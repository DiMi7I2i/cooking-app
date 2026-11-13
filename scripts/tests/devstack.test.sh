#!/bin/bash
# Test réel de start.sh / stop.sh : démarre la stack de dev, puis vérifie que
# l'arrêt (Ctrl+C sur start.sh, ou ./stop.sh) ne laisse aucun processus du
# projet derrière lui, et ne tue pas un navigateur connecté au frontend.
# Utilise la base de dev Docker (démarrée puis arrêtée, données conservées).
# Usage : bash scripts/tests/devstack.test.sh   (~2 min, ports 3000 et 5173 libres)
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT" || exit 1

if lsof -ti tcp:3000 -sTCP:LISTEN >/dev/null 2>&1 || lsof -ti tcp:5173 -sTCP:LISTEN >/dev/null 2>&1; then
  echo "❌ Ports 3000 ou 5173 déjà utilisés : arrêtez la stack de dev avant ce test." >&2
  exit 1
fi

FAILS=0
assert() { # assert <description> <commande...>
  local desc="$1"; shift
  if "$@"; then echo "  ✔ $desc"; else echo "  ✘ $desc"; FAILS=$((FAILS+1)); fi
}
listening() { lsof -ti "tcp:$1" -sTCP:LISTEN >/dev/null 2>&1; }
ports_free() { ! listening 3000 && ! listening 5173; }
# pgrep dans ce shell (dans un `bash -c`, il se trouverait lui-même)
nest_watcher_stopped() { ! pgrep -f "$ROOT/backend/cooking-nest-app/node_modules/.bin/nest start" >/dev/null; }
# En cas d'échec : qui occupe encore les ports
show_listeners() { ss -ltnpH | grep -E ':(3000|5173) ' | sed 's/^/      /'; }
wait_until() { # wait_until <secondes> <commande...>
  local t="$1"; shift
  for _ in $(seq 1 "$t"); do "$@" && return 0; sleep 1; done
  return 1
}
# Faux navigateur : une connexion TCP ouverte sur le frontend
open_browser() { (exec 3<>/dev/tcp/127.0.0.1/5173; sleep 120) & BROWSER=$!; sleep 1; }

START_PID=""
cleanup() {
  [ -n "$START_PID" ] && kill -TERM "$START_PID" 2>/dev/null
  [ -n "$BROWSER" ] && kill "$BROWSER" 2>/dev/null
  ./stop.sh >/dev/null 2>&1
  pkill -f "$ROOT/backend/cooking-nest-app/node_modules/.bin/nest start" 2>/dev/null
}
trap cleanup EXIT

start_stack() {
  ./start.sh > /dev/null 2>&1 &
  START_PID=$!
  wait_until 180 bash -c "lsof -ti tcp:3000 -sTCP:LISTEN >/dev/null && lsof -ti tcp:5173 -sTCP:LISTEN >/dev/null"
}

echo "arrêt par Ctrl+C sur start.sh"
assert "start.sh démarre backend et frontend" start_stack
open_browser
kill -TERM "$START_PID"   # équivalent de Ctrl+C (même gestionnaire)
assert "les ports 3000 et 5173 sont libérés" wait_until 20 ports_free || show_listeners
assert "le watcher Nest est arrêté" wait_until 10 nest_watcher_stopped
assert "start.sh s'est terminé" wait_until 20 bash -c "! kill -0 $START_PID 2>/dev/null"
assert "le fichier .dev-pids est supprimé" test ! -e .dev-pids
kill "$BROWSER" 2>/dev/null; START_PID=""

echo "arrêt par ./stop.sh"
assert "start.sh redémarre" start_stack
assert "start.sh note ses processus dans .dev-pids" test -s .dev-pids
open_browser
./stop.sh >/dev/null 2>&1
assert "les ports 3000 et 5173 sont libérés" wait_until 20 ports_free || show_listeners
assert "le watcher Nest est arrêté" wait_until 10 nest_watcher_stopped
assert "le navigateur connecté n'a pas été tué" kill -0 "$BROWSER"
assert "start.sh s'est terminé" wait_until 20 bash -c "! kill -0 $START_PID 2>/dev/null"
assert "MongoDB de dev est arrêté" bash -c "! docker ps --format '{{.Names}}' | grep -q '^dev-db-1$'"
kill "$BROWSER" 2>/dev/null; START_PID=""

[ "$FAILS" -eq 0 ] && echo "OK" || { echo "$FAILS échec(s)"; exit 1; }
