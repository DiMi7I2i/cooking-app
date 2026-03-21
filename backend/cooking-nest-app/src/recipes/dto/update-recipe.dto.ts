import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
  ValidateNested,
  ArrayNotEmpty,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { CreateIngredientDto } from './create-ingredient.dto';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';

export class UpdateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Category)
  @IsOptional()
  categoryCode?: string;

  @IsEnum(Difficulty)
  @IsOptional()
  difficultyCode?: string;

  @IsEnum(Cost)
  @IsOptional()
  costCode?: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  preparationDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  cookDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  breakDuration?: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  servings?: number;

  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  steps?: string[];

  @Transform(({ value }) => {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (Array.isArray(parsed)) {
      return parsed.map((item: any) => Object.assign(new CreateIngredientDto(), item));
    }
    return parsed;
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateIngredientDto)
  @ArrayNotEmpty()
  @IsOptional()
  ingredients?: CreateIngredientDto[];
}
