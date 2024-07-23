import {
  validateEmail,
  validateField,
  validatePassword,
} from '../middlewares/validation';
import { createAccount } from '../services/user.service';

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
  const passwordValue = validatePassword(password, confirm_password);

  // call a service
  const payload = {
    first_name: firstName,
    last_name: lastName,
    email: emailValue,
    phone_number,
    password: passwordValue,
  };
  const user = await createAccount(payload);
  console.log(user);
  // return response
  return res.status(201).json({
    message:
      'User created successfully. Please visit your email to verify your email address.',
    success: true,
    status: 201,
  });
});
