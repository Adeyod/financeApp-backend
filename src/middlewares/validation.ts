const forbiddenCharsRegex = /[|!{}()&=[\]===><>]/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneNumberPattern = /^\+\d{10,14}$/;

const passwordRegex =
  /^(?=.*[!@#$%^&*()_+{}\[\]:;<>,.?~\\/-])(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).{8,20}$/;

const validateField = (field: string, value?: string): string => {
  const trimmed = field.trim();
  if (!trimmed) {
    throw new Error(`${value} field is required`);
  }

  if (value === 'phone') {
    if (!phoneNumberPattern.test(trimmed)) {
      console.log(trimmed);
      throw new Error(`Invalid input at ${value} field`);
    }
  } else if (value === 'email') {
    if (!emailRegex.test(trimmed)) {
      throw new Error('Invalid input at Email field');
    }
  } else if (forbiddenCharsRegex.test(trimmed)) {
    throw new Error(`Invalid input at ${value} field`);
  }
  return trimmed;
};

const validatePassword = (
  field: string,
  compare?: string,
  purpose: 'registration' | 'login' = 'registration'
): string => {
  const trimmedField = field.trim();

  if (purpose === 'registration') {
    const trimmedCompare = compare?.trim();
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
  } else if (purpose === 'login') {
    if (!trimmedField) {
      throw new Error('Password field is required');
    }
    if (!passwordRegex.test(trimmedField)) {
      throw new Error(
        'Password must contain at least 1 special character, 1 lowercase letter, and 1 uppercase letter. Also it must be minimum of 8 characters and maximum of 20 characters'
      );
    }
  } else {
    throw new Error('Invalid validation purpose');
  }

  return trimmedField;
};

export { validateField, validatePassword };
