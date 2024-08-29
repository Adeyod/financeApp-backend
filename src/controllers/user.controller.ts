import { getUserProfileByIdService } from '../services/user.service';
import { AppError } from '../utils/app.error';
import catchError from '../utils/tryCatch';

const getUserProfileById = catchError(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  const profileDetails = await getUserProfileByIdService(user.userId);

  return res.status(200).json({
    message: 'Profile fetched successfully',
    status: 200,
    success: true,
    user: profileDetails,
  });
});

export { getUserProfileById };
