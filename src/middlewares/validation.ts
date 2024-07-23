const forbiddenCharsRegex = /[|!{}()&=[\]===><>]/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex =
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/;

const validateField = (field: string, value?: string): string => {
  const trimmed = field.trim();
  if (!trimmed) {
    throw new Error(`${value} field is required`);
  }
  if (forbiddenCharsRegex.test(trimmed)) {
    throw new Error(`Forbidden characters at ${value}`);
  }
  return trimmed;
};

const validateEmail = (field: string): string => {
  const value = field.trim();
  if (!value) {
    throw new Error('Email field is required');
  }
  if (!emailRegex.test(value)) {
    throw new Error('Invalid input for Email field');
  }

  return value;
};

const validatePassword = (field: string, compare: string): string => {
  const trimmedField = field.trim();
  const trimmedCompare = compare.trim();
  if (!trimmedField || !trimmedCompare) {
    throw new Error('Password and confirm password fields are required');
  }

  if (!passwordRegex.test(trimmedField)) {
    throw new Error(
      'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters'
    );
  }

  if (trimmedCompare !== trimmedField) {
    throw new Error('Password and confirm password must be the same');
  }

  return trimmedField;
};

export { validateField, validateEmail, validatePassword };
