# Cooking App v1 — Design Specification

## Overview

Application de gestion de recettes de cuisine. Responsive (PC + mobile). Sans authentification pour v1.

## Data Model

### Recipe (MongoDB)

| Champ | Type | Requis | Description |
|-------|------|--------|-------------|
| title | string | oui | Nom de la recette (max 200 caractères) |
| description | string | non | Description de la recette |
| thumbnail | string | non | Chemin de l'image uploadée (stockage local) |
| categoryCode | string enum | oui | APERITIF, ENTREE, PLAT, DESSERT, BOISSON, DEJ_BRUNCH |
| difficultyCode | string enum | oui | EASY, MIDDLE, HARD, VERY_HARD, EXPERT |
| costCode | string enum | oui | CHEAP, MIDDLE, EXPENSIVE |
| preparationDuration | number | non | Durée de préparation en minutes (entier positif) |
| cookDuration | number | non | Durée de cuisson en minutes (entier positif) |
| breakDuration | number | non | Temps de repos en minutes (entier positif) |
| steps | string[] | non | Liste ordonnée des étapes (l'index donne l'ordre) |
| createdAt | Date | auto | Date de création (timestamp Mongoose) |
| updatedAt | Date | auto | Date de modification (timestamp Mongoose) |

### Notes sur le modèle

- **steps** : tableau simple de strings. Le seed data existant utilise `{ num_order, description }` — il sera migré vers `string[]` (l'ordre est donné par l'index du tableau).
- **Durées** : nombres entiers en minutes. Le seed data sera mis à jour pour utiliser des nombres au lieu de `$dateFromParts`.
- **Enums** : stockés comme strings en MongoDB. Les enums frontend existants (numériques) seront migrés vers des string enums (`APERITIF = "APERITIF"`, etc.).

### Validation (backend)

- `title` : requis, string, max 200 caractères
- `categoryCode`, `difficultyCode`, `costCode` : requis, doit être une valeur de l'enum correspondant
- `preparationDuration`, `cookDuration`, `breakDuration` : optionnel, entier positif
- `steps` : optionnel, tableau de strings non vides
- Validation via `class-validator` + `class-transformer` (NestJS ValidationPipe)
- Erreurs de validation : HTTP 400 avec body `{ statusCode: 400, message: string[], error: "Bad Request" }` (format par défaut NestJS)

## API REST

Base path: `/data/recipes`

| Méthode | Route | Description | Body/Params |
|---------|-------|-------------|-------------|
| GET | `/data/recipes` | Liste paginée + filtres | Query: `page`, `limit`, `title`, `categoryCode` |
| GET | `/data/recipes/:id` | Détail d'une recette | — |
| POST | `/data/recipes` | Créer une recette | multipart/form-data (champs + thumbnail) |
| PUT | `/data/recipes/:id` | Modifier une recette | multipart/form-data (champs + thumbnail) |
| DELETE | `/data/recipes/:id` | Supprimer une recette | — |

### Pagination

- Paramètres : `page` (défaut 1), `limit` (défaut 10)
- Réponse : `{ data: Recipe[], total: number, page: number, limit: number }`
- Le frontend calcule `totalPages = Math.ceil(total / limit)`

### Filtres

- `title` : recherche partielle insensible à la casse sur le titre (regex MongoDB)
- `categoryCode` : filtre exact sur la catégorie

### Upload d'images

- Champ `thumbnail` en multipart/form-data
- Librairie : Multer via `@nestjs/platform-express`
- Stockage dans un dossier `uploads/` servi en statique par NestJS (`ServeStaticModule` ou `app.useStaticAssets`)
- Nom de fichier : UUID généré + extension originale (ex: `a1b2c3d4.jpg`)
- Types acceptés : JPEG, PNG, WebP
- Taille max : 5 Mo
- URL servie au frontend : `/uploads/<filename>`
- **Suppression** : le fichier est supprimé du disque lors de la suppression de la recette ou du remplacement de l'image

### Codes de retour HTTP

| Scénario | Code |
|----------|------|
| Succès lecture | 200 |
| Succès création | 201 |
| Succès suppression | 204 (No Content) |
| Validation échouée | 400 |
| Recette non trouvée | 404 |
| Erreur serveur | 500 |

## Frontend

### Routes

Ordre de déclaration important : `/recipes/create` avant `/recipes/:id` pour éviter les conflits.

| Route | Composant | Description |
|-------|-----------|-------------|
| `/` | SearchRecipes | Liste paginée + recherche par nom + filtre catégorie |
| `/recipes/create` | RecipeForm | Formulaire de création |
| `/recipes/:id` | RecipeDetail | Vue détaillée (lecture seule) |
| `/recipes/:id/edit` | RecipeForm | Formulaire de modification (pré-rempli) |

### Composants

- **RecipeCard** : carte résumée d'une recette (image, titre, catégorie, difficulté, coût, durée). Utilisée dans la liste.
- **RecipeForm** : formulaire unique pour création et modification. Tous les champs sur une seule page. Upload d'image inclus.
- **RecipeDetail** : affichage complet d'une recette avec ses étapes. Boutons modifier/supprimer. Dialogue de confirmation avant suppression.
- **Header / Footer / LeftBar** : composants existants, à adapter pour la navigation.

### Service API

- `RecipeService.ts` : remplace le `ProductService.js` mock actuel
- Méthodes : `getRecipes(filters)`, `getRecipe(id)`, `createRecipe(data)`, `updateRecipe(id, data)`, `deleteRecipe(id)`

### Gestion des erreurs frontend

- Erreurs API affichées via PrimeVue **Toast** (notifications)
- Erreurs de validation formulaire affichées inline sous les champs

### Enums frontend

Les enums existants seront migrés de numériques vers string enums :
```typescript
export enum Category {
  APERITIF = 'APERITIF',
  ENTREE = 'ENTREE',
  // ...
}
```

### Responsive

- **Mobile** : liste en 1 colonne, sidebar en drawer, formulaire pleine largeur
- **Desktop** : liste en grille 2-3 colonnes, sidebar drawer ou permanente

## Testing Strategy (TDD)

### Méthodologie

Pour chaque fonctionnalité :
1. Écrire le(s) test(s) (RED)
2. Vérifier qu'ils échouent
3. Implémenter le minimum pour passer (GREEN)
4. Refactor si nécessaire

### Backend (Jest)

- **Unit tests** : RecipesService — logique métier avec mocking du modèle Mongoose
- **E2E tests** : chaque endpoint via Supertest + `mongodb-memory-server` (base in-memory)

### Frontend (Cypress)

- **Component tests** : RecipeCard, RecipeForm, SearchRecipes (rendu, interactions utilisateur)
- **E2E tests** : parcours complets (CRUD + recherche)

## Hors scope v1

- Authentification / gestion d'utilisateurs
- Ingrédients (liste d'ingrédients par recette)
- Recherche avancée (difficulté, coût, durée...)
- Formulaire en étapes (wizard/stepper)
