import { Controller, Get, Query } from '@nestjs/common';
import { RecipesService } from '../services/recipes.service';
import { QueryRecipesDto } from '../dto/query-recipes.dto';

@Controller('data/recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getRecipes(@Query() query: QueryRecipesDto) {
    return this.recipesService.findAll(query);
  }
}
