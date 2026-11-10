#!/bin/bash

# Toujours travailler depuis la racine du projet, quel que soit le dossier d'appel
cd "$(dirname "$0")" || exit 1
source scripts/common.sh

echo "🚀 Démarrage de Cooking App..."

# Prérequis Docker (installation, droits sur le socket, démon)
check_docker || exit 1
detect_compose || exit 1
compose() { "${COMPOSE[@]}" -f backend/dev/mongodb.yml "$@"; }

# Nettoyage des ports
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:5173 | xargs -r kill -9 2>/dev/null

# MongoDB
echo "📦 Démarrage de MongoDB..."
if ! compose up -d --build; then
  echo "❌ Échec du démarrage de MongoDB (voir l'erreur ci-dessus)." >&2
  exit 1
fi

# Attente de MongoDB
echo "⏳ Attente de MongoDB..."
MONGO_READY=0
for i in $(seq 1 30); do
  if compose exec -T db mongosh --quiet --eval "db.runCommand({ ping: 1 })" > /dev/null 2>&1; then
    MONGO_READY=1
    break
  fi
  sleep 1
done
if [ "$MONGO_READY" -ne 1 ]; then
  echo "❌ MongoDB ne répond pas après 30 s. Logs : ${COMPOSE[*]} -f backend/dev/mongodb.yml logs db" >&2
  exit 1
fi
echo "✅ MongoDB prêt"

# Backend
echo "⚙️  Démarrage du backend (port 3000)..."
cd backend/cooking-nest-app || exit 1
npm run start:dev &
BACKEND_PID=$!
cd ../..

# Attente du backend
echo "⏳ Attente du backend..."
for i in $(seq 1 30); do
  curl -s http://localhost:3000 > /dev/null 2>&1 && break
  sleep 1
done
echo "✅ Backend prêt"

# Frontend
echo "🎨 Démarrage du frontend (port 5173)..."
cd frontend/cooking-vue-app || exit 1
npm run dev &
FRONTEND_PID=$!
cd ../..

sleep 2
echo ""
echo "========================================="
echo "  Cooking App est prête !"
echo "  Frontend : http://localhost:5173"
echo "  Backend  : http://localhost:3000"
echo "  MongoDB  : localhost:27018"
echo "========================================="
echo ""
echo "Appuyez sur Ctrl+C pour tout arrêter"

# Arrêt propre avec Ctrl+C
cleanup() {
  echo ''
  echo '🛑 Arrêt...'
  kill "$BACKEND_PID" "$FRONTEND_PID" 2>/dev/null
  compose down
  echo '✅ Arrêté'
  exit 0
}
trap cleanup SIGINT SIGTERM

wait
