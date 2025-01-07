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

// // Configure CORS options
// const corsOptions = {
//   origin: ['https://cheffy-client.vercel.app'], // List allowed origins https://cheffy-client.vercel.app http://localhost:3000
//   credentials: true, // Allow credentials (cookies, authorization headers, etc.)
//   methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
//   allowedHeaders: ['Content-Type', 'Authorization'],
// };

// // Apply CORS with options
// app.use(cors(corsOptions));

// // Handle preflight (OPTIONS) requests
// app.options('*', cors());

// app.use(cookieParser());

// //parser
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));


// app.use((req, res, next) => {
//   res.header('Access-Control-Allow-Origin', 'https://cheffy-client.vercel.app'); // List allowed origins https://cheffy-client.vercel.app http://localhost:3000
//   res.header('Access-Control-Allow-Credentials', 'true');
//   res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
//   res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
//   // // For preflight requests, respond with OK status
//   // if (req.method === 'OPTIONS') {
//   //   return res.status(200).end();
//   // }
//   next();
// });

// Configure CORS options
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    const allowedOrigins = [
      'https://cheffy-client.vercel.app',
      'http://localhost:3000',
    ];
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
};

app.use(cors(corsOptions));

app.use((_req: Request, res: Response, next: NextFunction): void => {
  res.header('Access-Control-Allow-Origin', 'https://cheffy-client.vercel.app');
  res.header(
    'Access-Control-Allow-Methods',
    'GET, HEAD, POST, PUT, PATCH, DELETE, OPTIONS',
  );
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Authorization, X-Requested-With, Accept',
  );
  if (_req.method === 'OPTIONS') {
    res.status(200).end(); // Respond OK for preflight
    return; // Explicitly return to end the middleware chain
  }
  next();
});

app.options('*', cors());

// parser
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// api
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
