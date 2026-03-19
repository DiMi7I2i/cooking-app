import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from '../schemas/recipe.schema';
import { QueryRecipesDto } from '../dto/query-recipes.dto';
import { PaginatedResponseDto } from '../dto/paginated-response.dto';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipesModel: Model<RecipeDocument>,
  ) {}

  async findAll(query: QueryRecipesDto): Promise<PaginatedResponseDto<Recipe>> {
    const filter: any = {};

    if (query.title) {
      filter.title = new RegExp(query.title, 'i');
    }

    if (query.categoryCode) {
      filter.categoryCode = query.categoryCode;
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
}
