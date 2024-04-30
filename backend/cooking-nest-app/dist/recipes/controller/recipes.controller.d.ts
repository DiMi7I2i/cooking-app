import { RecipesService } from '../services/recipes.service';
import { RecipeDto } from '../dto/recipe.dto';
export declare class RecipesController {
    private readonly recipesService;
    constructor(recipesService: RecipesService);
    getRecipes(): Promise<RecipeDto[]>;
}
