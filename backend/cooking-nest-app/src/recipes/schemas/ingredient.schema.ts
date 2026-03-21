import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema({ _id: false })
export class Ingredient {
  @Prop({ required: true, maxlength: 200 })
  name: string;

  @Prop()
  quantity: number;

  @Prop({ maxlength: 50 })
  unit: string;
}

export const IngredientSchema = SchemaFactory.createForClass(Ingredient);
