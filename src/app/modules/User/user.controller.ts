import httpStatus from 'http-status';
import { catchAsync } from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import { UserServices } from './user.service';

const userRegister = catchAsync(async (req, res) => {
  const user = await UserServices.createUser(req.body);

  sendResponse(res, {
    success: true,
    statusCode: httpStatus.OK,
    message: 'User Created Successfully',
    data: user,
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
  getUnfollowedUsers
};
