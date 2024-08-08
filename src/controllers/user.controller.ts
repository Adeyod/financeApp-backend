import { getUserProfileService } from '../services/user.service';
import catchError from '../utils/tryCatch';

const getUserProfile = catchError(async (req, res) => {
  const user = req.user;
  const { user_id } = req.params;
  if (!user) {
    throw new Error('Unable to authenticate user');
  }

  if (user_id !== user.userId) {
    throw new Error('You can only get your profile');
  }

  const profileDetails = await getUserProfileService(user_id);

  return res.status(200).json({
    message: 'Profile fetched successfully',
    status: 200,
    success: true,
    user: profileDetails,
  });
});

export { getUserProfile };
