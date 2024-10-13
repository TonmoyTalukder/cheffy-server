import express from 'express';
import { AuthRoutes } from '../modules/Auth/auth.route';
import { UserRoutes } from '../modules/User/user.route';
import { ImageUploadRoutes } from '../modules/ImageUpload/imageUpload.routes';
import { RecipeRoutes } from '../modules/Recipe/recipe.router';


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
  }
];


moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;