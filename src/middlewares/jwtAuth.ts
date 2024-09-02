import jwt from 'jsonwebtoken';
import catchError from '../utils/tryCatch';
import { JWT_SECRET } from '../constants/env';
import { Response, Request, NextFunction } from 'express';
import { UserInJwt } from '../constants/types';
import { AppError, JwtError } from '../utils/app.error';
require('dotenv').config();

const generateAccessToken = async (userId: string, userEmail: string) => {
  try {
    const payload = {
      userId,
      userEmail,
    };

    const token = await jwt.sign(payload, JWT_SECRET, {
      expiresIn: '15days',
    });

    return token;
  } catch (error: any) {
    throw new JwtError(error.message, error.status);
  }
};

const verifyAccessToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<any> => {
  try {
    const access_token = await req.cookies.access_token;
    if (!access_token) {
      throw new AppError('Please login to continue', 401);
    }

    const user = (await jwt.verify(access_token, JWT_SECRET)) as UserInJwt;
    if (!user) {
      throw new AppError('Invalid token', 401);
    }
    req.user = user;

    next();
  } catch (error: any) {
    next(new JwtError(error.message, error.status));
  }
};

export { generateAccessToken, verifyAccessToken };
