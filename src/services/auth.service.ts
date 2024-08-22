import bcrypt from 'bcryptjs';

import {
  Payload,
  ResetPasswordDocument,
  PayloadForLoginInput,
  UserDocument,
  LoginParams,
  UserWithAccountType,
  ChangePasswordType,
  EmailJobData,
} from '../constants/types';
import { generateCode, generateRandomCode } from '../middlewares/codes';
import { VerificationCodeType } from '../constants/enumTypes';
import { TokenExpiration, encodeExpiresAt } from '../utils/dates';
import { FRONTEND_URL } from '../constants/env';
import { sendEmailVerification, sendPasswordReset } from '../utils/nodemailer';
import { generateAccessToken } from '../middlewares/jwtAuth';
import {
  createVerificationCodeFunction,
  deleteTokenFunction,
  findTokenFunction,
  findUserByEmailFunction,
  findUserByIdFunction,
  findUserByUsername,
  generateAccountNumberFunction,
  registerNewUserFunction,
  saveAccountNumberFunction,
  sendSMSFunction,
  updateUserPasswordFunction,
  updateUserVerificationFunction,
} from '../middlewares/functions';
import { changePassword } from '../controllers/auth.controller';
import { queue } from '../utils/queue';

const verifyNum = 15;
const expireAt = TokenExpiration(30);
const convertExpireDateToNumber = (dateString: string): number => {
  return new Date(dateString).getTime();
};

const registerUserService = async (
  payload: Payload
): Promise<UserWithAccountType> => {
  const { first_name, last_name, email, phone_number, password, user_name } =
    payload;

  const existingUserResult = await findUserByEmailFunction(email);

  const existingUser = existingUserResult[0];

  if (existingUser) {
    throw new Error('User with this email already exist');
  }

  const userNameExist = await findUserByUsername(user_name);
  const existingUserName = userNameExist[0];

  if (existingUserName) {
    throw new Error('User with this username already exist');
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUserResult = await registerNewUserFunction({
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

  // generate token
  const token = await generateCode({
    first_name: others.first_name,
    last_name: others.last_name,
    num: verifyNum,
  });

  // save token and user inside database
  const newVerificationCodeResult = await createVerificationCodeFunction({
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

  const link = `${FRONTEND_URL}/auth/email-verification/${others.id}/${tokenDetails}`;
  // const link = `${FRONTEND_URL}/email-verification?userId=${others.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

  const jobData = {
    email: others.email,
    first_name: others.first_name,
    link,
    type: 'email-verification',
  };

  // send email verification link to the new user here
  const mailSent = await queue.add('sendEmail', jobData, {
    attempts: 5,
    backoff: 10000,
    removeOnComplete: true,
  });

  console.log('mailSent: ' + mailSent);

  // create the default account number here and make sure it's unique
  const accountNumber = await generateAccountNumberFunction();

  const accountString = JSON.stringify(accountNumber);

  const userNewAccountSaved = await saveAccountNumberFunction({
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

const verifyEmailService = async (
  userId: string,
  token: string
): Promise<UserDocument> => {
  // check if the token and user_id exist inside the verification_code table

  const verificationResult = await findTokenFunction({
    user_id: userId,
    token,
    purpose: VerificationCodeType.EmailVerification,
  });

  const verificationDetails = verificationResult[0];

  if (!verificationDetails) {
    throw new Error('No verification code found');
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
    await deleteTokenFunction({
      user_id,
      purpose: VerificationCodeType.EmailVerification,
      id,
    });
    throw new Error('Verification link has expired. Please request a new one');
  }

  // update the user verification status

  const updateResult = await updateUserVerificationFunction(user_id);
  const updateUser = updateResult[0];

  if (!updateUser) {
    throw new Error('Unable to set is_verified for this user');
  } else {
    // delete verification code from the database

    const deletedData = await deleteTokenFunction({
      user_id,
      purpose: VerificationCodeType.EmailVerification,
      id,
    });

    console.log('verified:', deletedData[0]);

    const user = updateUser;

    return user as UserDocument;
  }
};

const loginUserService = async (
  payload: PayloadForLoginInput
): Promise<LoginParams> => {
  const { loginInput, password } = payload;

  let getUserResult: UserDocument[];

  if (loginInput.includes('@')) {
    getUserResult = await findUserByEmailFunction(loginInput);
  } else {
    getUserResult = await findUserByUsername(loginInput);
  }

  const user = getUserResult[0];

  if (!user) {
    throw new Error('Invalid credentials');
  }

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
    const activeTokenResult = await findTokenFunction({
      user_id: user.id,
      purpose: VerificationCodeType.EmailVerification,
    });

    const activeToken = activeTokenResult[0];

    if (!activeToken) {
      // meaning there is no active token, create the token, save to database, make a link and send to user
      token = await generateCode({
        first_name: user.first_name,
        last_name: user.last_name,
        num: verifyNum,
      });

      const verificationTokenResult = await createVerificationCodeFunction({
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

      // send email verification link to the new user here
      link = `${FRONTEND_URL}/auth/email-verification/${user.id}/${tokenDetails}`;
      //  link = `${FRONTEND_URL}/email-verification?userId=${user.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

      const jobData = {
        email: user.email,
        first_name: user.first_name,
        link,
        type: 'email-verification',
      };

      // link email and first name
      const mailSent = await queue.add('sendEmail', jobData, {
        attempts: 5,
        backoff: 10000,
        removeOnComplete: true,
      });

      console.log('sending email login part 1:', mailSent);

      throw new Error('Please check your email to verify your account');
    } else {
      // there is active token, then make a link out of it and send to the user
      const { user_id, expires_at } = activeToken;
      console.log('i am running here where there is active token');

      // check if expires_at is has not expired
      const currentTime = Date.now();

      const checkExpires = convertExpireDateToNumber(expires_at);
      console.log(checkExpires);
      if (currentTime > checkExpires) {
        // delete the token, generate a new token and send to the user
        const deleteExpiredToken = await deleteTokenFunction({
          user_id,
          purpose: VerificationCodeType.EmailVerification,
          id: activeToken.id,
        });

        token = await generateCode({
          first_name: user.first_name,
          last_name: user.last_name,
          num: verifyNum,
        });

        const verificationTokenResult = await createVerificationCodeFunction({
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

        // send email verification link to the new user here
        link = `${FRONTEND_URL}/auth/email-verification/${user.id}/${tokenDetails}`;
        //  link = `${FRONTEND_URL}/email-verification?userId=${user.id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

        const jobData = {
          email: user.email,
          first_name: user.first_name,
          link,
          type: 'email-verification',
        };

        // sending email verification to the queue
        const mailSent = await queue.add('sendEmail', jobData, {
          attempts: 5,
          backoff: 10000,
          removeOnComplete: true,
        });

        console.log('sending email login part 2:', mailSent);

        throw new Error('Please check your email to verify your account');
      } else {
        const encodedExpiresAt = encodeExpiresAt(expires_at);

        link = `${FRONTEND_URL}/auth/email-verification/${user_id}/${token}`;
        //  link = `${FRONTEND_URL}/email-verification?userId=${user_id}&token=${tokenDetails}&expires_at=${encodedExpiresAt}`;

        const jobData = {
          email: user.email,
          first_name: user.first_name,
          link,
          type: 'email-verification',
        };

        //  sending email verification to the queue
        const mailSent = await queue.add('sendEmail', jobData, {
          attempts: 5,
          backoff: 10000,
          removeOnComplete: true,
        });

        console.log('sending email login part 3:', mailSent);

        throw new Error('Please check your email to verify your account');
      }
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
  const userQueryResult = await findUserByEmailFunction(email);

  const user = userQueryResult[0];

  if (!user) {
    throw new Error(`User with email: ${email} not found`);
  }

  if (user.is_verified) {
    throw new Error('User already verified');
  }

  let link: string = '';

  // if found, use the user.id and purpose to find token and also check if it is still active

  const savedTokenQueryResult = await findTokenFunction({
    user_id: user.id,
    token: undefined,
    purpose: VerificationCodeType.EmailVerification,
  });
  console.log('savedTokenQueryResult', savedTokenQueryResult);

  const savedToken = savedTokenQueryResult[0];

  const currentTime = Date.now();

  if (!savedToken) {
    // generate a new token
    let token = await generateCode({
      first_name: user.first_name,
      last_name: user.last_name,
      num: verifyNum,
    });

    const saveTokenResult = await createVerificationCodeFunction({
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

    // send email verification link to the new user here
    link = `${FRONTEND_URL}/auth/email-verification/${saveToken.user_id}/${saveToken.token}`;
    // const link = `${FRONTEND_URL}/email-verification?userId=${saveToken.user_id}&token=${saveToken.token}&expires_at=${encodedExpiresAt}`;

    // link email and first name
  } else if (currentTime > convertExpireDateToNumber(savedToken.expires_at)) {
    const deleteTokenResult = await deleteTokenFunction({
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

    const saveTokenResult = await createVerificationCodeFunction({
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

    // send email verification link to the new user here
    link = `${FRONTEND_URL}/auth/email-verification/${saveToken.user_id}/${saveToken.token}`;
    // const link = `${FRONTEND_URL}/email-verification?userId=${saveToken.user_id}&token=${saveToken.token}&expires_at=${encodedExpiresAt}`;
  } else if (savedToken) {
    const { token, user_id, expires_at } = savedToken;
    const encodedExpiresAt = encodeExpiresAt(expires_at);
    console.log('I found token that has not expired and using it');

    link = `${FRONTEND_URL}/auth/email-verification/${user_id}/${token}`;
    // const link = `${FRONTEND_URL}/email-verification?userId=${user_id}&token=${token}&expires_at=${encodedExpiresAt}`;
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

  console.log('sendTheMail', await sendTheMail);

  return sendTheMail;
};

const forgotPasswordService = async (email: string): Promise<object> => {
  // check if the user with that email exists

  const findUserResult = await findUserByEmailFunction(email);

  const userFound = findUserResult[0];

  let link: string = '';

  if (!userFound) {
    throw new Error(`User with email ${email} not found`);
  }
  if (userFound.is_verified === false) {
    throw new Error(
      'You need to verify your email address before you can use this service'
    );
  }

  // check if the user has a saved token that has not expired

  const findTokenResult = await findTokenFunction({
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
    // generate token, save to database, generate link using the new token and user id

    const saveTokenResult = await createVerificationCodeFunction({
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

    const encodedExpiresAt = encodeExpiresAt(expires_at);

    link = `${FRONTEND_URL}/auth/reset-password/${user_id}/${tokenValue}`;
    // link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}`
  } else if (tokenFound) {
    // check if it has expired and generate a new token

    const currentTime = Date.now();
    const expiresAt = convertExpireDateToNumber(tokenFound.expires_at);

    if (currentTime > expiresAt) {
      // delete expired token, generate new token and save it

      const deleteTokenResult = await deleteTokenFunction({
        user_id: userFound.id,
        purpose: VerificationCodeType.PasswordReset,
        id: tokenFound.id,
      });

      const deletedToken = deleteTokenResult[0];
      if (!deletedToken) {
        throw new Error('Unable to delete token');
      }

      const saveTokenResult = await createVerificationCodeFunction({
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

      const encodedExpiresAt = encodeExpiresAt(expires_at);

      link = `${FRONTEND_URL}/auth/reset-password/${user_id}/${tokenValue}`;
      // link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}`
    } else {
      const { user_id, token, expires_at } = tokenFound;

      const encodedExpiresAt = encodeExpiresAt(expires_at);

      link = `${FRONTEND_URL}/auth/reset-password/${user_id}/${token}`;
      // link = `${FRONTEND_URL}/reset-password?userId=${user_id}&token=${tokenValue}&expiresAt=${encodedExpiresAt}
    }
  }

  const jobData = {
    email: userFound.email,
    first_name: userFound.first_name,
    link,
    type: 'forgot-password',
  };

  // send the mail to queue using the first name, email, link and type
  const sendPasswordResetLink = await queue.add('sendEmail', jobData, {
    attempts: 5,
    backoff: 10000,
    removeOnComplete: true,
  });

  return sendPasswordResetLink;
};

const resetPasswordService = async (
  payload: ResetPasswordDocument
): Promise<string> => {
  const { user_id, token, password } = payload;

  // find verification code using the user id, token, and purpose

  const findCodeResult = await findTokenFunction({
    user_id,
    token,
    purpose: VerificationCodeType.PasswordReset,
  });

  const findCode = findCodeResult[0];
  if (!findCode) {
    throw new Error('Invalid verification code');
  }

  // if found, check if it has not expired
  const currentTime = Date.now();
  const expiresAt = convertExpireDateToNumber(findCode.expires_at);

  if (currentTime > expiresAt) {
    // if expires, delete the code and throw an error
    const deleteCodeResult = await deleteTokenFunction({
      user_id,
      purpose: VerificationCodeType.PasswordReset,
      id: findCode.id,
    });

    throw new Error(
      `This code has expired. Please request for a new password reset link to continue. ${deleteCodeResult}`
    );
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const updateUserPasswordResult = await updateUserPasswordFunction({
    user_id: findCode.user_id,
    password: hashedPassword,
  });

  const updateUserPassword = updateUserPasswordResult[0];
  if (!updateUserPassword) {
    throw new Error('Unable to update user password');
  }

  const deleteCodeResult = await deleteTokenFunction({
    user_id: findCode.user_id,
    purpose: VerificationCodeType.PasswordReset,
    id: findCode.id,
  });

  return `${updateUserPassword.first_name}, your password has been updated successfully. Please login to your account with the new password.`;
};

const sendPhoneVerificationCodeService = async (
  user_id: string,
  userId: string
) => {
  console.log(userId);
  console.log(user_id);

  if (user_id !== userId) {
    throw new Error('You can do phone verification only for your account');
  }

  // get the user details from the database
  // generate 6 digit pin and send to the phone number of the user
  // set expires to 10mins
  const findUserByIdResult = await findUserByIdFunction(user_id);
  const userDetails = findUserByIdResult[0];

  if (userDetails.is_phone_verified) {
    throw new Error('Phone number already verified');
  }

  const phoneCode = generateRandomCode(6);

  const smsResult = await sendSMSFunction({
    code: phoneCode,
    phone_number: userDetails.phone_number,
  });

  console.log(smsResult);

  return;
};

const changePasswordService = async ({
  paramId,
  reqId,
  currentPassword,
  newPassword,
}: ChangePasswordType): Promise<string> => {
  if (paramId !== reqId) {
    throw new Error('You are not allowed to change this password');
  }

  const userDetails = await findUserByIdFunction(paramId);
  const user = userDetails[0];
  if (!user) {
    throw new Error('User does not exist');
  }

  const passwordCompare = await bcrypt.compare(currentPassword, user.password);
  if (!passwordCompare) {
    throw new Error('Invalid credentials');
  }

  const hashPassword = await bcrypt.hash(newPassword, 10);

  const updatePassword = await updateUserPasswordFunction({
    user_id: user.id,
    password: hashPassword,
  });

  if (!updatePassword) {
    throw new Error('Unable to update password');
  }

  return user.first_name;
};

export {
  changePasswordService,
  sendPhoneVerificationCodeService,
  resetPasswordService,
  forgotPasswordService,
  registerUserService,
  verifyEmailService,
  loginUserService,
  resendEmailVerificationLinkService,
};

/**
 *
 * Update user profile route
 * get user route
 */
