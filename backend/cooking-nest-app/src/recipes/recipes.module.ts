import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import { extname, join } from 'path';
import { RecipesController } from './controller/recipes.controller';
import { Recipe, RecipeSchema } from './schemas/recipe.schema';
import { RecipesService } from './services/recipes.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Recipe.name, schema: RecipeSchema }]),
    MulterModule.register({
      storage: diskStorage({
        destination: join(process.cwd(), 'uploads'),
        filename: (_req, file, cb) => {
          const ext = extname(file.originalname);
          cb(null, `${uuidv4()}${ext}`);
        },
      }),
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 Mo
      fileFilter: (_req, file, cb) => {
        if (/\/(jpeg|jpg|png|webp)$/i.test(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('Only JPEG, PNG, and WebP files are allowed'), false);
        }
      },
    }),
  ],
  controllers: [RecipesController],
  providers: [RecipesService],
})
export class RecipesModule {}
