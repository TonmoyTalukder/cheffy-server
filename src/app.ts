/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import cors from 'cors';
import express, { Application, NextFunction, Request, Response } from 'express';
import httpStatus from 'http-status';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import routes from './app/routes';
import cookieParser from 'cookie-parser';
import notFound from './app/middlewares/notFound';

const app: Application = express();

// Configure CORS options
const corsOptions = {
  origin: ['https://cheffy-client.vercel.app'], // List allowed origins https://cheffy-client.vercel.app http://localhost:3000
  credentials: true, // Allow credentials (cookies, authorization headers, etc.)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS with options
app.use(cors(corsOptions));

// Handle preflight (OPTIONS) requests
app.options('*', cors());

app.use(cookieParser());

//parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://cheffy-client.vercel.app'); // List allowed origins https://cheffy-client.vercel.app http://localhost:3000
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // // For preflight requests, respond with OK status
  // if (req.method === 'OPTIONS') {
  //   return res.status(200).end();
  // }
  next();
});

app.use('/api', routes);

//Testing
app.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.status(httpStatus.OK).json({
    success: true,
    message: 'Welcome to the Cheffy API',
  });
});

//global error handler
app.use(globalErrorHandler);

//handle not found
app.use(notFound);

export default app;
