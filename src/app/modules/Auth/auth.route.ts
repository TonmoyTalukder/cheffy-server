import express from 'express';
// import auth from '../../middlewares/auth';
import validateRequest, {
  validateRequestCookies,
} from '../../middlewares/validateRequest';
// import { USER_ROLE } from '../User/user.constant';
import { AuthControllers } from './auth.controller';
import { AuthValidation } from './auth.validation';
// import { multerUpload } from '../../config/multer.config';

const router = express.Router();

router.post(
  '/register',
  validateRequest(AuthValidation.registerValidationSchema),
  // multerUpload.single('displayPicture'),
  AuthControllers.registerUser
);

router.post(
  '/login',
  validateRequest(AuthValidation.loginValidationSchema),
  AuthControllers.loginUser
);

router.post(
  '/change-password',
  // auth(USER_ROLE.USER, USER_ROLE.ADMIN),
  validateRequest(AuthValidation.changePasswordValidationSchema),
  AuthControllers.changePassword
);

router.post(
  '/forget-password',
  validateRequest(AuthValidation.forgetPasswordSchema),
  AuthControllers.forgetPassword
);

router.post(
  '/reset-password/:token',
  validateRequest(AuthValidation.resetPasswordSchema),
  AuthControllers.resetPassword
);

router.post(
  '/refresh-token',
  validateRequestCookies(AuthValidation.refreshTokenValidationSchema),
  AuthControllers.refreshToken
);

export const AuthRoutes = router;
