import mongoose, { Schema, Model } from 'mongoose';
import { IComment, IRecipe } from './recipe.interface';

const IngredientSchema = new Schema({
  name: { type: String, required: true },
  amount: { type: String, required: true },
  type: { type: String, required: false },
});

const InstructionStepSchema = new Schema({
  details: { type: String, required: true },
  time: { type: Number, required: true },
});

const RecipeSchema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    ingredients: [IngredientSchema],
    instructions: [InstructionStepSchema],
    image: { type: String, required: true },
    cookingTime: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    ratingsCount: { type: Number, default: 0 },
    tags: [{ type: String }],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 },
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    premium: { type: Boolean, default: false },
    comments: [{ type: Schema.Types.ObjectId, ref: 'Comment' }],
  },
  { timestamps: true }
);

// Comment Schema
const CommentSchema = new Schema(
  {
    authorId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
  },
  { timestamps: true }
);

export const Recipe: Model<IRecipe> = mongoose.model<IRecipe>('Recipe', RecipeSchema);
export const Comment: Model<IComment> = mongoose.model<IComment>('Comment', CommentSchema);
