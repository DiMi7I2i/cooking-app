#!/bin/bash

# Toujours travailler depuis la racine du projet, quel que soit le dossier d'appel
cd "$(dirname "$0")" || exit 1
source scripts/common.sh

echo "🚀 Démarrage de Cooking App..."

# Prérequis Docker (installation, droits sur le socket, démon)
check_docker || exit 1
detect_compose || exit 1
compose() { "${COMPOSE[@]}" -f backend/dev/mongodb.yml "$@"; }

# Restes d'un lancement précédent (ports 3000/5173, watcher Nest orphelin)
stop_dev_processes

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

# Arrêt propre avec Ctrl+C : chaque serveur tourne dans son propre groupe de
# processus (setsid), arrêté en entier (npm + watcher Nest/Vite + serveur)
cleanup() {
  echo ''
  echo '🛑 Arrêt...'
  [ -n "$BACKEND_PGID" ] && stop_process_group "$BACKEND_PGID"
  [ -n "$FRONTEND_PGID" ] && stop_process_group "$FRONTEND_PGID"
  rm -f .dev-pids
  compose down
  echo '✅ Arrêté'
  exit 0
}
trap cleanup SIGINT SIGTERM

# Backend
echo "⚙️  Démarrage du backend (port 3000)..."
cd backend/cooking-nest-app || exit 1
setsid npm run start:dev &
BACKEND_PGID=$!
cd ../..
# Groupes notés pour ./stop.sh (lancé depuis un autre terminal)
echo "$BACKEND_PGID" > .dev-pids

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
setsid npm run dev &
FRONTEND_PGID=$!
cd ../..
echo "$FRONTEND_PGID" >> .dev-pids

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

wait
