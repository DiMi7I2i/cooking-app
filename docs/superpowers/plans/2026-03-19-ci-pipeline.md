# CI Pipeline Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Set up a GitHub Actions CI pipeline with build, tests (backend + frontend), and a deploy placeholder.

**Architecture:** Single workflow file with 3 parallel jobs (backend, frontend-build, frontend-e2e). Frontend E2E uses a MongoDB service container and starts the backend live. Small code changes to make MongoDB URI configurable and fix E2E tests.

**Tech Stack:** GitHub Actions, Node 20, MongoDB 7.0 (service container), Cypress, Jest, mongodb-memory-server

**Spec:** `docs/superpowers/specs/2026-03-19-ci-pipeline-design.md`

---

## Chunk 1: Code changes for CI compatibility

### Task 1: Make MongoDB URI configurable

**Files:**
- Modify: `backend/cooking-nest-app/src/app.module.ts`

- [ ] **Step 1: Update app.module.ts**

Replace the hardcoded MongoDB URI with environment variable support:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RecipesModule } from './recipes/recipes.module';

@Module({
  imports: [
    MongooseModule.forRoot(
      process.env.MONGODB_URI || 'mongodb://cooking:cooking@localhost:27018',
      {
        dbName: process.env.MONGODB_DBNAME || 'cooking',
      },
    ),
    RecipesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

- [ ] **Step 2: Verify backend still works locally**

Run: `cd backend/cooking-nest-app && npm run build`
Expected: Compilation succeeds.

- [ ] **Step 3: Commit**

```bash
git add backend/cooking-nest-app/src/app.module.ts
git commit -m "feat(backend): make MongoDB URI configurable via env vars"
```

---

### Task 2: Refactor app.e2e-spec.ts to use mongodb-memory-server

**Files:**
- Modify: `backend/cooking-nest-app/test/app.e2e-spec.ts`

- [ ] **Step 1: Rewrite app.e2e-spec.ts**

Replace `backend/cooking-nest-app/test/app.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from '../src/app.controller';
import { AppService } from '../src/app.service';
import { RecipesModule } from '../src/recipes/recipes.module';

describe('AppController (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        RecipesModule,
      ],
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

  it('/ (GET)', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });
});
```

- [ ] **Step 2: Run E2E tests to verify**

Run: `cd backend/cooking-nest-app && npx jest --config ./test/jest-e2e.json --verbose`
Expected: All E2E tests PASS (both app.e2e-spec.ts and recipes.e2e-spec.ts).

- [ ] **Step 3: Commit**

```bash
git add backend/cooking-nest-app/test/app.e2e-spec.ts
git commit -m "fix(backend): refactor app.e2e-spec.ts to use mongodb-memory-server"
```

---

### Task 3: Fix Cypress E2E tests to be self-contained

**Files:**
- Modify: `frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts`

The tests "search recipes by title" and "view recipe detail" reference "Pad Thaï" which won't exist in a fresh database. Rewrite tests to create their own data first.

- [ ] **Step 1: Rewrite recipes.cy.ts**

Replace `frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts`:

```typescript
describe('Recipes CRUD', () => {
  it('should display the recipe list page', () => {
    cy.visit('/')
    cy.contains('Rechercher').should('be.visible')
  })

  it('should navigate to create recipe form', () => {
    cy.visit('/recipes/create')
    cy.contains('Créer une recette').should('be.visible')
  })

  it('should create a new recipe', () => {
    cy.visit('/recipes/create')

    cy.get('#title').type('Crêpes bretonnes')
    cy.get('#description').type('Délicieuses crêpes de sarrasin')

    // Select category
    cy.get('#categoryCode').click()
    cy.contains('Plat').click()

    // Select difficulty
    cy.get('#difficultyCode').click()
    cy.contains('Facile').click()

    // Select cost
    cy.get('#costCode').click()
    cy.contains('Bon marché').click()

    cy.get('#preparationDuration').type('15')
    cy.get('#cookDuration').type('20')

    // Add a step
    cy.contains('Ajouter une étape').click()
    cy.get('input').last().type('Mélanger la farine et les oeufs')

    // Submit
    cy.contains('Créer').click()

    // Should redirect to list and show the new recipe
    cy.url().should('eq', Cypress.config().baseUrl + '/')
    cy.contains('Crêpes bretonnes').should('be.visible')
  })

  it('should search recipes by title', () => {
    // Create a recipe first so we have data to search
    cy.request('POST', 'http://localhost:3000/data/recipes', {
      title: 'Pad Thaï',
      description: 'Plat thaïlandais',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      steps: ['Étape 1'],
    })

    cy.visit('/')
    cy.get('input[placeholder*="Rechercher"]').type('Pad')
    cy.contains('Rechercher').click()
    cy.contains('Pad Thaï').should('be.visible')
  })

  it('should view recipe detail', () => {
    cy.visit('/')
    // Click on first visible recipe (created in previous tests)
    cy.get('.border').first().click()
    cy.contains('Étapes').should('be.visible')
    cy.contains('Modifier').should('be.visible')
  })

  it('should delete a recipe', () => {
    // Create a recipe to delete
    cy.visit('/recipes/create')
    cy.get('#title').type('Recette à supprimer')
    cy.get('#categoryCode').click()
    cy.contains('Dessert').click()
    cy.get('#difficultyCode').click()
    cy.contains('Facile').click()
    cy.get('#costCode').click()
    cy.contains('Bon marché').click()
    cy.contains('Créer').click()

    // Navigate to its detail
    cy.contains('Recette à supprimer').click()

    // Delete it
    cy.contains('Supprimer').click()
    cy.contains('Êtes-vous sûr').should('be.visible')
    cy.get('.p-dialog-footer').contains('Supprimer').click()

    // Should redirect to list
    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })
})
```

Key changes:
- Removed `beforeEach(() => cy.visit('/'))` — each test navigates explicitly
- "search" test creates data via `cy.request` before searching
- "view detail" test clicks the first recipe card instead of relying on "Pad Thaï"

- [ ] **Step 2: Commit**

```bash
git add frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts
git commit -m "fix(frontend): make Cypress E2E tests self-contained (no seed data dependency)"
```

---

## Chunk 2: GitHub Actions workflow

### Task 4: Create the CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: Create directory**

Run: `mkdir -p .github/workflows`

- [ ] **Step 2: Create ci.yml**

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  backend:
    name: Backend - Build & Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: backend/cooking-nest-app/package-lock.json

      - name: Install dependencies
        working-directory: backend/cooking-nest-app
        run: npm ci

      - name: Build
        working-directory: backend/cooking-nest-app
        run: npm run build

      - name: Unit tests
        working-directory: backend/cooking-nest-app
        run: npm run test

      - name: E2E tests
        working-directory: backend/cooking-nest-app
        run: npx jest --config ./test/jest-e2e.json

  frontend-build:
    name: Frontend - Build & Component Tests
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: frontend/cooking-vue-app/package-lock.json

      - name: Install dependencies
        working-directory: frontend/cooking-vue-app
        run: npm ci

      - name: Build
        working-directory: frontend/cooking-vue-app
        run: npm run build

      - name: Component tests
        uses: cypress-io/github-action@v6
        with:
          working-directory: frontend/cooking-vue-app
          component: true
          install: false

  frontend-e2e:
    name: Frontend - E2E Tests
    runs-on: ubuntu-latest

    services:
      mongo:
        image: mongo:7.0
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
          cache-dependency-path: |
            backend/cooking-nest-app/package-lock.json
            frontend/cooking-vue-app/package-lock.json

      - name: Install backend dependencies
        working-directory: backend/cooking-nest-app
        run: npm ci

      - name: Install frontend dependencies
        working-directory: frontend/cooking-vue-app
        run: npm ci

      - name: Build backend
        working-directory: backend/cooking-nest-app
        run: npm run build

      - name: Start backend
        working-directory: backend/cooking-nest-app
        run: node dist/main &
        env:
          MONGODB_URI: mongodb://localhost:27017
          MONGODB_DBNAME: cooking

      - name: Wait for backend
        run: |
          for i in $(seq 1 30); do
            curl -s http://localhost:3000 && break
            sleep 1
          done

      - name: Build frontend
        working-directory: frontend/cooking-vue-app
        run: npm run build-only

      - name: E2E tests
        uses: cypress-io/github-action@v6
        with:
          working-directory: frontend/cooking-vue-app
          install: false
          start: npm run preview
          wait-on: 'http://localhost:4173'

  # deploy:
  #   name: Deploy
  #   runs-on: ubuntu-latest
  #   needs: [backend, frontend-build, frontend-e2e]
  #   if: github.ref == 'refs/heads/main' && github.event_name == 'push'
  #   steps:
  #     - uses: actions/checkout@v4
  #     - name: Deploy
  #       run: echo "Deploy step - to be configured"
```

- [ ] **Step 3: Verify YAML syntax**

Run: `python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))" && echo "YAML valid"`
Expected: "YAML valid"

- [ ] **Step 4: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "ci: add GitHub Actions pipeline — build, tests, E2E"
```

---

### Task 5: Push and verify pipeline runs

- [ ] **Step 1: Push to GitHub**

Run: `git push origin main`

- [ ] **Step 2: Check pipeline status**

Run: `gh run list --limit 1`
Expected: Shows the CI workflow running.

- [ ] **Step 3: Watch pipeline execution**

Run: `gh run watch`
Monitor until all jobs pass or identify failures.

- [ ] **Step 4: Fix any issues if needed**

If a job fails, check logs with:
```bash
gh run view --log-failed
```
Fix the issue, commit, and push again.
