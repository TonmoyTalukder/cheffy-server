/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt, { JwtPayload } from 'jsonwebtoken';
import AppError from '../errors/AppError';
import { USER_ROLE, USER_STATUS } from '../modules/User/user.constant';
import { TFollowUser } from '../modules/Auth/auth.interface';

export const createToken = (
  jwtPayload: {
    _id?: string;
    name: string;
  displayPicture?: string;
  email: string;
  phone: string;      
  role: keyof typeof USER_ROLE;
  status: keyof typeof USER_STATUS;
  bio?: string;     
  city?: string;     
  coverPicture?: string;
  followers?: Array<TFollowUser>; 
  following?: Array<TFollowUser>; 
  foodHabit?: string;   
  sex?: string;
  topics?: Array<string>;  
  },
  secret: string,
  expiresIn: string
) => {
  return jwt.sign(jwtPayload, secret, {
    expiresIn,
  });
};

export const verifyToken = (
  token: string,
  secret: string
): JwtPayload | Error => {
  try {
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error: any) {
    throw new AppError(401, 'You are not authorized!');
  }
};
