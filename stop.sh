#!/bin/bash

cd "$(dirname "$0")" || exit 1
source scripts/common.sh

echo "Arrêt de Cooking App..."

# Backend & Frontend : groupes notés par start.sh, puis serveurs encore à
# l'écoute sur 3000/5173 et watcher Nest orphelin (jamais un navigateur connecté)
stop_dev_processes
echo "Backend et frontend arrêtés"

# MongoDB
check_docker || exit 1
detect_compose || exit 1
"${COMPOSE[@]}" -f backend/dev/mongodb.yml stop
echo "MongoDB arrêté"

echo "Cooking App arrêtée"
