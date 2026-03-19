import {
  IsString,
  IsNotEmpty,
  MaxLength,
  IsEnum,
  IsOptional,
  IsInt,
  Min,
  IsArray,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';

export class CreateRecipeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(Category)
  categoryCode: string;

  @IsEnum(Difficulty)
  difficultyCode: string;

  @IsEnum(Cost)
  costCode: string;

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

  @Transform(({ value }) => (typeof value === 'string' ? [value] : value))
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  steps?: string[];
}
