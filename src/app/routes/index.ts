import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ImageUploadRoutes } from '../modules/ImageUpload/imageUpload.routes';
import { RecipeRoutes } from '../modules/Recipe/recipe.router';
import paymentRouter from '../modules/aamarpay/payment.route';


const router = express.Router();

const moduleRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: "/image-upload",
    route: ImageUploadRoutes
  },
  {
    path: "/recipes",
    route: RecipeRoutes
  },
  {
    path: "/payment",
    route: paymentRouter
  },
];


moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;