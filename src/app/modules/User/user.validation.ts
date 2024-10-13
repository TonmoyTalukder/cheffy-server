import { z } from 'zod';
import { USER_ROLE, USER_STATUS } from './user.constant';

const createUserValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    // role: z.nativeEnum(USER_ROLE),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email({
        message: 'Invalid email',
      }),
    password: z.string({
      required_error: 'Password is required',
    }),
    phone: z.string().optional(),
  }),
});

const followUserSchema = z.object({
  id: z.string(),
  name: z.string(),
  email: z.string().email(),
  profilePicture: z.string().optional(),
});

const updateUserValidationSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    role: z.nativeEnum(USER_ROLE).optional(),
    email: z.string().email().optional(),
    password: z.string().optional(),
    status: z.nativeEnum(USER_STATUS).optional(),
    phone: z.string().optional(),
    city: z.string().optional(),
    bio: z.string().optional(),
    foodHabit: z.string().optional(),
    sex: z.string().optional(),
    topics: z.array(z.string()).optional(),
    isPremium: z.boolean().optional(),
    followers: z.array(followUserSchema).optional(), // Followers can be an array of TFollowUser
    following: z.array(followUserSchema).optional(), // Following can be an array of TFollowUser
    displayPicture: z.string().optional(), 
    coverPicture: z.string().optional()
  }),
});

const followUserValidationSchema = z.object({
  params: z.object({
    userId: z.string({
      required_error: 'User ID is required',
    }),
    targetUserId: z.string({
      required_error: 'Target User ID is required',
    }),
  }),
});



export const UserValidation = {
  createUserValidationSchema,
  updateUserValidationSchema,
  followUserValidationSchema
};