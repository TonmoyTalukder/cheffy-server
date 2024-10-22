import express from 'express';
import { UserControllers } from './user.controller';
import auth from '../../middlewares/auth';
import { USER_ROLE } from './user.constant';
import validateRequest, { validateRequestParams } from '../../middlewares/validateRequest';
import { UserValidation } from './user.validation';

const router = express.Router();

export const UserRoutes = router;

router.post(
  '/create-user',
  auth(USER_ROLE.ADMIN),
  validateRequest(UserValidation.createUserValidationSchema),
  UserControllers.userRegister
);
router.get('/', UserControllers.getAllUsers);
router.get('/:id', UserControllers.getSingleUser);

router.put('/:id',
  validateRequestParams(UserValidation.updateUserValidationSchema),
  UserControllers.updateUser);

router.put(
  '/:userId/report',
  validateRequestParams(UserValidation.reportUserValidationSchema), // Validate userId
  UserControllers.reportUser
);

// router.post('/:userId/follow/:targetUserId',
//   validateRequest(UserValidation.followUserValidationSchema),
//   UserControllers.followUser);

router.put('/:userId/follow/:targetUserId',
  validateRequestParams(UserValidation.followUserValidationSchema),
  UserControllers.followUser
);

router.get('/users/:id/unfollowed', UserControllers.getUnfollowedUsers);
