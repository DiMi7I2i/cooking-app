#!/bin/bash
# Tests de scripts/common.sh avec un faux `docker` placé dans le PATH.
# Usage : bash scripts/tests/common.test.sh
HERE="$(cd "$(dirname "$0")" && pwd)"
source "$HERE/../common.sh"

FAILS=0
assert() { # assert <description> <commande...>
  local desc="$1"; shift
  if "$@"; then echo "  ✔ $desc"; else echo "  ✘ $desc"; FAILS=$((FAILS+1)); fi
}

# Fabrique un faux docker : fake_docker <script du corps>
fake_docker() {
  FAKE_DIR="$(mktemp -d)"
  printf '#!/bin/bash\n%s\n' "$1" > "$FAKE_DIR/docker"
  chmod +x "$FAKE_DIR/docker"
}
run_with_fake() { ( PATH="$FAKE_DIR:/usr/bin:/bin"; "$@" ) ; }

echo "check_docker"
fake_docker 'exit 0'
assert "OK quand docker info réussit" bash -c 'PATH="$1"; source "$2"; check_docker' _ "$FAKE_DIR:/usr/bin:/bin" "$HERE/../common.sh"

fake_docker 'echo "permission denied while trying to connect to the docker API at unix:///var/run/docker.sock" >&2; exit 1'
out="$(run_with_fake check_docker 2>&1)"; rc=$?
assert "échoue sur permission denied" test $rc -ne 0
assert "message mentionne usermod" grep -q "usermod -aG docker" <<<"$out"
assert "message mentionne newgrp" grep -q "newgrp docker" <<<"$out"

fake_docker 'echo "Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?" >&2; exit 1'
out="$(run_with_fake check_docker 2>&1)"; rc=$?
assert "échoue si démon arrêté" test $rc -ne 0
assert "message mentionne le démon" grep -qi "démon" <<<"$out"

EMPTY="$(mktemp -d)"
out="$( PATH="$EMPTY"; check_docker 2>&1 )"; rc=$?
assert "échoue si docker absent" test $rc -ne 0
assert "message mentionne l'installation" grep -qi "install" <<<"$out"

echo "detect_compose"
fake_docker '[ "$1 $2" = "compose version" ] && exit 0; exit 1'
assert "préfère 'docker compose'" bash -c 'PATH="$1"; source "$2"; detect_compose && test "${COMPOSE[*]}" = "docker compose"' _ "$FAKE_DIR" "$HERE/../common.sh"

fake_docker 'exit 1'
cat > "$FAKE_DIR/docker-compose" <<'EOS'
#!/bin/bash
exit 0
EOS
chmod +x "$FAKE_DIR/docker-compose"
assert "repli sur docker-compose" bash -c 'PATH="$1"; source "$2"; detect_compose && test "${COMPOSE[*]}" = "docker-compose"' _ "$FAKE_DIR" "$HERE/../common.sh"

fake_docker 'exit 1'
rm -f "$FAKE_DIR/docker-compose"
assert "échoue si aucun compose" bash -c 'PATH="$1"; source "$2"; ! detect_compose >/dev/null 2>&1' _ "$FAKE_DIR" "$HERE/../common.sh"

[ "$FAILS" -eq 0 ] && echo "OK" || { echo "$FAILS échec(s)"; exit 1; }
