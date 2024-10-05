import {
  ComparePassType,
  PayloadForLoginInput,
  User,
} from '../constants/types';
import { joiValidation } from '../utils/validation';
import {
  registerNewUser,
  verifyEmail,
  logUserIn,
  sendEmailVerificationAgain,
  forgotPass,
  passwordReset,
  sendPhoneVerificationPin,
  passwordChange,
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

  const payload = {
    first_name,
    user_name,
    last_name,
    email,
    phone_number,
    password,
    confirm_password,
  };

  const validateInputs = joiValidation(payload, 'register');

  const { success, value } = validateInputs;

  const user = await registerNewUser(value);

  return res.status(201).json({
    message:
      'User created successfully. Please visit your email to verify your email address.',
    success: true,
    status: 201,
  });
});

const verifyUserEmail = catchErrors(async (req, res) => {
  const { userId, token } = req.params;

  const isVerified = await verifyEmail(userId, token);

  return res.status(200).json({
    message: `${isVerified.first_name}, your email has been verified successfully. Please login to continue.`,
    success: true,
    status: 200,
  });
});

const loginUser = catchErrors(async (req, res) => {
  const { login_input, password }: PayloadForLoginInput = req.body;

  const payload = {
    login_input,
    password,
  };

  const validateInputs = joiValidation(payload, 'login');

  const { success, value } = validateInputs;

  const { access, token, ...others } = await logUserIn(value);

  return res
    .cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'none',
      secure: true,
      maxAge: 15 * 24 * 60 * 60 * 1000,
    })
    .status(200)
    .json({
      message: `${others.first_name}, your login was successful`,
      user: others,
      access,
      success: true,
      status: 200,
    });
});

const resendEmailVerificationLink = catchErrors(async (req, res) => {
  const { email } = req.body;

  const validateInputs = joiValidation(email, 'forgot-password');

  const { success, value } = validateInputs;

  const newEmail = await sendEmailVerificationAgain(value);

  return res.status(200).json({
    message: 'Please check your email to verify your account',
    success: true,
    status: 200,
  });
});

const forgotPassword = catchErrors(async (req, res) => {
  const { email } = req.body;

  const validateInputs = joiValidation(email, 'forgot-password');

  const { success, value } = validateInputs;

  const forgotPasswordResult = await forgotPass(value);

  return res.status(200).json({
    success: true,
    message: 'Please check your email for the password reset link',
    status: 200,
  });
});

const resetPassword = catchErrors(async (req, res) => {
  const { userId, token } = req.params;
  const { password, confirm_password }: ComparePassType = req.body;

  const inputContent = {
    password,
    confirm_password,
  };

  const validateInputs = joiValidation(inputContent, 'reset-password');

  const { success, value } = validateInputs;

  const payload = {
    user_id: userId,
    token: token,
    password: value.password,
  };

  const resetPasswordResponse = await passwordReset(payload);

  return res.status(200).json({
    message: resetPasswordResponse,
    success: true,
    status: 200,
  });
});

const changePassword = catchErrors(async (req, res) => {
  const user = req.user;

  const { current_password, new_password, confirm_new_password } =
    await req.body;

  const inputContent = {
    password: new_password,
    confirm_password: confirm_new_password,
  };

  const validateInputs = joiValidation(inputContent, 'reset-password');

  const { success, value } = validateInputs;

  if (!user) {
    throw new Error('User not authenticated');
  }

  const changePasswordServiceResult = await passwordChange({
    reqId: user.userId,
    currentPassword: current_password,
    newPassword: value.password,
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

  const serviceResult = await sendPhoneVerificationPin(user_id, user.userId);
});

const logoutUser = catchErrors(async (req, res) => {
  res.clearCookie('access_token', { httpOnly: true });
  res.status(200).json({
    message: 'User logged out successfully',
  });
});

export {
  logoutUser,
  registerUser,
  verifyUserEmail,
  loginUser,
  resendEmailVerificationLink,
  changePassword,
  sendPhoneVerificationCode,
  resetPassword,
  forgotPassword,
};
