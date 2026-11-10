#!/bin/bash
# Déploie une version de Cooking App sur la stack de production (réseau local).
# Lancement manuel uniquement :
#   ./deploy.sh          → déploie la branche main locale
#   ./deploy.sh v1.0     → déploie un tag (ou une branche, ou un commit)
# Le code est extrait du commit choisi : les modifications non commitées ne
# sont jamais déployées. Configuration : .env à la racine (voir .env.example).

cd "$(dirname "$0")" || exit 1
ROOT="$(pwd)"
source scripts/common.sh

REF="${1:-main}"

if [ ! -f .env ]; then
  echo "❌ Fichier .env manquant. Créez-le puis adaptez-le :  cp .env.example .env" >&2
  exit 1
fi

if ! SHA="$(git rev-parse --verify --quiet "$REF^{commit}")"; then
  echo "❌ Version inconnue : '$REF' (ni branche, ni tag, ni commit)." >&2
  exit 1
fi
SHORT="$(git rev-parse --short "$SHA")"

if [ -n "$(git status --porcelain --untracked-files=no)" ]; then
  echo "⚠️  Modifications non commitées détectées : elles ne seront pas déployées."
fi

check_docker || exit 1
detect_compose || exit 1

# Extraction du commit dans un dossier temporaire
BUILD_DIR="$(mktemp -d)"
trap 'rm -rf "$BUILD_DIR"' EXIT
git archive "$SHA" | tar -x -C "$BUILD_DIR"

prod() { "${COMPOSE[@]}" -p cooking-prod -f "$BUILD_DIR/docker-compose.prod.yml" --env-file "$ROOT/.env" "$@"; }

echo "🚀 Déploiement de $REF ($SHORT)..."
if ! prod up -d --build --wait --wait-timeout 180; then
  echo "❌ Échec du déploiement. Derniers logs :" >&2
  prod logs --tail 30 >&2
  exit 1
fi

PORT="$(sed -n 's/^HTTP_PORT=//p' .env)"
PORT="${PORT:-80}"
IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
SUFFIX=""; [ "$PORT" != "80" ] && SUFFIX=":$PORT"
echo "✅ $REF ($SHORT) déployé."
echo "   Accès depuis le réseau local : http://${IP:-<ip-du-pc>}$SUFFIX"
