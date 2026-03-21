import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
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
            countDocuments: jest
              .fn()
              .mockReturnValue({ exec: jest.fn().mockResolvedValue(1) }),
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

    it('should apply difficultyCode filter', async () => {
      await service.findAll({ page: 1, limit: 10, difficultyCode: 'EASY' });
      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({ difficultyCode: 'EASY' }),
      );
    });

    it('should apply costCode filter', async () => {
      await service.findAll({ page: 1, limit: 10, costCode: 'CHEAP' });
      expect(model.find).toHaveBeenCalledWith(
        expect.objectContaining({ costCode: 'CHEAP' }),
      );
    });

    it('should use skip and limit for pagination', async () => {
      await service.findAll({ page: 2, limit: 5 });
      expect(mockQuery.skip).toHaveBeenCalledWith(5);
      expect(mockQuery.limit).toHaveBeenCalledWith(5);
    });
  });

  describe('findOne', () => {
    it('should return a recipe by id', async () => {
      model.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRecipe) });
      const result = await service.findOne('507f1f77bcf86cd799439011');
      expect(result).toEqual(mockRecipe);
      expect(model.findById).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
    });

    it('should throw NotFoundException if recipe not found', async () => {
      model.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.findOne('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('create', () => {
    it('should create and return a recipe', async () => {
      const createDto = {
        title: 'Crêpes',
        categoryCode: 'DESSERT',
        difficultyCode: 'EASY',
        costCode: 'CHEAP',
        ingredients: [{ name: 'Farine', quantity: 250, unit: 'g' }],
        servings: 4,
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
      model.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRecipe) });
      model.findByIdAndUpdate = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(updatedRecipe) });

      const result = await service.update('507f1f77bcf86cd799439011', updateDto);
      expect(result).toEqual(updatedRecipe);
      expect(model.findByIdAndUpdate).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
        updateDto,
        { new: true },
      );
    });

    it('should throw NotFoundException if recipe not found', async () => {
      model.findById = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(
        service.update('nonexistent', { title: 'Test' }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('delete', () => {
    it('should delete the recipe', async () => {
      model.findByIdAndDelete = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(mockRecipe) });

      await service.delete('507f1f77bcf86cd799439011');
      expect(model.findByIdAndDelete).toHaveBeenCalledWith(
        '507f1f77bcf86cd799439011',
      );
    });

    it('should throw NotFoundException if recipe not found', async () => {
      model.findByIdAndDelete = jest
        .fn()
        .mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      await expect(service.delete('nonexistent')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
