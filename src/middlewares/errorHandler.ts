import { ErrorRequestHandler, Response } from 'express';
import { AppError, JoiError, JwtError } from '../utils/app.error';

const isJoiError = (error: any): error is JoiError => {
  return error instanceof JoiError;
};

const appErrorHandler = (res: Response, error: AppError) => {
  console.log('from Error handler:', error.message);
  return res.status(error.statusCode).json({
    message: error.message,
    success: false,
    status: error.statusCode,
  });
};

const jwtErrorHandler = (res: Response, error: JwtError) => {
  const statusCode = error.statusCode || 401;

  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: error.message,
    name: error.name,
  });
};

const joiErrorHandler = (res: Response, error: JoiError) => {
  const statusCode = error.statusCode || 400;
  return res.status(statusCode).json({
    success: false,
    status: statusCode,
    message: error.message,
    type: error.type,
  });
};

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  if (error instanceof AppError) {
    return appErrorHandler(res, error);
  } else if (error instanceof JwtError) {
    return jwtErrorHandler(res, error);
  } else if (isJoiError(error)) {
    return joiErrorHandler(res, error);
  }

  return res.status(500).json({
    success: false,
    status: 500,
    errMsg: 'Internal Server Error....',
    error: error,
    message: error.message || 'Something went wrong',
  });
};
