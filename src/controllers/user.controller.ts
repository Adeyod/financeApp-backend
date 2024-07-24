import {
  validateEmail,
  validateField,
  validatePassword,
} from '../middlewares/validation';
import {
  registerUserService,
  verifyEmailService,
  loginUserService,
  resendEmailVerificationLinkService,
} from '../services/user.service';

import catchErrors from '../utils/tryCatch';

type User = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
  confirm_password: string;
};

export const registerUser = catchErrors(async (req, res) => {
  const {
    first_name,
    last_name,
    email,
    phone_number,
    password,
    confirm_password,
  }: User = req.body;

  const firstName = validateField(first_name, 'first name');
  const lastName = validateField(last_name, 'last name');
  const emailValue = validateEmail(email);
  const passwordValue = validatePassword(
    password,
    confirm_password,
    'registration'
  );

  // call a service
  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: emailValue,
    phone_number,
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

export const verifyUserEmail = catchErrors(async (req, res) => {
  // get the params
  const { userId, token } = req.params;

  const user_id = parseInt(userId);

  // call a service
  const isVerified = await verifyEmailService(userId, token);

  // return the response
  return res.status(200).json({
    message: `${isVerified.first_name}, your email has been verified successfully. Please login to continue.`,
    success: true,
    status: 200,
  });
});

export const loginUser = catchErrors(async (req, res) => {
  // get the details from the req.body and validate it
  const { email, password } = req.body;
  const emailValue = validateEmail(email);
  const passwordValue = validatePassword(password, undefined, 'login');

  const payload = {
    email: emailValue,
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
      succeess: true,
      status: 200,
    });
});

export const resendEmailVerificationLink = catchErrors(async (req, res) => {
  const { email } = req.body;
  const checkEmail = validateEmail(email);

  // call a service
  const newEmail = await resendEmailVerificationLinkService(email);

  // return response
  return res.status(200).json({
    message: 'Please check your email to verify your account',
    success: true,
    status: 200,
  });
});
export const forgotPassword = catchErrors(async (req, res) => {});

export const resetPassword = catchErrors(async (req, res) => {});
