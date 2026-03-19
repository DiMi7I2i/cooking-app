# GitHub Actions CI Pipeline — Design Specification

## Overview

Pipeline CI pour cooking-app sur GitHub Actions. Build + Tests sur push main et Pull Requests. Étape déploiement en placeholder pour plus tard.

## Déclenchement

- Push sur `main`
- Pull Request vers `main`

## Jobs

### 1. backend

**Runner :** `ubuntu-latest`, Node 20

Étapes :
1. Checkout code
2. Setup Node 20 (avec cache npm — cache le répertoire `~/.npm`, `npm ci` réinstalle depuis ce cache)
3. `npm ci` dans `backend/cooking-nest-app/`
4. `npm run build` — vérifier la compilation TypeScript
5. `npm run test` — unit tests (Jest, mocks Mongoose)
6. E2E tests via `npx jest --config ./test/jest-e2e.json` — tests (Jest + Supertest + mongodb-memory-server)

Note : `app.e2e-spec.ts` importe `AppModule` qui contient l'URI MongoDB. Ce test doit être refactoré pour utiliser mongodb-memory-server (comme `recipes.e2e-spec.ts`) ou être skippé en CI.

### 2. frontend-build

**Runner :** `ubuntu-latest`, Node 20

Étapes :
1. Checkout code
2. Setup Node 20 (avec cache npm)
3. `npm ci` dans `frontend/cooking-vue-app/`
4. `npm run build` — type-check + production build Vite (vérifications indépendantes)
5. Component tests Cypress via `cypress-io/github-action` (headless, cache binaire Cypress automatique)

Note : les component tests Cypress utilisent leur propre dev server Vite (configuré dans `cypress.config.ts`), indépendant du build production.

### 3. frontend-e2e

**Runner :** `ubuntu-latest`, Node 20
**Service :** MongoDB via `services: mongo` (image `mongo:7.0`, port 27017)

Utiliser un vrai service MongoDB Docker plutôt que mongodb-memory-server pour le backend live. C'est plus simple et plus fiable pour les tests E2E frontend.

Étapes :
1. Checkout code
2. Setup Node 20 (avec cache npm)
3. `npm ci` dans `backend/cooking-nest-app/` et `frontend/cooking-vue-app/`
4. Démarrer le backend en arrière-plan avec `MONGODB_URI=mongodb://localhost:27017/cooking`
5. Seed data : envoyer une requête POST pour créer la recette Pad Thaï (nécessaire pour les tests de recherche)
6. Build frontend + démarrer le serveur preview (`npm run build && npm run preview`)
7. Cypress E2E via `cypress-io/github-action` (base URL : `http://localhost:4173`)

### 4. deploy (placeholder)

**Conditionné à :** `github.ref == 'refs/heads/main'` et `github.event_name == 'push'`
**Dépend de :** backend, frontend-build, frontend-e2e

Commenté/désactivé. Prêt à être activé quand la cible de déploiement sera choisie.

## Modifications requises au code existant

### 1. Backend : MONGODB_URI configurable

`backend/cooking-nest-app/src/app.module.ts` — remplacer l'URI hardcodée par :
```typescript
MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://cooking:cooking@localhost:27018', {
  dbName: process.env.MONGODB_DBNAME || 'cooking',
})
```

Cela permet à la pipeline de passer une URI MongoDB différente via variable d'environnement.

### 2. Backend : refactor app.e2e-spec.ts

`backend/cooking-nest-app/test/app.e2e-spec.ts` importe directement `AppModule` qui contient l'URI MongoDB hardcodée. En CI, aucun MongoDB ne tourne sur `localhost:27018`.

Solution : refactorer ce test pour utiliser mongodb-memory-server (comme `recipes.e2e-spec.ts`), en construisant un module de test avec `MongooseModule.forRoot(memoryUri)` au lieu d'importer `AppModule`.

### 3. Frontend E2E : seed data

Les tests Cypress E2E (`recipes.cy.ts`) supposent que des données existent (test "search recipes by title" cherche "Pad Thaï"). Avec une base vide, ce test échouera.

Solution : dans le workflow, après le démarrage du backend, envoyer un `curl POST` pour créer la recette de test avant de lancer Cypress. Alternativement, modifier le test pour créer ses propres données en premier (le test "create" tourne avant "search" dans le fichier, mais c'est fragile).

Approche retenue : réordonner les tests Cypress E2E pour que la création soit toujours en premier, et que la recherche cherche la recette créée par le test précédent (pas "Pad Thaï").

## Cache

- `actions/setup-node` avec `cache: 'npm'` — cache le répertoire npm (`~/.npm`), `npm ci` réinstalle depuis ce cache
- `cypress-io/github-action` — cache binaire Cypress automatiquement

## Hors scope

- Déploiement (cible non définie)
- Notifications (Slack, email) sur échec
- Badges de statut dans le README
