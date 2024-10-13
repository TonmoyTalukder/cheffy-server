import { Router } from 'express';
import {
  createRecipe,
  getRecipes,
  getRecipeById,
  updateRecipe,
  deleteRecipe,
  postComment,
  getComments,
  updateComment,
  deleteComment,
} from './recipe.controller';
import { validateRecipe, validateUpdateRecipe } from './recipe.validation';

const router = Router();

// Routes for recipes
router.post('/', validateRecipe, createRecipe); // Create a new recipe
router.get('/', getRecipes); // Get all recipes
router.get('/:id', getRecipeById); // Get a recipe by ID
router.put('/:id', validateUpdateRecipe, updateRecipe); // Update a recipe
router.delete('/:id', deleteRecipe); // Delete a recipe

// Routes for comments
router.post('/:recipeId/comments', postComment); // Post a comment on a recipe
router.get('/:recipeId/comments', getComments); // Get comments for a recipe
router.put('/comments/:id', updateComment); // Update a comment
router.delete('/comments/:id', deleteComment); // Delete a comment

export const RecipeRoutes = router;
