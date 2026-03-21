# Ingrédients — Design Specification

## Overview

Ajout d'une liste d'ingrédients aux recettes. Chaque ingrédient a un nom, une quantité optionnelle et une unité optionnelle. Au moins un ingrédient est requis par recette.

## Modèle de données

### Ingredient (sous-document MongoDB)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| name | string (max 200) | oui | Nom de l'ingrédient (ex: "Nouilles de riz") |
| quantity | number (> 0, décimaux autorisés) | non | Quantité (ex: 200, 1.5) |
| unit | string (max 50, texte libre) | non | Unité (ex: "g", "cl", "pièce") — pas d'enum, texte libre |

### Modification du schéma Recipe

Ajout du champ :
```
ingredients: Ingredient[] (requis au niveau DTO, optionnel au niveau Mongoose pour compatibilité avec les données existantes)
```

Note : `required` est appliqué au niveau des DTOs (`CreateRecipeDto`) et non au niveau du schéma Mongoose, pour éviter de casser la lecture/mise à jour des recettes existantes qui n'ont pas d'ingrédients.

## API

Pas de nouveaux endpoints. Le champ `ingredients` est ajouté aux structures existantes.

### Sérialisation FormData

Les endpoints utilisent `multipart/form-data` (upload d'images). Les ingrédients sont envoyés comme une chaîne JSON :

**Frontend** :
```typescript
formData.append('ingredients', JSON.stringify(ingredients))
```

**Backend DTO** :
```typescript
@Transform(({ value }) => typeof value === 'string' ? JSON.parse(value) : value)
@ValidateNested({ each: true })
@Type(() => CreateIngredientDto)
@ArrayNotEmpty()
ingredients: CreateIngredientDto[];
```

Un sous-DTO `CreateIngredientDto` gère la validation de chaque ingrédient :
```typescript
class CreateIngredientDto {
  @IsString() @IsNotEmpty() @MaxLength(200) name: string;
  @IsNumber() @Min(0.01) @IsOptional() quantity?: number;
  @IsString() @MaxLength(50) @IsOptional() unit?: string;
}
```

### Exemple de payload (JSON dans le champ FormData)

```json
[
  { "name": "Nouilles de riz", "quantity": 200, "unit": "g" },
  { "name": "Poulet", "quantity": 150, "unit": "g" },
  { "name": "Sel" }
]
```

## Frontend

### Types

Ajout dans `types/recipe.ts` :
```typescript
interface Ingredient {
  name: string
  quantity?: number
  unit?: string
}
```

Ajout de `ingredients: Ingredient[]` dans l'interface `Recipe`.

### RecipeForm

Section "Ingrédients" avec bouton "Ajouter un ingrédient". Chaque ligne contient :
- Champ **Nom** (texte, requis)
- Champ **Quantité** (nombre, optionnel)
- Champ **Unité** (texte, optionnel)
- Bouton **supprimer** (icône poubelle)

Même pattern visuel que la section "Étapes" existante. Validation frontend : au moins un ingrédient avec un nom non vide.

Sérialisation : `formData.append('ingredients', JSON.stringify(ingredients))`.

### RecipeDetail

Section "Ingrédients" affichée **avant** la section "Étapes". Liste à puces formatée :
- Avec quantité et unité : "200 g — Nouilles de riz"
- Avec quantité sans unité : "3 — Œufs"
- Sans quantité : "Sel"

### RecipeCard

Pas de modification.

## Tests (TDD)

### Backend
- **Schema** : validation du sous-document Ingredient (name requis)
- **Service** : tests CRUD avec ingrédients
- **Controller** : mise à jour des tests existants pour inclure ingredients
- **E2E** : création/modification/lecture de recettes avec ingrédients

### Frontend
- Build TypeScript OK

## Seed data

Mise à jour de `recipes.js` pour ajouter des ingrédients à la recette Pad Thaï.

## Compatibilité

Les recettes existantes sans ingrédients restent valides en lecture (le champ est optionnel au niveau Mongoose). La validation `ArrayNotEmpty` s'applique uniquement à la création (POST) via le DTO.
