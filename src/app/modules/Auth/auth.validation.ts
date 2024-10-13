import { z } from 'zod';

const registerValidationSchema = z.object({
  body: z.object({
    name: z.string({
      required_error: 'Name is required',
    }),
    email: z
      .string({
        required_error: 'Email is required',
      })
      .email('Invalid email address'), // Email validation
    password: z.string({
      required_error: 'Password is required',
    }),
    phone: z
      .string({
        required_error: 'Phone number is required',
      })
      .regex(/^\+?[1-9]\d{1,14}$/, 'Invalid phone number'), // Phone validation (E.164 format)
    city: z.string({
      required_error: 'City is required',
    }),
    bio: z.string({
      required_error: 'Bio is required',
    }),
    foodHabit: z.string({
      required_error: 'Food habit is required',
    }),
    sex: z.enum(['Male', 'Female', 'Other'], {
      required_error: 'Sex is required',
    }),
    followers: z
      .array(z.any())
      .optional(), // Follower array can be empty or optional
    following: z
      .array(z.any())
      .optional(), // Following array can be empty or optional
    topics: z.array(z.string(), {
      required_error: 'At least one topic is required',
    }),
    status: z.enum(['active', 'inactive', 'banned']).optional(), // Optional field, defaults to active
    passwordChangedAt: z.date().optional(), // Optional date field
    displayPicture: z
      .string()
      .url('Invalid URL for display picture')
      .optional(), // Optional display picture
    coverPicture: z
      .string()
      .url('Invalid URL for cover picture')
      .optional(), // Optional cover picture
  }),
});

const loginValidationSchema = z.object({
  body: z.object({
    email: z.string({
      required_error: 'Email is required',
    }),
    password: z.string({ required_error: 'Password is required' }),
  }),
});

const changePasswordValidationSchema = z.object({
  body: z.object({
    oldPassword: z.string({
      required_error: 'Old password is required',
    }),
    newPassword: z.string({ required_error: 'Password is required' }),
  }),
});

const refreshTokenValidationSchema = z.object({
  cookies: z.object({
    refreshToken: z.string({
      required_error: 'Refresh token is required!',
    }),
  }),
});

export const AuthValidation = {
  registerValidationSchema,
  loginValidationSchema,
  changePasswordValidationSchema,
  refreshTokenValidationSchema,
};
