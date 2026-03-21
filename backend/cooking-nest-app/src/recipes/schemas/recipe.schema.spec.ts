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
});
