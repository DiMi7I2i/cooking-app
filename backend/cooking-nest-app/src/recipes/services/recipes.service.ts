import { Model } from 'mongoose';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { join } from 'path';
import { existsSync, unlinkSync } from 'fs';
import { Recipe, RecipeDocument } from '../schemas/recipe.schema';
import { QueryRecipesDto } from '../dto/query-recipes.dto';
import { CreateRecipeDto } from '../dto/create-recipe.dto';
import { UpdateRecipeDto } from '../dto/update-recipe.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipesModel: Model<RecipeDocument>,
  ) {}

  async findAll(
    query: QueryRecipesDto,
  ): Promise<PaginatedResponseDto<Recipe>> {
    const filter: any = {};

    if (query.title) {
      filter.title = new RegExp(query.title, 'i');
    }

    if (query.categoryCode) {
      filter.categoryCode = query.categoryCode;
    }

    if (query.difficultyCode) {
      filter.difficultyCode = query.difficultyCode;
    }

    if (query.costCode) {
      filter.costCode = query.costCode;
    }

    if (query.tags) {
      const tagList = query.tags.split(',').map((t) => t.trim());
      filter.tags = { $all: tagList };
    }

    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.recipesModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ title: 1 })
        .exec(),
      this.recipesModel.countDocuments(filter).exec(),
    ]);

    return new PaginatedResponseDto(data, total, page, limit);
  }

  async findOne(id: string): Promise<Recipe> {
    const recipe = await this.recipesModel.findById(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }
    return recipe;
  }

  async create(createRecipeDto: CreateRecipeDto): Promise<Recipe> {
    return this.recipesModel.create(createRecipeDto);
  }

  async update(id: string, updateRecipeDto: UpdateRecipeDto): Promise<Recipe> {
    const existing = await this.recipesModel.findById(id).exec();
    if (!existing) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    // Delete old thumbnail file if a new one is being uploaded
    if (updateRecipeDto['thumbnail'] && existing.thumbnail) {
      this.deleteThumbnailFile(existing.thumbnail);
    }

    const recipe = await this.recipesModel
      .findByIdAndUpdate(id, updateRecipeDto, { new: true })
      .exec();
    return recipe;
  }

  async delete(id: string): Promise<void> {
    const recipe = await this.recipesModel.findByIdAndDelete(id).exec();
    if (!recipe) {
      throw new NotFoundException(`Recipe with id ${id} not found`);
    }

    // Delete thumbnail file from disk
    if (recipe.thumbnail) {
      this.deleteThumbnailFile(recipe.thumbnail);
    }
  }

  private deleteThumbnailFile(thumbnailPath: string): void {
    const filePath = join(process.cwd(), thumbnailPath);
    if (existsSync(filePath)) {
      unlinkSync(filePath);
    }
  }
}
