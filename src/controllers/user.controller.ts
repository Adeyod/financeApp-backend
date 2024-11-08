import { PayloadWithoutPassword } from '../constants/types';
import { createNotificationMessage } from '../repository/notifications';
import { getUserDetailsById, userImageUpload } from '../services/user.service';
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

const uploadUserImage = catchErrors(async (req, res) => {
  const user = req.user;

  console.log(user);
  console.log(req.file);

  if (!user) {
    throw new AppError('Unable to authenticate user', 401);
  }

  console.log('I want to upload image. Presently in the controller');

  const uploadImg = await userImageUpload(req, user, res);
  const { ...others } = uploadImg;
  console.log('USER: ', others);

  if (uploadImg) {
    const payload = {
      title: 'Image upload successful',
      message: `You have successfully uploaded an image to your profile.`,
      user_id: user.userId,
    };

    const newNotification = await createNotificationMessage(payload);
  }

  return res.status(200).json({
    message: 'Profile Image uploaded successfully',
    status: 200,
    success: true,
    user: others,
  });
});

export { getUserProfileById, uploadUserImage };

// upload user image added
