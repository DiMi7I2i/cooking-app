#!/bin/bash
# Certificat HTTPS de dev, pour tester l'appli depuis un téléphone du réseau local
# (le partage natif des fichiers exige HTTPS, sauf sur localhost).
#
# Crée une autorité de certification locale (une seule fois, réutilisée ensuite)
# puis un certificat serveur pour localhost et les IP de la machine.
#
# Usage : scripts/dev-https-cert.sh [IP ...]   (par défaut : IP détectées)
# Ensuite : cd frontend/cooking-vue-app && npm run dev:https
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CA_DIR="${CA_DIR:-$HOME/.local/share/cooking-app-dev-ca}"
OUT_DIR="${OUT_DIR:-$ROOT/frontend/cooking-vue-app/.certs}"
PORT=5174

if [ $# -gt 0 ]; then
  IPS=("$@")
else
  # IP de la machine, sans les réseaux internes Docker / libvirt
  read -r -a IPS <<<"$(hostname -I | tr ' ' '\n' | grep -E '^[0-9.]+$' \
    | grep -vE '^(172\.(1[7-9]|2[0-9]|3[01])\.|192\.168\.122\.)' | tr '\n' ' ')"
fi

mkdir -p "$CA_DIR" "$OUT_DIR"
chmod 700 "$CA_DIR"

# 1. Autorité locale (gardée hors du dépôt, réutilisée pour ne pas reconfigurer le téléphone)
if [ ! -f "$CA_DIR/rootCA.key" ] || [ ! -f "$CA_DIR/rootCA.crt" ]; then
  echo "🔐 Création de l'autorité de certification locale ($CA_DIR)"
  (umask 077 && openssl genrsa -out "$CA_DIR/rootCA.key" 2048 2>/dev/null)
  openssl req -x509 -new -key "$CA_DIR/rootCA.key" -sha256 -days 3650 \
    -subj "/CN=Cooking App dev CA ($(hostname))" \
    -addext "basicConstraints=critical,CA:TRUE" \
    -addext "keyUsage=critical,keyCertSign,cRLSign" \
    -out "$CA_DIR/rootCA.crt"
fi
chmod 600 "$CA_DIR/rootCA.key"

# 2. Certificat serveur (régénéré à chaque fois, pour suivre les IP)
SAN="DNS:localhost,IP:127.0.0.1"
for ip in "${IPS[@]}"; do SAN="$SAN,IP:$ip"; done

EXT="$(mktemp)"
trap 'rm -f "$EXT" "$OUT_DIR/dev.csr"' EXIT
cat >"$EXT" <<EOF
basicConstraints=CA:FALSE
keyUsage=critical,digitalSignature,keyEncipherment
extendedKeyUsage=serverAuth
subjectAltName=$SAN
EOF

(umask 077 && openssl genrsa -out "$OUT_DIR/dev.key" 2048 2>/dev/null)
openssl req -new -key "$OUT_DIR/dev.key" -subj "/CN=cooking-app-dev" -out "$OUT_DIR/dev.csr"
# 397 jours : sous les limites d'iOS (825) et des navigateurs (398)
openssl x509 -req -in "$OUT_DIR/dev.csr" -CA "$CA_DIR/rootCA.crt" -CAkey "$CA_DIR/rootCA.key" \
  -CAcreateserial -days 397 -sha256 -extfile "$EXT" -out "$OUT_DIR/dev.crt" 2>/dev/null

# Certificat public de l'autorité, à installer sur le téléphone
cp "$CA_DIR/rootCA.crt" "$OUT_DIR/cooking-dev-ca.crt"

echo "✅ Certificat HTTPS de dev prêt ($OUT_DIR)"
echo "   Valable pour : ${SAN//,/, }"
echo
echo "📱 Sur le téléphone, installer une seule fois l'autorité : $OUT_DIR/cooking-dev-ca.crt"
echo "   Android : Paramètres › Sécurité › Chiffrement et identifiants › Installer un certificat › Certificat CA"
echo "   iPhone  : ouvrir le fichier › Réglages › Profil téléchargé › Installer,"
echo "             puis Réglages › Général › Informations › Réglages des certificats › activer la confiance"
echo
echo "🚀 Lancer : cd frontend/cooking-vue-app && npm run dev:https"
for ip in "${IPS[@]}"; do echo "   puis ouvrir https://$ip:$PORT sur le téléphone"; done
