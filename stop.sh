#!/bin/bash

echo "Arrêt de Cooking App..."

# Backend & Frontend
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:5173 | xargs -r kill -9 2>/dev/null
echo "Backend et frontend arrêtés"

# MongoDB
cd backend/dev
docker-compose -f mongodb.yml stop 2>/dev/null
echo "MongoDB arrêté"

echo "Cooking App arrêtée"
