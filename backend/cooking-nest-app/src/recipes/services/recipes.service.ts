import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Recipe, RecipeDocument } from '../schemas/recipe.schema';

@Injectable()
export class RecipesService {
  constructor(
    @InjectModel(Recipe.name) private recipesModel: Model<RecipeDocument>,
  ) {}

  async findAll(): Promise<Recipe[]> {
    return this.recipesModel.find().sort({ title: -1 }).exec();
  }
}
