import { NextFunction, Request, Response } from 'express';

type UserInJwt = {
  userId: string;
  userEmail: string;
  iat: number;
  exp: number;
};

type GenerateCodeType = {
  first_name: string;
  last_name: string;
  num: number;
};

declare global {
  namespace Express {
    interface Request {
      user?: UserInJwt;
    }
  }
}

type ComparePassType = {
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
  login_input: string;
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
  profile_image?: {
    url: string;
    public_id: string;
  };
};

type VerificationQuery = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: string;
  expires_at: string;
};

type TransactionType = {
  amount: string;
  account_number: string;
  email: string;
  user_id: string;
};

type DataType = {
  amount: number;
  reference: string;
  account_number: string;
  user_id: string;
};

type VerificationParams = Pick<
  VerificationQuery,
  'user_id' | 'token' | 'purpose' | 'expires_at'
>;

type PayloadWithoutPassword = Omit<UserDocument, 'password'>;

type LoginParams = PayloadWithoutPassword & {
  access: string;
  token: string;
};

type EmailVerificationDocument = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: Date;
  expires_at: Date;
};

type User = ComparePassType & {
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

type ChangePasswordType = {
  reqId: string;
  currentPassword: string;
  newPassword: string;
};

type EmailType = {
  email: string;
  first_name: string;
  link: string;
};

type EmailJobData = {
  email: string;
  first_name: string;
  link: string;
  type: 'email-verification' | 'forgot-password';
};

type AccountCredit = {
  user_id: string;
  account_number: string;
  amount: number;
};

type TransactionDetails = {
  id: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  transaction_date: Date;
  transaction_status: string;
  description: string;
  account_number: string;
  account_id: string;
  reference_number: string;
  created_at: string;
  updated_at: string;
  transaction_source: string;
};

type InitializationType = {
  status: boolean;
  message: string;
  reference: string;
  user_id: string;
  amount: number;
  transaction_type: string;
  transaction_status: string;
  description: string;
  account_number: string;
};

type TransactionResponse = {
  transaction: TransactionDetails;
  user: PayloadWithoutPassword;
};

export {
  TransactionResponse,
  InitializationType,
  AccountCredit,
  TransactionDetails,
  EmailJobData,
  EmailType,
  ChangePasswordType,
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
  ComparePassType,
  User,
  GenerateCodeType,
  TransactionType,
  DataType,
};
