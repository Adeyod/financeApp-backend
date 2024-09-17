import bcrypt from 'bcryptjs';

import {
  Payload,
  ResetPasswordDocument,
  PayloadForLoginInput,
  UserDocument,
  LoginParams,
  UserWithAccountType,
  ChangePasswordType,
} from '../constants/types';
import { generateCode, generateRandomCode } from '../utils/codes';
import { VerificationCodeType } from '../constants/enumTypes';
import { TokenExpiration, encodeExpiresAt } from '../utils/dates';
import { FRONTEND_URL } from '../constants/env';
import { generateAccessToken } from '../middlewares/jwtAuth';

import { queue } from '../utils/queue';
import {
  findUserByEmail,
  findUserById,
  findUserByUsername,
  newUserRegistration,
  sendSMS,
  updateUserPassword,
  updateUserVerification,
} from '../repository/user.repository';
import {
  generateAccountNumber,
  saveAccountNumber,
} from '../repository/account.repository';
import {
  createVerificationCode,
  deleteToken,
  findToken,
} from '../repository/verification.repository';
import { AppError } from '../utils/app.error';

const verifyNum = 15;
const expireAt = TokenExpiration(30);
const convertExpireDateToNumber = (dateString: string): number => {
  return new Date(dateString).getTime();
};

const registerNewUser = async (
  payload: Payload
): Promise<UserWithAccountType> => {
  const { first_name, last_name, email, phone_number, password, user_name } =
    payload;

  const existingUserResult = await findUserByEmail(email);

  const existingUser = existingUserResult[0];

  if (existingUser) {
    throw new AppError('User with this email already exist', 409);
  }

  const userNameExist = await findUserByUsername(user_name);
  const existingUserName = userNameExist[0];

  if (existingUserName) {
    throw new AppError('User with this username already exist', 409);
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUserResult = await newUserRegistration({
    first_name,
    last_name,
    email,
    phone_number,
    password: hashedPassword,
    user_name,
  });

  const newUser = newUserResult[0];
  console.log('newUser', newUser);

  if (!newUser) {
    throw new Error('Unable to register user');
  }

  const { password: _password, ...others } = newUser;

  const token = await generateCode({
    first_name: others.first_name,
    last_name: others.last_name,
    num: verifyNum,
  });

  const newVerificationCodeResult = await createVerificationCode({
    token,
    user_id: others.id,
    purpose: VerificationCodeType.EmailVerification,
    expires_at: expireAt.toISOString(),
  });

  const newVerificationCode = newVerificationCodeResult[0];
  if (!newVerificationCode) {
    throw new Error('Unable to save verification code');
  }

  console.log('newVerificationCode', newVerificationCode);

  const { token: tokenDetails, expires_at } = newVerificationCode;

  const encodedExpiresAt = expires_at;
  // const encodedExpiresAt = encodeURIComponent(expires_at.toISOString());

  // const link = `${FRONTEND_URL}/auth/email-verification/${others.id}/${tokenDetails}`;
  const link = `${FRONTEND_URL}/email-verification?userId=${others.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

  const jobData = {
    email: others.email,
    first_name: others.first_name,
    link,
    type: 'email-verification',
  };

  const mailSent = await queue.add('sendEmail', jobData, {
    attempts: 5,
    backoff: 10000,
    removeOnComplete: true,
  });

  console.log('mailSent: ' + mailSent);

  const accountNumber = await generateAccountNumber();

  const accountString = JSON.stringify(accountNumber);

  const userNewAccountSaved = await saveAccountNumber({
    user_id: others.id,
    accountNumber: accountString,
  });

  console.log('userNewAccountSaved', userNewAccountSaved);

  const dataToSend = {
    userData: others as UserDocument,
    account: userNewAccountSaved[0],
  };

  return dataToSend;
};

const verifyEmail = async (
  userId: string,
  token: string
): Promise<UserDocument> => {
  const verificationResult = await findToken({
    user_id: userId,
    token,
    purpose: VerificationCodeType.EmailVerification,
  });

  const verificationDetails = verificationResult[0];

  if (!verificationDetails) {
    throw new AppError('No verification code found', 404);
  }

  const {
    id,
    user_id,
    token: tokenPsql,
    purpose,
    expires_at,
  } = verificationDetails;

  const currentTime = Date.now();
  const expiresAt = convertExpireDateToNumber(expires_at);

  console.log('expiresAt', expiresAt);
  console.log('currentTime', currentTime);

  if (currentTime > expiresAt) {
    await deleteToken({
      user_id,
      purpose: VerificationCodeType.EmailVerification,
      id,
    });
    throw new AppError(
      'Verification link has expired. Please request a new one',
      401
    );
  }

  const updateResult = await updateUserVerification(user_id);
  const updateUser = updateResult[0];

  if (!updateUser) {
    throw new Error('Unable to set is_verified for this user');
  } else {
    const deletedData = await deleteToken({
      user_id,
      purpose: VerificationCodeType.EmailVerification,
      id,
    });

    console.log('verified:', deletedData[0]);

    const user = updateUser;

    return user as UserDocument;
  }
};

const logUserIn = async (
  payload: PayloadForLoginInput
): Promise<LoginParams> => {
  const { login_input, password } = payload;

  let getUserResult: UserDocument[];

  if (login_input.includes('@')) {
    getUserResult = await findUserByEmail(login_input);
  } else {
    getUserResult = await findUserByUsername(login_input);
  }

  const user = getUserResult[0];

  if (!user || user === undefined) {
    throw new AppError('Invalid credentials', 401);
  }

  const validatePassword = await bcrypt.compare(password, user.password);
  if (!validatePassword) {
    throw new AppError('Invalid credentials', 401);
  }

  if (!user.is_verified) {
    let token;
    let link;

    const activeTokenResult = await findToken({
      user_id: user.id,
      purpose: VerificationCodeType.EmailVerification,
    });

    const activeToken = activeTokenResult[0];

    if (!activeToken) {
      token = await generateCode({
        first_name: user.first_name,
        last_name: user.last_name,
        num: verifyNum,
      });

      const verificationTokenResult = await createVerificationCode({
        token,
        user_id: user.id,
        purpose: VerificationCodeType.EmailVerification,
        expires_at: expireAt.toISOString(),
      });

      const newVerificationCode = verificationTokenResult[0];

      if (!newVerificationCode) {
        throw new Error('Unable to save verification code');
      }

      const { token: tokenDetails, expires_at } = newVerificationCode;

      const encodedExpiresAt = encodeExpiresAt(expires_at);

      // link = `${FRONTEND_URL}/auth/email-verification/${user.id}/${tokenDetails}`;
      link = `${FRONTEND_URL}/email-verification?userId=${user.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

      const jobData = {
        email: user.email,
        first_name: user.first_name,
        link,
        type: 'email-verification',
      };

      const mailSent = await queue.add('sendEmail', jobData, {
        attempts: 5,
        backoff: 10000,
        removeOnComplete: true,
      });

      console.log('sending email login part 1:', mailSent);

      throw new AppError('Please check your email to verify your account', 403);
    } else {
      const { user_id, expires_at } = activeToken;

      const currentTime = Date.now();

      const checkExpires = convertExpireDateToNumber(expires_at);
      console.log(checkExpires);
      if (currentTime > checkExpires) {
        const deleteExpiredToken = await deleteToken({
          user_id,
          purpose: VerificationCodeType.EmailVerification,
          id: activeToken.id,
        });

        token = await generateCode({
          first_name: user.first_name,
          last_name: user.last_name,
          num: verifyNum,
        });

        const verificationTokenResult = await createVerificationCode({
          token,
          user_id: user.id,
          purpose: VerificationCodeType.EmailVerification,
          expires_at: expireAt.toISOString(),
        });

        const newVerificationCode = verificationTokenResult[0];

        if (!newVerificationCode) {
          throw new Error('Unable to save verification code');
        }

        const { token: tokenDetails, expires_at } = newVerificationCode;

        const encodedExpiresAt = encodeExpiresAt(expires_at);

        // link = `${FRONTEND_URL}/auth/email-verification/${user.id}/${tokenDetails}`;
        link = `${FRONTEND_URL}/email-verification?userId=${user.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

        const jobData = {
          email: user.email,
          first_name: user.first_name,
          link,
          type: 'email-verification',
        };

        const mailSent = await queue.add('sendEmail', jobData, {
          attempts: 5,
          backoff: 10000,
          removeOnComplete: true,
        });

        console.log('sending email login part 2:', mailSent);

        throw new AppError(
          'Please check your email to verify your account',
          403
        );
      } else {
        const encodedExpiresAt = encodeExpiresAt(expires_at);

        // link = `${FRONTEND_URL}/auth/email-verification/${user_id}/${activeToken.token}`;
        link = `${FRONTEND_URL}/email-verification?userId=${user_id}&token=${activeToken.token}&expires_at=${encodedExpiresAt}`;

        const jobData = {
          email: user.email,
          first_name: user.first_name,
          link,
          type: 'email-verification',
        };

        const mailSent = await queue.add('sendEmail', jobData, {
          attempts: 5,
          backoff: 10000,
          removeOnComplete: true,
        });

        throw new AppError(
          'Please check your email to verify your account',
          403
        );
      }
    }
  }

  const access_token = await generateAccessToken(user.id, user.email);
  const { token, access } = access_token;

  const { password: hashValue, ...others } = user;

  const user_access = {
    ...others,
    token,
    access,
  };

  return user_access as LoginParams;
};

const sendEmailVerificationAgain = async (email: string): Promise<object> => {
  const userQueryResult = await findUserByEmail(email);

  const user = userQueryResult[0];

  if (!user) {
    throw new AppError(`User with email: ${email} not found`, 404);
  }

  if (user.is_verified) {
    throw new AppError('User already verified', 409);
  }

  let link: string = '';

  const savedTokenQueryResult = await findToken({
    user_id: user.id,
    token: undefined,
    purpose: VerificationCodeType.EmailVerification,
  });
  console.log('savedTokenQueryResult', savedTokenQueryResult);

  const savedToken = savedTokenQueryResult[0];

  const currentTime = Date.now();

  if (!savedToken) {
    let token = await generateCode({
      first_name: user.first_name,
      last_name: user.last_name,
      num: verifyNum,
    });

    const saveTokenResult = await createVerificationCode({
      token,
      user_id: user.id,
      purpose: VerificationCodeType.EmailVerification,
      expires_at: expireAt.toISOString(),
    });

    const saveToken = saveTokenResult[0];
    console.log('Newly generated saveToken', saveToken);

    if (!saveToken) {
      throw new Error('Unable to save token');
    }

    const encodedExpiresAt = encodeExpiresAt(saveToken.expires_at);
    console.log('Newly encodedExpiresAt', encodedExpiresAt);

    // link = `${FRONTEND_URL}/auth/email-verification/${saveToken.user_id}/${saveToken.token}`;
    const link = `${FRONTEND_URL}/email-verification?userId=${saveToken.user_id}&token=${saveToken.token}&expires_at=${encodedExpiresAt}`;
  } else if (currentTime > convertExpireDateToNumber(savedToken.expires_at)) {
    const deleteTokenResult = await deleteToken({
      user_id: user.id,
      purpose: VerificationCodeType.EmailVerification,
      id: savedToken.id,
    });
    console.log('deleteTokenResult', deleteTokenResult);
    let token = await generateCode({
      first_name: user.first_name,
      last_name: user.last_name,
      num: verifyNum,
    });

    const saveTokenResult = await createVerificationCode({
      token,
      user_id: user.id,
      purpose: VerificationCodeType.EmailVerification,
      expires_at: expireAt.toISOString(),
    });

    const saveToken = saveTokenResult[0];

    if (!saveToken) {
      throw new Error('Unable to save token');
    }

    const encodedExpiresAt = encodeExpiresAt(saveToken.expires_at);
    console.log('Time check encodedExpiresAt', encodedExpiresAt);

    // link = `${FRONTEND_URL}/auth/email-verification/${saveToken.user_id}/${saveToken.token}`;
    const link = `${FRONTEND_URL}/email-verification?userId=${saveToken.user_id}&token=${saveToken.token}&expires_at=${encodedExpiresAt}`;
  } else if (savedToken) {
    const { token, user_id, expires_at } = savedToken;
    const encodedExpiresAt = encodeExpiresAt(expires_at);

    // link = `${FRONTEND_URL}/auth/email-verification/${user_id}/${token}`;
    const link = `${FRONTEND_URL}/email-verification?userId=${user_id}&token=${token}&expires_at=${encodedExpiresAt}`;
  }

  const jobData = {
    email: user.email,
    first_name: user.first_name,
    link,
    type: 'email-verification',
  };

  const sendTheMail = await queue.add('sendEmail', jobData, {
    attempts: 5,
    backoff: 10000,
    removeOnComplete: true,
  });

  return sendTheMail;
};

const forgotPass = async (email: string): Promise<object> => {
  const findUserResult = await findUserByEmail(email);

  const userFound = findUserResult[0];

  let link: string = '';

  if (!userFound) {
    throw new AppError(`User with email ${email} not found`, 404);
  }
  if (!userFound.is_verified) {
    throw new AppError(
      'You need to verify your email address before you can use this service',
      403
    );
  }

  const findTokenResult = await findToken({
    user_id: userFound.id,
    purpose: VerificationCodeType.PasswordReset,
  });

  const tokenFound = findTokenResult[0];

  const token = await generateCode({
    first_name: userFound.first_name,
    last_name: userFound.last_name,
    num: verifyNum,
  });

  if (!tokenFound) {
    const saveTokenResult = await createVerificationCode({
      token,
      user_id: userFound.id,
      purpose: VerificationCodeType.PasswordReset,
      expires_at: expireAt.toISOString(),
    });

    const saveToken = saveTokenResult[0];

    if (!saveToken) {
      throw new Error('Could not save token');
    }

    const { token: tokenValue, user_id, expires_at } = saveToken;

    const encodedExpiresAt = expires_at;

    // link = `${FRONTEND_URL}/auth/reset-password/${user_id}/${tokenValue}`;
    link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}`;
  } else if (tokenFound) {
    const currentTime = Date.now();
    const expiresAt = convertExpireDateToNumber(tokenFound.expires_at);

    if (currentTime > expiresAt) {
      const deleteTokenResult = await deleteToken({
        user_id: userFound.id,
        purpose: VerificationCodeType.PasswordReset,
        id: tokenFound.id,
      });

      const deletedToken = deleteTokenResult[0];
      if (!deletedToken) {
        throw new Error('Unable to delete token');
      }

      const saveTokenResult = await createVerificationCode({
        token,
        user_id: userFound.id,
        purpose: VerificationCodeType.PasswordReset,
        expires_at: tokenFound.expires_at,
      });

      const saveToken = saveTokenResult[0];

      if (!saveToken) {
        throw new Error('Could not save token');
      }

      const { token: tokenValue, user_id, expires_at } = saveToken;

      const encodedExpiresAt = expires_at;

      // link = `${FRONTEND_URL}/auth/reset-password/${user_id}/${tokenValue}`;
      link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}`;
    } else {
      const { user_id, token, expires_at } = tokenFound;

      const encodedExpiresAt = expires_at;

      // link = `${FRONTEND_URL}/auth/reset-password/${user_id}/${token}`;
      link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${token}&expiresAt=${encodedExpiresAt}`;
    }
  }

  const jobData = {
    email: userFound.email,
    first_name: userFound.first_name,
    link,
    type: 'forgot-password',
  };

  const sendPasswordResetLink = await queue.add('sendEmail', jobData, {
    attempts: 5,
    backoff: 10000,
    removeOnComplete: true,
  });

  return sendPasswordResetLink;
};

const passwordReset = async (
  payload: ResetPasswordDocument
): Promise<string> => {
  const { user_id, token, password } = payload;

  const findCodeResult = await findToken({
    user_id,
    token,
    purpose: VerificationCodeType.PasswordReset,
  });

  const findCode = findCodeResult[0];
  if (!findCode) {
    throw new AppError('Invalid verification code', 400);
  }

  const currentTime = Date.now();
  const expiresAt = convertExpireDateToNumber(findCode.expires_at);

  if (currentTime > expiresAt) {
    const deleteCodeResult = await deleteToken({
      user_id,
      purpose: VerificationCodeType.PasswordReset,
      id: findCode.id,
    });

    throw new AppError(
      `This code has expired. Please request for a new password reset link to continue. ${deleteCodeResult}`,
      410
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await updateUserPassword({
    user_id: findCode.user_id,
    password: hashedPassword,
  });

  const updateUserPasswordResult = result[0];
  if (!updateUserPasswordResult) {
    throw new Error('Unable to update user password');
  }

  const deleteCodeResult = await deleteToken({
    user_id: findCode.user_id,
    purpose: VerificationCodeType.PasswordReset,
    id: findCode.id,
  });

  return `${updateUserPasswordResult.first_name}, your password has been updated successfully. Please login to your account with the new password.`;
};

const passwordChange = async ({
  reqId,
  currentPassword,
  newPassword,
}: ChangePasswordType): Promise<string> => {
  const userDetails = await findUserById(reqId);
  const user = userDetails[0];
  if (!user) {
    throw new AppError('User does not exist', 404);
  }

  const passwordCompare = await bcrypt.compare(currentPassword, user.password);
  if (!passwordCompare) {
    throw new AppError('Invalid credentials', 401);
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  const updatePassword = await updateUserPassword({
    user_id: user.id,
    password: hashPassword,
  });

  if (!updatePassword) {
    throw new Error('Unable to update password');
  }

  return user.first_name;
};

const sendPhoneVerificationPin = async (user_id: string, userId: string) => {
  if (user_id !== userId) {
    throw new Error('You can do phone verification only for your account');
  }

  const findUserByIdResult = await findUserById(user_id);
  const userDetails = findUserByIdResult[0];

  if (userDetails.is_phone_verified) {
    throw new Error('Phone number already verified');
  }

  const phoneCode = generateRandomCode(6);

  const smsResult = await sendSMS({
    code: phoneCode,
    phone_number: userDetails.phone_number,
  });

  return;
};

export {
  logUserIn,
  sendEmailVerificationAgain,
  forgotPass,
  passwordReset,
  registerNewUser,
  verifyEmail,
  sendPhoneVerificationPin,
  passwordChange,
};

/**
 *
 * Update user profile route
 * get user route
 */
