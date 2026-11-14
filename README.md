# cooking

## back-end technologies

- NestJS framework
- MongoDB for the database


## front-end technologies

- VueJS framework


## HTTPS sur le réseau local

L'appli est servie en HTTPS, y compris sur le réseau local. Sans HTTPS, le téléphone ne peut pas
ouvrir son menu de partage (bouton « Partager » d'une recette) : il télécharge seulement le PDF.

Le certificat vient d'une **autorité de certification locale**, créée une fois sur le PC par
`scripts/https-cert.sh`. Chaque téléphone doit faire confiance à cette autorité : on y installe une seule fois
son certificat public, `cooking-ca.crt`, qui sert ensuite pour la prod comme pour la dev.

### Mise en place de la prod (une seule fois, sur le PC serveur)

1. **Configuration** : `cp .env.example .env`, puis adapter le mot de passe MongoDB et, si besoin,
   les ports (`HTTPS_PORT=443`, `HTTP_PORT=80` ; le port HTTP redirige vers HTTPS).
2. **Adresse IP fixe** : réserver l'IP du PC dans la box (réservation DHCP).
   Le certificat est lié à cette IP : si elle change, les téléphones le refusent.
3. **Certificat** :
   ```bash
   scripts/https-cert.sh --prod                 # IP du PC détectées automatiquement
   scripts/https-cert.sh --prod 192.168.1.20 cooking.local   # ou IP / noms choisis
   ```
   Crée l'autorité dans `~/.local/share/cooking-app-ca` (si elle n'existe pas encore), puis le certificat dans `certs/`.
4. **Déploiement** : `./deploy.sh`. Il refuse de déployer sans certificat, puis affiche l'adresse
   `https://…` et la date d'expiration du certificat.
5. **Pare-feu** : `sudo ufw allow 80/tcp && sudo ufw allow 443/tcp`. Pas de redirection de port sur la box :
   l'appli reste privée au réseau local.

### Installer l'autorité sur un téléphone (une seule fois par téléphone)

Copier `certs/cooking-ca.crt` sur le téléphone (e-mail, messagerie, câble…), puis :

- **Android** : Paramètres › Sécurité › Chiffrement et identifiants › Installer un certificat ›
  Certificat CA › choisir `cooking-ca.crt`.
- **iPhone** : ouvrir le fichier › Réglages › Profil téléchargé › Installer, **puis** Réglages ›
  Général › Informations › Réglages des certificats › activer la confiance pour « Cooking App CA (<nom du PC>) ».

Ouvrir ensuite `https://<IP du PC>` : aucun avertissement ne doit apparaître.

### Renouvellement (environ une fois par an)

Le certificat du serveur est valable 397 jours, la durée maximale acceptée par iPhone et par les navigateurs.
Avant l'échéance (ou après un changement d'IP) :

```bash
scripts/https-cert.sh --prod && ./deploy.sh
```

L'autorité reste la même : rien à refaire sur les téléphones.

### HTTPS en dev (tester depuis un téléphone)

```bash
./start.sh                                        # MongoDB + backend (+ frontend en HTTP)
scripts/https-cert.sh                             # certificat dans frontend/cooking-vue-app/.certs
cd frontend/cooking-vue-app && npm run dev:https  # Vite en HTTPS sur le port 5174, ouvert au réseau
```

Puis ouvrir `https://<IP du PC>:5174` sur le téléphone, et ouvrir le port 5174 dans ufw le temps du test.

### Sécurité

- La clé privée de l'autorité (`~/.local/share/cooking-app-ca/rootCA.key`) permet de créer
  des certificats que vos téléphones accepteront pour **n'importe quel site**. Elle ne doit pas quitter le PC :
  ne pas la copier, ne pas l'envoyer, ne pas la versionner.
- Les dossiers `certs/` et `frontend/cooking-vue-app/.certs/` ne sont pas versionnés.
- Pour retirer la confiance d'un téléphone, supprimer le certificat « Cooking App CA » dans ses réglages.

### En cas de problème

| Symptôme | Cause probable |
|---|---|
| Avertissement « connexion non privée » | Autorité non installée sur le téléphone, ou confiance non activée (iPhone) |
| Avertissement après un changement de box ou d'IP | Le certificat ne couvre plus l'IP : relancer `scripts/https-cert.sh --prod && ./deploy.sh` |
| « Partager » télécharge le PDF au lieu d'ouvrir le menu de partage | Page ouverte en `http://` ; ou navigateur sans partage de fichiers (normal sur ordinateur) |
| `./deploy.sh` : « Certificat HTTPS manquant » | Lancer `scripts/https-cert.sh --prod` |


