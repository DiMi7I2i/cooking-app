# Tags — Design Specification

## Overview

Ajout d'un système de tags prédéfinis sur les recettes pour identifier facilement les régimes alimentaires (sans gluten, végan, etc.). Tags optionnels, filtrables via la LeftBar.

## Modèle de données

### Enum Tag (backend + frontend)

| Code | Label français |
|------|---------------|
| GLUTEN_FREE | Sans gluten |
| LACTOSE_FREE | Sans lactose |
| VEGAN | Végan |
| VEGETARIAN | Végétarien |
| NUT_FREE | Sans noix |
| HALAL | Halal |
| KOSHER | Casher |
| BIO | Bio |

### Modification du schéma Recipe

Ajout du champ avec contrainte enum Mongoose :
```typescript
@Prop({ type: [String], enum: Tag })
tags: string[];
```

Optionnel (une recette peut n'avoir aucun tag). La contrainte `enum` au niveau Mongoose garantit que seules les valeurs valides sont acceptées.

## API

Pas de nouveaux endpoints. Modifications aux structures existantes :

### DTOs

**CreateRecipeDto** :
```typescript
@Transform(({ value }) => (typeof value === 'string' ? [value] : value))
@IsArray()
@IsEnum(Tag, { each: true })
@IsOptional()
tags?: string[];
```

**UpdateRecipeDto** : même décorateurs que CreateRecipeDto (le DTO est une classe séparée, pas un PartialType).

**QueryRecipesDto** :
```typescript
@IsOptional()
@IsEnum(Tag)
tags?: string;  // string simple (un seul tag via query param)
```

### Filtrage

`GET /data/recipes?tags=VEGAN` retourne les recettes qui contiennent le tag VEGAN dans leur tableau `tags`.

Le service utilise `{ tags: query.tags }` dans le filtre MongoDB, ce qui fonctionne car MongoDB match automatiquement une valeur dans un tableau.

### Sérialisation FormData

Chaque tag envoyé via `formData.append('tags', tag)`. Le DTO utilise `@Transform` pour gérer le cas d'un seul tag (string → array).

## Frontend

### Enum + Labels

Fichier `frontend/cooking-vue-app/src/enums/tag.ts` avec string enum + labels FR.

### Types

Ajout de `tags?: string[]` dans l'interface `Recipe` (`types/recipe.ts`).
Ajout de `tags?: string` dans `RecipeFilters`.

### RecipeForm

Sélection multiple de tags via checkboxes ou MultiSelect PrimeVue. Champ optionnel.
Sérialisation : `form.tags.forEach(tag => formData.append('tags', tag))`.

### RecipeCard

Tags affichés sous forme de petits badges après les tags existants (catégorie, difficulté, coût).

### RecipeDetail

Tags affichés dans la section header, à côté des tags existants.

### LeftBar

Nouvelle section "Tags" (collapsible, fermée par défaut) avec les tags cliquables.
Chaque tag navigue vers `/?tags=GLUTEN_FREE` etc.

Note : cliquer sur un tag dans la LeftBar réinitialise les autres filtres (catégorie, difficulté, coût), conformément au comportement existant des autres filtres.

### SearchRecipes

Gère le paramètre `tags` depuis l'URL query. Passe le filtre au RecipeService.

### RecipeService

Ajout de `tags` dans les query params de l'API.

## Backend — Fichiers

- Créer : `backend/cooking-nest-app/src/recipes/enums/tag.enum.ts`
- Modifier : `recipe.schema.ts`, `create-recipe.dto.ts`, `update-recipe.dto.ts`, `query-recipes.dto.ts`, `recipes.service.ts`

## Tests (TDD)

### Backend
- **Schema** : accepte recipe avec tags, accepte recipe sans tags
- **Service** : filtre par tag
- **Controller** : mise à jour tests existants
- **E2E** : création avec tags, filtrage par tag

### Frontend
- Build TypeScript OK

## Seed data

Mise à jour de `recipes.js` pour ajouter des tags au Pad Thaï : `["LACTOSE_FREE"]`.
