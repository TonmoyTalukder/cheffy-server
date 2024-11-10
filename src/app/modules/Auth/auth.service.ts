import bcrypt from 'bcryptjs';
import httpStatus from 'http-status';
import jwt, { JwtPayload } from 'jsonwebtoken';
import config from '../../config';
import AppError from '../../errors/AppError';
import { createToken } from '../../utils/verifyJWT';
import { USER_ROLE, USER_STATUS } from '../User/user.constant';
import { User } from '../User/user.model';
import { TLoginUser, TRegisterUser } from './auth.interface';
import { UserServices } from '../User/user.service';
import { sendEmail } from '../../utils/emailSender';
// import { cloudinaryUpload } from '../../config/cloudinary.config';
// import { Express } from 'express';

const JWT_SECRET = process.env.JWT_ACCESS_SECRET || 'your_jwt_secret';

const registerUser = async (payload: TRegisterUser) => {
  // Check if the user already exists
  const userExists = await User.isUserExistsByEmail(payload.email);
  if (userExists) {
    throw new AppError(httpStatus.CONFLICT, 'This user already exists!');
  }

  // Set user role
  payload.role = USER_ROLE.USER;

  // Set user status
  payload.status = USER_STATUS.ACTIVE;
    
  payload.isPremium = false;

  payload.followers = [];
  payload.following = [];

  // Hash the password before saving
  // const hashedPassword = await bcrypt.hash(payload.password, Number(config.bcrypt_salt_rounds));

  // // If displayPicture was uploaded, use the URL
  // let displayPictureUrl: string | undefined = undefined;

  // // Check if a file was uploaded
  // if (file) {
  //   // Upload to Cloudinary
  //   const uploadResult = await cloudinaryUpload.uploader.upload(file.path);
  //   displayPictureUrl = uploadResult.secure_url; // Get the secure URL
  // }

  // Set default values for other optional fields
  payload.displayPicture = payload.displayPicture ?? 'N/A';
  payload.city = payload.city ?? 'N/A';
  payload.bio = payload.bio ?? 'N/A';
  payload.foodHabit = payload.foodHabit ?? 'N/A';
  payload.sex = payload.sex ?? 'N/A';
  payload.topics = payload.topics ?? [];

  // Create new user with displayPicture URL included
  const newUser = await User.create({
    ...payload,
    password: payload.password,
    displayPicture: payload.displayPicture, // Store the URL of the uploaded picture
  });

  console.log("New User => ", newUser)

  // Create JWT payload
  const jwtPayload = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    phone: newUser.phone,
    role: newUser.role,
    status: newUser.status,
    city: newUser.city,
    bio: newUser.bio,
    foodHabit: newUser.foodHabit,
    sex: newUser.sex,
    followers: newUser.followers,
    following: newUser.following,
    displayPicture: newUser.displayPicture,
    topics: newUser.topics,
    isPremium: newUser.isPremium
  };

  // Generate access and refresh tokens
  const accessToken = createToken(jwtPayload, config.jwt_access_secret as string, config.jwt_access_expires_in as string);
  const refreshToken = createToken(jwtPayload, config.jwt_refresh_secret as string, config.jwt_refresh_expires_in as string);

  return { accessToken, refreshToken };
};


const loginUser = async (payload: TLoginUser) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload?.email);

  console.log("Fetched user: ", user);

  console.log("Stored hashed password: ", user.password);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  // Check if the user's premium status has expired
  if (user.isPremium && user.premiumExpiryDate && user.premiumExpiryDate <= new Date()) {
    // Prepare the update payload for premium status
    const updatePayload = {
      isPremium: false,
      premiumExpiryDate: undefined, // Clear the expiry date
    };

    // Use the updateUser function to update the premium status
    await UserServices.updateUser(user._id!, updatePayload);

  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload?.password, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //create token and sent to the  client

  const jwtPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    city: user.city,
    bio: user.bio,
    foodHabit: user.foodHabit,
    sex: user.sex,
    followers: user.followers,
    following: user.following,
    displayPicture: user.displayPicture,
    topics: user.topics,
    isPremium: user.isPremium
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  const refreshToken = createToken(
    jwtPayload,
    config.jwt_refresh_secret as string,
    config.jwt_refresh_expires_in as string
  );

  return {
    accessToken,
    refreshToken,
  };
};

const changePassword = async (
  // userData: JwtPayload,
  payload: { oldPassword: string; newPassword: string, email: string }
) => {
  // checking if the user is exist
  const user = await User.isUserExistsByEmail(payload.email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is blocked

  const userStatus = user?.status;

  if (userStatus === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  //checking if the password is correct

  if (!(await User.isPasswordMatched(payload.oldPassword, user?.password)))
    throw new AppError(httpStatus.FORBIDDEN, 'Password do not matched');

  //hash new password
  const newHashedPassword = await bcrypt.hash(
    payload.newPassword,
    Number(config.bcrypt_salt_rounds)
  );

  await User.findOneAndUpdate(
    {
      email: user.email,
      role: user.role,
    },
    {
      password: newHashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return null;
};


const refreshToken = async (token: string) => {
  // checking if the given token is valid
  const decoded = jwt.verify(
    token,
    config.jwt_refresh_secret as string
  ) as JwtPayload;

  const { email, iat } = decoded;

  // checking if the user is exist
  const user = await User.isUserExistsByEmail(email);

  if (!user) {
    throw new AppError(httpStatus.NOT_FOUND, 'This user is not found!');
  }

  // checking if the user is blocked
  const userStatus = user?.status;

  if (userStatus === 'BLOCKED') {
    throw new AppError(httpStatus.FORBIDDEN, 'This user is blocked!');
  }

  if (
    user.passwordChangedAt &&
    User.isJWTIssuedBeforePasswordChanged(user.passwordChangedAt, iat as number)
  ) {
    throw new AppError(httpStatus.UNAUTHORIZED, 'You are not authorized !');
  }

  const jwtPayload = {
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    status: user.status,
    city: user.city,
    bio: user.bio,
    foodHabit: user.foodHabit,
    sex: user.sex,
    followers: user.followers,
    following: user.following,
    displayPicture: user.displayPicture,
    topics: user.topics,
    isPremium: user.isPremium
  };

  const accessToken = createToken(
    jwtPayload,
    config.jwt_access_secret as string,
    config.jwt_access_expires_in as string
  );

  return {
    accessToken,
  };
};


const forgetPassword = async (email: string) => {
  // Find the user by email
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  // Generate a token for resetting the password
  const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

  // Send password reset email
  const resetLink = `https://cheffy-client.vercel.app/reset-password/${token}`;
  const html = `<p>You requested a password reset. Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 1 hour.</p>`;

  await sendEmail(email, html, 'Password Reset Request');

  return { message: 'Password reset email sent' };
};

const resetPassword = async (token: string, newPassword: string) => {
  // Verify the token
  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
  } catch (err) {
    console.error('Token verification error:', err); // Add logging here
    throw new Error('Invalid or expired token');
  }


  // Find the user by decoded user ID
  const user = await User.findById(decoded.userId);
  if (!user) {
    throw new Error('User not found');
  }

  // Hash the new password and update the user
  const hashedPassword = await bcrypt.hash(
    newPassword,
    Number(config.bcrypt_salt_rounds)
  );
  // user.password = hashedPassword;
  // await user.save();

  await User.findOneAndUpdate(
    {
      email: user.email,
      role: user.role,
    },
    {
      password: hashedPassword,
      passwordChangedAt: new Date(),
    }
  );

  return { message: 'Password has been reset successfully' };
};

export const AuthServices = {
  registerUser,
  loginUser,
  changePassword,
  refreshToken,
  forgetPassword,
  resetPassword
};
