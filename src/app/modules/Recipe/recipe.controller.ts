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
    const recipes = await Recipe.find({ deleted: false })
      .populate({
        path: 'authorId',
        model: 'User', // Use the model name as a string
        select: '_id name email isPremium displayPicture', // Fields to include from the User model
      })
      .populate('comments');
    res.status(200).json(recipes);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

// Get a single recipe by ID
export const getRecipeById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const recipe = await Recipe.findById({ _id: id, deleted: false })
      .populate({
        path: 'authorId',
        model: 'User',
        select: '_id name email isPremium displayPicture',
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
export const updateRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const updatedRecipe = await Recipe.findByIdAndUpdate(id, req.body, {
      new: true,
    })
      .populate({
        path: 'authorId',
        model: 'User',
        select: '_id name email isPremium displayPicture',
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

// Update or delete a vote from the array
export const updateVote = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipeId, userId } = req.params;
    const { upvote, downvote } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    // Find the vote for the specific user in the array
    const existingVoteIndex = recipe.votes.findIndex((v) => v.id.toString() === userId);

    if (existingVoteIndex === -1) {
      // If the vote doesn't exist, add it as a new vote
      if (upvote || downvote) {
        recipe.votes.push({ id: userId, upvote, downvote });
      } else {
        res.status(400).json({ error: 'At least one vote type (upvote or downvote) must be true' });
        return;
      }
    } else {
      // If both upvote and downvote are false, remove the vote from the array
      if (!upvote && !downvote) {
        recipe.votes.splice(existingVoteIndex, 1);
      } else {
        // Otherwise, update the user's vote
        recipe.votes[existingVoteIndex].upvote = upvote;
        recipe.votes[existingVoteIndex].downvote = downvote;
      }
    }

    await recipe.save();

    res.status(200).json(recipe);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};


// Update or delete a rating from the array
export const updateRating = async (req: Request, res: Response): Promise<void> => {
  try {
    const { recipeId, userId } = req.params;
    const { rating } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      res.status(404).json({ error: 'Recipe not found' });
      return;
    }

    // Find the rating for the specific user in the array
    const existingRatingIndex = recipe.ratings.findIndex((r) => r.id.toString() === userId);

    if (existingRatingIndex === -1) {
      // If the user hasn't rated yet and rating is not 0, create a new rating
      if (rating > 0) {
        recipe.ratings.push({ id: userId, rating });
      } else {
        res.status(400).json({ error: 'Rating must be greater than 0' });
        return;
      }
    } else {
      // If the rating is 0, remove it from the array
      if (rating === 0) {
        recipe.ratings.splice(existingRatingIndex, 1);
      } else {
        // Otherwise, update the user's rating
        recipe.ratings[existingRatingIndex].rating = rating;
      }
    }

    // Update ratingsCount
    recipe.ratingsCount = recipe.ratings.length;
    await recipe.save();

    res.status(200).json(recipe);
  } catch (error) {
    const errorMessage = (error as Error).message;
    res.status(500).json({ error: errorMessage });
  }
};

// Delete a recipe
export const deleteRecipe = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const deletedRecipe = await Recipe.findByIdAndUpdate(
      id,
      { deleted: true },
      { new: true }
    );
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
      select: '_id name email isPremium displayPicture',
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
        select: '_id name email isPremium displayPicture',
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
      select: '_id name email isPremium displayPicture',
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
