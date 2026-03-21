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
    findAll: jest
      .fn()
      .mockResolvedValue(new PaginatedResponseDto([mockRecipe], 1, 1, 10)),
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
    const dto = {
      title: 'Crêpes',
      categoryCode: 'DESSERT',
      difficultyCode: 'EASY',
      costCode: 'CHEAP',
      ingredients: [{ name: 'Farine', quantity: 250, unit: 'g' }],
    };
    const result = await controller.createRecipe(dto, undefined);
    expect(result.title).toBe('Pad Thaï');
    expect(service.create).toHaveBeenCalled();
  });

  it('PUT /data/recipes/:id — should update a recipe', async () => {
    const dto = { title: 'Pad Thaï Revisité' };
    const result = await controller.updateRecipe(
      '507f1f77bcf86cd799439011',
      dto,
      undefined,
    );
    expect(service.update).toHaveBeenCalled();
  });

  it('DELETE /data/recipes/:id — should delete a recipe', async () => {
    await controller.deleteRecipe('507f1f77bcf86cd799439011');
    expect(service.delete).toHaveBeenCalledWith('507f1f77bcf86cd799439011');
  });
});
