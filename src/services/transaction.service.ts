import { Request, Response } from 'express';
import {
  getAccountByAccountNumberOnly,
  getUserAccountByAccountNumber,
  updateAccountBalance,
  updateAccountBalances,
} from '../repository/account.repository';
import { findUserById } from '../repository/user.repository';
import { AppError } from '../utils/app.error';
import {
  paystackBankCodes,
  paystackCallBack,
  // paystackBankTransfer,
  payStackInitialized,
  paystackResult,
  paystackCreateTransferRecipient,
} from '../utils/paystack';
import {
  TransactionDetails,
  BankCreditType,
  ReceiverInfo,
  FundFlowTransferData,
} from '../constants/types';
import {
  getAllBanks,
  getSingleTransactionByTransactionIdAndUserId,
  getSingleTransactionsByAccountNumber,
  saveLocalBankTransferTransaction,
  userTransactionsDetails,
} from '../repository/transaction.repository';
import { getMonnifyAccessKey, initiateTransfer } from '../utils/monnify';
import { generateReferenceCode } from '../utils/codes';

const userAccountCredit = async (
  account_number: string,
  amount: string,
  user_id: string
) => {
  const userExist = await findUserById(user_id);

  console.log(amount);

  const user = userExist[0];

  if (!user) {
    throw new AppError('User not found', 404);
  }

  const accountExist = await getUserAccountByAccountNumber(
    userExist[0].id,
    account_number
  );

  if (!accountExist) {
    throw new AppError('Account not found', 404);
  }

  const transactionInfo = {
    amount,
    account_number,
    email: userExist[0].email,
    user_id: userExist[0].id,
  };

  const paystackResponse = await payStackInitialized(transactionInfo);

  // create the instance of transaction inside the transaction table for the transaction

  // console.log('RESPONSE:', paystackResponse)
  return paystackResponse;
};

const getUserTransactionsWithUserId = async (
  userId: string,
  page: number = 1,
  limit: number = 10,
  searchParams: string
): Promise<{ totalCount: number; transactions: TransactionDetails[] }> => {
  // calculate offset(skip)
  const offset = (page - 1) * limit;

  console.log('searchParams:', searchParams);
  console.log('service page:', page);
  console.log('service limit:', typeof limit);

  const transactionResponse = await userTransactionsDetails(
    userId,
    limit,
    offset,
    searchParams
  );

  return {
    totalCount: transactionResponse.totalCount, // or get it from the DB call
    transactions: transactionResponse.transactions,
  };
};

const getTransactionResponse = async (req: Request, res: Response) => {
  const response = await paystackResult(req, res);
  return response;
};

const getCallBackResponse = async (reference: string) => {
  const result = await paystackCallBack(reference);

  return result;
};

const bankAccountCredit = async ({
  paying_account_number,
  receiving_account_number,
  bank_name,
  amount,
  user_id,
  narration,
}: BankCreditType) => {
  const userExist = await findUserById(user_id);

  if (!userExist) {
    throw new AppError('User not found', 404);
  }

  const getPayingAccount = await getUserAccountByAccountNumber(
    user_id,
    paying_account_number
  );

  if (!getPayingAccount) {
    throw new AppError('Account not found', 404);
  }

  if (parseFloat(getPayingAccount.balance) < amount) {
    throw new AppError('Insufficient balance', 400);
  }

  const result = await getMonnifyAccessKey();

  const transferInitiation = await initiateTransfer(result.accessToken);

  // const result = getPayingAccount;
  // const result = await paystackBankTransfer({
  //   paying_account: getPayingAccount,
  //   receiving_account_number,
  //   bank_name,
  //   amount,
  //   user_id,
  //   narration,
  // });

  return result;
};

const getBankDetails = async () => {
  const result = await getAllBanks();

  if (!result) {
    throw new Error('Unable to get bank details from paystack');
  }

  return result;
};

const getSingleAccountTransactionsWithAccountNumber = async (
  account_number: string,
  page: number = 1,
  limit: number = 10,
  searchParams: string
): Promise<{
  transactions: TransactionDetails[];
  totalCount: number;
  completed_transactions: number;
  total_transactions: number;
}> => {
  // skip
  const offset = (page - 1) * limit;

  console.log('SERVICE accountNumber:', account_number);
  console.log('SERVICE limit:', limit);
  console.log('SERVICE offset:', offset);
  console.log('SERVICE searchParams:', searchParams);
  const results = await getSingleTransactionsByAccountNumber(
    account_number,
    limit,
    offset,
    searchParams
  );

  if (!results) {
    throw new AppError(
      'Unable to get transactions for this account. Account might not be available again.',
      400
    );
  }

  const { results: transactions, totalCount } = results;

  const length = transactions.length;
  const completed = transactions.filter(
    (result) => result.transaction_status === 'completed'
  ).length;

  const response = {
    transactions,
    totalCount,
    completed_transactions: completed,
    total_transactions: length,
  };

  return response;
};

type Receiver = {
  account_number: string;
  account_name: string;
  bank_code: string;
};

const transferMoneyRequest = async (
  user_id: string,
  receiverDetails: Receiver,
  receivingAccount: string,
  selectedAccountNumber: string,
  bankCode: string,
  narration: string,
  amount: string
) => {
  const response = await getUserAccountByAccountNumber(
    user_id,
    selectedAccountNumber
  );

  const parsedAmount = parseFloat(amount);
  const parsedBalance = parseFloat(response.balance);

  if (parsedAmount > parsedBalance) {
    throw new AppError('Insufficient balance.', 400);
  }

  const referenceCode = await generateReferenceCode(30);

  const data = {
    user_id: user_id,
    amount: amount,
    transaction_type: 'debit',
    transaction_date: new Date(),
    transaction_status: 'pending',
    description: narration,
    account_id: response.id,
    reference_number: referenceCode,
    receiving_account: receivingAccount,
    account_number: selectedAccountNumber,
    receiver_account_name: receiverDetails.account_name,
  };

  const saveTransactionData = await saveLocalBankTransferTransaction(data);

  if (!saveTransactionData) {
    throw new AppError('Could not make transaction', 400);
  }

  const accessToken = await getMonnifyAccessKey();

  if (!accessToken) {
    throw new Error('Could not get access token from Monnify');
  }

  const monnifyResponse = await initiateTransfer({
    accessToken,
    user_id,
    amount,
    narration,
    receiverDetails,
    destinationBankCode: bankCode,
    destinationAccountNumber: receivingAccount,
    reference: data.reference_number,
  });

  if (!monnifyResponse.data) {
    throw new Error(
      `Unable to complete transaction. Error coming from monnify: ${monnifyResponse}`
    );
  }
  console.log('SERVICE:', monnifyResponse.config.data);
  console.log('SERVICE:', monnifyResponse.data.responseBody);

  if (monnifyResponse.data.responseBody.status === 'SUCCESS') {
    // UPDATE THE TRANSACTION IN THE TRANSACTION TABLE

    const data = {
      monnifyResponse: {
        reference: monnifyResponse.data.responseBody.reference,
        amount: monnifyResponse.data.responseBody.amount,
        receiving_bank_name:
          monnifyResponse.data.responseBody.destinationBankName,
      },
      account_number: selectedAccountNumber,
    };
    const result = await updateAccountBalance(data);
    console.log('SERVICE:', result);
    return result;
  } else {
    console.log('Unable to process transaction');
    return;
  }

  // console.log('paystackResponse:', paystackResponse.data.data.details);
};

const getSingleUserTransaction = async (
  transaction_id: string,
  user_id: string
) => {
  const transaction = await getSingleTransactionByTransactionIdAndUserId(
    transaction_id,
    user_id
  );

  return transaction;
};

const fundFlowTransfer = async ({
  user_id,
  receiving_account_number,
  selected_account_number,
  amount,
  description,
}: FundFlowTransferData) => {
  const findAccount = await getUserAccountByAccountNumber(
    user_id,
    selected_account_number
  );
  if (!findAccount) {
    throw new AppError('Account not found', 401);
  }

  if (Number(findAccount.balance) < Number(amount)) {
    console.log('Insufficient funds');
    throw new AppError('Insufficient balance', 400);
  }

  const accountExist = await getAccountByAccountNumberOnly(
    receiving_account_number
  );

  if (!accountExist) {
    throw new AppError(
      'The account number you want to send money to does not exist',
      404
    );
  }

  const response = await updateAccountBalances({
    sender: findAccount,
    receiver: accountExist,
    amount: amount,
    description: description,
  });

  return response;
};

export {
  fundFlowTransfer,
  getSingleUserTransaction,
  transferMoneyRequest,
  getBankDetails,
  bankAccountCredit,
  getCallBackResponse,
  userAccountCredit,
  getTransactionResponse,
  getUserTransactionsWithUserId,
  getSingleAccountTransactionsWithAccountNumber,
};
