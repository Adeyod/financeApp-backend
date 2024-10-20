import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app.error';

const authenticateCustomHeader = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (req.path === '/api/v1/payment/paystack/webhook') {
    return next();
  }

  const fundFlowHeader = req.headers['x-fund-flow'];

  if (!fundFlowHeader) {
    // throw new AppError('Invalid client', 403);
    return res.json({
      message: 'Invalid client',
      status: 403,
    });
  }

  next();
};

export default authenticateCustomHeader;
