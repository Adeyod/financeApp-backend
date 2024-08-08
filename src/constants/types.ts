import { NextFunction, Request, Response } from 'express';

// export type
type UserInJwt = {
  userId: string;
  userEmail: string;
  iat: number;
  exp: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserInJwt;
    }
  }
}

type comparePassType = {
  password: string;
  confirm_password: string;
};

type TokenSearchType = {
  user_id: string;
  purpose: string;
  token?: string;
};

type DeleteTokenType = {
  user_id: string;
  purpose: string;
  id?: string;
};

type AccountCreationType = {
  user_id: string;
  accountNumber: string;
};

type AccountCreatedDetailsType = {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

type UserWithAccountType = {
  userData: UserDocument;
  account: AccountCreatedDetailsType;
};

type Payload = {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
};

type PayloadForLoginInput = {
  loginInput: string;
  password: string;
};

type UserDocument = Payload & {
  id: string;
  created_at: string;
  is_verified: boolean;
  updated_at: string;
  two_fa_enabled: boolean;
  biometric_enabled: boolean;
  is_phone_verified: boolean;
};

type VerificationQuery = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: string;
  expires_at: string;
};

type VerificationParams = Pick<
  VerificationQuery,
  'user_id' | 'token' | 'purpose' | 'expires_at'
>;

type PayloadWithoutPassword = Omit<UserDocument, 'password'>;

type LoginParams = PayloadWithoutPassword & {
  access_token: string;
};

type EmailVerificationDocument = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: Date;
  expires_at: Date;
};

type User = comparePassType & {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

type ResetPasswordDocument = {
  user_id: string;
  token: string;
  password: string;
};

type AsyncHandler = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>;

type SmsType = {
  code: number;
  phone_number: string;
};

type changePasswordType = {
  paramId: string;
  reqId: string;
  currentPassword: string;
  newPassword: string;
};

export {
  changePasswordType,
  SmsType,
  UserInJwt,
  TokenSearchType,
  DeleteTokenType,
  UserWithAccountType,
  PayloadForLoginInput,
  AccountCreationType,
  AccountCreatedDetailsType,
  Payload,
  VerificationParams,
  VerificationQuery,
  UserDocument,
  PayloadWithoutPassword,
  LoginParams,
  EmailVerificationDocument,
  AsyncHandler,
  ResetPasswordDocument,
  comparePassType,
  User,
};
