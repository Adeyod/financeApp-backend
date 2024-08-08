import jwt from 'jsonwebtoken';
import catchError from '../utils/tryCatch';
import { JWT_SECRET } from '../constants/env';
import { Response, Request, NextFunction } from 'express';
import { UserInJwt } from '../constants/types';
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
  } catch (error) {
    throw new Error('Error generating access token');
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
      throw new Error('Please login to continue');
    }

    const user = (await jwt.verify(access_token, JWT_SECRET)) as UserInJwt;
    if (!user) {
      throw new Error('Invalid token');
    }
    req.user = user;

    next();
  } catch (error) {
    throw new Error('Error verifying access token');
  }
};

export { generateAccessToken, verifyAccessToken };
