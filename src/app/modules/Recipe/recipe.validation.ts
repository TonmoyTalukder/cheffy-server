import { z } from 'zod';
import { Request, Response, NextFunction } from 'express';

// Define the schema for a recipe
export const recipeSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  ingredients: z.array(z.object({
    name: z.string().min(1, 'Ingredient name is required'),
    amount: z.string().min(1, 'Ingredient amount is required'),
    type: z.string().optional(),
  })).min(1, 'At least one ingredient is required'),
  instructions: z.array(z.object({
    details: z.string().min(1, 'Step details are required'),
    time: z.number().positive('Time must be greater than zero'),
  })).min(1, 'At least one instruction step is required'),
  image: z.string().min(1, 'Image URL is required'),
  cookingTime: z.number().positive('Cooking time must be greater than zero'),
  rating: z.number().min(0).max(5).optional(),
  tags: z.array(z.string()).optional(),
  authorId: z.string().min(1, 'Author ID is required'),
  premium: z.boolean().optional(),
});

// Middleware for validating the recipe payload before saving or updating a recipe
export const validateRecipe = (req: Request, res: Response, next: NextFunction): void => {
    try {
      recipeSchema.parse(req.body);
      next(); // Call the next middleware
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors }); // Respond, but no return
        return; // Ensure next() is not called after a response
      }
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };
  
  // Middleware for validating the recipe payload for updates
  export const validateUpdateRecipe = (req: Request, res: Response, next: NextFunction): void => {
    try {
      recipeSchema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ error: error.errors });
        return;
      }
      res.status(500).json({ error: 'Internal server error' });
      return;
    }
  };