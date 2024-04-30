import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type RecipeDocument = Recipe & Document;

@Schema({ collection: 'recipes' })
export class Recipe {
  @Prop()
  name: string;
}

export const RecipeSchema = SchemaFactory.createForClass(Recipe);
