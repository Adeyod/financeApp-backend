// export type
export type comparePassType = {
  password: string;
  confirm_password: string;
};

export type Payload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
};
export type PayloadForLoginInput = Pick<Payload, 'email' | 'password'>;

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

export type PayloadWithoutPassword = Omit<UserDocument, 'password'>;

export type EmailVerificationDocument = {
  id: string;
  user_id: string;
  token: string;
  purpose: string;
  created_at: Date;
  expires_at: Date;
};

export type User = comparePassType & {
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
