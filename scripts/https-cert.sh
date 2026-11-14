#!/bin/bash
# Certificats HTTPS pour le réseau local (le partage natif de fichiers sur
# téléphone exige HTTPS hors localhost).
#
# Crée une autorité de certification locale (une seule fois, réutilisée ensuite,
# pour la dev comme pour la prod : le téléphone ne l'installe qu'une fois),
# puis un certificat serveur pour localhost, les IP et les noms donnés.
#
# Usage :
#   scripts/https-cert.sh [IP|nom ...]          → dev  (frontend/cooking-vue-app/.certs, npm run dev:https)
#   scripts/https-cert.sh --prod [IP|nom ...]   → prod (certs/, puis ./deploy.sh)
# Sans IP ni nom : les IP de la machine sont détectées.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
source scripts/common.sh

MODE=dev
if [ "${1:-}" = "--prod" ]; then MODE=prod; shift; fi

CA_DIR="${CA_DIR:-$HOME/.local/share/cooking-app-ca}"
if [ "$MODE" = prod ]; then
  OUT_DIR="${OUT_DIR:-$ROOT/certs}"
  PORT="${HTTPS_PORT:-$(env_value HTTPS_PORT || true)}"
  PORT="${PORT:-443}"
else
  OUT_DIR="${OUT_DIR:-$ROOT/frontend/cooking-vue-app/.certs}"
  PORT=5174
fi

if [ $# -gt 0 ]; then
  HOSTS=("$@")
else
  # IP de la machine, sans les réseaux internes Docker / libvirt
  read -r -a HOSTS <<<"$(hostname -I | tr ' ' '\n' | grep -E '^[0-9.]+$' \
    | grep -vE '^(172\.(1[7-9]|2[0-9]|3[01])\.|192\.168\.122\.)' | tr '\n' ' ')"
fi

mkdir -p "$CA_DIR" "$OUT_DIR"
chmod 700 "$CA_DIR"

# 1. Autorité locale (gardée hors du dépôt)
if [ ! -f "$CA_DIR/rootCA.key" ] || [ ! -f "$CA_DIR/rootCA.crt" ]; then
  echo "🔐 Création de l'autorité de certification locale ($CA_DIR)"
  (umask 077 && openssl genrsa -out "$CA_DIR/rootCA.key" 2048 2>/dev/null)
  openssl req -x509 -new -key "$CA_DIR/rootCA.key" -sha256 -days 3650 \
    -subj "/CN=Cooking App CA ($(hostname))" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -out "$CA_DIR/rootCA.crt"
fi
chmod 600 "$CA_DIR/rootCA.key"

# 2. Certificat serveur (régénéré à chaque fois, pour suivre les IP)
SAN="DNS:localhost,IP:127.0.0.1"
for h in "${HOSTS[@]}"; do
  if [[ "$h" =~ ^[0-9]+(\.[0-9]+){3}$ ]]; then SAN="$SAN,IP:$h"; else SAN="$SAN,DNS:$h"; fi
done

EXT="$(mktemp)"
trap 'rm -f "$EXT" "$OUT_DIR/server.csr"' EXIT
cat >"$EXT" <<EOF
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=$SAN
EOF

# Clé privée lisible par moi seul (nginx la lit en root au démarrage)
(umask 077 && openssl genrsa -out "$OUT_DIR/server.key" 2048 2>/dev/null)
openssl req -new -key "$OUT_DIR/server.key" -subj "/CN=cooking-app" -out "$OUT_DIR/server.csr"
# 397 jours : sous les limites d'iOS (825) et des navigateurs (398)
openssl x509 -req -in "$OUT_DIR/server.csr" -CA "$CA_DIR/rootCA.crt" -CAkey "$CA_DIR/rootCA.key" \
  -CAcreateserial -days 397 -sha256 -extfile "$EXT" -out "$OUT_DIR/server.crt" 2>/dev/null

# Certificat public de l'autorité, à installer sur le téléphone
cp "$CA_DIR/rootCA.crt" "$OUT_DIR/cooking-ca.crt"

echo "✅ Certificat HTTPS ($MODE) prêt dans $OUT_DIR, valable 397 jours"
echo "   Pour : ${SAN//,/, }"
echo
echo "📱 Sur le téléphone, installer une seule fois l'autorité : $OUT_DIR/cooking-ca.crt"
echo "   Android : Paramètres › Sécurité › Chiffrement et identifiants › Installer un certificat › Certificat CA"
echo "   iPhone  : ouvrir le fichier › Réglages › Profil téléchargé › Installer,"
echo "             puis Réglages › Général › Informations › Réglages des certificats › activer la confiance"
echo
SUFFIX=""; [ "$PORT" != 443 ] && SUFFIX=":$PORT"
if [ "$MODE" = prod ]; then
  echo "🚀 Lancer (ou relancer) : ./deploy.sh"
else
  echo "🚀 Lancer : cd frontend/cooking-vue-app && npm run dev:https"
fi
for h in "${HOSTS[@]}"; do echo "   puis ouvrir https://$h$SUFFIX"; done
