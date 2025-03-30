import { PayloadWithoutPassword } from '../constants/types';
import { createNotificationMessage } from '../repository/notifications';
import {
  getUserDetailsById,
  userImageUpload,
  getAllUsersDetails,
  getAllCustomersDetails,
  getAllAdminsDetails,
  getAdminDetailsById,
  moveAdminToCustomer,
} from '../services/user.service';
import { AppError } from '../utils/app.error';
import catchErrors from '../utils/tryCatch';

const getUserProfileById = catchErrors(async (req, res) => {
  const user = req.user;

  console.log('user:', user);

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

const getSingleCustomerById = catchErrors(async (req, res) => {
  const { customer_id } = req.params;

  const response = await getUserDetailsById(customer_id);

  console.log('response', response);
  if (response) {
    return res.status(200).json({
      message: 'User fetched successfully',
      success: true,
      user: response,
    });
  }
});

const getSingleAdminById = catchErrors(async (req, res) => {
  const { admin_id } = req.params;

  const response = await getAdminDetailsById(admin_id);

  console.log('response', response);
  if (response) {
    return res.status(200).json({
      message: 'User fetched successfully',
      success: true,
      user: response,
    });
  }
});

const getAllUsers = catchErrors(async (req, res) => {
  const userId = req?.user?.userId;
  const response = await getAllUsersDetails();

  const removeCurrentUser = response.filter((user) => user.id !== userId);

  return res.status(200).json({
    message: 'User fetched successfully',
    success: true,
    user: removeCurrentUser,
  });
});

const getAllAdmins = catchErrors(async (req, res) => {
  console.log('i an running here');
  const { page, limit, searchParams } = req.query;

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const response = await getAllAdminsDetails(
    Number(page),
    Number(limit),
    searchQuery
  );

  return res.status(200).json({
    message: 'Admins fetched successfully',
    success: true,
    customers: response,
  });
});

const changeAdminToCustomer = catchErrors(async (req, res) => {
  console.log('i an running here');
  const { admin_id } = req.params;

  const response = await moveAdminToCustomer(admin_id);

  console.log(response);

  return res.status(200).json({
    message: 'Admin removed successfully',
    success: true,
    customer: response,
  });
});

const getAllCustomers = catchErrors(async (req, res) => {
  const { page, limit, searchParams } = req.query;

  const searchQuery = typeof searchParams === 'string' ? searchParams : '';

  const response = await getAllCustomersDetails(
    Number(page),
    Number(limit),
    searchQuery
  );

  return res.status(200).json({
    message: 'Customers fetched successfully',
    success: true,
    customers: response,
  });
});

export {
  changeAdminToCustomer,
  getSingleAdminById,
  getAllCustomers,
  getAllAdmins,
  getUserProfileById,
  uploadUserImage,
  getAllUsers,
  getSingleCustomerById,
};

// upload user image added
