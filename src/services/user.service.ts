import bcrypt from 'bcryptjs';

import { pool } from '../config/database';
import {
  EmailVerificationDocument,
  Payload,
  PayloadForLoginInput,
  PayloadWithoutPassword,
  UserDocument,
} from '../constants/types';
import { generateCode } from '../middlewares/codes';
import { VerificationCodeType } from '../constants/enumTypes';
import { TokenExpiration } from '../utils/dates';
import { FRONTEND_URL } from '../constants/env';
import { sendEmailVerification } from '../utils/nodemailer';
import { generateAccessToken } from '../middlewares/jwtAuth';

const verifyNum = 15;
const expireAt = TokenExpiration(30);
type LoginParams = PayloadWithoutPassword & {
  access_token: string;
};

const registerUserService = async (payload: Payload): Promise<UserDocument> => {
  const { first_name, last_name, email, phone_number, password } = payload;

  const fetchUserQuery = `
  select * from users where email = $1
  `;
  const existingUserResult = await pool.query(fetchUserQuery, [email]);

  const existingUser = existingUserResult.rows;

  if (existingUser.length > 0) {
    throw new Error('User with this email already exist');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const registerUserQuery = `
  INSERT INTO users (first_name, last_name, email, phone_number, password) VALUES ($1, $2, $3, $4, $5) RETURNING *
  `;

  const newUserResult = await pool.query(registerUserQuery, [
    first_name,
    last_name,
    email,
    phone_number,
    hashedPassword,
  ]);

  const newUser = newUserResult.rows;

  if (newUser.length === 0) {
    throw new Error('Unable to register user');
  }

  const { password: _password, ...others } = newUser[0];

  // generate token
  const token = await generateCode({
    first_name: others.first_name,
    last_name: others.last_name,
    num: verifyNum,
  });

  console.log('token: ' + token);

  // save token and user inside database

  const verificationCodeQuery = `
  INSERT INTO verification_code (token, user_id, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *
  `;
  const newVerificationCodeResult = await pool.query(verificationCodeQuery, [
    token,
    others.id,
    VerificationCodeType.EmailVerification,
    expireAt,
  ]);
  const newVerificationCode = newVerificationCodeResult.rows;
  if (newVerificationCode.length === 0) {
    throw new Error('Unable to save verification code');
  }

  const { token: tokenDetails, expires_at } = newVerificationCode[0];

  const encodedExpiresAt = encodeURIComponent(expires_at.toISOString());
  console.log('encodedExpiresAt: ', encodedExpiresAt);

  // send email verification link to the new user here
  const link = `${FRONTEND_URL}/email-verification/${others.id}/${tokenDetails}`;
  // const link = `${FRONTEND_URL}/email-verification?userId=${others.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

  // link email and first name
  const mailSent = await sendEmailVerification({
    email: others.email,
    first_name: others.first_name,
    link,
  });

  console.log('others', others);

  return others as UserDocument;
};

const verifyEmailService = async (
  userId: string,
  token: string
): Promise<UserDocument> => {
  // check if the token and user_id exist inside the verification_code table
  const verificationQuery = `SELECT * FROM verification_code WHERE user_id = $1 AND token = $2 AND purpose = $3`;

  const verificationResult = await pool.query(verificationQuery, [
    userId,
    token,
    VerificationCodeType.EmailVerification,
  ]);

  const verificationDetails = verificationResult.rows;
  console.log('verificationDetails', verificationDetails[0]);
  console.log('2verificationDetails', JSON.stringify(verificationDetails));

  console.log('length:', verificationDetails.length);

  if (verificationDetails.length === 0) {
    throw new Error('No verification code found');
  }

  const {
    id,
    user_id,
    token: tokenPsql,
    purpose,
    expires_at,
    created_at,
  } = verificationDetails[0];

  const currentTime = new Date();

  const deleteQuery = `
  DELETE FROM verification_code WHERE user_id = $1 RETURNING *
  `;

  if (currentTime > expires_at) {
    const deleteData = await pool.query(deleteQuery, [user_id]);
    console.log('expired:', deleteData.rows[0]);
    throw new Error('Verification link has expired. Please request a new one');
  }

  // update the user verification status
  const updateQuery = `
  UPDATE users SET is_verified = true WHERE id = $1 RETURNING *
  `;
  const updateResult = await pool.query(updateQuery, [user_id]);

  const updateUser = updateResult.rows;

  if (updateUser.length === 0) {
    throw new Error('Unable to set is_verified for this user');
  } else {
    // delete verification code from the database
    const deletedData = await pool.query(deleteQuery, [user_id]);
    console.log('verified:', deletedData.rows[0]);

    const user = updateUser[0];

    return user as UserDocument;
  }
};

const loginUserService = async (
  payload: PayloadForLoginInput
): Promise<LoginParams> => {
  const { email, password } = payload;

  const loginQuery = `SELECT * FROM users WHERE email = $1`;

  const getUserResult = await pool.query(loginQuery, [email]);
  const getUser = getUserResult.rows;

  if (getUser.length === 0) {
    throw new Error('Invalid credentials');
  }

  const user: UserDocument = getUser[0];

  // compare password with saved password
  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    throw new Error('Invalid credentials');
  }

  // check if the user is verified
  if (!user.is_verified) {
    //  we either have a token or we don't have

    let token;
    let link;

    // check if there is a token not expired
    const tokenQueryParams = `
    SELECT * FROM verification_code WHERE user_id = $1 and purpose = $2
    `;
    const activeTokenResult = await pool.query(tokenQueryParams, [
      user.id,
      VerificationCodeType.EmailVerification,
    ]);

    const activeToken = activeTokenResult.rows;

    if (activeToken.length === 0) {
      // meaning there is no active token, create the token, save to database, make a link and send to user
      token = await generateCode({
        first_name: user.first_name,
        last_name: user.last_name,
        num: verifyNum,
      });

      const saveTokenQueryParams = `
      INSERT INTO verification_code (user_id, token, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *
      `;

      const verificationTokenResult = await pool.query(saveTokenQueryParams, [
        user.id,
        token,
        VerificationCodeType.EmailVerification,
        expireAt,
      ]);

      const newVerificationCode = verificationTokenResult.rows[0];

      if (!newVerificationCode) {
        throw new Error('Unable to save verification code');
      }

      const { token: tokenDetails, expires_at } = newVerificationCode;

      const encodedExpiresAt = encodeURIComponent(expires_at.toISOString());

      // send email verification link to the new user here
      link = `${FRONTEND_URL}/email-verification/${user.id}/${tokenDetails}`;
      //  link = `${FRONTEND_URL}/email-verification?userId=${user.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

      // link email and first name
      const mailSent = await sendEmailVerification({
        email: user.email,
        first_name: user.first_name,
        link,
      });

      throw new Error('Please check your email to verify your account');
    } else {
      // there is active token, then make a link out of it and send to the user
      const { token, user_id, expires_at } = activeToken[0];

      const encodedExpiresAt = encodeURIComponent(expires_at.toISOString());

      link = `${FRONTEND_URL}/email-verification/${user_id}/${token}`;
      //  link = `${FRONTEND_URL}/email-verification?userId=${user_id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

      // link email and first name
      const mailSent = await sendEmailVerification({
        email: user.email,
        first_name: user.first_name,
        link,
      });

      throw new Error('Please check your email to verify your account');
    }
  }

  const access_token = await generateAccessToken(user.id, user.email);

  const { password: hashValue, ...others } = user;

  const user_access = {
    ...others,
    access_token,
  };

  return user_access as LoginParams;
};

const resendEmailVerificationLinkService = async (
  email: string
): Promise<object> => {
  // find user by email
  const userQueryParams = `
  SELECT * FROM users WHERE email = $1
  `;

  const userQueryResult = await pool.query(userQueryParams, [email]);

  const user = userQueryResult.rows[0];

  console.log('user: ' + JSON.stringify(user));

  if (!user) {
    throw new Error(`User with email: ${email} not found`);
  }

  if (user.is_verified) {
    throw new Error('User already verified');
  }

  // if found, use the user.id and purpose to find token and also check if it is still active
  const savedTokenQueryParams = `
  SELECT * FROM verification_code WHERE user_id = $1 and purpose = $2
  `;

  const savedTokenQueryResult = await pool.query(savedTokenQueryParams, [
    user.id,
    VerificationCodeType.EmailVerification,
  ]);

  const savedToken = savedTokenQueryResult.rows[0];

  let link: string = '';
  let token = await generateCode({
    first_name: user.first_name,
    last_name: user.last_name,
    num: verifyNum,
  });

  const currentTime = Date.now();

  if (!savedToken) {
    // generate a new token

    const saveTokenQueryParams = `
    INSERT INTO verification_code (user_id, token, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *
    `;

    const saveTokenResult = await pool.query(saveTokenQueryParams, [
      user.id,
      token,
      VerificationCodeType.EmailVerification,
      expireAt,
    ]);

    const saveToken = saveTokenResult.rows[0];

    if (!saveToken) {
      throw new Error('Unable to save token');
    }

    const encodedExpiresAt = encodeURIComponent(
      saveToken.expires_at.toISOString()
    );

    // send email verification link to the new user here
    link = `${FRONTEND_URL}/email-verification/${saveToken.user_id}/${saveToken.token}`;
    // const link = `${FRONTEND_URL}/email-verification?userId=${saveToken.user_id}&token=${saveToken.token}&expires_at=${encodedExpiresAt}`;

    // link email and first name
  } else if (currentTime > savedToken.expires_at) {
    const deleteTokenParams = `
      DELETE FROM verification_code where user_id = $1 and purpose = $2 RETURNING *
      `;

    const deleteTokenResult = await pool.query(deleteTokenParams, [
      user.id,
      VerificationCodeType.EmailVerification,
    ]);

    console.log('++++ DELETED: ' + deleteTokenResult.rows[0]);

    console.log('++++ token', token);

    const saveTokenQueryParams = `
    INSERT INTO verification_code (user_id, token, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *
    `;

    const saveTokenResult = await pool.query(saveTokenQueryParams, [
      user.id,
      token,
      VerificationCodeType.EmailVerification,
      expireAt,
    ]);

    const saveToken = saveTokenResult.rows[0];
    console.log('++++ saveToken', saveToken);

    if (!saveToken) {
      throw new Error('Unable to save token');
    }

    const encodedExpiresAt = encodeURIComponent(
      saveToken.expires_at.toISOString()
    );
    console.log('++++ encodedExpiresAt: ', encodedExpiresAt);

    // send email verification link to the new user here
    link = `${FRONTEND_URL}/email-verification/${saveToken.user_id}/${saveToken.token}`;
    // const link = `${FRONTEND_URL}/email-verification?userId=${saveToken.user_id}&token=${saveToken.token}&expires_at=${encodedExpiresAt}`;

    console.log('++++ first link used:', link);
  } else if (savedToken) {
    const { token, user_id, expires_at } = savedToken;
    const encodedExpiresAt = encodeURIComponent(expires_at.toISOString());

    link = `${FRONTEND_URL}/email-verification/${user_id}/${token}`;
    // const link = `${FRONTEND_URL}/email-verification?userId=${user_id}&token=${token}&expires_at=${encodedExpiresAt}`;
  }

  const sendTheMail = await sendEmailVerification({
    email: user.email,
    first_name: user.first_name,
    link,
  });

  return sendTheMail;
};
export {
  registerUserService,
  verifyEmailService,
  loginUserService,
  resendEmailVerificationLinkService,
};
