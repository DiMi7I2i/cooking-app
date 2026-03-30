# UX/UI Improvements — Design Spec

**Date:** 2026-03-30
**Scope:** 4 axes d'amélioration UX/UI pour cooking-app

---

## 1. Design System — Variables CSS & harmonisation

### Problème
- La couleur primaire `#3eb9a1` est hardcodée dans 10+ endroits (Header, Footer, RecipeCard, RecipeDetail, SearchRecipes, RecipeForm)
- La palette Tailwind `@theme` dans `style.css` utilise des tons emerald (`#10b981`) qui ne correspondent pas à la couleur réellement utilisée
- `base.css` contient des variables Vue theme (`--vt-c-*`) probablement inutilisées
- Mix incohérent de styles : Tailwind utilities, scoped SCSS, classes PrimeVue, hex hardcodés

### Solution
1. **Recalculer la palette `@theme`** autour de `#3eb9a1` comme couleur de référence (primary-500), en générant les nuances 50→950 cohérentes
2. **Ajouter une variable CSS sémantique** `--color-teal` (ou réutiliser `--color-primary-500`) pour les cas où Tailwind ne s'applique pas (scoped styles)
3. **Remplacer tous les `#3eb9a1` hardcodés** par `bg-primary-500`, `text-primary-500`, ou `var(--color-primary-500)` selon le contexte
4. **Nettoyer `base.css`** — supprimer les variables `--vt-c-*` si elles ne sont plus utilisées
5. **Harmoniser les patterns de style :**
   - Boutons : utiliser les variants PrimeVue (`severity`, `outlined`, `text`) de façon cohérente
   - Tags/badges : toujours via le composant PrimeVue `Tag` avec des severities standardisées
   - Erreurs de formulaire : un seul pattern (`p-invalid` + message rouge en dessous)
   - Espacements : uniquement les classes Tailwind (pas de valeurs arbitraires en px)

### Fichiers impactés
- `src/style.css` — palette `@theme` à recalculer
- `src/assets/base.css` — nettoyage variables inutilisées
- `src/components/Header.vue` — remplacer `#3eb9a1` par classes Tailwind/variables
- `src/components/Footer.vue` — idem
- `src/components/RecipeCard.vue` — idem
- `src/components/RecipeDetail.vue` — idem
- `src/components/SearchRecipes.vue` — idem
- `src/components/RecipeForm.vue` — idem

---

## 2. LeftBar — Fix scrollbars multiples

### Problème
Quand toutes les sections sont dépliées (Catégories, Difficulté, Coût, Tags), plusieurs scrollbars apparaissent dans le Drawer PrimeVue — une sur le Drawer et une sur le contenu interne.

### Solution
1. **Une seule scrollbar** sur le conteneur principal du Drawer — tout le contenu scrolle ensemble (header de navigation, sections dépliantes, footer profil)
2. **Footer "Dimitri Fernandez" fixé en bas** du drawer (sticky bottom) — toujours visible, ne scrolle pas avec le reste
3. **Structure CSS :** le Drawer utilise `display: flex; flex-direction: column`, le contenu central prend `flex: 1; overflow-y: auto`, le footer reste en place

### Fichiers impactés
- `src/components/LeftBar.vue` — restructuration du layout CSS du Drawer

---

## 3. Navigation — Breadcrumb inline avec flèche retour

### Design retenu
Option C : breadcrumb intégré dans le contenu (pas de barre dédiée), avec le premier élément qui sert de bouton retour (`← Recettes`).

### Comportement
- **RecipeDetail :** `← Recettes › [Catégorie] › [Titre recette]`
- **RecipeForm (création) :** `← Recettes › Nouvelle recette`
- **RecipeForm (édition) :** `← Recettes › [Titre recette] › Modifier`
- **SearchRecipes (accueil) :** pas de breadcrumb (page racine)
- Le lien `← Recettes` ramène toujours à la liste (avec filtres préservés si possible)
- Chaque segment intermédiaire est cliquable

### Implémentation
- Créer un composant `Breadcrumb.vue` réutilisable
- Le composant reçoit un tableau de segments `{ label, to? }` en props
- Le premier segment affiche la flèche retour `←`
- Le dernier segment est non-cliquable (page courante)
- Style : texte petit (13-14px), couleur primaire pour les liens, gris pour le segment courant, séparateur `›`

### Fichiers impactés
- `src/components/Breadcrumb.vue` — nouveau composant
- `src/components/RecipeDetail.vue` — intégrer le breadcrumb
- `src/components/RecipeForm.vue` — intégrer le breadcrumb

---

## 4. Formulaire — Upload image, drag-and-drop, validation

### 4a. Upload d'image stylé

**Problème :** Input file brut du navigateur, pas de preview.

**Solution :**
- Zone de drop stylée : rectangle en pointillés avec icône + texte "Glissez une image ou cliquez pour sélectionner"
- Preview immédiate après sélection/drop, avec bouton "×" pour retirer
- Contraintes affichées : "JPEG, PNG ou WebP — 5 Mo max" en texte discret sous la zone
- En mode édition : si la recette a déjà une image, elle s'affiche dans la zone avec possibilité de la remplacer ou supprimer

### 4b. Drag-and-drop pour ingrédients et étapes

**Problème :** On peut ajouter/supprimer des ingrédients et étapes, mais pas les réordonner.

**Solution :**
- Poignée de drag (icône ⠿ à gauche de chaque ligne) pour réordonner par glisser-déposer
- Utilisation d'une lib légère : `vuedraggable` ou `vue-draggable-plus` (wrapper SortableJS)
- Les boutons ajouter/supprimer restent en place
- Feedback visuel pendant le drag : élément semi-transparent, placeholder visible

### 4c. Validation en temps réel

**Problème :** Les erreurs n'apparaissent qu'au submit.

**Solution :**
- Validation au blur (quand on quitte un champ) — pas pendant la saisie pour ne pas être intrusif
- Pattern unique pour les erreurs : classe `p-invalid` sur le champ + message rouge en dessous
- Champs requis : indicateur visuel clair (astérisque + bordure rouge si vide après blur)
- Bouton submit désactivé tant que les champs requis ne sont pas remplis

### Fichiers impactés
- `src/components/RecipeForm.vue` — upload stylé, drag-and-drop, validation
- `package.json` — ajout dépendance `vuedraggable` ou `vue-draggable-plus`

---

## Ordre d'implémentation

1. **Design System** — centraliser variables, harmoniser styles (fondation pour le reste)
2. **LeftBar** — fix scrollbars (correctif rapide)
3. **Navigation** — breadcrumb inline (nouveau composant)
4. **Formulaire** — upload, drag-and-drop, validation (le plus complexe)

## Dépendances externes
- `vuedraggable` ou `vue-draggable-plus` (wrapper Vue 3 pour SortableJS)
