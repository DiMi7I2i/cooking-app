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
