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
  balance: string;
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

type BankCreditType = {
  paying_account_number: string;
  receiving_account_number: string;
  bank_name: string;
  amount: number;
  user_id: string;
  narration: string;
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
  receiving_account?: string;
  receiving_account_number: string;
  receiver_account_name: string;
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

type MonnifyPendingStatus = {
  user_id: string;
  amount: string;
  receiver_account_name: string;
  transaction_type: string;
  transaction_date: Date;
  transaction_status: string;
  description: string;
  account_id: string;
  reference_number: string;
  receiving_account: string;
  account_number: string;
};

type MonnifyDataUpdate = {
  account_number: string;
  monnifyResponse: {
    reference: string;
    amount: string;
    receiving_bank_name: string;
  };
};

type TransactionResponse = {
  transaction: TransactionDetails;
  user: PayloadWithoutPassword;
};

type ReceiverInfo = {
  account_number: string;
  account_name: string;
  bank_id: number;
};

type BankDataReturnType = {
  id: string;
  bank_id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type BankDataType = {
  id: number;
  name: string;
  slug: string;
  code: string;
  longcode: string;
  pay_with_bank: boolean;
  supports_transfer: boolean;
  active: boolean;
  country: string;
  currency: string;
  type: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
};

type PaystackTransferInitialized = {
  active: boolean;
  createdAt: string;
  currency: string;
  description: string;
  domain: string;
  email: string;
  id: number;
  integration: number;
  metadata: {
    sender_id: string;
    amount: number;
    sender_account: string;
  };
  name: string;
  recipient_code: string;
  type: string;
  updatedAt: string;
  is_deleted: boolean;
  isDeleted: boolean;
  details: {
    authorization_code: string;
    account_number: string;
    account_name: string;
    bank_code: string;
    bank_name: string;
  };
};

type FundFlowTransferData = {
  user_id: string;
  receiving_account_number: string;
  selected_account_number: string;
  amount: string;
  description: string;
};

type UpdateTransferAccountType = {
  sender: AccountCreatedDetailsType;
  receiver: AccountCreatedDetailsType;
  amount: string;
  description: string;
};

type MonnifyTransferInitialization = {
  accessToken: string;
  user_id: string;
  amount: string;
  narration: string;
  receiverDetails: {
    account_number: string;
    bank_code: string;
  };
  destinationBankCode: string;
  destinationAccountNumber: string;
  reference: string;
};

export {
  MonnifyDataUpdate,
  MonnifyTransferInitialization,
  UpdateTransferAccountType,
  FundFlowTransferData,
  PaystackTransferInitialized,
  ReceiverInfo,
  BankDataReturnType,
  BankDataType,
  BankCreditType,
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
  MonnifyPendingStatus,
};
