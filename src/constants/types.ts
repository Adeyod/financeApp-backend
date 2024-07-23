export type Payload = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  password: string;
};

export type PayloadWithoutPassword = Omit<Payload, 'password'>;

export type UserDocument = PayloadWithoutPassword & {
  id: number;
  created_at: string;
  is_verified: boolean;
  updated_at: string;
  two_fa_enabled: boolean;
  biometric_enabled: boolean;
};
