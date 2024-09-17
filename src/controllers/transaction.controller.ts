import catchErrors from '../utils/tryCatch';

const getAllUserTransactions = catchErrors(async (req, res) => {
  const { userId } = req.body;
  return res.status(200).json({
    message: 'Successful',
    userId,
  });
});
const getUserSingleAccountTransactions = catchErrors(async (req, res) => {});

export { getAllUserTransactions, getUserSingleAccountTransactions };
