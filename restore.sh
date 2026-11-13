#!/bin/bash
# Restaure une sauvegarde faite par backup.sh sur la stack de production.
# ATTENTION : remplace toutes les recettes et images actuelles.
#   ./restore.sh backups/cooking-AAAAMMJJ-HHMMSS.tar.gz         (demande confirmation)
#   ./restore.sh backups/cooking-AAAAMMJJ-HHMMSS.tar.gz --yes   (sans confirmation)

cd "$(dirname "$0")" || exit 1
source scripts/common.sh

ARCHIVE="$1"
PROJECT="${COOKING_PROJECT:-cooking-prod}"

if [ -z "$ARCHIVE" ]; then
  echo "Usage : ./restore.sh <archive> [--yes]" >&2
  exit 1
fi
if [ ! -f "$ARCHIVE" ]; then
  echo "❌ Archive introuvable : $ARCHIVE" >&2
  exit 1
fi

check_docker || exit 1
MONGO="$(prod_mongo_container "$PROJECT")" || exit 1
IMAGE="$(docker inspect -f '{{.Config.Image}}' "$MONGO")"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT
if ! tar xzf "$ARCHIVE" -C "$WORK" mongo.archive.gz uploads.tar.gz 2>/dev/null; then
  echo "❌ Archive invalide (mongo.archive.gz ou uploads.tar.gz manquant) : $ARCHIVE" >&2
  exit 1
fi

if [ "$2" != "--yes" ]; then
  read -r -p "⚠️  Remplacer TOUTES les recettes et images de $PROJECT par $ARCHIVE ? [o/N] " answer
  [[ "$answer" =~ ^[oOyY] ]] || { echo "Annulé, rien n'a été modifié."; exit 1; }
fi

echo "♻️  Restauration de $ARCHIVE..."
if ! docker exec -i "$MONGO" sh -c 'mongorestore --quiet -u "$MONGO_INITDB_ROOT_USERNAME" \
    -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin \
    --drop --archive --gzip' < "$WORK/mongo.archive.gz"; then
  echo "❌ Échec de la restauration de la base (mongorestore)." >&2
  exit 1
fi
if ! docker run --rm -i -v "${PROJECT}_uploads:/uploads" "$IMAGE" \
    sh -c 'find /uploads -mindepth 1 -delete && tar xzf - -C /uploads' < "$WORK/uploads.tar.gz"; then
  echo "❌ Échec de la restauration des images." >&2
  exit 1
fi

echo "✅ Restauration terminée."
