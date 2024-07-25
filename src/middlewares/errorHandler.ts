import { ErrorRequestHandler } from 'express';

export const errorHandler: ErrorRequestHandler = (error, req, res, next) => {
  console.log(error.message);
  return res.status(500).json({
    errMsg: 'Internal Server Error....',
    error: error,
    errorMessage: error.message,
  });
};
