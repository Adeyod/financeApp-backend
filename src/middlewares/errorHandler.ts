import { ErrorRequestHandler, Response } from 'express';
import { AppError, JoiError, JwtError } from '../utils/app.error';

const isJoiError = (error: any): error is JoiError => {
  return error instanceof JoiError;
};

const appErrorHandler = (res: Response, error: AppError) => {
  return res.status(error.statusCode).json({
    message: error.message,
  });
};

const jwtErrorHandler = (res: Response, error: JwtError) => {
  const statusCode = error.statusCode || 401;

  return res.status(statusCode).json({
    message: error.message,
    name: error.name,
  });
};

const joiErrorHandler = (res: Response, error: JoiError) => {
  const statusCode = error.statusCode || 400;
  return res.status(statusCode).json({
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
    errMsg: 'Internal Server Error....',
    error: error,
    errorMessage: error.message,
  });
};
