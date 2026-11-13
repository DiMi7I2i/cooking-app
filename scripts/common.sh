#!/bin/bash
# Fonctions partagées par start.sh et stop.sh (à sourcer).

# Vérifie que Docker est installé et que l'utilisateur peut parler au démon.
# Retourne 1 avec un message explicite sinon.
check_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    echo "❌ Docker n'est pas installé (ou absent du PATH). Installez Docker Engine : https://docs.docker.com/engine/install/" >&2
    return 1
  fi

  local out
  if out="$(docker info 2>&1)"; then
    return 0
  fi

  if grep -qi "permission denied" <<<"$out"; then
    cat >&2 <<MSG
❌ Docker refuse l'accès au socket (permission denied).
   Votre utilisateur n'est pas (encore) actif dans le groupe 'docker' pour cette session.
   1. Ajoutez-le au groupe (une seule fois) : sudo usermod -aG docker \$USER
   2. Activez le groupe dans ce terminal    : newgrp docker
      (ou fermez puis rouvrez votre session)
   3. Relancez ce script.
MSG
  else
    cat >&2 <<MSG
❌ Impossible de joindre le démon Docker. Est-il démarré ?
   Essayez : sudo systemctl start docker
   Détail : $(head -n1 <<<"$out")
MSG
  fi
  return 1
}

# Remplit le tableau COMPOSE avec 'docker compose' (v2) ou, à défaut, 'docker-compose' (v1).
detect_compose() {
  if docker compose version >/dev/null 2>&1; then
    COMPOSE=(docker compose)
  elif command -v docker-compose >/dev/null 2>&1; then
    COMPOSE=(docker-compose)
  else
    echo "❌ Ni 'docker compose' ni 'docker-compose' n'est disponible. Installez le plugin Compose." >&2
    return 1
  fi
}

# Lit une valeur du .env à la racine du projet (vide si absente) : env_value <CLÉ>
env_value() {
  [ -f .env ] && sed -n "s/^$1=//p" .env | tail -n1
}

# Affiche l'id du conteneur MongoDB en cours d'exécution du projet Compose donné.
# Retourne 1 avec un message explicite si la stack ne tourne pas.
prod_mongo_container() {
  local id
  id="$(docker ps -q --filter "label=com.docker.compose.project=$1" \
    --filter "label=com.docker.compose.service=mongo")"
  if [ -z "$id" ]; then
    echo "❌ La stack $1 ne tourne pas (MongoDB introuvable). Lancez d'abord ./deploy.sh" >&2
    return 1
  fi
  echo "$id"
}

# PIDs des processus à l'écoute sur un port TCP (jamais les clients connectés,
# comme un navigateur ouvert sur l'appli)
listening_pids() {
  lsof -ti "tcp:$1" -sTCP:LISTEN 2>/dev/null
}

# Arrête un groupe de processus : TERM, puis KILL s'il résiste plus de 5 s
stop_process_group() {
  kill -TERM -- "-$1" 2>/dev/null || return 0
  for _ in $(seq 1 10); do
    kill -0 -- "-$1" 2>/dev/null || return 0
    sleep 0.5
  done
  kill -KILL -- "-$1" 2>/dev/null
  return 0
}

# Arrête les processus à l'écoute sur un port : TERM, puis KILL après 5 s
stop_listeners() {
  local pids
  pids="$(listening_pids "$1")"
  [ -z "$pids" ] && return 0
  kill -TERM $pids 2>/dev/null
  for _ in $(seq 1 10); do
    [ -z "$(listening_pids "$1")" ] && return 0
    sleep 0.5
  done
  pids="$(listening_pids "$1")"
  [ -n "$pids" ] && kill -KILL $pids 2>/dev/null
  return 0
}

# Arrête les processus de dev du projet lancés par start.sh (npm, watcher Nest,
# serveurs), y compris ceux d'un lancement interrompu. À appeler depuis la racine.
stop_dev_processes() {
  local pgid
  if [ -f .dev-pids ]; then
    while read -r pgid; do
      # Ne touche qu'à un groupe appartenant bien à ce projet (PID réutilisé sinon)
      [ -n "$pgid" ] && ps -o args= -g "$pgid" 2>/dev/null | grep -qF "$PWD" \
        && stop_process_group "$pgid"
    done < .dev-pids
    rm -f .dev-pids
  fi
  stop_listeners 3000
  stop_listeners 5173
  pkill -TERM -f "$PWD/backend/cooking-nest-app/node_modules/.bin/nest start" 2>/dev/null
  return 0
}
