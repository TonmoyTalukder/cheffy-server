/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';
import { USER_ROLE, USER_STATUS } from './user.constant';
import { TFollowUser } from '../Auth/auth.interface';

export type TUser = {
  save(): unknown;
  _id?: string;
  name: string;
  displayPicture?: string;
  email: string;
  phone: string;
  password: string;
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
  report: number;
  isPremium: boolean;
  premiumExpiryDate?: Date;
  passwordChangedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
};

export interface IUserModel extends Model<TUser> {
  activatePremium(userId: string): Promise<TUser>;
  isUserExistsByEmail(id: string): Promise<TUser>;
  isPasswordMatched(
    plainTextPassword: string,
    hashedPassword: string
  ): Promise<boolean>;
  isJWTIssuedBeforePasswordChanged(
    passwordChangedTimestamp: Date,
    jwtIssuedTimestamp: number
  ): boolean;
}
