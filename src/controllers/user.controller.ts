import { getUserDetailsById } from '../services/user.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getUserProfileById = catchErrors(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const profileDetails = await getUserDetailsById(user.userId);

  return res.status(200).json({
    message: 'Profile fetched successfully',
    status: 200,
    success: true,
    user: profileDetails,
  });
});

export { getUserProfileById };
