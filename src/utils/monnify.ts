import axios from 'axios';
import dotenv from 'dotenv';
import { generateRandomCode, generateReferenceCode } from './codes';
import { MonnifyTransferInitialization } from '../constants/types';
dotenv.config();

const monnify_api_key = process.env.MONNIFY_API_KEY;
const monnify_secret_key = process.env.MONNIFY_SECRET_KEY;
const monnify_base_url = process.env.MONNIFY_BASE_URL;

const getMonnifyAccessKey = async () => {
  const authString = `${monnify_api_key}:${monnify_secret_key}`;
  const base64AuthString = Buffer.from(authString).toString('base64');
  try {
    const response = await axios.post(
      `${monnify_base_url}/api/v1/auth/login`,
      {},
      {
        headers: {
          Authorization: `Basic ${base64AuthString}`,
        },
      }
    );

    console.log('ACCESS TOKEN:', response.data.responseBody.accessToken);

    if (response.data.responseBody.accessToken) {
      return response.data.responseBody.accessToken;
    } else {
      throw new Error('Unable to get access token from monnify');
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

const initiateTransfer = async ({
  accessToken,
  user_id,
  amount,
  narration,
  receiverDetails,
  destinationBankCode,
  destinationAccountNumber,
  reference,
}: MonnifyTransferInitialization) => {
  try {
    const metadata = {
      receiverDetails: receiverDetails,
      senderDetails: {
        user_id: user_id,
      },
    };
    const account = process.env.MONNIFY_SOURCE_ACCOUNT_NUMBER;
    const transferDetails = {
      // name: name,
      amount,
      reference: reference,
      narration,
      destinationBankCode,
      destinationAccountNumber,
      sourceAccountNumber: account,
      currency: 'NGN',
      metadata,
    };

    const response = await axios.post(
      `${monnify_base_url}/api/v2/disbursements/single`,

      transferDetails,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    console.log('MONNIFY INITIALIZATION', response);

    if (!response) {
      throw new Error('Transaction is not successful as monnify throw error');
    } else {
      return response;
    }
  } catch (error) {
    console.error(error);
    throw error;
  }
};

// const validateOtp = async (reference,
//   otp,
//   accessToken) => {
//   /**
//    * TO RUN THIS ENDPOINT
//    * reference needed(coming from reference for the particular transaction)
//    * accessToken needed(this is the access token generated for the transaction initialization)
//    * OTP needed(this is the OTP sent to my email address by Monnify)
//    */
//   try {

//     // console.log('validation', accessToken);
//     // const otp = '960505';
//     const transferDetails = {
//       reference: reference,
//       authorizationCode: otp,
//     };

//     const response = await axios.post(
//       `${monnify_base_url}/api/v2/disbursements/single/validate-otp`,
//       transferDetails,
//       {
//         headers: {
//           Authorization: `Bearer ${accessToken}`,
//         },
//       }
//     );

//     console.log('VALIDATION:', response);

//     return response;
//   } catch (error) {
//     console.error(error);
//     throw new Error('Error: ');
//   }
// };

export { getMonnifyAccessKey, initiateTransfer };
