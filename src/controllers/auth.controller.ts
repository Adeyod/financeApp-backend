import {
  comparePassType,
  PayloadForLoginInput,
  User,
} from '../constants/types';
import { validateField, validatePassword } from '../middlewares/validation';
import {
  registerUserService,
  verifyEmailService,
  loginUserService,
  resendEmailVerificationLinkService,
  forgotPasswordService,
  resetPasswordService,
  sendPhoneVerificationCodeService,
  changePasswordService,
} from '../services/auth.service';

import catchErrors from '../utils/tryCatch';

const registerUser = catchErrors(async (req, res) => {
  const {
    first_name,
    user_name,
    last_name,
    email,
    phone_number,
    password,
    confirm_password,
  }: User = req.body;

  const firstName = validateField(first_name, 'first name');
  const userName = validateField(user_name, 'user name');
  const lastName = validateField(last_name, 'last name');
  const emailValue = validateField(email, 'email');
  const phoneValue = validateField(phone_number, 'phone');

  const passwordValue = validatePassword(
    password,
    confirm_password,
    'registration'
  );

  // call a service
  const payload = {
    first_name: firstName,
    user_name: userName,
    last_name: lastName,
    email: emailValue,
    phone_number: phoneValue,
    password: passwordValue,
  };
  const user = await registerUserService(payload);

  // return response
  return res.status(201).json({
    message:
      'User created successfully. Please visit your email to verify your email address.',
    success: true,
    status: 201,
  });
});

const verifyUserEmail = catchErrors(async (req, res) => {
  // get the params
  const { userId, token } = req.params;

  // const user_id = parseInt(userId);

  // call a service
  const isVerified = await verifyEmailService(userId, token);

  // return the response
  return res.status(200).json({
    message: `${isVerified.first_name}, your email has been verified successfully. Please login to continue.`,
    success: true,
    status: 200,
  });
});

const loginUser = catchErrors(async (req, res) => {
  // get the details from the req.body and validate it
  const { loginInput, password }: PayloadForLoginInput = req.body;

  let loginInputValue: string = '';

  if (loginInput.includes('@')) {
    loginInputValue = validateField(loginInput, 'email');
  } else {
    loginInputValue = validateField(loginInput, 'user_name');
  }
  const passwordValue = validatePassword(password, undefined, 'login');

  const payload = {
    loginInput: loginInputValue,
    password: passwordValue,
  };

  //  call a service
  const { access_token, ...others } = await loginUserService(payload);

  // return the response
  return res
    .cookie('access_token', access_token, {
      httpOnly: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      user: others,
      message: `${others.first_name}, your login was successful`,
      success: true,
      status: 200,
    });
});

const resendEmailVerificationLink = catchErrors(async (req, res) => {
  const { email } = req.body;
  const checkEmail = validateField(email, 'email');

  // call a service
  const newEmail = await resendEmailVerificationLinkService(email);

  // return response
  return res.status(200).json({
    message: 'Please check your email to verify your account',
    success: true,
    status: 200,
  });
});

const forgotPassword = catchErrors(async (req, res) => {
  // get email and validate it
  const { email } = req.body;

  const emailValue = validateField(email, 'email');

  // call a service
  const forgotPasswordResult = await forgotPasswordService(emailValue);

  // return response
  return res.status(200).json({
    success: true,
    message: 'Please check your email for the password reset link',
    status: 200,
  });
});

const resetPassword = catchErrors(async (req, res) => {
  // get user id, and token from params
  const { userId, token } = req.params;
  // get new password and confirm password from body
  const { password, confirm_password }: comparePassType = req.body;
  const validatedResult = await validatePassword(
    password,
    confirm_password,
    'registration'
  );

  const payload = {
    user_id: userId,
    token: token,
    password: validatedResult,
  };

  // call a service
  const resetPasswordResponse = await resetPasswordService(payload);

  // return response
  return res.status(200).json({
    message: resetPasswordResponse,
    success: true,
    status: 200,
  });
});

const changePassword = catchErrors(async (req, res) => {
  const { user_id } = req.params;
  const user = req.user;

  const { currentPassword, newPassword, confirmNewPassword } = await req.body;
  const validPassword = validatePassword(
    newPassword,
    confirmNewPassword,
    'registration'
  );

  if (!user) {
    throw new Error('User not authenticated');
  }

  const changePasswordServiceResult = await changePasswordService({
    paramId: user_id,
    reqId: user.userId,
    currentPassword,
    newPassword,
  });

  return res.status(200).json({
    message: `${changePasswordServiceResult}, your password has been changed successfully. You will need to use it to login henceforth.`,
    success: true,
    status: 200,
  });
});

const sendPhoneVerificationCode = catchErrors(async (req, res) => {
  const { user_id } = req.params;
  const user = req.user;

  if (!user) {
    throw new Error('User not authenticated');
  }

  // call a service
  const serviceResult = await sendPhoneVerificationCodeService(
    user_id,
    user.userId
  );

  // send response
});

export {
  registerUser,
  verifyUserEmail,
  loginUser,
  resendEmailVerificationLink,
  changePassword,
  sendPhoneVerificationCode,
  resetPassword,
  forgotPassword,
};
