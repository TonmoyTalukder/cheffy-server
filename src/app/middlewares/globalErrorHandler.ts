import { ErrorRequestHandler } from 'express';
import { ZodError } from 'zod';
import config from '../config';
import AppError from '../errors/AppError';
import handleCastError from '../errors/handleCastError';
import handleValidationError from '../errors/handleValidationError';
import handleZodError from '../errors/handleZodError';
import handleDuplicateError from '../errors/handlerDuplicateError';
import { TErrorSources } from '../interfaces/error.interface';
import { TImageFiles } from '../interfaces/image.interface';
import { deleteImageFromCloudinary } from '../utils/deleteImage';

const globalErrorHandler: ErrorRequestHandler = async (err, req, res, next) => {
  try {
    // setting default values
    let statusCode = 500;
    let message = 'Something went wrong!';
    let errorSources: TErrorSources = [
      {
        path: '',
        message: 'Something went wrong',
      },
    ];

    if (req.files && Object.keys(req.files).length > 0) {
      await deleteImageFromCloudinary(req.files as TImageFiles);
    }

    if (err instanceof ZodError) {
      const simplifiedError = handleZodError(err);
      statusCode = simplifiedError?.statusCode;
      message = simplifiedError?.message;
      errorSources = simplifiedError?.errorSources;
    } else if (err?.name === 'ValidationError') {
      const simplifiedError = handleValidationError(err);
      statusCode = simplifiedError?.statusCode;
      message = simplifiedError?.message;
      errorSources = simplifiedError?.errorSources;
    } else if (err?.name === 'CastError') {
      const simplifiedError = handleCastError(err);
      statusCode = simplifiedError?.statusCode;
      message = simplifiedError?.message;
      errorSources = simplifiedError?.errorSources;
    } else if (err?.code === 11000) {
      const simplifiedError = handleDuplicateError(err);
      statusCode = simplifiedError?.statusCode;
      message = simplifiedError?.message;
      errorSources = simplifiedError?.errorSources;
    } else if (err instanceof AppError) {
      statusCode = err?.statusCode;
      message = err.message;
      errorSources = [
        {
          path: '',
          message: err?.message,
        },
      ];
    } else if (err instanceof Error) {
      message = err.message;
      errorSources = [
        {
          path: '',
          message: err?.message,
        },
      ];
    }

    // ultimate return
    res.status(statusCode).json({
      success: false,
      message,
      errorSources,
      err,
      stack: config.NODE_ENV === 'development' ? err?.stack : null,
    });

    next();
  } catch (error) {
    next(error);
  }
};

export default globalErrorHandler;
