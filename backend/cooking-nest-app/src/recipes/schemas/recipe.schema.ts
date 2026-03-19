import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';

export type RecipeDocument = Recipe & Document;

@Schema({ collection: 'recipes', timestamps: true })
export class Recipe {
  @Prop({ required: true, maxlength: 200 })
  title: string;

  @Prop()
  description: string;

  @Prop()
  thumbnail: string;

  @Prop({ required: true, enum: Category })
  categoryCode: string;

  @Prop({ required: true, enum: Difficulty })
  difficultyCode: string;

  @Prop({ required: true, enum: Cost })
  costCode: string;

  @Prop()
  preparationDuration: number;

  @Prop()
  cookDuration: number;

  @Prop()
  breakDuration: number;

  @Prop({ type: [String] })
  steps: string[];
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
