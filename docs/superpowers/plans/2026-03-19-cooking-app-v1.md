# Cooking App v1 Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full CRUD recipe management app with search, pagination, image upload, and responsive UI.

**Architecture:** NestJS backend with MongoDB (Mongoose) serving a REST API. Vue 3 frontend with PrimeVue components consuming the API. TDD methodology throughout — tests written before implementation.

**Tech Stack:** NestJS 11, Mongoose 9, class-validator, Multer, mongodb-memory-server (tests) | Vue 3, PrimeVue 4, Tailwind CSS 4, Cypress

**Spec:** `docs/superpowers/specs/2026-03-19-cooking-app-v1-design.md`

---

## Chunk 1: Backend Foundation

### Task 1: Install backend dependencies

**Files:**
- Modify: `backend/cooking-nest-app/package.json`

- [ ] **Step 1: Install production dependencies**

Run:
```bash
cd backend/cooking-nest-app
npm install class-validator class-transformer uuid @nestjs/serve-static
```

- [ ] **Step 2: Install dev dependencies**

Run:
```bash
cd backend/cooking-nest-app
npm install --save-dev mongodb-memory-server @types/uuid @types/multer
```

- [ ] **Step 3: Verify installation**

Run: `cd backend/cooking-nest-app && npm ls class-validator class-transformer uuid mongodb-memory-server @nestjs/serve-static`
Expected: All packages listed without errors.

- [ ] **Step 4: Commit**

```bash
git add backend/cooking-nest-app/package.json backend/cooking-nest-app/package-lock.json
git commit -m "chore(backend): add class-validator, multer, uuid, serve-static, mongodb-memory-server"
```

---

### Task 2: Update seed data

**Files:**
- Modify: `backend/dev/recipes.js`

- [ ] **Step 1: Update recipes.js**

Migrate `steps` from `{ num_order, description }` to `string[]` and durations from `$dateFromParts` to plain numbers (minutes):

```javascript
// Ingrédients

// Recipes
db.recipes.drop();
db.recipes.insertMany([
    {
        title: "Pad Thaï",
        thumbnail: null,
        description: "Plat traditionnel acidulé-sucré-salé-épicé de la cuisine thaïlandaise, à base de nouilles de riz sautées au wok, très apprécié et très consommé à titre de plat national dans toute la Thaïlande",
        categoryCode: "PLAT",
        difficultyCode: "EASY",
        costCode: "CHEAP",
        preparationDuration: 30,
        cookDuration: 15,
        breakDuration: null,
        steps: [
            "Faire chauffer un wok ou une grosse poêle.",
            "Ajouter 1 cuillère d'huile, ajouter le basilic, le laisser frire pendant une minute.",
            "L'enlever et l'essorer sur du papier.",
            "Ajouter un autre cuillère d'huile à la poêle, faire revenir le poulet, ajouter le sel et le paprika, faire cuire pendant 4 à 5 minutes.",
            "Ajouter les œufs et bien mélanger (ça doit ressembler à des œufs brouillés).",
            "Enlever le tout et mettre dans un plat. Ajouter la dernière cuillère d'huile dans la poêle. Mettre l'ail, le vinaigre le nuoc nam et le sucre, faire cuire pendant 2 minutes.",
            "Ajouter les pâtes (que vous avez fait cuire) dans cette sauce. Mettre le piment et les arachides, rajouter le poulet et les légumes au tout et bien mélanger.",
            "Mettre le tout dans un plat, décorer avec le basilic frit et des tranches de citron."
        ]
    }
])
```

- [ ] **Step 2: Rebuild and restart MongoDB to apply seed data**

Run:
```bash
cd backend/dev
docker-compose -f mongodb.yml down
docker-compose -f mongodb.yml up -d --build
```

Note: `docker-entrypoint-initdb.d` only runs on fresh volumes. If data persists, you may need to remove the volume first:
```bash
docker-compose -f mongodb.yml down -v
docker-compose -f mongodb.yml up -d --build
```

- [ ] **Step 3: Commit**

```bash
git add backend/dev/recipes.js
git commit -m "chore(seed): migrate steps to string[] and durations to numbers"
```

---

### Task 3: Create backend enums

**Files:**
- Create: `backend/cooking-nest-app/src/recipes/enums/category.enum.ts`
- Create: `backend/cooking-nest-app/src/recipes/enums/difficulty.enum.ts`
- Create: `backend/cooking-nest-app/src/recipes/enums/cost.enum.ts`

- [ ] **Step 1: Create Category enum**

```typescript
// backend/cooking-nest-app/src/recipes/enums/category.enum.ts
export enum Category {
  APERITIF = 'APERITIF',
  ENTREE = 'ENTREE',
  PLAT = 'PLAT',
  DESSERT = 'DESSERT',
  BOISSON = 'BOISSON',
  DEJ_BRUNCH = 'DEJ_BRUNCH',
}
```

- [ ] **Step 2: Create Difficulty enum**

```typescript
// backend/cooking-nest-app/src/recipes/enums/difficulty.enum.ts
export enum Difficulty {
  EASY = 'EASY',
  MIDDLE = 'MIDDLE',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
  EXPERT = 'EXPERT',
}
```

- [ ] **Step 3: Create Cost enum**

```typescript
// backend/cooking-nest-app/src/recipes/enums/cost.enum.ts
export enum Cost {
  CHEAP = 'CHEAP',
  MIDDLE = 'MIDDLE',
  EXPENSIVE = 'EXPENSIVE',
}
```

- [ ] **Step 4: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/enums/
git commit -m "feat(backend): add Category, Difficulty, Cost enums"
```

---

### Task 4: Update Recipe schema

**Files:**
- Modify: `backend/cooking-nest-app/src/recipes/schemas/recipe.schema.ts`

- [ ] **Step 1: Write the failing test**

Create `backend/cooking-nest-app/src/recipes/schemas/recipe.schema.spec.ts`:

```typescript
import { Recipe, RecipeSchema } from './recipe.schema';
import mongoose from 'mongoose';

describe('RecipeSchema', () => {
  const RecipeModel = mongoose.model('RecipeSchemaTest', RecipeSchema);

  it('should require title', async () => {
    const recipe = new RecipeModel({});
    const errors = recipe.validateSync();
    expect(errors.errors['title']).toBeDefined();
  });

  it('should require categoryCode', async () => {
    const recipe = new RecipeModel({});
    const errors = recipe.validateSync();
    expect(errors.errors['categoryCode']).toBeDefined();
  });

  it('should require difficultyCode', async () => {
    const recipe = new RecipeModel({});
    const errors = recipe.validateSync();
    expect(errors.errors['difficultyCode']).toBeDefined();
  });

  it('should require costCode', async () => {
    const recipe = new RecipeModel({});
    const errors = recipe.validateSync();
    expect(errors.errors['costCode']).toBeDefined();
  });

  it('should validate categoryCode enum values', async () => {
    const recipe = new RecipeModel({ title: 'Test', categoryCode: 'INVALID', difficultyCode: 'EASY', costCode: 'CHEAP' });
    const errors = recipe.validateSync();
    expect(errors.errors['categoryCode']).toBeDefined();
  });

  it('should accept valid recipe', async () => {
    const recipe = new RecipeModel({
      title: 'Pad Thaï',
      categoryCode: 'PLAT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      preparationDuration: 30,
      cookDuration: 15,
      steps: ['Étape 1', 'Étape 2'],
    });
    const errors = recipe.validateSync();
    expect(errors).toBeUndefined();
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/schemas/recipe.schema.spec.ts --verbose`
Expected: FAIL — schema only has `title`, no required fields, no enums.

- [ ] **Step 3: Update the schema**

Replace `backend/cooking-nest-app/src/recipes/schemas/recipe.schema.ts` with:

```typescript
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';

export type RecipeDocument = Recipe & Document;

@Schema({ collection: 'recipes', timestamps: true })
export class Recipe {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop()
  description: string;

  @Prop()
  thumbnail: string;

  @Prop({ required: true, enum: Category })
  categoryCode: string;

  @Prop({ required: true, enum: Difficulty })
  difficultyCode: string;

  @Prop({ required: true, enum: Cost })
  costCode: string;

  @Prop()
  preparationDuration: number;

  @Prop()
  cookDuration: number;

  @Prop()
  breakDuration: number;

  @Prop({ type: [String] })
  steps: string[];
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/schemas/recipe.schema.spec.ts --verbose`
Expected: All 6 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/schemas/
git commit -m "feat(backend): update Recipe schema with all fields, enums, timestamps"
```

---

### Task 5: Create DTOs with validation

**Files:**
- Modify: `backend/cooking-nest-app/src/recipes/dto/recipe.dto.ts`
- Create: `backend/cooking-nest-app/src/recipes/dto/create-recipe.dto.ts`
- Create: `backend/cooking-nest-app/src/recipes/dto/update-recipe.dto.ts`
- Create: `backend/cooking-nest-app/src/recipes/dto/query-recipes.dto.ts`
- Create: `backend/cooking-nest-app/src/recipes/dto/paginated-response.dto.ts`

- [ ] **Step 1: Create CreateRecipeDto**

```typescript
// backend/cooking-nest-app/src/recipes/dto/create-recipe.dto.ts
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Category)
  categoryCode: string;

  @IsEnum(Difficulty)
  difficultyCode: string;

  @IsEnum(Cost)
  costCode: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  preparationDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  cookDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  breakDuration?: number;

  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  steps?: string[];
}
```

- [ ] **Step 2: Create UpdateRecipeDto**

```typescript
// backend/cooking-nest-app/src/recipes/dto/update-recipe.dto.ts
import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';

export class UpdateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Category)
  @IsOptional()
  categoryCode?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficultyCode?: string;

  @IsEnum(Cost)
  @IsOptional()
  costCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  preparationDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  cookDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  breakDuration?: number;

  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  steps?: string[];
}
```

- [ ] **Step 3: Create QueryRecipesDto**

```typescript
// backend/cooking-nest-app/src/recipes/dto/query-recipes.dto.ts
import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '../enums/category.enum';

export class QueryRecipesDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(Category)
  categoryCode?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
```

- [ ] **Step 4: Create PaginatedResponseDto**

```typescript
// backend/cooking-nest-app/src/recipes/dto/paginated-response.dto.ts
export class PaginatedResponseDto<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;

  constructor(data: T[], total: number, page: number, limit: number) {
    this.data = data;
    this.total = total;
    this.page = page;
    this.limit = limit;
  }
}
```

- [ ] **Step 5: Delete the old RecipeDto (no longer needed — controller returns Mongoose documents directly)**

Run: `rm backend/cooking-nest-app/src/recipes/dto/recipe.dto.ts`

- [ ] **Step 6: Enable ValidationPipe in main.ts**

Update `backend/cooking-nest-app/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );
  await app.listen(3000);
}
bootstrap();
```

- [ ] **Step 7: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/dto/ backend/cooking-nest-app/src/main.ts
git commit -m "feat(backend): add DTOs with class-validator, enable ValidationPipe and CORS"
```

---

## Chunk 2: Backend Service & Controller (TDD)

### Task 6: RecipesService — findAll with pagination and filters

**Files:**
- Modify: `backend/cooking-nest-app/src/recipes/services/recipes.service.ts`
- Create: `backend/cooking-nest-app/src/recipes/services/recipes.service.spec.ts`

- [ ] **Step 1: Write the failing tests**

Create `backend/cooking-nest-app/src/recipes/services/recipes.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { RecipesService } from './recipes.service';
import { Recipe } from '../schemas/recipe.schema';

describe('RecipesService', () => {
  let service: RecipesService;
  let model: any;

  const mockRecipe = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Pad Thaï',
    description: 'Plat thaïlandais',
    categoryCode: 'PLAT',
    difficultyCode: 'EASY',
    costCode: 'CHEAP',
    preparationDuration: 30,
    cookDuration: 15,
    steps: ['Étape 1', 'Étape 2'],
  };

  const mockQuery = {
    skip: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    sort: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([mockRecipe]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecipesService,
        {
          provide: getModelToken(Recipe.name),
          useValue: {
            find: jest.fn().mockReturnValue(mockQuery),
            countDocuments: jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
          },
        },
      ],
    }).compile();

    service = module.get<RecipesService>(RecipesService);
    model = module.get(getModelToken(Recipe.name));
  });

  describe('findAll', () => {
    it('should return paginated recipes', async () => {
      const result = await service.findAll({ page: 1, limit: 10 });
      expect(result.data).toEqual([mockRecipe]);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
      expect(result.limit).toBe(10);
    });

    it('should apply title filter with case-insensitive regex', async () => {
      await service.findAll({ page: 1, limit: 10, title: 'pad' });
      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({ title: expect.any(RegExp) }),
      );
    });

    it('should apply categoryCode filter', async () => {
      await service.findAll({ page: 1, limit: 10, categoryCode: 'PLAT' });
      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({ categoryCode: 'PLAT' }),
      );
    });

    it('should use skip and limit for pagination', async () => {
      await service.findAll({ page: 2, limit: 5 });
      expect(mockQuery.skip).toHaveBeenCalledWith(5);
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/services/recipes.service.spec.ts --verbose`
Expected: FAIL — `findAll` currently takes no parameters and returns no pagination.

- [ ] **Step 3: Implement findAll with pagination and filters**

Replace `backend/cooking-nest-app/src/recipes/services/recipes.service.ts`:

```typescript
import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from '../schemas/recipe.schema';
import { QueryRecipesDto } from '../dto/query-recipes.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipesModel: Model<RecipeDocument>,
  ) {}

  async findAll(query: QueryRecipesDto): Promise<PaginatedResponseDto<Recipe>> {
    const filter: any = {};

    if (query.title) {
      filter.title = new RegExp(query.title, 'i');
    }

    if (query.categoryCode) {
      filter.categoryCode = query.categoryCode;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.recipesModel.find(filter).skip(skip).limit(limit).sort({ title: 1 }).exec(),
      this.recipesModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/services/recipes.service.spec.ts --verbose`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/services/
git commit -m "feat(backend): RecipesService.findAll with pagination and filters (TDD)"
```

---

### Task 7: RecipesService — findOne, create, update, delete

**Files:**
- Modify: `backend/cooking-nest-app/src/recipes/services/recipes.service.ts`
- Modify: `backend/cooking-nest-app/src/recipes/services/recipes.service.spec.ts`

- [ ] **Step 1: Write failing tests for findOne, create, update, delete**

Append to `recipes.service.spec.ts` (inside the main `describe` block, after the `findAll` describe):

```typescript
  describe('findOne', () => {
    it('should return a recipe by id', async () => {
      model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRecipe) });
      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockRecipe);
      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if recipe not found', async () => {
      model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne('nonexistent')).rejects.toThrow();
    });
  });

  describe('create', () => {
    it('should create and return a recipe', async () => {
      const createDto = {
        title: 'Crêpes',
        categoryCode: 'DESSERT',
        difficultyCode: 'EASY',
        costCode: 'CHEAP',
      };
      const createdRecipe = { _id: 'newid', ...createDto };
      model.create = jest.fn().mockResolvedValue(createdRecipe);

      const result = await service.create(createDto);
      expect(result).toEqual(createdRecipe);
      expect(model.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('update', () => {
    it('should update and return the recipe', async () => {
      const updateDto = { title: 'Pad Thaï Revisité' };
      const updatedRecipe = { ...mockRecipe, ...updateDto };
      model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRecipe) });
      model.findByIdAndUpdate = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedRecipe) });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);
      expect(result).toEqual(updatedRecipe);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if recipe not found', async () => {
      model.findById = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.update('nonexistent', { title: 'Test' })).rejects.toThrow();
    });
  });

  describe('delete', () => {
    it('should delete the recipe', async () => {
      model.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRecipe) });

      await service.delete('507f1f77bcf86cd799439011');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if recipe not found', async () => {
      model.findByIdAndDelete = jest.fn().mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.delete('nonexistent')).rejects.toThrow();
    });
  });
```

Also add `NotFoundException` import at the top of the test file:

```typescript
import { NotFoundException } from '@nestjs/common';
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/services/recipes.service.spec.ts --verbose`
Expected: FAIL — methods `findOne`, `create`, `update`, `delete` do not exist.

- [ ] **Step 3: Implement the methods**

Add to `backend/cooking-nest-app/src/recipes/services/recipes.service.ts`:

```typescript
import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { Recipe, RecipeDocument } from '../schemas/recipe.schema';
import { QueryRecipesDto } from '../dto/query-recipes.dto';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipesModel: Model<RecipeDocument>,
  ) {}

  async findAll(query: QueryRecipesDto): Promise<PaginatedResponseDto<Recipe>> {
    const filter: any = {};

    if (query.title) {
      filter.title = new RegExp(query.title, 'i');
    }

    if (query.categoryCode) {
      filter.categoryCode = query.categoryCode;
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.recipesModel.find(filter).skip(skip).limit(limit).sort({ title: 1 }).exec(),
      this.recipesModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipesModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return this.recipesModel.create(createRecipeDto);
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    const existing = await this.recipesModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    // Delete old thumbnail file if a new one is being uploaded
    if (updateRecipeDto['thumbnail'] && existing.thumbnail) {
      this.deleteThumbnailFile(existing.thumbnail);
    }

    const recipe = await this.recipesModel
      .findByIdAndUpdate(id, updateRecipeDto, { new: true })
      .exec();
    return recipe;
  }

  async delete(id: string): Promise<void> {
    const recipe = await this.recipesModel.findByIdAndDelete(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    // Delete thumbnail file from disk
    if (recipe.thumbnail) {
      this.deleteThumbnailFile(recipe.thumbnail);
    }
  }

  private deleteThumbnailFile(thumbnailPath: string): void {
    // thumbnailPath is like "/uploads/uuid.jpg"
    const filePath = join(process.cwd(), thumbnailPath);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/services/recipes.service.spec.ts --verbose`
Expected: All 10 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/services/ backend/cooking-nest-app/src/recipes/dto/
git commit -m "feat(backend): RecipesService CRUD methods — findOne, create, update, delete (TDD)"
```

---

### Task 8: RecipesController — all CRUD endpoints

**Files:**
- Modify: `backend/cooking-nest-app/src/recipes/controller/recipes.controller.ts`
- Create: `backend/cooking-nest-app/src/recipes/controller/recipes.controller.spec.ts`

- [ ] **Step 1: Write failing controller tests**

Create `backend/cooking-nest-app/src/recipes/controller/recipes.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { RecipesController } from './recipes.controller';
import { RecipesService } from '../services/recipes.service';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

describe('RecipesController', () => {
  let controller: RecipesController;
  let service: RecipesService;

  const mockRecipe = {
    _id: '507f1f77bcf86cd799439011',
    title: 'Pad Thaï',
    description: 'Plat thaïlandais',
    categoryCode: 'PLAT',
    difficultyCode: 'EASY',
    costCode: 'CHEAP',
    preparationDuration: 30,
    cookDuration: 15,
    steps: ['Étape 1'],
  };

  const mockService = {
    findAll: jest.fn().mockResolvedValue(
      new PaginatedResponseDto([mockRecipe], 1, 1, 10),
    ),
    findOne: jest.fn().mockResolvedValue(mockRecipe),
    create: jest.fn().mockResolvedValue(mockRecipe),
    update: jest.fn().mockResolvedValue(mockRecipe),
    delete: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RecipesController],
      providers: [{ provide: RecipesService, useValue: mockService }],
    }).compile();

    controller = module.get<RecipesController>(RecipesController);
    service = module.get<RecipesService>(RecipesService);
  });

  it('GET /data/recipes — should return paginated recipes', async () => {
    const query = { page: 1, limit: 10 };
    const result = await controller.getRecipes(query);
    expect(result.data).toHaveLength(1);
    expect(result.total).toBe(1);
    expect(service.findAll).toHaveBeenCalledWith(query);
  });

  it('GET /data/recipes/:id — should return a recipe', async () => {
    const result = await controller.getRecipe('507f1f77bcf86cd799439011');
    expect(result.title).toBe('Pad Thaï');
    expect(service.findOne).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });

  it('POST /data/recipes — should create a recipe', async () => {
    const dto = { title: 'Crêpes', categoryCode: 'DESSERT', difficultyCode: 'EASY', costCode: 'CHEAP' };
    const result = await controller.createRecipe(dto, undefined);
    expect(result.title).toBe('Pad Thaï');
    expect(service.create).toHaveBeenCalled();
  });

  it('PUT /data/recipes/:id — should update a recipe', async () => {
    const dto = { title: 'Pad Thaï Revisité' };
    const result = await controller.updateRecipe('507f1f77bcf86cd799439011', dto, undefined);
    expect(service.update).toHaveBeenCalled();
  });

  it('DELETE /data/recipes/:id — should delete a recipe', async () => {
    await controller.deleteRecipe('507f1f77bcf86cd799439011');
    expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/controller/recipes.controller.spec.ts --verbose`
Expected: FAIL — controller methods don't exist.

- [ ] **Step 3: Implement the controller**

Replace `backend/cooking-nest-app/src/recipes/controller/recipes.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecipesService } from '../services/recipes.service';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { QueryRecipesDto } from '../dto/query-recipes.dto';

@Controller('data/recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getRecipes(@Query() query: QueryRecipesDto) {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  async getRecipe(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async createRecipe(
    @Body() createRecipeDto: CreateRecipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createRecipeDto['thumbnail'] = `/uploads/${file.filename}`;
    }
    return this.recipesService.create(createRecipeDto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async updateRecipe(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateRecipeDto['thumbnail'] = `/uploads/${file.filename}`;
    }
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecipe(@Param('id') id: string) {
    return this.recipesService.delete(id);
  }
}
```

- [ ] **Step 4: Run tests to verify they pass**

Run: `cd backend/cooking-nest-app && npx jest src/recipes/controller/recipes.controller.spec.ts --verbose`
Expected: All 5 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/controller/
git commit -m "feat(backend): RecipesController with full CRUD endpoints (TDD)"
```

---

### Task 9: Image upload configuration (Multer + static files)

**Files:**
- Modify: `backend/cooking-nest-app/src/recipes/recipes.module.ts`
- Modify: `backend/cooking-nest-app/src/main.ts`

- [ ] **Step 1: Configure Multer in RecipesModule**

Replace `backend/cooking-nest-app/src/recipes/recipes.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { RecipesController } from './controller/recipes.controller';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { RecipesService } from './services/recipes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
      fileFilter: (_req, file, cb) => {
        if (/\/(jpeg|jpg|png|webp)$/i.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, PNG, and WebP files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
```

- [ ] **Step 2: Serve static files + create uploads directory**

Update `backend/cooking-nest-app/src/main.ts`:

```typescript
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors();
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const uploadsDir = join(process.cwd(), 'uploads');
  if (!existsSync(uploadsDir)) {
    mkdirSync(uploadsDir);
  }
  app.useStaticAssets(uploadsDir, { prefix: '/uploads' });

  await app.listen(3000);
}
bootstrap();
```

- [ ] **Step 3: Add uploads/ to .gitignore**

Append to `backend/cooking-nest-app/.gitignore`:
```
uploads/
```

- [ ] **Step 4: Verify backend compiles**

Run: `cd backend/cooking-nest-app && npm run build`
Expected: Compilation succeeds.

- [ ] **Step 5: Commit**

```bash
git add backend/cooking-nest-app/src/recipes/recipes.module.ts backend/cooking-nest-app/src/main.ts backend/cooking-nest-app/.gitignore
git commit -m "feat(backend): configure Multer image upload + static file serving"
```

---

### Task 10: Backend E2E tests with mongodb-memory-server

**Files:**
- Create: `backend/cooking-nest-app/test/recipes.e2e-spec.ts`
- Modify: `backend/cooking-nest-app/test/jest-e2e.json`

- [ ] **Step 1: Update jest-e2e.json to increase timeout**

Replace `backend/cooking-nest-app/test/jest-e2e.json`:

```json
{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".e2e-spec.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "testTimeout": 30000
}
```

- [ ] **Step 2: Write E2E tests**

Create `backend/cooking-nest-app/test/recipes.e2e-spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { MongooseModule } from '@nestjs/mongoose';
import { RecipesModule } from '../src/recipes/recipes.module';

describe('Recipes (e2e)', () => {
  let app: INestApplication;
  let mongod: MongoMemoryServer;
  let createdRecipeId: string;

  beforeAll(async () => {
    mongod = await MongoMemoryServer.create();
    const uri = mongod.getUri();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        MongooseModule.forRoot(uri),
        RecipesModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await mongod.stop();
  });

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
      })
      .expect(201);

    expect(res.body.title).toBe('Pad Thaï');
    expect(res.body._id).toBeDefined();
    createdRecipeId = res.body._id;
  });

  it('POST /data/recipes — should return 400 for invalid data', async () => {
    await request(app.getHttpServer())
      .post('/data/recipes')
      .send({ title: '' })
      .expect(400);
  });

  it('GET /data/recipes — should return paginated recipes', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.total).toBe(1);
    expect(res.body.page).toBe(1);
    expect(res.body.limit).toBe(10);
  });

  it('GET /data/recipes?title=pad — should filter by title', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes?title=pad')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].title).toBe('Pad Thaï');
  });

  it('GET /data/recipes?title=nonexistent — should return empty', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes?title=nonexistent')
      .expect(200);

    expect(res.body.data).toHaveLength(0);
    expect(res.body.total).toBe(0);
  });

  it('GET /data/recipes?categoryCode=PLAT — should filter by category', async () => {
    const res = await request(app.getHttpServer())
      .get('/data/recipes?categoryCode=PLAT')
      .expect(200);

    expect(res.body.data).toHaveLength(1);
  });

  it('GET /data/recipes/:id — should return a recipe', async () => {
    const res = await request(app.getHttpServer())
      .get(`/data/recipes/${createdRecipeId}`)
      .expect(200);

    expect(res.body.title).toBe('Pad Thaï');
    expect(res.body.steps).toEqual(['Étape 1', 'Étape 2']);
  });

  it('GET /data/recipes/:id — should return 404 for unknown id', async () => {
    await request(app.getHttpServer())
      .get('/data/recipes/507f1f77bcf86cd799439011')
      .expect(404);
  });

  it('PUT /data/recipes/:id — should update a recipe', async () => {
    const res = await request(app.getHttpServer())
      .put(`/data/recipes/${createdRecipeId}`)
      .send({ title: 'Pad Thaï Revisité' })
      .expect(200);

    expect(res.body.title).toBe('Pad Thaï Revisité');
  });

  it('DELETE /data/recipes/:id — should delete a recipe', async () => {
    await request(app.getHttpServer())
      .delete(`/data/recipes/${createdRecipeId}`)
      .expect(204);
  });

  it('GET /data/recipes/:id — should return 404 after deletion', async () => {
    await request(app.getHttpServer())
      .get(`/data/recipes/${createdRecipeId}`)
      .expect(404);
  });
});
```

- [ ] **Step 3: Run E2E tests**

Run: `cd backend/cooking-nest-app && npm run test:e2e -- --testPathPattern=recipes`
Expected: All 11 tests PASS.

- [ ] **Step 4: Run all backend tests**

Run: `cd backend/cooking-nest-app && npx jest --verbose`
Expected: All unit tests + schema tests PASS.

- [ ] **Step 5: Commit**

```bash
git add backend/cooking-nest-app/test/recipes.e2e-spec.ts backend/cooking-nest-app/test/jest-e2e.json
git commit -m "test(backend): add E2E tests for all recipe endpoints with mongodb-memory-server"
```

---

## Chunk 3: Frontend Foundation

### Task 11: Migrate frontend enums to string enums

**Files:**
- Modify: `frontend/cooking-vue-app/src/enums/category.ts`
- Modify: `frontend/cooking-vue-app/src/enums/difficulty.ts`
- Modify: `frontend/cooking-vue-app/src/enums/cost.ts`

- [ ] **Step 1: Update Category enum**

```typescript
// frontend/cooking-vue-app/src/enums/category.ts
export enum Category {
  APERITIF = 'APERITIF',
  ENTREE = 'ENTREE',
  PLAT = 'PLAT',
  DESSERT = 'DESSERT',
  BOISSON = 'BOISSON',
  DEJ_BRUNCH = 'DEJ_BRUNCH',
}

export const CategoryLabels: Record<Category, string> = {
  [Category.APERITIF]: 'Apéritif',
  [Category.ENTREE]: 'Entrée',
  [Category.PLAT]: 'Plat',
  [Category.DESSERT]: 'Dessert',
  [Category.BOISSON]: 'Boisson',
  [Category.DEJ_BRUNCH]: 'Petit-déj / Brunch',
}
```

- [ ] **Step 2: Update Difficulty enum**

```typescript
// frontend/cooking-vue-app/src/enums/difficulty.ts
export enum Difficulty {
  EASY = 'EASY',
  MIDDLE = 'MIDDLE',
  HARD = 'HARD',
  VERY_HARD = 'VERY_HARD',
  EXPERT = 'EXPERT',
}

export const DifficultyLabels: Record<Difficulty, string> = {
  [Difficulty.EASY]: 'Facile',
  [Difficulty.MIDDLE]: 'Moyen',
  [Difficulty.HARD]: 'Difficile',
  [Difficulty.VERY_HARD]: 'Très difficile',
  [Difficulty.EXPERT]: 'Expert',
}
```

- [ ] **Step 3: Update Cost enum**

```typescript
// frontend/cooking-vue-app/src/enums/cost.ts
export enum Cost {
  CHEAP = 'CHEAP',
  MIDDLE = 'MIDDLE',
  EXPENSIVE = 'EXPENSIVE',
}

export const CostLabels: Record<Cost, string> = {
  [Cost.CHEAP]: 'Bon marché',
  [Cost.MIDDLE]: 'Moyen',
  [Cost.EXPENSIVE]: 'Coûteux',
}
```

- [ ] **Step 4: Commit**

```bash
git add frontend/cooking-vue-app/src/enums/
git commit -m "feat(frontend): migrate enums to string values + add French labels"
```

---

### Task 12: Create Recipe type and RecipeService

**Files:**
- Create: `frontend/cooking-vue-app/src/types/recipe.ts`
- Create: `frontend/cooking-vue-app/src/services/RecipeService.ts`
- Delete: `frontend/cooking-vue-app/src/service/ProductService.js`

- [ ] **Step 1: Create Recipe type**

```typescript
// frontend/cooking-vue-app/src/types/recipe.ts
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
  createdAt: string
  updatedAt: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  limit: number
}

export interface RecipeFilters {
  title?: string
  categoryCode?: string
  page?: number
  limit?: number
}
```

- [ ] **Step 2: Create RecipeService**

```typescript
// frontend/cooking-vue-app/src/services/RecipeService.ts
import type { Recipe, PaginatedResponse, RecipeFilters } from '@/types/recipe'

const API_BASE = 'http://localhost:3000/data/recipes'

export const RecipeService = {
  async getRecipes(filters: RecipeFilters = {}): Promise<PaginatedResponse<Recipe>> {
    const params = new URLSearchParams()
    if (filters.title) params.set('title', filters.title)
    if (filters.categoryCode) params.set('categoryCode', filters.categoryCode)
    if (filters.page) params.set('page', String(filters.page))
    if (filters.limit) params.set('limit', String(filters.limit))

    const res = await fetch(`${API_BASE}?${params}`)
    if (!res.ok) throw new Error('Erreur lors de la récupération des recettes')
    return res.json()
  },

  async getRecipe(id: string): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/${id}`)
    if (!res.ok) throw new Error('Recette non trouvée')
    return res.json()
  },

  async createRecipe(data: FormData): Promise<Recipe> {
    const res = await fetch(API_BASE, {
      method: 'POST',
      body: data,
    })
    if (!res.ok) throw new Error('Erreur lors de la création de la recette')
    return res.json()
  },

  async updateRecipe(id: string, data: FormData): Promise<Recipe> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'PUT',
      body: data,
    })
    if (!res.ok) throw new Error('Erreur lors de la modification de la recette')
    return res.json()
  },

  async deleteRecipe(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/${id}`, {
      method: 'DELETE',
    })
    if (!res.ok) throw new Error('Erreur lors de la suppression de la recette')
  },
}
```

- [ ] **Step 3: Delete ProductService.js**

Run: `rm frontend/cooking-vue-app/src/service/ProductService.js`

- [ ] **Step 4: Commit**

```bash
git add frontend/cooking-vue-app/src/types/ frontend/cooking-vue-app/src/services/
git rm frontend/cooking-vue-app/src/service/ProductService.js
git commit -m "feat(frontend): add Recipe type, RecipeService, remove mock ProductService"
```

---

### Task 13: Update routes, navigation, App.vue, and cleanup

**Files:**
- Modify: `frontend/cooking-vue-app/src/main.ts`
- Modify: `frontend/cooking-vue-app/src/components/LeftBar.vue`
- Modify: `frontend/cooking-vue-app/src/App.vue`
- Create: `frontend/cooking-vue-app/src/components/RecipeDetail.vue`
- Create: `frontend/cooking-vue-app/src/components/RecipeForm.vue`
- Delete: `frontend/cooking-vue-app/src/components/CreateNewRecipe.vue`

- [ ] **Step 1: Replace main.ts with complete updated file**

Replace `frontend/cooking-vue-app/src/main.ts`:

```typescript
import './style.css'
import './flags.css'
import 'primeicons/primeicons.css'

import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'

import App from './App.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Drawer from 'primevue/drawer'
import Toast from 'primevue/toast'
import ToastService from 'primevue/toastservice'
import Avatar from 'primevue/avatar'
import AutoComplete from 'primevue/autocomplete'
import Ripple from 'primevue/ripple'
import StyleClass from 'primevue/styleclass'
import DataView from 'primevue/dataview'
import Tag from 'primevue/tag'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Paginator from 'primevue/paginator'
import ProgressSpinner from 'primevue/progressspinner'

import SearchRecipes from './components/SearchRecipes.vue'
import RecipeDetail from './components/RecipeDetail.vue'
import RecipeForm from './components/RecipeForm.vue'

const routes = [
  {
    path: '/',
    component: SearchRecipes,
  },
  {
    path: '/recipes/create',
    component: RecipeForm,
  },
  {
    path: '/recipes/:id',
    component: RecipeDetail,
  },
  {
    path: '/recipes/:id/edit',
    component: RecipeForm,
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

const app = createApp(App)
app.use(PrimeVue, {
  theme: {
    preset: Aura,
    options: {
      prefix: 'p',
      darkModeSelector: '.dark',
    },
  },
})
app.use(ToastService)
app.use(router)

app.directive('styleclass', StyleClass)
app.directive('ripple', Ripple)

app.component('Button', Button)
app.component('InputText', InputText)
app.component('Toast', Toast)
app.component('Drawer', Drawer)
app.component('Avatar', Avatar)
app.component('AutoComplete', AutoComplete)
app.component('DataView', DataView)
app.component('Tag', Tag)
app.component('Dialog', Dialog)
app.component('Select', Select)
app.component('Textarea', Textarea)
app.component('Paginator', Paginator)
app.component('ProgressSpinner', ProgressSpinner)

app.mount('#app')
```

- [ ] **Step 2: Add `<Toast />` to App.vue**

Replace `frontend/cooking-vue-app/src/App.vue`:

```vue
<script setup lang="ts">
import Header from './components/Header.vue'
import Footer from './components/Footer.vue'
</script>

<template>
  <Header />
  <Toast />
  <router-view></router-view>
  <Footer />
</template>

<style lang="scss">
#app {
  display: grid;
  width: 100%;
  height: 100%;
  grid-template-columns: 1fr;
  grid-template-rows: auto 1fr auto;
  max-width: 100%;
  max-height: 100%;
  padding: 0;
}
</style>
```

Note: also fixed `grid-template-rows` to `auto 1fr auto` (header auto height, content fills, footer auto height).

- [ ] **Step 3: Replace LeftBar.vue with complete updated file**

Replace `frontend/cooking-vue-app/src/components/LeftBar.vue`:

```vue
<script setup lang="ts">
import { ref } from 'vue'

const visible = ref(false)
</script>

<template>
  <Drawer v-model:visible="visible">
    <template #container="{ closeCallback }">
      <div class="flex flex-col h-full">
        <div class="flex items-center justify-between px-4 pt-4 shrink-0">
          <span class="inline-flex items-center gap-2">
            <img src="./icons/cooking-icon-sidebar.png" width="30px" height="30px" />
            <span class="font-semibold text-2xl text-primary">Cooking app</span>
          </span>
          <span>
            <Button type="button" @click="closeCallback" icon="pi pi-times" rounded outlined class="h-8 w-8"></Button>
          </span>
        </div>
        <div class="overflow-y-auto mt-4">
          <ul class="list-none px-4 m-0">
            <li>
              <div
                v-ripple
                v-styleclass="{
                  selector: '@next',
                  enterClass: 'hidden',
                  enterActiveClass: 'slidedown',
                  leaveToClass: 'hidden',
                  leaveActiveClass: 'slideup',
                }"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Gérer</span>
                <i class="pi pi-chevron-down"></i>
              </div>
              <ul class="list-none p-0 m-0 overflow-hidden">
                <li>
                  <router-link to="/" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-search mr-2"></i>
                    <span class="font-medium">Rechercher des recettes</span>
                  </router-link>
                </li>
                <li>
                  <router-link to="/recipes/create" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-plus mr-2"></i>
                    <span class="font-medium">Créer une recette</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="overflow-y-auto mt-4">
          <ul class="list-none px-4 m-0">
            <li>
              <div
                v-ripple
                v-styleclass="{
                  selector: '@next',
                  enterClass: 'hidden',
                  enterActiveClass: 'slidedown',
                  leaveToClass: 'hidden',
                  leaveActiveClass: 'slideup',
                }"
                class="p-3 flex items-center justify-between text-surface-600 dark:text-surface-400 cursor-pointer rounded-md"
              >
                <span class="font-medium">Catégories</span>
                <i class="pi pi-chevron-down"></i>
              </div>
              <ul class="list-none p-0 m-0 overflow-hidden">
                <li>
                  <router-link :to="{ path: '/', query: { categoryCode: 'APERITIF' } }" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Apéritifs</span>
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ path: '/', query: { categoryCode: 'ENTREE' } }" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Entrées</span>
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ path: '/', query: { categoryCode: 'PLAT' } }" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Plats</span>
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ path: '/', query: { categoryCode: 'DESSERT' } }" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Desserts</span>
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ path: '/', query: { categoryCode: 'BOISSON' } }" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Boissons</span>
                  </router-link>
                </li>
                <li>
                  <router-link :to="{ path: '/', query: { categoryCode: 'DEJ_BRUNCH' } }" @click="visible = false" class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors no-underline">
                    <i class="pi pi-chevron-circle-right mr-2"></i>
                    <span class="font-medium">Petit-déj / Brunch</span>
                  </router-link>
                </li>
              </ul>
            </li>
          </ul>
        </div>
        <div class="mt-auto">
          <hr class="mb-3 mx-3 border-t-1 border-none border-surface-200 dark:border-surface-700" />
          <ul class="list-none p-0 m-0 overflow-hidden">
            <li>
              <a v-ripple class="flex items-center cursor-pointer p-3 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
                <i class="pi pi-cog mr-2"></i>
                <span class="font-medium">Paramètres</span>
              </a>
            </li>
          </ul>
          <a v-ripple class="m-3 flex items-center cursor-pointer p-3 gap-2 rounded-md text-surface-700 dark:text-surface-0/80 hover:bg-surface-100 dark:hover:bg-surface-700 duration-200 transition-colors">
            <Avatar image="src/assets/profile-picture.png" shape="circle" />
            <span class="font-bold">Dimitri Fernandez</span>
          </a>
        </div>
      </div>
    </template>
  </Drawer>
  <Button @click="visible = true">
    <i class="pi pi-bars mt-2 sidebar-button"></i>
  </Button>
</template>

<style lang="scss">
.sidebar-button {
  color: white;
  font-size: 1.5rem;
  padding-right: 10px;
  margin-left: 5px;
}
</style>
```

- [ ] **Step 4: Create placeholder components**

Create `frontend/cooking-vue-app/src/components/RecipeDetail.vue`:

```vue
<template>
  <div>Détail de la recette</div>
</template>

<script setup lang="ts">
</script>
```

Create `frontend/cooking-vue-app/src/components/RecipeForm.vue`:

```vue
<template>
  <div>Formulaire recette</div>
</template>

<script setup lang="ts">
</script>
```

- [ ] **Step 5: Delete CreateNewRecipe.vue (dead code)**

Run: `rm frontend/cooking-vue-app/src/components/CreateNewRecipe.vue`

- [ ] **Step 6: Verify app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 7: Commit**

```bash
git add frontend/cooking-vue-app/src/
git rm frontend/cooking-vue-app/src/components/CreateNewRecipe.vue
git commit -m "feat(frontend): update routes, navigation with router-link, add Toast, cleanup"
```

---

## Chunk 4: Frontend Components

### Task 14: RecipeCard component

**Files:**
- Create: `frontend/cooking-vue-app/src/components/RecipeCard.vue`
- Create: `frontend/cooking-vue-app/src/components/__tests__/RecipeCard.cy.ts`

- [ ] **Step 1: Write failing component test**

Create `frontend/cooking-vue-app/src/components/__tests__/RecipeCard.cy.ts`:

```typescript
import RecipeCard from '../RecipeCard.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import Tag from 'primevue/tag'
import Button from 'primevue/button'
import { createRouter, createMemoryHistory } from 'vue-router'

const mockRecipe = {
  _id: '123',
  title: 'Pad Thaï',
  description: 'Plat thaïlandais',
  thumbnail: null,
  categoryCode: 'PLAT',
  difficultyCode: 'EASY',
  costCode: 'CHEAP',
  preparationDuration: 30,
  cookDuration: 15,
  steps: ['Étape 1'],
  createdAt: '2024-01-01',
  updatedAt: '2024-01-01',
}

const router = createRouter({
  history: createMemoryHistory(),
  routes: [{ path: '/', component: { template: '<div />' } }, { path: '/recipes/:id', component: { template: '<div />' } }],
})

describe('RecipeCard', () => {
  const mountOptions = {
    props: { recipe: mockRecipe },
    global: {
      plugins: [router, [PrimeVue, { theme: { preset: Aura } }]],
      components: { Tag, Button },
    },
  }

  it('should display recipe title', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('Pad Thaï').should('be.visible')
  })

  it('should display category label', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('Plat').should('be.visible')
  })

  it('should display difficulty label', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('Facile').should('be.visible')
  })

  it('should display preparation duration', () => {
    cy.mount(RecipeCard, mountOptions)
    cy.contains('30').should('be.visible')
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `cd frontend/cooking-vue-app && npx cypress run --component --spec src/components/__tests__/RecipeCard.cy.ts`
Expected: FAIL — RecipeCard component does not exist.

- [ ] **Step 3: Implement RecipeCard**

Create `frontend/cooking-vue-app/src/components/RecipeCard.vue`:

```vue
<template>
  <div
    class="border border-surface-200 rounded-lg p-4 cursor-pointer hover:shadow-md transition-shadow"
    @click="$router.push(`/recipes/${recipe._id}`)"
  >
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="w-full sm:w-32 h-32 bg-surface-100 rounded-md overflow-hidden flex-shrink-0">
        <img
          v-if="recipe.thumbnail"
          :src="`http://localhost:3000${recipe.thumbnail}`"
          :alt="recipe.title"
          class="w-full h-full object-cover"
        />
        <div v-else class="w-full h-full flex items-center justify-center">
          <i class="pi pi-image text-4xl text-surface-400"></i>
        </div>
      </div>
      <div class="flex flex-col gap-2 flex-1">
        <h3 class="text-lg font-semibold m-0">{{ recipe.title }}</h3>
        <p v-if="recipe.description" class="text-surface-600 text-sm m-0 line-clamp-2">
          {{ recipe.description }}
        </p>
        <div class="flex flex-wrap gap-2 mt-auto">
          <Tag :value="categoryLabel" severity="info" />
          <Tag :value="difficultyLabel" :severity="difficultySeverity" />
          <Tag :value="costLabel" />
        </div>
        <div class="flex gap-4 text-sm text-surface-500">
          <span v-if="recipe.preparationDuration">
            <i class="pi pi-clock mr-1"></i>Prépa {{ recipe.preparationDuration }} min
          </span>
          <span v-if="recipe.cookDuration">
            <i class="pi pi-clock mr-1"></i>Cuisson {{ recipe.cookDuration }} min
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { Recipe } from '@/types/recipe'
import { CategoryLabels, Category } from '@/enums/category'
import { DifficultyLabels, Difficulty } from '@/enums/difficulty'
import { CostLabels, Cost } from '@/enums/cost'

const props = defineProps<{
  recipe: Recipe
}>()

const categoryLabel = computed(() => CategoryLabels[props.recipe.categoryCode as Category] || props.recipe.categoryCode)
const difficultyLabel = computed(() => DifficultyLabels[props.recipe.difficultyCode as Difficulty] || props.recipe.difficultyCode)
const costLabel = computed(() => CostLabels[props.recipe.costCode as Cost] || props.recipe.costCode)

const difficultySeverity = computed(() => {
  switch (props.recipe.difficultyCode) {
    case 'EASY': return 'success'
    case 'MIDDLE': return 'info'
    case 'HARD': return 'warn'
    case 'VERY_HARD': return 'danger'
    case 'EXPERT': return 'danger'
    default: return undefined
  }
})
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `cd frontend/cooking-vue-app && npx cypress run --component --spec src/components/__tests__/RecipeCard.cy.ts`
Expected: All 4 tests PASS.

- [ ] **Step 5: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeCard.vue frontend/cooking-vue-app/src/components/__tests__/RecipeCard.cy.ts
git commit -m "feat(frontend): RecipeCard component with labels and tags (TDD)"
```

---

### Task 15: SearchRecipes — connect to API with search and filters

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/SearchRecipes.vue`

- [ ] **Step 1: Rewrite SearchRecipes component**

Replace `frontend/cooking-vue-app/src/components/SearchRecipes.vue`:

```vue
<template>
  <div class="p-4 max-w-6xl mx-auto">
    <!-- Search bar -->
    <div class="flex flex-col sm:flex-row gap-3 mb-6">
      <div class="flex-1">
        <InputText
          v-model="searchTitle"
          placeholder="Rechercher une recette..."
          class="w-full"
          @keyup.enter="search"
        />
      </div>
      <Select
        v-model="searchCategory"
        :options="categoryOptions"
        optionLabel="label"
        optionValue="value"
        placeholder="Toutes les catégories"
        class="w-full sm:w-60"
        showClear
      />
      <Button label="Rechercher" icon="pi pi-search" @click="search" />
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <!-- Results -->
    <div v-else-if="recipes.length > 0">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <RecipeCard v-for="recipe in recipes" :key="recipe._id" :recipe="recipe" />
      </div>
      <Paginator
        v-if="total > limit"
        :rows="limit"
        :totalRecords="total"
        :first="(page - 1) * limit"
        @page="onPageChange"
        class="mt-6"
      />
    </div>

    <!-- Empty state -->
    <div v-else class="text-center p-8 text-surface-500">
      <i class="pi pi-search text-4xl mb-4 block"></i>
      <p>Aucune recette trouvée.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/RecipeService'
import { Category, CategoryLabels } from '@/enums/category'
import RecipeCard from './RecipeCard.vue'

const route = useRoute()
const toast = useToast()

const recipes = ref<Recipe[]>([])
const loading = ref(false)
const searchTitle = ref('')
const searchCategory = ref<string | null>(null)
const page = ref(1)
const limit = ref(9)
const total = ref(0)

const categoryOptions = Object.entries(CategoryLabels).map(([value, label]) => ({
  value,
  label,
}))

async function fetchRecipes() {
  loading.value = true
  try {
    const result = await RecipeService.getRecipes({
      title: searchTitle.value || undefined,
      categoryCode: searchCategory.value || undefined,
      page: page.value,
      limit: limit.value,
    })
    recipes.value = result.data
    total.value = result.total
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de charger les recettes', life: 3000 })
  } finally {
    loading.value = false
  }
}

function search() {
  page.value = 1
  fetchRecipes()
}

function onPageChange(event: { page: number }) {
  page.value = event.page + 1
  fetchRecipes()
}

onMounted(() => {
  if (route.query.categoryCode) {
    searchCategory.value = route.query.categoryCode as string
  }
  fetchRecipes()
})
</script>
```

- [ ] **Step 2: Verify app compiles and displays recipes**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

Manually verify: open `http://localhost:5173` — should display the Pad Thaï recipe from the database.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/SearchRecipes.vue
git commit -m "feat(frontend): SearchRecipes connected to API with search, filters, pagination"
```

---

### Task 16: RecipeDetail component

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeDetail.vue`

- [ ] **Step 1: Implement RecipeDetail**

Replace `frontend/cooking-vue-app/src/components/RecipeDetail.vue`:

```vue
<template>
  <div class="p-4 max-w-4xl mx-auto">
    <div v-if="loading" class="flex justify-center p-8">
      <ProgressSpinner />
    </div>

    <div v-else-if="recipe">
      <!-- Header -->
      <div class="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
        <div>
          <h1 class="text-3xl font-bold m-0">{{ recipe.title }}</h1>
          <div class="flex flex-wrap gap-2 mt-3">
            <Tag :value="categoryLabel" severity="info" />
            <Tag :value="difficultyLabel" :severity="difficultySeverity" />
            <Tag :value="costLabel" />
          </div>
        </div>
        <div class="flex gap-2">
          <Button label="Modifier" icon="pi pi-pencil" severity="info" @click="$router.push(`/recipes/${recipe._id}/edit`)" />
          <Button label="Supprimer" icon="pi pi-trash" severity="danger" outlined @click="confirmDelete = true" />
        </div>
      </div>

      <!-- Image -->
      <div v-if="recipe.thumbnail" class="mb-6">
        <img
          :src="`http://localhost:3000${recipe.thumbnail}`"
          :alt="recipe.title"
          class="w-full max-h-96 object-cover rounded-lg"
        />
      </div>

      <!-- Description -->
      <p v-if="recipe.description" class="text-surface-600 mb-6">{{ recipe.description }}</p>

      <!-- Durations -->
      <div class="flex flex-wrap gap-6 mb-6 text-surface-600">
        <div v-if="recipe.preparationDuration" class="flex items-center gap-2">
          <i class="pi pi-clock"></i>
          <span>Préparation : {{ recipe.preparationDuration }} min</span>
        </div>
        <div v-if="recipe.cookDuration" class="flex items-center gap-2">
          <i class="pi pi-clock"></i>
          <span>Cuisson : {{ recipe.cookDuration }} min</span>
        </div>
        <div v-if="recipe.breakDuration" class="flex items-center gap-2">
          <i class="pi pi-clock"></i>
          <span>Repos : {{ recipe.breakDuration }} min</span>
        </div>
      </div>

      <!-- Steps -->
      <div v-if="recipe.steps && recipe.steps.length > 0">
        <h2 class="text-xl font-semibold mb-4">Étapes</h2>
        <ol class="list-decimal list-inside space-y-3">
          <li v-for="(step, index) in recipe.steps" :key="index" class="text-surface-700">
            {{ step }}
          </li>
        </ol>
      </div>
    </div>

    <!-- Delete confirmation -->
    <Dialog v-model:visible="confirmDelete" header="Supprimer la recette" :modal="true">
      <p>Êtes-vous sûr de vouloir supprimer cette recette ?</p>
      <template #footer>
        <Button label="Annuler" severity="secondary" @click="confirmDelete = false" />
        <Button label="Supprimer" severity="danger" @click="handleDelete" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import type { Recipe } from '@/types/recipe'
import { RecipeService } from '@/services/RecipeService'
import { CategoryLabels, Category } from '@/enums/category'
import { DifficultyLabels, Difficulty } from '@/enums/difficulty'
import { CostLabels, Cost } from '@/enums/cost'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const recipe = ref<Recipe | null>(null)
const loading = ref(false)
const confirmDelete = ref(false)

const categoryLabel = computed(() => recipe.value ? CategoryLabels[recipe.value.categoryCode as Category] : '')
const difficultyLabel = computed(() => recipe.value ? DifficultyLabels[recipe.value.difficultyCode as Difficulty] : '')
const costLabel = computed(() => recipe.value ? CostLabels[recipe.value.costCode as Cost] : '')

const difficultySeverity = computed(() => {
  if (!recipe.value) return undefined
  switch (recipe.value.difficultyCode) {
    case 'EASY': return 'success'
    case 'MIDDLE': return 'info'
    case 'HARD': return 'warn'
    case 'VERY_HARD': return 'danger'
    case 'EXPERT': return 'danger'
    default: return undefined
  }
})

async function fetchRecipe() {
  loading.value = true
  try {
    recipe.value = await RecipeService.getRecipe(route.params.id as string)
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Recette non trouvée', life: 3000 })
    router.push('/')
  } finally {
    loading.value = false
  }
}

async function handleDelete() {
  if (!recipe.value) return
  try {
    await RecipeService.deleteRecipe(recipe.value._id)
    toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette supprimée', life: 3000 })
    router.push('/')
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de supprimer la recette', life: 3000 })
  }
  confirmDelete.value = false
}

onMounted(fetchRecipe)
</script>
```

- [ ] **Step 2: Verify app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeDetail.vue
git commit -m "feat(frontend): RecipeDetail page with delete confirmation"
```

---

### Task 17: RecipeForm component (create + edit)

**Files:**
- Modify: `frontend/cooking-vue-app/src/components/RecipeForm.vue`

- [ ] **Step 1: Implement RecipeForm**

Replace `frontend/cooking-vue-app/src/components/RecipeForm.vue`:

```vue
<template>
  <div class="p-4 max-w-3xl mx-auto">
    <h1 class="text-2xl font-bold mb-6">{{ isEdit ? 'Modifier la recette' : 'Créer une recette' }}</h1>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4">
      <!-- Title -->
      <div class="flex flex-col gap-1">
        <label for="title" class="font-medium">Titre *</label>
        <InputText id="title" v-model="form.title" :class="{ 'p-invalid': errors.title }" />
        <small v-if="errors.title" class="text-red-500">{{ errors.title }}</small>
      </div>

      <!-- Description -->
      <div class="flex flex-col gap-1">
        <label for="description" class="font-medium">Description</label>
        <Textarea id="description" v-model="form.description" rows="3" />
      </div>

      <!-- Category, Difficulty, Cost -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label for="categoryCode" class="font-medium">Catégorie *</label>
          <Select
            id="categoryCode"
            v-model="form.categoryCode"
            :options="categoryOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir"
            :class="{ 'p-invalid': errors.categoryCode }"
          />
          <small v-if="errors.categoryCode" class="text-red-500">{{ errors.categoryCode }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label for="difficultyCode" class="font-medium">Difficulté *</label>
          <Select
            id="difficultyCode"
            v-model="form.difficultyCode"
            :options="difficultyOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir"
            :class="{ 'p-invalid': errors.difficultyCode }"
          />
          <small v-if="errors.difficultyCode" class="text-red-500">{{ errors.difficultyCode }}</small>
        </div>
        <div class="flex flex-col gap-1">
          <label for="costCode" class="font-medium">Coût *</label>
          <Select
            id="costCode"
            v-model="form.costCode"
            :options="costOptions"
            optionLabel="label"
            optionValue="value"
            placeholder="Choisir"
            :class="{ 'p-invalid': errors.costCode }"
          />
          <small v-if="errors.costCode" class="text-red-500">{{ errors.costCode }}</small>
        </div>
      </div>

      <!-- Durations -->
      <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div class="flex flex-col gap-1">
          <label for="preparationDuration" class="font-medium">Préparation (min)</label>
          <InputText id="preparationDuration" v-model.number="form.preparationDuration" type="number" min="1" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="cookDuration" class="font-medium">Cuisson (min)</label>
          <InputText id="cookDuration" v-model.number="form.cookDuration" type="number" min="1" />
        </div>
        <div class="flex flex-col gap-1">
          <label for="breakDuration" class="font-medium">Repos (min)</label>
          <InputText id="breakDuration" v-model.number="form.breakDuration" type="number" min="1" />
        </div>
      </div>

      <!-- Image -->
      <div class="flex flex-col gap-1">
        <label class="font-medium">Image</label>
        <input type="file" accept="image/jpeg,image/png,image/webp" @change="onFileChange" />
        <img
          v-if="imagePreview"
          :src="imagePreview"
          alt="Aperçu"
          class="mt-2 max-h-48 rounded-md object-cover"
        />
      </div>

      <!-- Steps -->
      <div class="flex flex-col gap-2">
        <label class="font-medium">Étapes</label>
        <div v-for="(step, index) in form.steps" :key="index" class="flex gap-2">
          <span class="font-medium mt-2 text-surface-500">{{ index + 1 }}.</span>
          <InputText v-model="form.steps[index]" class="flex-1" />
          <Button icon="pi pi-trash" severity="danger" text @click="removeStep(index)" />
        </div>
        <Button label="Ajouter une étape" icon="pi pi-plus" severity="secondary" text @click="addStep" />
      </div>

      <!-- Submit -->
      <div class="flex gap-2 mt-4">
        <Button type="submit" :label="isEdit ? 'Enregistrer' : 'Créer'" icon="pi pi-check" :loading="submitting" />
        <Button label="Annuler" severity="secondary" outlined @click="$router.back()" />
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { RecipeService } from '@/services/RecipeService'
import { CategoryLabels } from '@/enums/category'
import { DifficultyLabels } from '@/enums/difficulty'
import { CostLabels } from '@/enums/cost'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const isEdit = computed(() => !!route.params.id)
const submitting = ref(false)
const thumbnailFile = ref<File | null>(null)
const imagePreview = ref<string | null>(null)

const form = reactive({
  title: '',
  description: '',
  categoryCode: '',
  difficultyCode: '',
  costCode: '',
  preparationDuration: null as number | null,
  cookDuration: null as number | null,
  breakDuration: null as number | null,
  steps: [] as string[],
})

const errors = reactive({
  title: '',
  categoryCode: '',
  difficultyCode: '',
  costCode: '',
})

const categoryOptions = Object.entries(CategoryLabels).map(([value, label]) => ({ value, label }))
const difficultyOptions = Object.entries(DifficultyLabels).map(([value, label]) => ({ value, label }))
const costOptions = Object.entries(CostLabels).map(([value, label]) => ({ value, label }))

function addStep() {
  form.steps.push('')
}

function removeStep(index: number) {
  form.steps.splice(index, 1)
}

function onFileChange(event: Event) {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  if (file) {
    thumbnailFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

function validate(): boolean {
  let valid = true
  errors.title = ''
  errors.categoryCode = ''
  errors.difficultyCode = ''
  errors.costCode = ''

  if (!form.title.trim()) {
    errors.title = 'Le titre est requis'
    valid = false
  }
  if (!form.categoryCode) {
    errors.categoryCode = 'La catégorie est requise'
    valid = false
  }
  if (!form.difficultyCode) {
    errors.difficultyCode = 'La difficulté est requise'
    valid = false
  }
  if (!form.costCode) {
    errors.costCode = 'Le coût est requis'
    valid = false
  }
  return valid
}

async function handleSubmit() {
  if (!validate()) return

  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('title', form.title)
    if (form.description) formData.append('description', form.description)
    formData.append('categoryCode', form.categoryCode)
    formData.append('difficultyCode', form.difficultyCode)
    formData.append('costCode', form.costCode)
    if (form.preparationDuration) formData.append('preparationDuration', String(form.preparationDuration))
    if (form.cookDuration) formData.append('cookDuration', String(form.cookDuration))
    if (form.breakDuration) formData.append('breakDuration', String(form.breakDuration))
    form.steps.filter(s => s.trim()).forEach(step => formData.append('steps', step))
    if (thumbnailFile.value) formData.append('thumbnail', thumbnailFile.value)

    if (isEdit.value) {
      await RecipeService.updateRecipe(route.params.id as string, formData)
      toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette modifiée', life: 3000 })
    } else {
      await RecipeService.createRecipe(formData)
      toast.add({ severity: 'success', summary: 'Succès', detail: 'Recette créée', life: 3000 })
    }
    router.push('/')
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Erreur', detail: 'Impossible de sauvegarder la recette', life: 3000 })
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) {
    try {
      const recipe = await RecipeService.getRecipe(route.params.id as string)
      form.title = recipe.title
      form.description = recipe.description || ''
      form.categoryCode = recipe.categoryCode
      form.difficultyCode = recipe.difficultyCode
      form.costCode = recipe.costCode
      form.preparationDuration = recipe.preparationDuration || null
      form.cookDuration = recipe.cookDuration || null
      form.breakDuration = recipe.breakDuration || null
      form.steps = recipe.steps || []
      if (recipe.thumbnail) {
        imagePreview.value = `http://localhost:3000${recipe.thumbnail}`
      }
    } catch (e) {
      toast.add({ severity: 'error', summary: 'Erreur', detail: 'Recette non trouvée', life: 3000 })
      router.push('/')
    }
  }
})
</script>
```

- [ ] **Step 2: Verify app compiles**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/RecipeForm.vue
git commit -m "feat(frontend): RecipeForm component for create and edit with validation"
```

---

## Chunk 5: Integration & Final Testing

### Task 18: RecipeForm component test

**Files:**
- Create: `frontend/cooking-vue-app/src/components/__tests__/RecipeForm.cy.ts`

- [ ] **Step 1: Write component test**

Create `frontend/cooking-vue-app/src/components/__tests__/RecipeForm.cy.ts`:

```typescript
import RecipeForm from '../RecipeForm.vue'
import PrimeVue from 'primevue/config'
import Aura from '@primevue/themes/aura'
import ToastService from 'primevue/toastservice'
import InputText from 'primevue/inputtext'
import Button from 'primevue/button'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'
import Tag from 'primevue/tag'
import Toast from 'primevue/toast'
import ProgressSpinner from 'primevue/progressspinner'
import { createRouter, createMemoryHistory } from 'vue-router'

const router = createRouter({
  history: createMemoryHistory(),
  routes: [
    { path: '/', component: { template: '<div />' } },
    { path: '/recipes/create', component: RecipeForm },
    { path: '/recipes/:id/edit', component: RecipeForm },
  ],
})

describe('RecipeForm', () => {
  const mountOptions = {
    global: {
      plugins: [router, [PrimeVue, { theme: { preset: Aura } }], ToastService],
      components: { InputText, Button, Select, Textarea, Tag, Toast, ProgressSpinner },
    },
  }

  it('should display the creation title by default', () => {
    cy.mount(RecipeForm, mountOptions)
    cy.contains('Créer une recette').should('be.visible')
  })

  it('should show validation errors when submitting empty form', () => {
    cy.mount(RecipeForm, mountOptions)
    cy.contains('Créer').click()
    cy.contains('Le titre est requis').should('be.visible')
    cy.contains('La catégorie est requise').should('be.visible')
  })

  it('should allow adding and removing steps', () => {
    cy.mount(RecipeForm, mountOptions)
    cy.contains('Ajouter une étape').click()
    cy.contains('Ajouter une étape').click()
    cy.get('input').should('have.length.at.least', 2)
  })
})
```

- [ ] **Step 2: Run test to verify it passes**

Run: `cd frontend/cooking-vue-app && npx cypress run --component --spec src/components/__tests__/RecipeForm.cy.ts`
Expected: All 3 tests PASS. (These tests verify the already-implemented RecipeForm component.)

- [ ] **Step 3: Commit**

```bash
git add frontend/cooking-vue-app/src/components/__tests__/RecipeForm.cy.ts
git commit -m "test(frontend): add RecipeForm component tests"
```

---

### Task 19: Frontend Cypress E2E tests

**Files:**
- Create: `frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts`
- Modify: `frontend/cooking-vue-app/cypress/e2e/example.cy.ts` (delete)

- [ ] **Step 1: Delete old example E2E test**

Run: `rm frontend/cooking-vue-app/cypress/e2e/example.cy.ts`

- [ ] **Step 2: Create recipes E2E test**

Create `frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts`:

```typescript
describe('Recipes CRUD', () => {
  beforeEach(() => {
    cy.visit('/')
  })

  it('should display the recipe list page', () => {
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
    cy.get('input[placeholder*="Rechercher"]').type('Pad')
    cy.contains('Rechercher').click()
    cy.contains('Pad Thaï').should('be.visible')
  })

  it('should view recipe detail', () => {
    cy.contains('Pad Thaï').click()
    cy.contains('Pad Thaï').should('be.visible')
    cy.contains('Étapes').should('be.visible')
  })

  it('should delete a recipe', () => {
    // First create a recipe to delete
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

- [ ] **Step 3: Run E2E tests**

Requires both backend and frontend to be running.

Run: `cd frontend/cooking-vue-app && npm run test:e2e`
Expected: All tests PASS.

- [ ] **Step 4: Commit**

```bash
git rm frontend/cooking-vue-app/cypress/e2e/example.cy.ts
git add frontend/cooking-vue-app/cypress/e2e/recipes.cy.ts
git commit -m "test(frontend): add Cypress E2E tests for recipes CRUD"
```

---

### Task 20: Update CLAUDE.md

**Files:**
- Modify: `CLAUDE.md`

- [ ] **Step 1: Add TDD section to CLAUDE.md**

Append to `CLAUDE.md` after the Data Model section:

```markdown
## Development Methodology

### TDD (Test-Driven Development)
Pour chaque fonctionnalité :
1. **RED** : Écrire les tests en premier (ils doivent échouer)
2. **GREEN** : Implémenter le minimum pour que les tests passent
3. **REFACTOR** : Nettoyer le code si nécessaire

### Test Commands
- Backend unit tests : `cd backend/cooking-nest-app && npm test`
- Backend E2E tests : `cd backend/cooking-nest-app && npm run test:e2e`
- Frontend component tests : `cd frontend/cooking-vue-app && npm run test:unit`
- Frontend E2E tests : `cd frontend/cooking-vue-app && npm run test:e2e`
```

- [ ] **Step 2: Commit**

```bash
git add CLAUDE.md
git commit -m "docs: add TDD methodology and test commands to CLAUDE.md"
```

---

### Task 21: End-to-end verification

- [ ] **Step 1: Run all backend tests**

Run: `cd backend/cooking-nest-app && npx jest --verbose`
Expected: All tests PASS.

- [ ] **Step 2: Run backend E2E tests**

Run: `cd backend/cooking-nest-app && npm run test:e2e`
Expected: All tests PASS.

- [ ] **Step 3: Build frontend**

Run: `cd frontend/cooking-vue-app && npm run build`
Expected: Build succeeds with no errors.

- [ ] **Step 4: Manual smoke test**

Start the app and verify in browser:
1. `http://localhost:5173` — should show recipe list with Pad Thaï
2. Click on Pad Thaï — should show detail page with all fields
3. Click "Créer une recette" — should show form
4. Fill form and submit — should create recipe and redirect to list
5. Edit a recipe — should pre-fill form
6. Delete a recipe — should show confirmation dialog
7. Search by name — should filter results
8. Filter by category — should filter results
9. Test on mobile viewport (DevTools) — should be responsive

- [ ] **Step 5: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix: address issues found during smoke testing"
```
