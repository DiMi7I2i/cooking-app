#!/bin/bash
# Sauvegarde la stack de production : base MongoDB + images uploadées,
# dans une archive datée. Garde les BACKUP_KEEP plus récentes.
#   ./backup.sh
# Réglages (variables d'environnement, sinon .env, sinon défauts) :
#   BACKUP_DIR  dossier des archives (défaut : backups/ à la racine du projet)
#   BACKUP_KEEP nombre d'archives conservées (défaut : 14)
# Pour une sauvegarde quotidienne, voir la ligne cron dans CLAUDE.md.

cd "$(dirname "$0")" || exit 1
ROOT="$(pwd)"
source scripts/common.sh

BACKUP_DIR="${BACKUP_DIR:-$(env_value BACKUP_DIR)}"
BACKUP_DIR="${BACKUP_DIR:-backups}"
[[ "$BACKUP_DIR" = /* ]] || BACKUP_DIR="$ROOT/$BACKUP_DIR"
BACKUP_KEEP="${BACKUP_KEEP:-$(env_value BACKUP_KEEP)}"
BACKUP_KEEP="${BACKUP_KEEP:-14}"
PROJECT="${COOKING_PROJECT:-cooking-prod}"

check_docker || exit 1
MONGO="$(prod_mongo_container "$PROJECT")" || exit 1
IMAGE="$(docker inspect -f '{{.Config.Image}}' "$MONGO")"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

echo "💾 Sauvegarde de $PROJECT..."
if ! docker exec "$MONGO" sh -c 'mongodump --quiet -u "$MONGO_INITDB_ROOT_USERNAME" \
    -p "$MONGO_INITDB_ROOT_PASSWORD" --authenticationDatabase admin \
    --db cooking --archive --gzip' > "$WORK/mongo.archive.gz"; then
  echo "❌ Échec de l'export de la base (mongodump)." >&2
  exit 1
fi
if ! docker run --rm -v "${PROJECT}_uploads:/uploads:ro" "$IMAGE" \
    tar czf - -C /uploads . > "$WORK/uploads.tar.gz"; then
  echo "❌ Échec de l'archivage des images." >&2
  exit 1
fi

mkdir -p "$BACKUP_DIR"
ARCHIVE="$BACKUP_DIR/cooking-$(date +%Y%m%d-%H%M%S).tar.gz"
# Écriture dans un fichier temporaire puis renommage : jamais d'archive partielle
tar czf "$ARCHIVE.part" -C "$WORK" mongo.archive.gz uploads.tar.gz && mv "$ARCHIVE.part" "$ARCHIVE" || {
  rm -f "$ARCHIVE.part"; echo "❌ Échec de l'écriture de l'archive." >&2; exit 1; }

# Rotation : les noms sont datés, l'ordre alphabétique est l'ordre chronologique
ls -1 "$BACKUP_DIR"/cooking-*.tar.gz | sort | head -n "-$BACKUP_KEEP" | xargs -r rm --

echo "✅ Sauvegarde créée : $ARCHIVE ($(du -h "$ARCHIVE" | cut -f1))"
