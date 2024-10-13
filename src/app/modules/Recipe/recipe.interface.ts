export interface IRecipe {
  id: string; // Unique identifier for the recipe
  title: string; // Recipe title
  description: string; // Brief description of the recipe
  ingredients: Ingredient[]; // List of ingredients for the recipe
  instructions: InstructionStep[]; // Array of detailed cooking steps
  image: string; // URL of the image of the recipe
  cookingTime: number; // Estimated cooking time in minutes
  rating: number; // Average rating of the recipe (1-5)
  ratingsCount: number; // Count of ratings given
  tags: string[]; // Tags related to the recipe (e.g., "vegetarian", "gluten-free")
  upvotes: number; // Number of upvotes received
  downvotes: number; // Number of downvotes received
  createdAt: Date; // Timestamp of recipe creation
  updatedAt: Date; // Timestamp of last update
  authorId: string; // ID of the user who created the recipe
  premium: boolean; // Flag indicating if the recipe is for premium users only
  comments: IComment[]; // List of comments on the recipe
}

export interface Ingredient {
  name: string; // Name of the ingredient
  amount: string; // Amount/measurement of the ingredient (e.g., "1 cup", "200g")
  type?: string; // Optional field to categorize ingredients (e.g., "spice", "vegetable")
}

export interface InstructionStep {
  details: string; // Details of the cooking step
  time: number; // Estimated time for this step in minutes
}

export interface IComment {
  id: string; // Unique identifier for the comment
  authorId: string; // ID of the user who made the comment
  content: string; // Content of the comment
  createdAt: Date; // Timestamp of when the comment was made
  updatedAt?: Date; // Optional timestamp of the last comment update
}
