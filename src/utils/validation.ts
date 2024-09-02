import Joi from 'joi';
import {
  ComparePassType,
  PayloadForLoginInput,
  User,
} from '../constants/types';
import { JoiError } from './app.error';

const forbiddenCharsRegex = /^[^|!{}()&=[\]===><>]+$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneNumberPattern = /^[0-9+]{10,14}$/;

const passwordRegex =
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/;

const joiValidation = <
  T extends User | PayloadForLoginInput | ComparePassType | string
>(
  payload: T,
  validationType: 'register' | 'login' | 'reset-password' | 'forgot-password'
): { success: boolean; value: T } => {
  let validationSchema;

  switch (validationType) {
    case 'register':
      validationSchema = Joi.object({
        first_name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.min':
              'First name length must be at least 3 characters long',
            'string.empty': 'First name is required',
            'string.pattern.base': 'Invalid characters in first name field',
          }),
        last_name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Last name is required',
            'string.min': 'Last name length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in last name field',
          }),
        user_name: Joi.string()
          .min(3)
          .required()
          .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
          .messages({
            'string.empty': 'Username is required',
            'string.min': 'Username length must be at least 3 characters long',
            'string.pattern.base': 'Invalid characters in username field',
          }),
        email: Joi.string().email().required().messages({
          'string.empty': 'Email is required',
          'string.email': 'Please provide a valid email address',
        }),
        password: Joi.string()
          .min(8)
          .max(32)
          .required()
          .pattern(passwordRegex)
          .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password can not be longer than 32 characters',
            'string.pattern.base':
              'Password must contain at least one lowercase, one uppercase and one special character',
          }),
        confirm_password: Joi.string()
          .valid(Joi.ref('password'))
          .required()
          .messages({
            'any.only': 'Password and confirm password do not match',
          }),
        phone_number: Joi.string()
          .pattern(phoneNumberPattern)
          .required()
          .messages({
            'string.empty': 'Phone number is required',
            'string.pattern.base': 'Please provide a valid phone number',
          }),
      });
      break;

    case 'login':
      validationSchema = Joi.object({
        login_input: Joi.string()
          .required()
          .custom((value, helpers) => {
            if (Joi.string().email().validate(value).error) {
              const usernameRegexPattern = /^[a-zA-Z0-9_]{3,}$/;
              if (!usernameRegexPattern.test(value)) {
                return helpers.error('any.invalid', {
                  custom: 'Invalid email or username',
                });
              }
            }
            return value;
          })
          .messages({
            'string.empty': 'Login input is required',
            'any.invalid': '{{#custom}}',
          }),
        password: Joi.string()
          .min(8)
          .max(32)
          .required()
          .pattern(passwordRegex)
          .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password can not be longer than 32 characters',
            'string.pattern.base':
              'Password must contain at least one lowercase, one uppercase and one special character',
          }),
      });
      break;

    case 'reset-password':
      validationSchema = Joi.object({
        password: Joi.string()
          .min(8)
          .max(32)
          .required()
          .pattern(passwordRegex)
          .messages({
            'string.empty': 'Password is required',
            'string.min': 'Password must be at least 8 characters long',
            'string.max': 'Password can not be longer than 32 characters',
            'string.pattern.base':
              'Password must contain at least one lowercase, one uppercase and one special character',
          }),
        confirm_password: Joi.string()
          .valid(Joi.ref('password'))
          .required()
          .messages({
            'string.empty': 'Confirm Password is required',
            'any.only': 'Password and confirm password do not match',
          }),
      });
      break;

    case 'forgot-password':
      validationSchema = Joi.object({
        email: Joi.string().email().required().messages({
          'string.empty': 'Email is required',
          'string.email': 'Please provide a valid email address',
        }),
      });

      const { error, value } = validationSchema.validate({ email: payload });
      if (error) {
        console.log(error);
        throw new JoiError(error.details[0].message);
      }

      return { success: true, value: value.email as T };
      break;

    default:
      throw new Error('Invalid validation type');
  }

  const { error, value } = validationSchema.validate(payload);
  if (error) {
    console.log(error);
    const statusCode = 422;

    throw new JoiError(
      error.details[0].message,
      statusCode,
      error.details[0].type
    );
  }

  return { success: true, value: value as T };
};

export { joiValidation };
