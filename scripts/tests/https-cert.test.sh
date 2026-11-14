#!/bin/bash
# Tests de scripts/https-cert.sh (certificats HTTPS du réseau local, dev et prod).
# Usage : bash scripts/tests/https-cert.test.sh
HERE="$(cd "$(dirname "$0")" && pwd)"
SCRIPT="$HERE/../https-cert.sh"

FAILS=0
assert() { # assert <description> <commande...>
  local desc="$1"; shift
  if "$@"; then echo "  ✔ $desc"; else echo "  ✘ $desc"; FAILS=$((FAILS+1)); fi
}
san_of() { openssl x509 -in "$1" -noout -ext subjectAltName 2>/dev/null; }

TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT
export CA_DIR="$TMP/ca" OUT_DIR="$TMP/out"

echo "Dev : premier lancement"
out="$(bash "$SCRIPT" 192.168.1.42 2>&1)"; rc=$?
assert "se termine sans erreur" test $rc -eq 0
assert "crée la clé de l'autorité" test -f "$CA_DIR/rootCA.key"
assert "crée le certificat de l'autorité" test -f "$CA_DIR/rootCA.crt"
assert "clé de l'autorité lisible par moi seul (600)" test "$(stat -c %a "$CA_DIR/rootCA.key" 2>/dev/null)" = 600
assert "crée la clé du serveur" test -f "$OUT_DIR/server.key"
assert "crée le certificat du serveur" test -f "$OUT_DIR/server.crt"
assert "copie le certificat de l'autorité à installer sur le téléphone" test -f "$OUT_DIR/cooking-ca.crt"
assert "le certificat serveur est signé par l'autorité" \
  openssl verify -CAfile "$CA_DIR/rootCA.crt" "$OUT_DIR/server.crt"

san="$(san_of "$OUT_DIR/server.crt")"
assert "valable pour l'IP demandée" grep -q "IP Address:192.168.1.42" <<<"$san"
assert "valable pour localhost" grep -q "DNS:localhost" <<<"$san"
assert "valable pour 127.0.0.1" grep -q "IP Address:127.0.0.1" <<<"$san"

eku="$(openssl x509 -in "$OUT_DIR/server.crt" -noout -ext extendedKeyUsage 2>/dev/null)"
assert "usage : authentification de serveur" grep -q "TLS Web Server Authentication" <<<"$eku"

# iOS refuse les certificats serveur valables plus de 825 jours
end="$(openssl x509 -in "$OUT_DIR/server.crt" -noout -enddate 2>/dev/null | cut -d= -f2)"
days=$(( ($(date -d "$end" +%s) - $(date +%s)) / 86400 ))
assert "durée de validité acceptée par iOS (≤ 825 jours, ici $days)" test "$days" -le 825

assert "explique comment installer l'autorité sur le téléphone" grep -qi "téléphone" <<<"$out"
assert "dev : indique la commande Vite" grep -q "npm run dev:https" <<<"$out"
assert "dev : indique l'adresse à ouvrir" grep -q "https://192.168.1.42:5174" <<<"$out"

echo "Dev : second lancement (autre IP)"
ca_before="$(openssl x509 -in "$CA_DIR/rootCA.crt" -noout -fingerprint -sha256)"
bash "$SCRIPT" 10.0.0.7 >/dev/null 2>&1; rc=$?
assert "se termine sans erreur" test $rc -eq 0
assert "réutilise la même autorité (le téléphone reste configuré)" \
  test "$ca_before" = "$(openssl x509 -in "$CA_DIR/rootCA.crt" -noout -fingerprint -sha256)"
assert "le certificat serveur couvre la nouvelle IP" grep -q "IP Address:10.0.0.7" <<<"$(san_of "$OUT_DIR/server.crt")"

echo "Nom d'hôte en argument"
bash "$SCRIPT" 10.0.0.7 cooking.local >/dev/null 2>&1
san="$(san_of "$OUT_DIR/server.crt")"
assert "un nom devient un DNS du certificat" grep -q "DNS:cooking.local" <<<"$san"
assert "l'IP est toujours couverte" grep -q "IP Address:10.0.0.7" <<<"$san"

echo "Sans IP en argument"
bash "$SCRIPT" >/dev/null 2>&1; rc=$?
assert "détecte les IP de la machine" test $rc -eq 0
first_ip="$(hostname -I | awk '{print $1}')"
assert "inclut l'IP principale ($first_ip)" grep -q "IP Address:$first_ip" <<<"$(san_of "$OUT_DIR/server.crt")"

echo "Prod (--prod)"
export OUT_DIR="$TMP/prod-certs"
out="$(bash "$SCRIPT" --prod 192.168.1.42 2>&1)"; rc=$?
assert "se termine sans erreur" test $rc -eq 0
assert "crée le certificat serveur de prod" test -f "$OUT_DIR/server.crt"
assert "signé par la même autorité que le dev" \
  openssl verify -CAfile "$CA_DIR/rootCA.crt" "$OUT_DIR/server.crt"
assert "--prod n'est pas pris pour un nom d'hôte" bash -c "! grep -q 'DNS:--prod' <<<\"\$(openssl x509 -in '$OUT_DIR/server.crt' -noout -ext subjectAltName)\""
assert "prod : indique de lancer ./deploy.sh" grep -q "./deploy.sh" <<<"$out"
assert "prod : adresse https sans port (443)" grep -q "https://192.168.1.42$" <<<"$out"
out="$(HTTPS_PORT=8443 bash "$SCRIPT" --prod 192.168.1.42 2>&1)"
assert "prod : adresse avec le port HTTPS s'il n'est pas 443" grep -q "https://192.168.1.42:8443" <<<"$out"

echo
if [ $FAILS -eq 0 ]; then echo "✅ Tous les tests passent"; else echo "❌ $FAILS échec(s)"; exit 1; fi
