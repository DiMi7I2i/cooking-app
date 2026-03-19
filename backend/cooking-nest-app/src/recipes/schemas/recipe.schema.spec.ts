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
    const recipe = new RecipeModel({
      title: 'Test',
      categoryCode: 'INVALID',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
    });
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
