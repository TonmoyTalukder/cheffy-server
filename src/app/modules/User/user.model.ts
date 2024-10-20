/* eslint-disable no-useless-escape */
import bcrypt from 'bcryptjs';
import { Schema, model } from 'mongoose';
import config from '../../config';
import { USER_ROLE, USER_STATUS } from './user.constant';
import { IUserModel, TUser } from './user.interface';

const userSchema = new Schema<TUser, IUserModel>(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: Object.keys(USER_ROLE),
      required: true,
    },
    email: {
      type: String,
      required: true,
      //validate email
      match: [
        /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/,
        'Please fill a valid email address',
      ],
    },
    password: {
      type: String,
      required: true,
      select: 0,
    },
    status: {
      type: String,
      enum: Object.keys(USER_STATUS),
      default: USER_STATUS.ACTIVE,
    },
    passwordChangedAt: {
      type: Date,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      match: [
        /^\+?[1-9]\d{1,14}$/,
        'Please enter a valid phone number',
      ], // Example for E.164 format phone number
    },
    city: {
      type: String,
      required: [true, 'City is required'],
    },
    bio: {
      type: String,
      required: [true, 'Bio is required'],
    },
    foodHabit: {
      type: String,
      required: [true, 'Food habit is required'],
    },
    sex: {
      type: String,
      required: [true, 'Sex is required'],
    },
    followers: {
      type: [{ type: Schema.Types.Mixed }],
      default: [], // Default to an empty array
    },
    following: {
      type: [{ type: Schema.Types.Mixed }],
      default: [], // Default to an empty array
    },
    displayPicture: {
      type: String, // Store file path or URL as a string
      required: [false, 'Display picture is required'],
    },
    coverPicture: {
      type: String, // Store file path or URL as a string
      required: [false, 'Display picture is required'],
    },
    topics: {
      type: [{ type: String }],
      required: [false, 'At least one topic is required'],
    },
    isPremium: { type: Boolean, default: false },
    premiumExpiryDate: {
      type: Date, // Date when premium status should expire
    },
  },
  {
    timestamps: true,
    virtuals: true,
  }
);

userSchema.pre('save', async function (next) {
  // eslint-disable-next-line @typescript-eslint/no-this-alias
  const user = this; // doc
  // hashing password and save into DB

  const hashedPassword = await bcrypt.hash(user.password, Number(config.bcrypt_salt_rounds));
  console.log("Hashed password before save:", hashedPassword);
  user.password = hashedPassword;
  next();
});

// set '' after saving password
userSchema.post('save', function (doc, next) {
  doc.password = '';
  next();
});

userSchema.statics.isUserExistsByEmail = async function (email: string) {
  return await User.findOne({ email }).select('+password');
};

userSchema.statics.activatePremium = async function (userId: string) {
  const premiumDuration = 30; // days
  const currentUser = await this.findById(userId);

  if (!currentUser) {
    throw new Error('User not found');
  }

  currentUser.isPremium = true;
  currentUser.premiumExpiryDate = new Date(Date.now() + premiumDuration * 24 * 60 * 60 * 1000); // Set expiration date
  await currentUser.save();
};


userSchema.statics.isPasswordMatched = async function (
  plainTextPassword,
  hashedPassword
) {
  console.log("Plain text password:", plainTextPassword);
  console.log("Hashed password for comparison:", hashedPassword);
  return await bcrypt.compare(plainTextPassword, hashedPassword);
};

userSchema.statics.isJWTIssuedBeforePasswordChanged = function (
  passwordChangedTimestamp: number,
  jwtIssuedTimestamp: number
) {
  const passwordChangedTime =
    new Date(passwordChangedTimestamp).getTime() / 1000;
  return passwordChangedTime > jwtIssuedTimestamp;
};

export const User = model<TUser, IUserModel>('User', userSchema);
