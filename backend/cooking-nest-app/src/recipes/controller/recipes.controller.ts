import { Controller, Get } from '@nestjs/common';
import { RecipesService } from '../services/recipes.service';
import { RecipeDto } from '../dto/recipe.dto';

@Controller('data')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get('recipes')
  async getRecipes(): Promise<RecipeDto[]> {
    return (await this.recipesService.findAll()).map(
      (recipe) => new RecipeDto(recipe.name),
    );
  }
}
