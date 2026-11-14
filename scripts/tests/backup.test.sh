#!/bin/bash
# Tests de backup.sh et restore.sh sur une stack de prod jetable
# (projet cooking-prod-test, ports 8099/8449, volumes supprimés à la fin).
# Usage : bash scripts/tests/backup.test.sh
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1
source scripts/common.sh
check_docker || exit 1
detect_compose || exit 1

PORT=8099
HTTPS_PORT=8449
BASE="https://127.0.0.1:$HTTPS_PORT"
WORK="$(mktemp -d)"
CA_DIR="$WORK/ca" OUT_DIR="$WORK/certs" bash scripts/https-cert.sh --prod 127.0.0.1 >/dev/null || exit 1
export CERTS_DIR="$WORK/certs"
curl() { command curl --cacert "$WORK/ca/rootCA.crt" "$@"; }
export WORK; export -f curl
export COOKING_PROJECT=cooking-prod-test
export BACKUP_DIR="$WORK/backups"
cat > "$WORK/.env" <<EOF
HTTP_PORT=$PORT
HTTPS_PORT=$HTTPS_PORT
MONGO_USER=cooking
MONGO_PASSWORD=test-password
EOF
stack() { "${COMPOSE[@]}" -p "$COOKING_PROJECT" -f docker-compose.prod.yml --env-file "$WORK/.env" "$@"; }
cleanup() { stack down -v --remove-orphans >/dev/null 2>&1; rm -rf "$WORK"; }
trap cleanup EXIT

FAILS=0
assert() { # assert <description> <commande...>
  local desc="$1"; shift
  if "$@"; then echo "  ✔ $desc"; else echo "  ✘ $desc"; FAILS=$((FAILS+1)); fi
}
recipes() { curl -s "$BASE/data/recipes"; }

echo "préparation (stack jetable + une recette avec image)"
stack up -d --build --wait --wait-timeout 300 >/dev/null 2>&1 || { echo "  ✘ la stack de test ne démarre pas"; exit 1; }
cp frontend/cooking-vue-app/src/components/icons/cooking-icon.png "$WORK/image.png"
created="$(curl -s -X POST "$BASE/data/recipes" -F title='Recette sauvegardée' -F categoryCode=PLAT \
  -F difficultyCode=EASY -F costCode=CHEAP -F servings=1 -F 'ingredients=[{"name":"x"}]' \
  -F "thumbnail=@$WORK/image.png;type=image/png")"
id="$(sed -n 's/.*"_id":"\([^"]*\)".*/\1/p' <<<"$created")"
thumb="$(sed -n 's/.*"thumbnail":"\([^"]*\)".*/\1/p' <<<"$created")"
[ -n "$id" ] && [ -n "$thumb" ] || { echo "  ✘ impossible de créer la recette de test"; exit 1; }

echo "sauvegarde"
out="$(./backup.sh 2>&1)"; rc=$?
assert "backup.sh réussit" test $rc -eq 0
archive="$(ls "$BACKUP_DIR"/cooking-*.tar.gz 2>/dev/null | head -1)"
assert "crée une archive datée" test -n "$archive"
assert "l'archive contient la base" bash -c "tar -tzf '$archive' | grep -q 'mongo.archive.gz'"
assert "l'archive contient les images" bash -c "tar -tzf '$archive' | grep -q 'uploads.tar.gz'"
assert "affiche le chemin de l'archive" grep -qF "${archive:-<aucune archive>}" <<<"$out"

echo "restauration"
curl -s -o /dev/null -X DELETE "$BASE/data/recipes/$id"
assert "(la recette a bien été supprimée)" bash -c "! curl -s '$BASE/data/recipes' | grep -q 'Recette sauvegardée'"
assert "(son image aussi)" test "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$thumb")" = "404"
out="$(./restore.sh 2>&1)"; rc=$?
assert "restore.sh sans archive : échoue" test $rc -ne 0
out="$(./restore.sh "$WORK/inexistant.tar.gz" --yes 2>&1)"; rc=$?
assert "restore.sh archive introuvable : échoue" test $rc -ne 0
out="$(echo n | ./restore.sh "$archive" 2>&1)"; rc=$?
assert "sans confirmation : n'écrase rien" bash -c "! curl -s '$BASE/data/recipes' | grep -q 'Recette sauvegardée'"
out="$(./restore.sh "$archive" --yes 2>&1)"; rc=$?
assert "restore.sh réussit" test $rc -eq 0
assert "la recette est restaurée" bash -c "curl -s '$BASE/data/recipes' | grep -q 'Recette sauvegardée'"
assert "l'image est restaurée" test "$(curl -s -o /dev/null -w '%{http_code}' "$BASE$thumb")" = "200"

echo "rotation"
for d in 20200101-000000 20200102-000000 20200103-000000; do touch "$BACKUP_DIR/cooking-$d.tar.gz"; done
BACKUP_KEEP=2 ./backup.sh >/dev/null 2>&1
assert "garde seulement les BACKUP_KEEP plus récentes" test "$(ls "$BACKUP_DIR"/cooking-*.tar.gz | wc -l)" -eq 2
assert "supprime les plus anciennes" test ! -e "$BACKUP_DIR/cooking-20200101-000000.tar.gz"

echo "stack arrêtée"
stack stop >/dev/null 2>&1
before="$(ls "$BACKUP_DIR" | wc -l)"
out="$(./backup.sh 2>&1)"; rc=$?
assert "backup.sh échoue si la stack ne tourne pas" test $rc -ne 0
assert "message explicite" grep -qi "ne tourne pas" <<<"$out"
assert "aucune archive partielle laissée" test "$(ls "$BACKUP_DIR" | wc -l)" -eq "$before"

[ "$FAILS" -eq 0 ] && echo "OK" || { echo "$FAILS échec(s)"; exit 1; }
