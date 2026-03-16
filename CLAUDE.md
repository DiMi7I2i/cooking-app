# CLAUDE.md — cooking-app

## Project Overview

Application de recettes de cuisine avec un backend API et un frontend SPA. Interface en français.

## Tech Stack

### Backend (`backend/cooking-nest-app/`)
- **Framework:** NestJS v10 (TypeScript 5.1)
- **Database:** MongoDB 7.0 via Mongoose v8.3
- **Port:** 3000
- **Entry point:** `src/main.ts`

### Frontend (`frontend/cooking-vue-app/`)
- **Framework:** Vue 3.4 (Composition API + `<script setup>`)
- **Build:** Vite 5.2
- **Language:** TypeScript 5.4
- **UI:** PrimeVue 3.52 (thème Aura Light Blue) + Tailwind CSS 3.4 + SCSS
- **Routing:** Vue Router 4 (`createWebHistory`)
- **Port:** 5173 (dev)
- **Entry point:** `src/main.ts`

### Infrastructure (`backend/dev/`)
- **MongoDB:** Docker Compose (`mongodb.yml`), port 27018, credentials `cooking/cooking`, base `cooking`
- **Init data:** `recipes.js` (sample recipe: Pad Thaï)

## Common Commands

### Database
```bash
cd backend/dev
docker-compose -f mongodb.yml up -d --build   # Start MongoDB
docker-compose -f mongodb.yml down             # Stop MongoDB
```

### Backend
```bash
cd backend/cooking-nest-app
npm run start:dev      # Dev server (watch mode, port 3000)
npm run build          # Compile TypeScript
npm run test           # Unit tests (Jest)
npm run test:e2e       # E2E tests (Jest + Supertest)
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
├── main.ts                          # Bootstrap, port 3000
├── app.module.ts                    # Root module, MongoDB connection
├── app.controller.ts                # GET /
└── recipes/
    ├── recipes.module.ts            # Feature module
    ├── controller/recipes.controller.ts   # GET /data/recipes
    ├── services/recipes.service.ts        # Business logic
    ├── schemas/recipe.schema.ts           # Mongoose schema
    └── dto/recipe.dto.ts                  # DTO
```

### Frontend Structure
```
src/
├── main.ts                          # App bootstrap + router
├── App.vue                          # Root layout (grid: header, content, footer)
├── components/
│   ├── Header.vue                   # Header teal avec sidebar toggle
│   ├── Footer.vue                   # Copyright
│   ├── LeftBar.vue                  # Sidebar navigation (PrimeVue Sidebar)
│   ├── SearchRecipes.vue            # Liste recettes (DataView paginé)
│   └── CreateNewRecipe.vue          # Placeholder création recette
├── enums/                           # Category, Difficulty, Cost
└── service/ProductService.js        # Données mockées
```

### API Endpoints
- `GET /` — Health check ("Hello World!")
- `GET /data/recipes` — Liste des recettes (titres)

## Coding Conventions

- **TypeScript** partout (backend et frontend)
- **Vue 3 Composition API** avec `<script setup lang="ts">`
- **NestJS patterns:** modules/controllers/services/DTOs/schemas
- **Styling:** Tailwind CSS utilities + SCSS, thème PrimeVue Aura Light Blue, couleur principale teal
- **Langue UI:** Français (labels, catégories, navigation)
- **Formatting:** Prettier + ESLint configurés dans les deux projets

## Data Model

### Recipe (MongoDB)
Champs connus (via `recipes.js`): `title`, `thumbnail`, `description`, `categoryCode`, `difficultyCode`, `costCode`, `preparationDuration`, `cookDuration`, `steps` (array ordonnée)

### Enums Frontend
- **Category:** APERITIF, ENTREE, PLAT, DESSERT, BOISSON, DEJ_BRUNCH
- **Difficulty:** EASY, MIDDLE, HARD, VERY_HARD, EXPERT
- **Cost:** CHEAP, MIDDLE, EXPENSIVE
