import jwt from 'jsonwebtoken';
import catchError from '../utils/tryCatch';
import { JWT_SECRET } from '../constants/env';
import { Response } from 'express';

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

export { generateAccessToken };
