import { Request, Response } from 'express';
import { Comment, Recipe } from './recipe.model';

export const createRecipe = async (req: Request, res: Response): Promise<void> => {
    try {
      const recipe = new Recipe(req.body);
      await recipe.save();
      res.status(201).json(recipe); // Send the response but don't return
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(400).json({ error: errorMessage });
    }
  };

// Get all recipes
export const getRecipes = async (req: Request, res: Response) => {
  try {
    const recipes = await Recipe.find()
      .populate({
        path: 'authorId',
        model: 'User', // Use the model name as a string
        select: 'name email bio displayPicture', // Fields to include from the User model
      })
      .populate('comments');
    res.status(200).json(recipes);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

// Get a single recipe by ID
export const getRecipeById = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById(id)
      .populate({
        path: 'authorId',
        model: 'User',
        select: 'name email bio displayPicture',
      })
      .populate('comments');
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json(recipe);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

// Update a recipe
export const updateRecipe = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate({
        path: 'authorId',
        model: 'User',
        select: 'name email bio displayPicture',
      })
      .populate('comments');
    if (!updatedRecipe) {
      res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json(updatedRecipe);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(400).json({ error: errorMessage });
  }
};

// Delete a recipe
export const deleteRecipe = async (req: Request, res: Response): Promise<void>  => {
  try {
    const { id } = req.params;
    const deletedRecipe = await Recipe.findByIdAndDelete(id);
    if (!deletedRecipe) {
     res.status(404).json({ error: 'Recipe not found' });
    }
    res.status(200).json({ message: 'Recipe deleted successfully' });
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

// Post a comment on a recipe
export const postComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipeId } = req.params;
      const { authorId, content } = req.body;
  
      // Validate request body
      if (!authorId || !content) {
        res.status(400).json({ error: 'Author ID and content are required' });
        return;
      }
  
      // Check if the recipe exists
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }
  
      // Create a new comment
      const comment = new Comment({ authorId, content });
      await comment.save();
  
      // Add the comment to the recipe's comment array
      recipe.comments.push(comment.id);
      await recipe.save();
  
      // Populate author info for response
      const populatedComment = await comment.populate({
        path: 'authorId',
        model: 'User',
        select: 'name email bio displayPicture',
      });
  
      // Send back the created comment with author details
      res.status(201).json(populatedComment);
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: errorMessage });
    }
  };
  

// Get all comments for a recipe
export const getComments = async (req: Request, res: Response): Promise<void> => {
    try {
      const { recipeId } = req.params;
      const recipe = await Recipe.findById(recipeId).populate({
        path: 'comments',
        populate: {
          path: 'authorId',
          model: 'User',
          select: 'name email bio displayPicture',
        },
      });
  
      if (!recipe) {
        res.status(404).json({ error: 'Recipe not found' });
        return;
      }
  
      res.status(200).json(recipe.comments);
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: errorMessage });
    }
  };
  
  // Update a comment
  export const updateComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
      const updatedComment = await Comment.findByIdAndUpdate(id, req.body, {
        new: true, // return the updated document
      }).populate({
        path: 'authorId',
        model: 'User',
        select: 'name email bio displayPicture',
      });
  
      if (!updatedComment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
  
      res.status(200).json(updatedComment);
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(400).json({ error: errorMessage });
    }
  };
  
  // Delete a comment
  export const deleteComment = async (req: Request, res: Response): Promise<void> => {
    try {
      const { id } = req.params;
  
      const deletedComment = await Comment.findByIdAndDelete(id);
      if (!deletedComment) {
        res.status(404).json({ error: 'Comment not found' });
        return;
      }
  
      // Remove the reference to the comment in the related recipe
      await Recipe.updateMany({ comments: id }, { $pull: { comments: id } });
  
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      const errorMessage = (error as Error).message;
      res.status(500).json({ error: errorMessage });
    }
  };
  