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

# Certificats HTTPS (servis par nginx) : certs/ par défaut, ou CERTS_DIR du .env
CERTS_DIR="$(env_value CERTS_DIR)"
CERTS_DIR="${CERTS_DIR:-certs}"
[[ "$CERTS_DIR" = /* ]] || CERTS_DIR="$ROOT/$CERTS_DIR"
if [ ! -f "$CERTS_DIR/server.crt" ] || [ ! -f "$CERTS_DIR/server.key" ]; then
  echo "❌ Certificat HTTPS manquant dans $CERTS_DIR. Créez-le avec :  scripts/https-cert.sh --prod" >&2
  exit 1
fi
export CERTS_DIR

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

PORT="$(env_value HTTPS_PORT)"
PORT="${PORT:-443}"
IP="$(hostname -I 2>/dev/null | awk '{print $1}')"
SUFFIX=""; [ "$PORT" != "443" ] && SUFFIX=":$PORT"
echo "✅ $REF ($SHORT) déployé."
echo "   Accès depuis le réseau local : https://${IP:-<ip-du-pc>}$SUFFIX"
EXPIRY="$(openssl x509 -in "$CERTS_DIR/server.crt" -noout -enddate 2>/dev/null | cut -d= -f2)"
if [ -n "$EXPIRY" ]; then
  echo "   Certificat HTTPS valable jusqu'au $EXPIRY (renouveler : scripts/https-cert.sh --prod)"
fi
