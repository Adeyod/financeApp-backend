// export type
export type comparePassType = {
  password: string;
  confirm_password: string;
};

export type TokenSearchType = {
  user_id: string;
  purpose: string;
  token?: string;
};

export type DeleteTokenType = {
  user_id: string;
  purpose: string;
  id?: string;
};

export type AccountCreationType = {
  user_id: string;
  accountNumber: string;
};

export type AccountCreatedDetailsType = {
  id: string;
  user_id: string;
  account_number: string;
  balance: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
};

export type UserWithAccountType = {
  userData: UserDocument;
  account: AccountCreatedDetailsType;
};

export type Payload = {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
};
export type PayloadForLoginInput = {
  loginInput: string;
  password: string;
};

export type UserDocument = Payload & {
  id: string;
  created_at: string;
  is_verified: boolean;
  updated_at: string;
  two_fa_enabled: boolean;
  biometric_enabled: boolean;
};

export type VerificationQuery = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: string;
  expires_at: string;
};

export type VerificationParams = Pick<
  VerificationQuery,
  'user_id' | 'token' | 'purpose' | 'expires_at'
>;

export type PayloadWithoutPassword = Omit<UserDocument, 'password'>;

export type LoginParams = PayloadWithoutPassword & {
  access_token: string;
};

export type EmailVerificationDocument = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: Date;
  expires_at: Date;
};

export type User = comparePassType & {
  user_name: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
};

export type ResetPasswordDocument = {
  user_id: string;
  token: string;
  password: string;
};
