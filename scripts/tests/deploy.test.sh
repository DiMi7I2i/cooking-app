#!/bin/bash
# Tests de deploy.sh dans un dépôt git jetable, avec un faux `docker`
# qui enregistre ce qu'on lui demande au lieu de lancer quoi que ce soit.
# Usage : bash scripts/tests/deploy.test.sh
ROOT="$(cd "$(dirname "$0")/../.." && pwd)"

FAILS=0
assert() { # assert <description> <commande...>
  local desc="$1"; shift
  if "$@"; then echo "  ✔ $desc"; else echo "  ✘ $desc"; FAILS=$((FAILS+1)); fi
}

# Dépôt de test : deploy.sh + common.sh, et un compose « marqué » par version
REPO="$(mktemp -d)"; FAKE="$(mktemp -d)"; LOG="$FAKE/calls.log"
trap 'rm -rf "$REPO" "$FAKE"' EXIT
mkdir -p "$REPO/scripts"
cp "$ROOT/deploy.sh" "$REPO/" 2>/dev/null
cp "$ROOT/scripts/common.sh" "$REPO/scripts/"
cd "$REPO" || exit 1
git init -q -b main && git config user.email t@t && git config user.name t
echo "version: v1" > docker-compose.prod.yml
git add -A && git commit -qm v1 && git tag v1.0
echo "version: v2" > docker-compose.prod.yml
git commit -qam v2

# Faux docker : `compose ... -f <fichier> ... up` note le contenu du fichier
cat > "$FAKE/docker" <<'EOS'
#!/bin/bash
echo "docker $*" >> "$LOG"
echo "env CERTS_DIR=$CERTS_DIR" >> "$LOG"
if [ "$1" = "compose" ] && [[ " $* " == *" up "* ]]; then
  prev=""; for a in "$@"; do [ "$prev" = "-f" ] && echo "deployed: $(cat "$a")" >> "$LOG"; prev="$a"; done
  [ -n "$FAIL_UP" ] && exit 1
fi
exit 0
EOS
chmod +x "$FAKE/docker"
deploy() { : > "$LOG"; LOG="$LOG" PATH="$FAKE:$PATH" ./deploy.sh "$@" 2>&1; }

echo "prérequis"
out="$(deploy)"; rc=$?
assert "échoue sans .env" test $rc -ne 0
assert "explique comment créer le .env" grep -q "cp .env.example .env" <<<"$out"
assert "ne lance rien sans .env" bash -c "! grep -q ' up ' '$LOG'"

printf 'HTTP_PORT=80\nMONGO_USER=u\nMONGO_PASSWORD=p\n' > .env

echo "certificats HTTPS"
out="$(deploy)"; rc=$?
assert "échoue sans certificat" test $rc -ne 0
assert "explique comment créer le certificat" grep -q "scripts/https-cert.sh --prod" <<<"$out"
assert "ne lance rien sans certificat" bash -c "! grep -q ' up ' '$LOG'"
mkdir -p certs && touch certs/server.crt certs/server.key
out="$(deploy)"; rc=$?
assert "réussit avec les certificats de certs/" test $rc -eq 0
assert "passe le dossier des certificats à Compose (chemin absolu)" grep -q "env CERTS_DIR=$REPO/certs" "$LOG"
assert "affiche une adresse https" grep -q "https://" <<<"$out"
assert "pas de port dans l'adresse quand HTTPS_PORT vaut 443 (défaut)" bash -c "! grep -qE 'https://[^ ]+:[0-9]+' <<<\"\$1\"" _ "$out"
printf 'HTTPS_PORT=8443\n' >> .env
out="$(deploy)"
assert "adresse avec le port quand HTTPS_PORT n'est pas 443" grep -qE "https://[^ ]+:8443" <<<"$out"
mkdir -p "$REPO/../autres-certs-$$" && touch "$REPO/../autres-certs-$$/server.crt" "$REPO/../autres-certs-$$/server.key"
printf 'CERTS_DIR=%s\n' "$REPO/../autres-certs-$$" >> .env
deploy >/dev/null
assert "CERTS_DIR du .env est respecté" grep -q "env CERTS_DIR=$REPO/../autres-certs-$$" "$LOG"
rm -rf "$REPO/../autres-certs-$$"
printf 'HTTP_PORT=80\nMONGO_USER=u\nMONGO_PASSWORD=p\n' > .env

echo "choix de la version"
out="$(deploy)"; rc=$?
assert "sans argument : réussit" test $rc -eq 0
assert "sans argument : déploie main" grep -q "deployed: version: v2" "$LOG"
assert "utilise le projet cooking-prod" grep -q -- "-p cooking-prod" "$LOG"
assert "passe le .env du dépôt" grep -q -- "--env-file $REPO/.env" "$LOG"
assert "affiche le commit déployé" grep -q "$(git rev-parse --short main)" <<<"$out"

out="$(deploy v1.0)"; rc=$?
assert "avec un tag : réussit" test $rc -eq 0
assert "avec un tag : déploie ce tag" grep -q "deployed: version: v1" "$LOG"

out="$(deploy inconnu)"; rc=$?
assert "version inconnue : échoue" test $rc -ne 0
assert "version inconnue : message clair" grep -q "inconnu" <<<"$out"
assert "version inconnue : ne lance rien" bash -c "! grep -q ' up ' '$LOG'"

echo "modifications non commitées"
echo "version: brouillon" > docker-compose.prod.yml
out="$(deploy)"; rc=$?
assert "déploie le commit, pas le dossier de travail" grep -q "deployed: version: v2" "$LOG"
assert "prévient que les modifications ne sont pas déployées" grep -qi "non commit" <<<"$out"
git checkout -q docker-compose.prod.yml

echo "échec du déploiement"
out="$(FAIL_UP=1 deploy)"; rc=$?
assert "renvoie une erreur" test $rc -ne 0
assert "affiche les logs des conteneurs" grep -q "compose.* logs" "$LOG"

[ "$FAILS" -eq 0 ] && echo "OK" || { echo "$FAILS échec(s)"; exit 1; }
