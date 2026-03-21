#!/bin/bash

echo "🚀 Démarrage de Cooking App..."

# Nettoyage des ports
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:5173 | xargs -r kill -9 2>/dev/null

# MongoDB
echo "📦 Démarrage de MongoDB..."
cd backend/dev
docker-compose -f mongodb.yml up -d --build 2>&1 | tail -1
cd ../..

# Backend
echo "⚙️  Démarrage du backend (port 3000)..."
cd backend/cooking-nest-app
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
cd frontend/cooking-vue-app
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
trap "echo ''; echo '🛑 Arrêt...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; cd backend/dev && docker-compose -f mongodb.yml down; echo '✅ Arrêté'; exit 0" SIGINT SIGTERM

wait
