import { NextFunction, Request, Response } from 'express';
import { QueryBuilder } from '../../builder/QueryBuilder';
import { UserSearchableFields } from './user.constant';
import { TUser } from './user.interface';
import { User } from './user.model';
import { FilterQuery } from 'mongoose';
import { initiateAamarPayment } from '../aamarpay/payment.utils';

const createUser = async (payload: TUser) => {
  const user = await User.create(payload);

  return user;
};

const getAllUsersFromDB = async (query: Record<string, unknown>) => {
  const users = new QueryBuilder(User.find(), query).search(UserSearchableFields);

  const result = await users.modelQuery;

  return result;
};

const getSingleUserFromDB = async (id: string) => {
  const user = await User.findById(id);

  return user;
};

const updateUser = async (userId: string, payload: Partial<TUser>) => {
  // Fetch the existing user
  const existingUser = await User.findById(userId);

  if (!existingUser) {
    throw new Error('User not found');
  }

  console.log("Payload => ", payload);

  // Merge existing user data with the payload
  const updatedData = {
    ...existingUser.toObject(),
    ...payload, // Overwrite existing fields with new data
  };

  // Update the user with the merged data
  const updatedUser = await User.findByIdAndUpdate(userId, updatedData, {
    new: true, // Return the updated document
    runValidators: true, // Ensure the updated fields are validated
  });

  return updatedUser;
};

const activatePremium = async (userId: string) => {
  // Fetch the existing user
  const user = await User.findById(userId);

  if (!user) {
    throw new Error('User not found');
  }

  // Prepare the update payload for activating premium
  const updatePayload = {
    isPremium: true,
    premiumExpiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Set expiry date to 30 days from now
  };

  // Use the updateUser function to update the user
  const updatedUser = await UserServices.updateUser(userId, updatePayload);

  return updatedUser;
};



const followUser = async (userId: string, targetUserId: string) => {
  const user = await User.findById(userId);
  const targetUser = await User.findById(targetUserId);

  // Check if both users exist
  if (!user || !targetUser) {
    throw new Error('User not found');
  }

  if (!targetUser.name || !targetUser.email || !targetUser.displayPicture) {
    throw new Error('Target user information is incomplete');
  }

  if (!user.name || !user.email || !user.displayPicture) {
    throw new Error('User information is incomplete');
  }

  // Initialize following and followers arrays if they are undefined
  user.following = user.following ?? [];
  targetUser.followers = targetUser.followers ?? [];

  // Check if the user is already following the target user
  const isFollowing = user.following.some(follow => follow.id === targetUserId);


  if (isFollowing) {
    user.following = user.following.filter(follow => follow.id !== targetUserId);
    targetUser.followers = targetUser.followers.filter(follower => follower.id !== userId);
  } else {
    user.following.push({
      id: targetUserId,
      name: targetUser.name,
      email: targetUser.email,
      profilePicture: targetUser.displayPicture
    });
    targetUser.followers.push({
      id: userId,
      name: user.name,
      email: user.email,
      profilePicture: user.displayPicture
    });
  }

  // Save both users
  await User.updateOne({ _id: userId }, { following: user.following });
  await User.updateOne({ _id: targetUserId }, { followers: targetUser.followers });


  return { user, targetUser };
};

const getUnfollowedUsersForUser = async (userId: string): Promise<TUser[]> => {
  const currentUser = await User.findById(userId);

  if (!currentUser) {
    throw new Error('User not found');
  }

  // Get the list of users the current user is already following
  const followingIds = currentUser.following?.map(follow => follow.id) || [];

  // Build the query to get users that are not followed by the current user
  const query: FilterQuery<TUser> = {
    $and: [
      { _id: { $ne: userId } },  // Exclude the current user
      { _id: { $nin: followingIds } },  // Exclude users the current user is already following
      { status: { $ne: "BLOCKED" } },  // Exclude blocked users
      { role: { $ne: "ADMIN" } }  // Exclude admins
    ]
  };

  const users = await User.find(query).lean();

  // Prioritize users based on location, topics, and food habit
  const prioritizedUsers = users.map(user => {
    let score = 0;

    // Location match: +3 points
    if (currentUser.city && user.city === currentUser.city) {
      score += 3;
    }

    // Food habit match: +2 points
    if (currentUser.foodHabit && user.foodHabit === currentUser.foodHabit) {
      score += 2;
    }

    // Topics match: +1 point per matching topic (up to a maximum of 3 points)
    if (currentUser.topics && user.topics) {
      const matchingTopics = currentUser.topics.filter(topic => user.topics!.includes(topic));
      score += Math.min(matchingTopics.length, 3);
    }

    return { ...user, score };
  });

  // Sort by score (descending), then randomize the result within each score group
  prioritizedUsers.sort((a, b) => b.score - a.score);

  // Pick 10 random users from the top priority users
  const randomUsers = prioritizedUsers
    .sort(() => 0.5 - Math.random())  // Shuffle the list
    .slice(0, 10);  // Get only 10 users

  return randomUsers;
};

// Function to initiate a payment for premium membership
export const initiatePayment = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {  // Change to Promise<void>
  try {
    const { userId } = req.params; // Extract userId from the request params

    // Find the user
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        statusCode: 404,
        message: 'User not found',
      });
      return; // Make sure to return void here
    }

    const transactionId = `TRX_CHEFFY_${Date.now()}`;
    const payableAmount = 400;

    // Create payment data
    const paymentData = {
      transactionId: transactionId,
      amount: payableAmount,
      customerName: user.name,
      customerEmail: user.email,
      customerPhone: user.phone,
      customerAddress: user.city,
    };

    console.log(paymentData);

    // Initiate the payment
    const paymentSession = await initiateAamarPayment(paymentData);

    // Call activatePremium here after successful payment initiation
    await UserServices.activatePremium(userId);  // Ensure UserServices is imported

    // Send the response only after the premium is activated
    res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Payment initiated and premium activated successfully',
      paymentSession: paymentSession,
    });
  } catch (error) {
    next(error); // Pass any error to the global error handler
  }
};

export const UserServices = {
  createUser,
  getAllUsersFromDB,
  getSingleUserFromDB,
  updateUser,
  followUser,
  getUnfollowedUsersForUser,
  activatePremium,
  // initiatePayment,
};
