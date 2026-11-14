# CLAUDE.md — cooking-app

## Project Overview

Application de recettes de cuisine avec un backend API et un frontend SPA. Interface en français.
CRUD complet (création, lecture, modification, suppression) avec recherche par nom et filtre par catégorie.

## Tech Stack

### Backend (`backend/cooking-nest-app/`)
- **Framework:** NestJS 11 (TypeScript 5.9)
- **Database:** MongoDB 7.0 via Mongoose 9
- **Validation:** class-validator + class-transformer (ValidationPipe)
- **Upload:** Multer (images JPEG/PNG/WebP, 5 Mo max, stockage local `uploads/`)
- **Port:** 3000
- **Entry point:** `src/main.ts`

### Frontend (`frontend/cooking-vue-app/`)
- **Framework:** Vue 3.5 (Composition API + `<script setup>`)
- **Build:** Vite 8
- **Language:** TypeScript 5.9
- **UI:** PrimeVue 4 (thème Aura Light Blue) + Tailwind CSS 4 + SCSS
- **Routing:** Vue Router 5 (`createWebHistory`)
- **Port:** 5173 (dev)
- **Entry point:** `src/main.ts`

### Infrastructure (`backend/dev/`)
- **MongoDB:** Docker Compose (`mongodb.yml`), port 27018, credentials `cooking/cooking`, base `cooking`
- **Init data:** `recipes.js` (sample recipe: Pad Thaï)

### Production — réseau local (`docker-compose.prod.yml`)
- **Stack:** nginx (build Vue + proxy `/data` et `/uploads`) → backend NestJS → MongoDB, projet Compose `cooking-prod`
- **Exposition:** seul nginx publie des ports : HTTPS (`HTTPS_PORT`, 443) et HTTP (`HTTP_PORT`, 80, redirige vers HTTPS) ; backend et MongoDB restent internes
- **HTTPS:** certificat de l'autorité locale (`scripts/https-cert.sh --prod`) monté en lecture seule dans nginx ; config `frontend/cooking-vue-app/nginx.conf.template`
- **Données:** volumes `cooking-prod_mongo-data` et `cooking-prod_uploads`, séparés de la base de dev (démarre vide)
- **Config:** `.env` à la racine (non versionné), modèle dans `.env.example`
- **Frontend:** appelle l'API en URL relatives ; en dev, le proxy Vite (`vite.config.ts`) relaie vers `localhost:3000`

## Common Commands

### Dev (tout-en-un)
```bash
./start.sh             # MongoDB dev + backend + frontend (Ctrl+C pour tout arrêter)
./stop.sh              # Arrêt
```

### HTTPS sur le réseau local (dev et prod)
Le partage natif d'un fichier (bouton « Partager ») exige HTTPS hors `localhost`.
`scripts/https-cert.sh` crée une fois une autorité locale (`~/.local/share/cooking-app-ca`, hors dépôt), commune à la dev et à la prod,
puis un certificat serveur (397 jours) pour `localhost` + les IP du PC (ou les IP/noms passés en argument, ex. `cooking.local`).
Installer une seule fois `cooking-ca.crt` (copié à côté du certificat) sur chaque téléphone ; le script explique comment.
```bash
scripts/https-cert.sh                   # Dev : certificat dans frontend/cooking-vue-app/.certs
cd frontend/cooking-vue-app && npm run dev:https   # Vite en HTTPS, port 5174, ouvert au réseau (backend : ./start.sh)
scripts/https-cert.sh --prod            # Prod : certificat dans certs/ (CERTS_DIR), puis ./deploy.sh ; à relancer avant expiration
```

### Production — réseau local (lancement manuel uniquement, jamais automatique)
```bash
cp .env.example .env   # Une seule fois, puis adapter (mot de passe MongoDB, ports)
scripts/https-cert.sh --prod   # Une seule fois (puis avant expiration du certificat, ~1 an)
./deploy.sh            # Déploie la branche main locale
./deploy.sh v1.0       # Déploie un tag, une branche ou un commit
docker compose -p cooking-prod logs -f   # Logs de la prod
docker compose -p cooking-prod down      # Arrêt (données conservées)
```
`deploy.sh` extrait le commit choisi (`git archive`) : les modifications non commitées ne sont jamais déployées.
Il refuse de déployer sans certificat HTTPS et transmet son dossier (absolu) à Compose via `CERTS_DIR`.

### Sauvegardes de la production
```bash
./backup.sh                                   # Archive datée (base + images) dans backups/, garde les 14 dernières
./restore.sh backups/cooking-<date>.tar.gz    # Restaure (remplace tout, demande confirmation ; --yes pour forcer)
```
Réglages facultatifs dans `.env` : `BACKUP_DIR`, `BACKUP_KEEP`. Sauvegarde quotidienne à 3 h via `crontab -e` :
```
0 3 * * * /chemin/vers/cooking-app/backup.sh >> $HOME/cooking-backup.log 2>&1
```

### Tests des scripts
```bash
bash scripts/tests/common.test.sh       # Fonctions Docker partagées
bash scripts/tests/deploy.test.sh       # deploy.sh (faux docker, rapide)
bash scripts/tests/prod-stack.test.sh   # Stack de prod réelle et jetable, en HTTPS (ports 8099/8449, ~2-3 min)
bash scripts/tests/backup.test.sh       # backup.sh + restore.sh sur une stack jetable (ports 8099/8449)
bash scripts/tests/devstack.test.sh     # start.sh / stop.sh réels (~2 min, ports 3000/5173 libres)
bash scripts/tests/https-cert.test.sh   # Certificats HTTPS dev/prod (rapide, openssl)
```

### Database
```bash
cd backend/dev
docker compose -f mongodb.yml up -d --build   # Start MongoDB
docker compose -f mongodb.yml down             # Stop MongoDB
docker compose -f mongodb.yml down -v          # Stop + reset data
```

### Backend
```bash
cd backend/cooking-nest-app
npm run start:dev      # Dev server (watch mode, port 3000)
npm run build          # Compile TypeScript
npm run test           # Unit tests (Jest)
npm run test:e2e       # E2E tests (Jest + Supertest + mongodb-memory-server)
npm run lint           # ESLint
npm run format         # Prettier
```

### Frontend
```bash
cd frontend/cooking-vue-app
npm run dev            # Dev server (Vite, port 5173)
npm run build          # Type-check + production build
npm run test:unit      # Component tests (Cypress headless)
npm run test:e2e       # E2E tests (Cypress, port 4173)
npm run lint           # ESLint
npm run format         # Prettier
```

## Architecture

### Backend Structure
```
src/
├── main.ts                          # Bootstrap, CORS, ValidationPipe, static assets
├── app.module.ts                    # Root module, MongoDB connection
├── app.controller.ts                # GET /
└── recipes/
    ├── recipes.module.ts            # Feature module + Multer config
    ├── controller/
    │   ├── recipes.controller.ts    # CRUD endpoints /data/recipes
    │   └── recipes.controller.spec.ts
    ├── services/
    │   ├── recipes.service.ts       # Business logic + file cleanup
    │   └── recipes.service.spec.ts
    ├── schemas/
    │   ├── recipe.schema.ts         # Mongoose schema (all fields, enums, timestamps)
    │   └── recipe.schema.spec.ts
    ├── dto/
    │   ├── create-recipe.dto.ts     # Validation: title, category, difficulty, cost required
    │   ├── update-recipe.dto.ts     # All fields optional
    │   ├── query-recipes.dto.ts     # Pagination + filters (title, categoryCode)
    │   └── paginated-response.dto.ts
    └── enums/
        ├── category.enum.ts
        ├── difficulty.enum.ts
        └── cost.enum.ts
```

### Frontend Structure
```
src/
├── main.ts                          # App bootstrap + router + PrimeVue components
├── App.vue                          # Root layout (Header, Toast, router-view, Footer)
├── components/
│   ├── Header.vue                   # Header teal avec sidebar toggle
│   ├── Footer.vue                   # Copyright
│   ├── LeftBar.vue                  # Sidebar navigation (router-link, catégories)
│   ├── SearchRecipes.vue            # Liste paginée + recherche + filtre catégorie
│   ├── RecipeCard.vue               # Carte recette (tags, durées, image)
│   ├── RecipeDetail.vue             # Vue détaillée + modifier/supprimer
│   ├── RecipeForm.vue               # Formulaire création/modification + upload image
│   └── __tests__/                   # Cypress component tests
├── types/recipe.ts                  # Recipe, PaginatedResponse, RecipeFilters
├── services/RecipeService.ts        # API calls (fetch)
└── enums/                           # Category, Difficulty, Cost (string enums + labels FR)
```

### API Endpoints
- `GET /` — Health check ("Hello World!")
- `GET /data/recipes` — Liste paginée + filtres (`?title=&categoryCode=&page=&limit=`)
- `GET /data/recipes/:id` — Détail d'une recette
- `POST /data/recipes` — Créer (multipart/form-data)
- `PUT /data/recipes/:id` — Modifier (multipart/form-data)
- `DELETE /data/recipes/:id` — Supprimer (204 No Content)

### Routes Frontend
- `/` — Recherche de recettes (SearchRecipes)
- `/recipes/create` — Formulaire de création (RecipeForm)
- `/recipes/:id` — Détail d'une recette (RecipeDetail)
- `/recipes/:id/edit` — Formulaire de modification (RecipeForm)

## Coding Conventions

- **TypeScript** partout (backend et frontend)
- **Vue 3 Composition API** avec `<script setup lang="ts">`
- **NestJS patterns:** modules/controllers/services/DTOs/schemas
- **Styling:** Tailwind CSS utilities + SCSS, thème PrimeVue Aura Light Blue, couleur principale teal
- **Langue UI:** Français (labels, catégories, navigation)
- **Formatting:** Prettier + ESLint configurés dans les deux projets

## Development Methodology

### TDD (Test-Driven Development)
Pour chaque fonctionnalité :
1. **RED** : Écrire les tests en premier (ils doivent échouer)
2. **GREEN** : Implémenter le minimum pour que les tests passent
3. **REFACTOR** : Nettoyer le code si nécessaire

### Test Stack
- **Backend unit tests** : Jest + @nestjs/testing (mock Mongoose model)
- **Backend E2E tests** : Jest + Supertest + mongodb-memory-server (base in-memory)
- **Frontend component tests** : Cypress component testing
- **Frontend E2E tests** : Cypress E2E

## Data Model

### Recipe (MongoDB)
| Champ | Type | Requis |
|-------|------|--------|
| title | string (max 200) | oui |
| description | string | non |
| thumbnail | string (path upload) | non |
| categoryCode | enum string | oui |
| difficultyCode | enum string | oui |
| costCode | enum string | oui |
| preparationDuration | number (minutes) | non |
| cookDuration | number (minutes) | non |
| breakDuration | number (minutes) | non |
| steps | string[] | non |
| createdAt / updatedAt | Date (auto) | auto |

### Enums (backend + frontend, string values)
- **Category:** APERITIF, ENTREE, PLAT, DESSERT, BOISSON, DEJ_BRUNCH
- **Difficulty:** EASY, MIDDLE, HARD, VERY_HARD, EXPERT
- **Cost:** CHEAP, MIDDLE, EXPENSIVE

## Design & Plan Documents
- **Spec:** `docs/superpowers/specs/2026-03-19-cooking-app-v1-design.md`
- **Plan:** `docs/superpowers/plans/2026-03-19-cooking-app-v1.md`
