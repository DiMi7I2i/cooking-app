# Ingredients Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an ingredients list (name, quantity, unit) to recipes, with at least one ingredient required on creation.

**Architecture:** New Ingredient sub-schema in Mongoose, CreateIngredientDto for nested validation, JSON serialization via FormData. Frontend adds ingredient section to RecipeForm and RecipeDetail.

**Tech Stack:** NestJS (Mongoose, class-validator, class-transformer) | Vue 3 (PrimeVue)

**Spec:** `docs/superpowers/specs/2026-03-21-ingredients-design.md`

---

## Chunk 1: Backend — Schema, DTOs, Tests

### Task 1: Ingredient sub-schema + Recipe schema update (TDD)

**Files:**
- Create: `backend/cooking-nest-app/src/recipes/schemas/ingredient.schema.ts`
- Modify: `backend/cooking-nest-app/src/recipes/schemas/recipe.schema.ts`
- Modify: `backend/cooking-nest-app/src/recipes/schemas/recipe.schema.spec.ts`

- [ ] **Step 1: Write failing schema tests**

Add to `recipe.schema.spec.ts`:

```typescript
  it('should store recipe with ingredients', async () => {
    const recipe = new RecipeModel({
      title: 'Crêpes',
      categoryCode: 'DESSERT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      ingredients: [
        { name: 'Farine', quantity: 250, unit: 'g' },
        { name: 'Sel' },
      ],
    });
    const errors = recipe.validateSync();
    expect(errors).toBeUndefined();
    const obj = recipe.toObject();
    expect(obj.ingredients).toBeDefined();
    expect(obj.ingredients).toHaveLength(2);
    expect(obj.ingredients[0].name).toBe('Farine');
  });

  it('should store ingredient without quantity and unit', async () => {
    const recipe = new RecipeModel({
      title: 'Test',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      ingredients: [{ name: 'Sel' }],
    });
    const errors = recipe.validateSync();
    expect(errors).toBeUndefined();
    const obj = recipe.toObject();
    expect(obj.ingredients[0].name).toBe('Sel');
    expect(obj.ingredients[0].quantity).toBeUndefined();
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/schemas/recipe.schema.spec.ts --verbose`
Expected: FAIL — `obj.ingredients` is undefined because Mongoose doesn't know the field yet (silently ignores it).

- [ ] **Step 3: Create Ingredient sub-schema**

Create `backend/cooking-nest-app/src/recipes/schemas/ingredient.schema.ts`:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Ingredient {
  @Prop({ required: true, maxlength: 200 })
  name: string;

  @Prop()
  quantity: number;

  @Prop({ maxlength: 50 })
  unit: string;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
```

- [ ] **Step 4: Add ingredients field to Recipe schema**

Add to `recipe.schema.ts` after the `steps` field:

```typescript
import { Ingredient, IngredientSchema } from './ingredient.schema';

// Inside the Recipe class:
  @Prop({ type: [IngredientSchema] })
  ingredients: Ingredient[];
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/schemas/recipe.schema.spec.ts --verbose`
Expected: All tests PASS.

- [ ] **Step 6: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/schemas/
git commit -m "feat(backend): add Ingredient sub-schema to Recipe (TDD)"
```

---

### Task 2: DTOs + E2E tests with ingredients (TDD)

DTOs and E2E tests are done together to avoid breaking existing tests (adding required `ingredients` to CreateRecipeDto would fail existing E2E POST without ingredients).

**Files:**
- Create: `backend/cooking-nest-app/src/recipes/dto/create-ingredient.dto.ts`
- Modify: `backend/cooking-nest-app/src/recipes/dto/create-recipe.dto.ts`
- Modify: `backend/cooking-nest-app/src/recipes/dto/update-recipe.dto.ts`
- Modify: `backend/cooking-nest-app/test/recipes.e2e-spec.ts`

- [ ] **Step 1: Create CreateIngredientDto**

Create `backend/cooking-nest-app/src/recipes/dto/create-ingredient.dto.ts`:

```typescript
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsNumber,
  Min,
  IsOptional,
} from 'class-validator';

export class CreateIngredientDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  name: string;

  @IsNumber()
  @Min(0.01)
  @IsOptional()
  quantity?: number;

  @IsString()
  @MaxLength(50)
  @IsOptional()
  unit?: string;
}
```

- [ ] **Step 2: Add ingredients to CreateRecipeDto**

Add to `create-recipe.dto.ts` after the `steps` field:

```typescript
import { ValidateNested, ArrayNotEmpty } from 'class-validator';
import { CreateIngredientDto } from './create-ingredient.dto';

// Inside CreateRecipeDto class:
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientDto)
  @ArrayNotEmpty()
  ingredients: CreateIngredientDto[];
```

Update imports at the top: add `ValidateNested, ArrayNotEmpty` to class-validator imports.

- [ ] **Step 3: Add ingredients to UpdateRecipeDto**

Add to `update-recipe.dto.ts` after the `steps` field:

```typescript
import { ValidateNested, ArrayNotEmpty } from 'class-validator';
import { CreateIngredientDto } from './create-ingredient.dto';

// Inside UpdateRecipeDto class:
  @Transform(({ value }) => (typeof value === 'string' ? JSON.parse(value) : value))
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientDto)
  @ArrayNotEmpty()
  @IsOptional()
  ingredients?: CreateIngredientDto[];
```

- [ ] **Step 4: Update E2E tests to include ingredients**

Update the POST test to include ingredients, add a test for empty ingredients, and update the GET detail test to verify ingredients. See full E2E test changes:

Replace the POST create test:
```typescript
  it('POST /data/recipes — should create a recipe', async () => {
    const res = await request(app.getHttpServer())
      .post('/data/recipes')
      .send({
        title: 'Pad Thaï',
        description: 'Plat thaïlandais',
        categoryCode: 'PLAT',
        difficultyCode: 'EASY',
        costCode: 'CHEAP',
        preparationDuration: 30,
        cookDuration: 15,
        steps: ['Étape 1', 'Étape 2'],
        ingredients: [
          { name: 'Nouilles de riz', quantity: 200, unit: 'g' },
          { name: 'Sel' },
        ],
      })
      .expect(201);

    expect(res.body.title).toBe('Pad Thaï');
    expect(res.body._id).toBeDefined();
    expect(res.body.ingredients).toHaveLength(2);
    expect(res.body.ingredients[0].name).toBe('Nouilles de riz');
    createdRecipeId = res.body._id;
  });
```

Add after the existing 400 test:
```typescript
  it('POST /data/recipes — should return 400 when ingredients is empty', async () => {
    await request(app.getHttpServer())
      .post('/data/recipes')
      .send({
        title: 'Test',
        categoryCode: 'PLAT',
        difficultyCode: 'EASY',
        costCode: 'CHEAP',
        ingredients: [],
      })
      .expect(400);
  });
```

Replace the GET detail test:
```typescript
  it('GET /data/recipes/:id — should return a recipe with ingredients', async () => {
    const res = await request(app.getHttpServer())
      .get(`/data/recipes/${createdRecipeId}`)
      .expect(200);

    expect(res.body.title).toBe('Pad Thaï');
    expect(res.body.ingredients).toHaveLength(2);
    expect(res.body.ingredients[0].name).toBe('Nouilles de riz');
    expect(res.body.ingredients[0].quantity).toBe(200);
    expect(res.body.ingredients[0].unit).toBe('g');
    expect(res.body.ingredients[1].name).toBe('Sel');
  });
```

- [ ] **Step 5: Run E2E tests**

Run: `cd backend/cooking-nest-app && npx jest --config ./test/jest-e2e.json test/recipes.e2e-spec.ts --verbose`
Expected: All tests PASS.

- [ ] **Step 6: Run all backend tests**

Run: `cd backend/cooking-nest-app && npx jest --verbose`
Expected: All tests PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/dto/ backend/cooking-nest-app/test/recipes.e2e-spec.ts
git commit -m "feat(backend): add CreateIngredientDto, update DTOs + E2E tests for ingredients (TDD)"
```

---

### Task 3: Update seed data

**Files:**
- Modify: `backend/dev/recipes.js`

- [ ] **Step 1: Add ingredients to Pad Thaï seed data**

Add `ingredients` field to the Pad Thaï recipe in `backend/dev/recipes.js`:

```javascript
        ingredients: [
            { name: "Nouilles de riz", quantity: 200, unit: "g" },
            { name: "Poulet", quantity: 150, unit: "g" },
            { name: "Œufs", quantity: 2 },
            { name: "Huile végétale", quantity: 3, unit: "cuillères à soupe" },
            { name: "Basilic thaï" },
            { name: "Ail", quantity: 2, unit: "gousses" },
            { name: "Nuoc-mâm", quantity: 2, unit: "cuillères à soupe" },
            { name: "Sucre", quantity: 1, unit: "cuillère à soupe" },
            { name: "Vinaigre de riz", quantity: 1, unit: "cuillère à soupe" },
            { name: "Cacahuètes concassées", quantity: 30, unit: "g" },
            { name: "Piment", quantity: 1 },
            { name: "Citron vert", quantity: 1 },
            { name: "Sel" },
            { name: "Paprika" }
        ]
```

- [ ] **Step 2: Rebuild MongoDB**

Run:
```bash
cd backend/dev
docker-compose -f mongodb.yml down -v
docker-compose -f mongodb.yml up -d --build
```

- [ ] **Step 3: Commit**

```bash
git add backend/dev/recipes.js
git commit -m "chore(seed): add ingredients to Pad Thaï seed data"
```

---

## Chunk 2: Frontend — Types, Form, Detail

### Task 4: Update frontend types

**Files:**
- Modify: `frontend/cooking-vue-app/src/types/recipe.ts`

- [ ] **Step 1: Add Ingredient interface and update Recipe**

Update `frontend/cooking-vue-app/src/types/recipe.ts`:

```typescript
export interface Ingredient {
  name: string
  quantity?: number
  unit?: string
}

export interface Recipe {
  _id: string
  title: string
  description?: string
  thumbnail?: string
  categoryCode: string
  difficultyCode: string
  costCode: string
  preparationDuration?: number
  cookDuration?: number
  breakDuration?: number
  steps: string[]
  ingredients: Ingredient[]
  createdAt: string
  updatedAt: string
}
```

- [ ] **Step 2: Verify build**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/types/recipe.ts
git commit -m "feat(frontend): add Ingredient type to Recipe interface"
```

---

### Task 5: Update RecipeForm with ingredients section

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Add ingredients to form reactive state**

In the `form` reactive object, add:
```typescript
  ingredients: [] as { name: string; quantity: number | null; unit: string }[],
```

In the `errors` reactive object, add:
```typescript
  ingredients: '',
```

- [ ] **Step 2: Add ingredient helper functions**

```typescript
function addIngredient() {
  form.ingredients.push({ name: '', quantity: null, unit: '' })
}

function removeIngredient(index: number) {
  form.ingredients.splice(index, 1)
}
```

- [ ] **Step 3: Add ingredients template section**

Add before the "Steps" section in the template:

```vue
      <!-- Ingredients -->
      <div class="flex flex-col gap-2">
        <label class="font-medium">Ingrédients *</label>
        <small v-if="errors.ingredients" class="text-red-500">{{ errors.ingredients }}</small>
        <div v-for="(ingredient, index) in form.ingredients" :key="index" class="flex gap-2 items-center">
          <InputText v-model="form.ingredients[index].name" placeholder="Nom *" class="flex-1" />
          <input
            v-model.number="form.ingredients[index].quantity"
            type="number"
            min="0.01"
            step="any"
            placeholder="Qté"
            class="p-inputtext w-24"
          />
          <InputText v-model="form.ingredients[index].unit" placeholder="Unité" class="w-24" />
          <Button icon="pi pi-trash" severity="danger" text @click="removeIngredient(index)" />
        </div>
        <Button
          label="Ajouter un ingrédient"
          icon="pi pi-plus"
          severity="secondary"
          text
          @click="addIngredient"
        />
      </div>
```

- [ ] **Step 4: Update validation**

In the `validate()` function, add:
```typescript
  errors.ingredients = ''
  const validIngredients = form.ingredients.filter(i => i.name.trim())
  if (validIngredients.length === 0) {
    errors.ingredients = 'Au moins un ingrédient est requis'
    valid = false
  }
```

- [ ] **Step 5: Update FormData serialization in handleSubmit**

Add before the `steps` line:
```typescript
    const validIngredients = form.ingredients
      .filter(i => i.name.trim())
      .map(i => ({
        name: i.name.trim(),
        ...(i.quantity ? { quantity: i.quantity } : {}),
        ...(i.unit?.trim() ? { unit: i.unit.trim() } : {}),
      }))
    formData.append('ingredients', JSON.stringify(validIngredients))
```

- [ ] **Step 6: Update onMounted for edit mode**

In the `onMounted` callback, add after `form.steps = recipe.steps || []`:
```typescript
      form.ingredients = (recipe.ingredients || []).map(i => ({
        name: i.name,
        quantity: i.quantity || null,
        unit: i.unit || '',
      }))
```

- [ ] **Step 7: Verify build**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): add ingredients section to RecipeForm"
```

---

### Task 6: Update RecipeDetail with ingredients display

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeDetail.vue`

- [ ] **Step 1: Add ingredients section before steps**

Add before the `<!-- Steps -->` section:

```vue
      <!-- Ingredients -->
      <div v-if="recipe.ingredients && recipe.ingredients.length > 0" class="mb-6">
        <h2 class="text-xl font-semibold mb-4">Ingrédients</h2>
        <ul class="list-disc list-inside space-y-2">
          <li v-for="(ingredient, index) in recipe.ingredients" :key="index" class="text-surface-700">
            <template v-if="ingredient.quantity && ingredient.unit">
              {{ ingredient.quantity }} {{ ingredient.unit }} — {{ ingredient.name }}
            </template>
            <template v-else-if="ingredient.quantity">
              {{ ingredient.quantity }} — {{ ingredient.name }}
            </template>
            <template v-else>
              {{ ingredient.name }}
            </template>
          </li>
        </ul>
      </div>
```

- [ ] **Step 2: Verify build**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeDetail.vue
git commit -m "feat(frontend): display ingredients in RecipeDetail"
```

---

### Task 7: Update Cypress E2E tests

**Files:**
- Modify: `frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts`

- [ ] **Step 1: Update create test to include ingredients**

In the "should create a new recipe" test, add ingredient interaction **before** the step:

```typescript
    // Add ingredients
    cy.contains('Ajouter un ingrédient').click()
    cy.get('input[placeholder="Nom *"]').first().type('Farine')
    cy.get('input[placeholder="Qté"]').first().type('250')
    cy.get('input[placeholder="Unité"]').first().type('g')

    // Add a step (use specific placeholder selector to avoid hitting ingredient inputs)
    cy.contains('Ajouter une étape').click()
```

Note: remove the old step-adding code and replace it with the above. The step input field doesn't have a placeholder, so keep the existing `cy.get('input').last()` **after** the step is added — but it needs to be after the "Ajouter une étape" click.

Update all `cy.request` POST calls to include ingredients:

```typescript
    cy.request('POST', 'http://localhost:3000/data/recipes', {
      title: 'Pad Thaï',
      description: 'Plat thaïlandais',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      steps: ['Étape 1'],
      ingredients: [{ name: 'Nouilles de riz', quantity: 200, unit: 'g' }],
    })
```

Also update the delete test `cy.request` to include `ingredients: [{ name: 'Test' }]`.

- [ ] **Step 2: Commit**

```bash
git add frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts
git commit -m "test(frontend): update Cypress E2E tests with ingredients"
```

---

### Task 8: Final verification

- [ ] **Step 1: Run all backend tests**

Run: `cd backend/cooking-nest-app && npx jest --verbose`
Expected: All tests PASS.

- [ ] **Step 2: Run backend E2E tests**

Run: `cd backend/cooking-nest-app && npx jest --config ./test/jest-e2e.json --verbose`
Expected: All tests PASS.

- [ ] **Step 3: Build frontend**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Manual smoke test**

1. Open `http://localhost:5173`
2. Create a recipe with ingredients — verify it saves
3. View the recipe detail — verify ingredients display correctly
4. Edit the recipe — verify ingredients are pre-filled
5. Create a recipe without ingredients — verify validation error
