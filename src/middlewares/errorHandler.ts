import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  return res.status(500).json({
    errMsg: 'Internal Server Error....',
    error: error,
    errorMessage: error.message,
  });
};
