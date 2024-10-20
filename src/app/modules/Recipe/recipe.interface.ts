export interface IRecipe {
  id: string; 
  title: string; 
  description: string; 
  ingredients: Ingredient[]; 
  instructions: InstructionStep[];
  image: string; 
  cookingTime: number; 
  ratings: IRating[]; 
  ratingsCount: number; 
  tags: string[]; 
  votes: IVote[]; 
  createdAt: Date; 
  updatedAt: Date; 
  authorId: string; 
  premium: boolean; 
  comments: IComment[]; 
  diet: string;
  deleted: boolean;
}

export interface IRating {
  id: string; 
  rating: number; 
}

export interface IVote {
  id: string; 
  upvote: boolean;
  downvote: boolean;
}

export interface Ingredient {
  name: string; 
  amount: string; 
  type?: string; 
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
