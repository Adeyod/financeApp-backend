import { pool } from '../config/database';
import { Payload, UserDocument } from '../constants/types';
import bcrypt from 'bcryptjs';
import { generateCode } from '../middlewares/codes';
import { VerificationCodeType } from '../constants/enumTypes';
import { TokenExpiresInFifteenMinutes } from '../utils/dates';
import { FRONTEND_URL } from '../constants/env';
import { sendEmailVerification } from '../utils/nodemailer';

const createAccount = async (payload: Payload): Promise<UserDocument> => {
  const { first_name, last_name, email, phone_number, password } = payload;
  const { rows: existingUser } = await pool.query(
    'select * from users where email = $1',
    [email]
  );

  if (existingUser.length > 0) {
    throw new Error('User with this email already exist');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const { rows: newUser } = await pool.query(
    'INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [first_name, last_name, email, phone_number, hashedPassword]
  );

  const { password: _password, ...others } = newUser[0];

  // generate token
  const verifyNum = 15;
  const token = await generateCode({
    first_name: others.first_name,
    last_name: others.last_name,
    num: verifyNum,
  });

  console.log('token: ' + token);

  const expireAt = TokenExpiresInFifteenMinutes();

  // save token and user inside database
  const { rows: newVerificationCode } = await pool.query(
    'INSERT INTO verification_code (token, user_id, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *',
    [token, others.id, VerificationCodeType.EmailVerification, expireAt]
  );

  if (newVerificationCode.length === 0) {
    throw new Error('Unable to save verification code');
  }

  const { token: tokenDetails, expires_at } = newVerificationCode[0];

  const encodedExpiresAt = encodeURIComponent(expireAt.toISOString());

  // send email verification link to the new user here
  const link = `${FRONTEND_URL}/email-verification?userId=${others.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

  // link email and first name
  const mailSent = await sendEmailVerification({
    email: others.email,
    first_name: others.first_name,
    link,
  });

  return others as UserDocument;
};

export { createAccount };
