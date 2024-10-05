import axios from 'axios';
import crypto from 'crypto';
import { Request, Response } from 'express';
import {
  creditUserAccountByUserIdAndAccountId,
  getUserAccountByAccountNumber,
} from '../repository/account.repository';
import {
  AccountCreatedDetailsType,
  DataType,
  TransactionDetails,
  TransactionType,
} from '../constants/types';
import {
  findTransactionByReference,
  findTransactionByReferenceAndStatus,
  saveInitializedTransaction,
  updateUserTransaction,
} from '../repository/transaction.repository';

const payStackInitialized = async (transactionInfo: TransactionType) => {
  const formattedAmount =
    parseInt(transactionInfo.amount.replace(/,/g, ''), 10) * 100;
  const paystackData = {
    email: transactionInfo.email,
    amount: formattedAmount,
    metadata: transactionInfo,
  };

  const response = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    paystackData,
    {
      headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_TEST_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
    }
  );

  const parsedData = JSON.parse(response.config.data);

  const amt = parseFloat(
    parsedData.metadata.amount.toString().replace(/,/g, '')
  );

  if (isNaN(amt)) {
    throw new Error('Invalid amount provided. Please provide a valid number');
  }

  const data = {
    status: response.data.status,
    message: response.data.message,
    reference: response.data.data.reference,
    user_id: parsedData.metadata.user_id,
    amount: amt,
    transaction_type: 'credit',
    transaction_status: 'pending',
    description: 'user credit account',
    account_number: parsedData.metadata.account_number,
  };

  const result = await saveInitializedTransaction(data);

  return { response, result };
};

const paystackCallBack = async (reference: string) => {
  try {
    const secret = process.env.PAYSTACK_TEST_SECRET_KEY || '';

    const headers = {
      Authorization: `Bearer ${secret}`,
    };

    const url = `https://api.paystack.co/transaction/verify/${reference}`;

    const paystackResponse = await axios(url, { headers });

    if (paystackResponse.data.data.status === 'success') {
      const data: DataType = {
        amount: paystackResponse.data.data.amount / 100,
        reference: paystackResponse.data.data.reference,
        account_number: paystackResponse.data.data.metadata.account_number,
        user_id: paystackResponse.data.data.metadata.user_id,
      };
      const getTransaction = await findTransactionByReferenceAndStatus(
        data.reference
      );

      let accountUpdate: AccountCreatedDetailsType[] = [];
      let transactionUpdate: TransactionDetails;

      if (getTransaction.length > 0) {
        transactionUpdate = await updateUserTransaction(data);

        console.log(transactionUpdate);
        // update the transactions and accounts tables

        accountUpdate = await creditUserAccountByUserIdAndAccountId({
          user_id: data.user_id,
          account_number: data.account_number,
          amount: data.amount,
        });

        console.log(accountUpdate);

        return { transactionUpdate, accountUpdate };
      } else {
        transactionUpdate = await findTransactionByReference(data.reference);
        const result = await getUserAccountByAccountNumber(
          data.user_id,
          data.account_number
        );

        accountUpdate = Array.isArray(result) ? result : [result];
        console.log('webhook has ran');
        return { transactionUpdate, accountUpdate };
      }
    }
  } catch (error) {
    console.log(error);
  }
};

const paystackResult = async (req: Request, res: Response) => {
  try {
    const secret = process.env.PAYSTACK_TEST_SECRET_KEY || '';
    const hash = crypto
      .createHmac('sha512', secret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    // console.log(hash, secret);

    if (hash == req.headers['x-paystack-signature']) {
      const event = req.body;
      // console.log('event:', event);
      if (event.event === 'charge.success') {
        console.log('transaction successful');
        // GET ACCOUNT USING ACCOUNT ID AND USER ID
        const {
          reference,
          status,
          created_at,
          metadata: { amount, account_number, user_id, email },
        } = event.data;

        const amt = parseFloat(amount.toString().replace(/,/g, ''));

        if (isNaN(amt)) {
          throw new Error(
            'Invalid amount provided. Please provide a valid number'
          );
        }

        // get the transaction and check if transaction_status is still pending. then update it to completed
        const getTransaction = await findTransactionByReferenceAndStatus(
          reference
        );

        if (getTransaction.length > 0) {
          const data = {
            amount: amt,
            reference: reference,
            account_number: account_number,
            user_id: user_id,
          };

          const transactionUpdate = await updateUserTransaction(data);

          // UPDATE THE ACCOUNT TO REFLECT THE AMOUNT CREDITED
          const result = await creditUserAccountByUserIdAndAccountId({
            amount: amt,
            account_number,
            user_id,
          });

          return { transactionUpdate, result };
        } else {
          const info = 'transaction already recorded';
          console.log(info);
          return info;
        }
      }
    }
  } catch (error) {
    console.log(error);
  }
};

export { payStackInitialized, paystackResult, paystackCallBack };
