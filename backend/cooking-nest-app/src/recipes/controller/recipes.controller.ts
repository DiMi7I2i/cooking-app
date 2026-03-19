import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  HttpCode,
  HttpStatus,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RecipesService } from '../services/recipes.service';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { QueryRecipesDto } from '../dto/query-recipes.dto';

@Controller('data/recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Get()
  async getRecipes(@Query() query: QueryRecipesDto) {
    return this.recipesService.findAll(query);
  }

  @Get(':id')
  async getRecipe(@Param('id') id: string) {
    return this.recipesService.findOne(id);
  }

  @Post()
  @UseInterceptors(FileInterceptor('thumbnail'))
  async createRecipe(
    @Body() createRecipeDto: CreateRecipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      createRecipeDto['thumbnail'] = `/uploads/${file.filename}`;
    }
    return this.recipesService.create(createRecipeDto);
  }

  @Put(':id')
  @UseInterceptors(FileInterceptor('thumbnail'))
  async updateRecipe(
    @Param('id') id: string,
    @Body() updateRecipeDto: UpdateRecipeDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      updateRecipeDto['thumbnail'] = `/uploads/${file.filename}`;
    }
    return this.recipesService.update(id, updateRecipeDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteRecipe(@Param('id') id: string) {
    return this.recipesService.delete(id);
  }
}
