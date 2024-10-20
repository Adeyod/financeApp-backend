import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

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

    const payload2 = {
      userId,
      unique: uuidv4(),
    };

    const access = await jwt.sign(payload2, JWT_SECRET, {
      expiresIn: '15days',
    });

    const token = await jwt.sign(payload, JWT_SECRET, {
      expiresIn: '15days',
    });

    const tokenObject = {
      access,
      token,
    };

    return tokenObject;
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
    let token;

    if (req.headers['x-fund-flow'] === 'web-fund-flow') {
      token = await req.cookies.token;
    } else if (req.headers['x-fund-flow'] === 'mobile-fund-flow') {
      token = req.headers['authorization']?.split(' ')[1];
    }
    if (!token) {
      throw new AppError('Please login to continue', 401);
    }

    const user = (await jwt.verify(token, JWT_SECRET)) as UserInJwt;

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
