import { GenerateCodeType } from '../constants/types';
import crypto from 'crypto';

const generateRandomCode = (num: number) => {
  if (num < 1) {
    throw new Error('Number of digits must be at least 1');
  }

  const min = Math.pow(10, num - 1);
  const max = Math.pow(10, num) - 1;

  const randomNum = Math.floor(min + Math.random() * (max - min + 1));
  return randomNum;
};

const generateCode = async ({
  first_name,
  last_name,
  num,
}: GenerateCodeType): Promise<string> => {
  let code;

  const firstValue = first_name.charAt(0);
  const lastValue = last_name.charAt(0);

  const uniqueId = generateRandomCode(num);
  code = `${uniqueId}-${firstValue}${lastValue}`;

  return code;
};

const generateReferenceCode = async (num: number) => {
  const result = crypto.randomBytes(num).toString('hex').slice(0, num);
  const timestamp = Date.now(); // Add a timestamp to make the code unique
  const response = `ffw-${result}-${timestamp}`;
  return response;
};

// const generateReferenceCode = async (num: number) => {
//   const result = crypto.randomBytes(num).toString('hex').slice(0, num);
//   const response = `ffw-${result}`;
//   return response;
// };

export { generateCode, generateRandomCode, generateReferenceCode };
