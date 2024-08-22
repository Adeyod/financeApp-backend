import Joi from 'joi';
import {
  ComparePassType,
  PayloadForLoginInput,
  User,
} from '../constants/types';

const forbiddenCharsRegex = /^[^|!{}()&=[\]===><>]+$/;

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneNumberPattern = /^\+\d{10,14}$/;

const passwordRegex =
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/;

const joiValidation = <
  T extends User | PayloadForLoginInput | ComparePassType | string
>(
  payload: T,
  validationType: 'register' | 'login' | 'reset-password' | 'forgot-password'
): { success: boolean; value: T } => {
  let validationSchema;

  if (validationType === 'register') {
    validationSchema = Joi.object({
      first_name: Joi.string()
        .min(3)
        .required()
        .pattern(new RegExp(`^[^${forbiddenCharsRegex.source}]*$`))
        .messages({
          'string.min': 'First name length must be at least 3 characters long',
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
        .messages({ 'any.only': 'Password and confirm password do not match' }),

      phone_number: Joi.string()
        .pattern(phoneNumberPattern)
        .required()
        .messages({
          'string.empty': 'Phone number is required',
          'string.pattern.base': 'Please provide a valid phone number',
        }),
    });

    const { error, value } = validationSchema.validate(payload as User);
    if (error) {
      console.log(error);
      throw new Error(error.details[0].message);
    }

    return { success: true, value: value as T };
  } else if (validationType === 'login') {
    validationSchema = Joi.object({
      loginInput: Joi.string()
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

    // forgotpassword resetpassword, changepassword, resendEmail, login, register

    const { error, value } = validationSchema.validate(
      payload as PayloadForLoginInput
    );
    if (error) {
      console.log(error);
      throw new Error(error.details[0].message);
    }

    return { success: true, value: value as T };
  } else if (validationType === 'reset-password') {
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
          'any.one': 'Password and confirm password do not match',
        }),
    });

    const { error, value } = validationSchema.validate(
      payload as ComparePassType
    );
    if (error) {
      throw new Error(error.details[0].message);
    }

    return { success: true, value: value as T };
  } else if (validationType === 'forgot-password') {
    validationSchema = Joi.object({
      email: Joi.string().email().required().messages({
        'string.empty': 'Email is required',
        'string.email': 'Please provide a valid email address',
      }),
    });

    const { error, value } = validationSchema.validate({
      email: payload as string,
    });
    if (error) {
      console.log(error);
      throw new Error(error.details[0].message);
    }

    return { success: true, value: value.email as T };
  }

  throw new Error('Invalid validation type');
};

export { joiValidation };
