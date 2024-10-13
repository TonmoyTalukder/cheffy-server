import { NextFunction, Request, Response } from 'express';
import { AnyZodObject } from 'zod';
import { catchAsync } from '../utils/catchAsync';

const validateRequest = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedBody = await schema.parseAsync({
      body: req.body,
    });

    req.body = parsedBody.body;

    next();
  });
};

export const validateRequestParams = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    // Pass both body and params for validation
    const parsedData = await schema.parseAsync({
      body: req.body,
      params: req.params, // Add params here
    });

    // Assign the validated params and body back to req
    req.body = parsedData.body;
    req.params = parsedData.params;

    next();
  });
};


export const validateRequestCookies = (schema: AnyZodObject) => {
  return catchAsync(async (req: Request, res: Response, next: NextFunction) => {
    const parsedCookies = await schema.parseAsync({
      cookies: req.cookies,
    });

    req.cookies = parsedCookies.cookies;

    next();
  });
};

export default validateRequest;
