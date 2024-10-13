import { USER_ROLE, USER_STATUS } from '../User/user.constant';

// A simplified type for users in followers/following arrays
export type TFollowUser = {
  id: string;      // User's unique identifier
  name: string;    // User's name
  email: string;   // User's email
  profilePicture?: string; // Optional profile picture
};

// Type for the login functionality
export type TLoginUser = {
  email: string;
  password: string;
};

// Type for registering a new user with additional fields
export type TRegisterUser = {
  name: string;
  displayPicture?: string;
  email: string;
  phone: string;      
  password: string;
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;
  bio?: string;     
  city?: string;     
  followers?: Array<TFollowUser>; 
  following?: Array<TFollowUser>; 
  foodHabit?: string;   
  sex?: string;
  topics?: Array<string>;    
  isPremium: boolean;    
};
