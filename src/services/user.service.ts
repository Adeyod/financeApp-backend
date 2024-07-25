import bcrypt from 'bcryptjs';
import { QueryResult } from 'pg';

import { pool } from '../config/database';
import {
  EmailVerificationDocument,
  Payload,
  ResetPasswordDocument,
  PayloadForLoginInput,
  PayloadWithoutPassword,
  UserDocument,
  VerificationQuery,
} from '../constants/types';
import { generateCode } from '../middlewares/codes';
import { VerificationCodeType } from '../constants/enumTypes';
import { TokenExpiration } from '../utils/dates';
import { FRONTEND_URL } from '../constants/env';
import { sendEmailVerification, sendPasswordReset } from '../utils/nodemailer';
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

  const verificationResult: QueryResult<VerificationQuery> = await pool.query(
    verificationQuery,
    [userId, token, VerificationCodeType.EmailVerification]
  );

  const verificationDetails = verificationResult.rows[0];
  console.log('verificationDetails', verificationDetails);
  console.log('2verificationDetails', JSON.stringify(verificationDetails));

  console.log('length:', verificationDetails);

  if (!verificationDetails) {
    throw new Error('No verification code found');
  }

  const {
    id,
    user_id,
    token: tokenPsql,
    purpose,
    expires_at,
    created_at,
  } = verificationDetails;

  const currentTime = Date.now();
  const expiresAt = new Date(expires_at).getTime();

  const deleteQuery = `
  DELETE FROM verification_code WHERE user_id = $1 RETURNING *
  `;

  if (currentTime > expiresAt) {
    const deleteData = await pool.query(deleteQuery, [user_id]);
    console.log('expired:', deleteData.rows[0]);
    throw new Error('Verification link has expired. Please request a new one');
  }

  // update the user verification status
  const updateQuery = `
  UPDATE users SET is_verified = true WHERE id = $1 RETURNING *
  `;
  const updateResult: QueryResult<UserDocument> = await pool.query(
    updateQuery,
    [user_id]
  );

  const updateUser = updateResult.rows[0];

  if (!updateUser) {
    throw new Error('Unable to set is_verified for this user');
  } else {
    // delete verification code from the database
    const deletedData = await pool.query(deleteQuery, [user_id]);
    console.log('verified:', deletedData.rows[0]);

    const user = updateUser;

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

  const saveTokenQueryParams = `
    INSERT INTO verification_code (user_id, token, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *
    `;

  const saveTokenResult = await pool.query(saveTokenQueryParams, [
    user.id,
    token,
    VerificationCodeType.EmailVerification,
    expireAt,
  ]);

  const currentTime = Date.now();

  if (!savedToken) {
    // generate a new token

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

const forgotPasswordService = async (email: string): Promise<object> => {
  // check if the user with that email exists
  const findUserQuery = `
  SELECT * FROM users WHERE email = $1
  `;

  const findUserResult: QueryResult<UserDocument> = await pool.query(
    findUserQuery,
    [email]
  );
  const userFound = findUserResult.rows[0];

  let link: string = '';

  if (!userFound) {
    throw new Error(`User with email ${email} not found`);
  }

  // check if the user has a saved token that has not expired
  const findTokenQuery = `
  SELECT * FROM verification_code WHERE user_id = $1 and purpose = $2
  `;

  const findTokenResult: QueryResult<VerificationQuery> = await pool.query(
    findTokenQuery,
    [userFound.id, VerificationCodeType.PasswordReset]
  );

  const tokenFound = findTokenResult.rows[0];

  const token = await generateCode({
    first_name: userFound.first_name,
    last_name: userFound.last_name,
    num: verifyNum,
  });

  const saveTokenQuery = `
INSERT INTO verification_code (user_id, token, purpose, expires_at) VALUES ($1, $2, $3, $4) RETURNING *
`;

  if (!tokenFound) {
    // generate token, save to database, generate link using the new token and user id

    const saveTokenResult: QueryResult<VerificationQuery> = await pool.query(
      saveTokenQuery,
      [userFound.id, token, VerificationCodeType.PasswordReset, expireAt]
    );

    const saveToken = saveTokenResult.rows[0];

    if (!saveToken) {
      throw new Error('Could not save token');
    }

    const { token: tokenValue, user_id, expires_at } = saveToken;

    const encodedExpiresAt = encodeURIComponent(
      new Date(expires_at).toISOString()
    );

    link = `${FRONTEND_URL}/reset-password/${user_id}/${tokenValue}`;
    // link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}`
  } else if (tokenFound) {
    // check if it has expired and generate a new token

    const currentTime = Date.now();
    const expiresAt = new Date(tokenFound.expires_at).getTime();

    if (currentTime > expiresAt) {
      // delete expired token, generate new token and save it
      const deleteTokenQuery = `
      DELETE FROM verification_code WHERE id = $1
      `;
      const deleteTokenResult: QueryResult<VerificationQuery> =
        await pool.query(deleteTokenQuery, [tokenFound.id]);

      const deletedToken = await deleteTokenResult.rows[0];
      if (!deletedToken) {
        throw new Error('Unable to delete token');
      }

      const saveTokenResult: QueryResult<VerificationQuery> = await pool.query(
        saveTokenQuery,
        [
          userFound.id,
          token,
          VerificationCodeType.PasswordReset,
          tokenFound.expires_at,
        ]
      );

      const saveToken = saveTokenResult.rows[0];

      if (!saveToken) {
        throw new Error('Could not save token');
      }

      const { token: tokenValue, user_id, expires_at } = saveToken;

      const encodedExpiresAt = encodeURIComponent(
        new Date(expires_at).toISOString()
      );

      link = `${FRONTEND_URL}/reset-password/${user_id}/${tokenValue}`;
      // link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}`
    } else {
      const { user_id, token, expires_at } = tokenFound;
      const encodedExpiresAt = encodeURIComponent(
        new Date(expires_at).toISOString()
      );

      link = `${FRONTEND_URL}/reset-password/${user_id}/${token}`;
      // link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}
    }
  }

  // send the mail using the first name, email and link
  const sendPasswordResetLink = await sendPasswordReset({
    first_name: userFound.first_name,
    email: userFound.email,
    link,
  });

  return sendPasswordResetLink;
};

const resetPasswordService = async (
  payload: ResetPasswordDocument
): Promise<string> => {
  const { user_id, token, password } = payload;

  // find verification code using the user id, token, and purpose
  const findCodeQuery = `
  SELECT * FROM verification_code WHERE user_id = $1 AND token = $2 AND purpose = $3
  `;

  const findCodeResult: QueryResult<VerificationQuery> = await pool.query(
    findCodeQuery,
    [user_id, token, VerificationCodeType.PasswordReset]
  );

  const findCode = findCodeResult.rows[0];
  if (!findCode) {
    throw new Error('Invalid verification code');
  }

  // if found, check if it has not expired
  const currentTime = Date.now();
  const expiresAt = new Date(findCode.expires_at).getTime();
  console.log('current time: ' + currentTime);
  console.log('expiresAt: ' + expiresAt);

  if (currentTime > expiresAt) {
    // if expires, delete the code and throw an error

    const deleteCodeQuery = `
    DELETE FROM verification_code WHERE id = $1 RETURNING *
    `;
    const deleteCodeResult: QueryResult<VerificationQuery> = await pool.query(
      deleteCodeQuery,
      [findCode.id]
    );

    throw new Error(
      `This code has expired. Please request for a new password reset link to continue. ${deleteCodeResult}`
    );
  }

  const updateUserPasswordQuery = `
  UPDATE users SET password = $1 WHERE id = $2 RETURNING first_name
  `;
  const updateUserPasswordResult: QueryResult<
    Pick<UserDocument, 'first_name'>
  > = await pool.query(updateUserPasswordQuery, [password, findCode.user_id]);

  const updateUserPassword = updateUserPasswordResult.rows[0];
  if (!updateUserPassword) {
    throw new Error('Unable to update user password');
  }

  const deleteCodeQuery = `
    DELETE FROM verification_code WHERE id = $1 RETURNING *
    `;

  const deleteCodeResult: QueryResult<VerificationQuery> = await pool.query(
    deleteCodeQuery,
    [findCode.id]
  );

  return `${updateUserPassword.first_name}, your password has been updated successfully. Please login to your account with the new password.`;
};

export {
  resetPasswordService,
  forgotPasswordService,
  registerUserService,
  verifyEmailService,
  loginUserService,
  resendEmailVerificationLinkService,
};
