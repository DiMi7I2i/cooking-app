#!/bin/bash
# Test de fumée de la stack de production (docker-compose.prod.yml).
# Lance une stack jetable (projet, port et volumes dédiés), vérifie qu'elle
# sert l'appli, relaie l'API et les images, persiste les données, puis la détruit.
# Usage : bash scripts/tests/prod-stack.test.sh
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1
source scripts/common.sh
check_docker || exit 1
detect_compose || exit 1

PORT=8099
HTTPS_PORT=8449
BASE="https://127.0.0.1:$HTTPS_PORT"
WORK="$(mktemp -d)"
# Autorité et certificat jetables
CA_DIR="$WORK/ca" OUT_DIR="$WORK/certs" bash scripts/https-cert.sh --prod 127.0.0.1 >/dev/null || exit 1
CA="$WORK/ca/rootCA.crt"
export CERTS_DIR="$WORK/certs"
cat > "$WORK/.env" <<EOF
HTTP_PORT=$PORT
HTTPS_PORT=$HTTPS_PORT
MONGO_USER=cooking
MONGO_PASSWORD=test-password
EOF
stack() { "${COMPOSE[@]}" -p cooking-prod-test -f docker-compose.prod.yml --env-file "$WORK/.env" "$@"; }
cleanup() { stack down -v --remove-orphans >/dev/null 2>&1; rm -rf "$WORK"; }
trap cleanup EXIT

FAILS=0
assert() { # assert <description> <commande...>
  local desc="$1"; shift
  if "$@"; then echo "  ✔ $desc"; else echo "  ✘ $desc"; FAILS=$((FAILS+1)); fi
}
# Toutes les requêtes HTTPS font confiance à l'autorité jetable (et à elle seule)
curl() { command curl --cacert "$CA" "$@"; }
export CA; export -f curl
http_code() { curl -s -o /dev/null -w '%{http_code}' "$@"; }
content_type() { curl -s -o /dev/null -w '%{content_type}' "$@"; }

echo "démarrage"
assert "la stack se construit et démarre" stack up -d --build --wait --wait-timeout 180

echo "frontend"
assert "GET / renvoie l'appli" bash -c "curl -sf '$BASE/' | grep -q '<div id=\"app\">'"
assert "une route Vue (/recipes/xyz) renvoie l'appli" bash -c "curl -sf '$BASE/recipes/xyz' | grep -q '<div id=\"app\">'"

echo "HTTPS"
assert "le certificat est validé par l'autorité locale" curl -sf -o /dev/null "$BASE/"
assert "refusé sans l'autorité (pas de certificat de complaisance)" bash -c "! command curl -sf -o /dev/null '$BASE/'"
assert "HTTP redirige vers HTTPS (301)" test "$(http_code "http://127.0.0.1:$PORT/recipes/xyz")" = "301"
assert "la redirection garde le chemin et le port HTTPS" \
  test "$(curl -s -o /dev/null -w '%{redirect_url}' "http://127.0.0.1:$PORT/recipes/xyz")" = "https://127.0.0.1:$HTTPS_PORT/recipes/xyz"

echo "API et images via nginx"
assert "GET /data/recipes renvoie du JSON" bash -c "[[ \$(curl -s -o /dev/null -w '%{content_type}' '$BASE/data/recipes') == application/json* ]]"
cp frontend/cooking-vue-app/src/components/icons/cooking-icon.png "$WORK/image.png"
created="$(curl -s -X POST "$BASE/data/recipes" -F title='Test prod' -F categoryCode=PLAT \
  -F difficultyCode=EASY -F costCode=CHEAP -F servings=1 -F 'ingredients=[{"name":"x"}]' \
  -F "thumbnail=@$WORK/image.png;type=image/png")"
thumb="$(sed -n 's/.*"thumbnail":"\([^"]*\)".*/\1/p' <<<"$created")"
assert "création d'une recette avec image" test -n "$thumb"
assert "l'image est servie" test "$(content_type "$BASE$thumb")" = "image/png"

echo "isolation"
published="$(docker ps --filter label=com.docker.compose.project=cooking-prod-test \
  --format '{{.Label "com.docker.compose.service"}} {{.Ports}}' | grep -- '->')"
assert "seul le frontend (nginx) publie des ports" test "$(cut -d' ' -f1 <<<"$published")" = "frontend"

echo "persistance"
stack down >/dev/null 2>&1
assert "la stack redémarre" stack up -d --wait --wait-timeout 120
assert "la recette est toujours là" bash -c "curl -s '$BASE/data/recipes' | grep -q 'Test prod'"
assert "l'image est toujours servie" test "$(http_code "$BASE$thumb")" = "200"

[ "$FAILS" -eq 0 ] && echo "OK" || { echo "$FAILS échec(s)"; exit 1; }
