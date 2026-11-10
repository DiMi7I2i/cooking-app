#!/bin/bash

cd "$(dirname "$0")" || exit 1
source scripts/common.sh

echo "Arrêt de Cooking App..."

# Backend & Frontend
lsof -ti:3000 | xargs -r kill -9 2>/dev/null
lsof -ti:5173 | xargs -r kill -9 2>/dev/null
echo "Backend et frontend arrêtés"

# MongoDB
check_docker || exit 1
detect_compose || exit 1
"${COMPOSE[@]}" -f backend/dev/mongodb.yml stop
echo "MongoDB arrêté"

echo "Cooking App arrêtée"
