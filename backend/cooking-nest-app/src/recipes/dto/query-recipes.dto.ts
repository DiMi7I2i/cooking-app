import { IsOptional, IsString, IsEnum, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { Category } from '../enums/category.enum';
import { Difficulty } from '../enums/difficulty.enum';
import { Cost } from '../enums/cost.enum';
import { Tag } from '../enums/tag.enum';

export class QueryRecipesDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(Category)
  categoryCode?: string;

  @IsOptional()
  @IsEnum(Difficulty)
  difficultyCode?: string;

  @IsOptional()
  @IsEnum(Cost)
  costCode?: string;

  @IsOptional()
  @IsEnum(Tag)
  tags?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
