import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';
import { Request, Response } from 'express';
import { User } from './user.model';

const userRegister = catchAsync(async (req, res) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Created Successfully',
    data: user,
  });
});

// Report a user and increment the report count
export const reportUser = catchAsync(async (req: Request, res: Response): Promise<void> => {
  const { userId } = req.params; // Extract userId from params

  const user = await UserServices.getSingleUserFromDB(userId);

  if (!user) {
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.NOT_FOUND,
      message: 'User not found',
      data: null, // Include 'data' field
    });
  }

  try {
    await User.findByIdAndUpdate(
      userId,
      { $inc: { report: 1 } }, // Increment report by 1
      { new: true }
    );
  } catch (error) {
    console.log(error);
    return sendResponse(res, {
      success: false,
      statusCode: httpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error updating user report count',
      data: null, // Include 'data' field
    });
  }

  // Respond with the updated user data
  return sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User report count updated successfully',
    data: user, // Include the user data
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const users = await UserServices.getAllUsersFromDB(req.query);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Users Retrieved Successfully',
    data: users,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const user = await UserServices.getSingleUserFromDB(req.params.id);

  if (!user) {
    throw new Error('User not found');
  }

  // Check if the user's premium status has expired
  if (user.isPremium && user.premiumExpiryDate && user.premiumExpiryDate <= new Date()) {
    // Prepare the update payload for premium status
    const updatePayload = {
      isPremium: false,
      premiumExpiryDate: undefined, // Clear the expiry date
    };

    // Use the updateUser function to update the premium status
    await UserServices.updateUser(user._id, updatePayload);

  }

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Retrieved Successfully',
    data: user,
  });
});

const updateUser = catchAsync(async (req, res) => {
  console.log("Req => ", req.params);
  const userId = req.params.id;
  const updatedUser = await UserServices.updateUser(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Updated Successfully',
    data: updatedUser,
  });
});

const followUser = catchAsync(async (req, res) => {
  const { userId, targetUserId } = req.params;

  // Call the followUser service with the extracted parameters
  const { user, targetUser } = await UserServices.followUser(userId, targetUserId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Follow/Unfollow Successfully',
    data: { user, targetUser },
  });
});

const getUnfollowedUsers = catchAsync(async (req, res) => {
  const userId = req.params.id;
  const unfollowedUsers = await UserServices.getUnfollowedUsersForUser(userId);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'Unfollowed Users Retrieved Successfully',
    data: unfollowedUsers,
  });
});

export const UserControllers = {
  getSingleUser,
  userRegister,
  getAllUsers,
  updateUser,
  followUser,
  getUnfollowedUsers,
  reportUser
};
