import { Request } from 'express';
import {
  findUserById,
  findUserByIdFirst,
  findCustomerForAdmin,
  saveImageToDatabase,
  findAllUsers,
  findAllAdmins,
  findAllCustomers,
  findAdminForSuperAdmin,
  adminChangedToCustomer,
} from '../repository/user.repository';
import { AppError } from '../utils/app.error';
import { PayloadWithoutPassword, UserInJwt } from '../constants/types';
import { cloudinaryDestroy, handleFileUpload } from '../utils/cloudinary';

const getUserDetailsById = async (user_id: string) => {
  const userDetails = await findCustomerForAdmin(user_id);
  if (!userDetails.user) {
    throw new AppError('User not found', 404);
  }

  return userDetails;
};

const getAdminDetailsById = async (user_id: string) => {
  const userDetails = await findAdminForSuperAdmin(user_id);
  if (!userDetails.user) {
    throw new AppError('User not found', 404);
  }

  return userDetails;
};

const getAllUsersDetails = async () => {
  const users = await findAllUsers();

  if (!users || users.length === 0) {
    throw new AppError('User not found', 404);
  }

  const destructuredUsers = users.map(({ password, ...others }) => {
    return others;
  });

  return destructuredUsers;
};

const getAllCustomersDetails = async (
  page: number = 1,
  limit: number = 10,
  searchParams: string
) => {
  const offset = (page - 1) * limit;

  const users = await findAllCustomers(limit, offset, searchParams);

  if (!users) {
    throw new AppError('User not found', 404);
  }

  const destructuredUsers = users?.result.map(({ password, ...others }) => {
    return others;
  });

  return { totalCount: users.totalCount, customers: destructuredUsers };
};

const getAllAdminsDetails = async (
  page: number = 1,
  limit: number = 10,
  searchParams: string
) => {
  const offset = (page - 1) * limit;

  const users = await findAllAdmins(limit, offset, searchParams);

  if (!users) {
    throw new AppError('User not found', 404);
  }

  const destructuredUsers = users?.result.map(({ password, ...others }) => {
    return others;
  });

  return { totalCount: users.totalCount, admins: destructuredUsers };
};
const moveAdminToCustomer = async (admin_id: string) => {
  const response = await adminChangedToCustomer(admin_id);

  return response;
};

const userImageUpload = async (
  req: Request,
  user: UserInJwt,
  res: any
): Promise<PayloadWithoutPassword> => {
  const getUser = await findUserById(user.userId);

  if (!getUser) {
    throw new AppError('User not found', 404);
  }

  if (getUser[0].profile_image) {
    console.log(
      'There is profile image and i am deleting it from cloudinary before i proceed'
    );
    const deleteImage = await cloudinaryDestroy(
      getUser[0].profile_image.public_id
    );
  }

  const uploadImageToCloudinary = await handleFileUpload(req, res);
  console.log(uploadImageToCloudinary);

  if (!uploadImageToCloudinary) {
    console.error('Unable to upload image to cloudinary');
  }

  let imageData:
    | {
        url: string;
        public_id: string;
      }
    | undefined;
  if (Array.isArray(uploadImageToCloudinary)) {
    imageData = uploadImageToCloudinary[0];
  } else {
    imageData = uploadImageToCloudinary;
  }

  if (!imageData || !('url' in imageData) || !('public_id' in imageData)) {
    console.log('it is not a cloudinary upload');
    throw new Error('it is not a cloudinary upload');
  }

  const saveImage = await saveImageToDatabase(imageData, user.userId);

  return saveImage;
};

export {
  moveAdminToCustomer,
  getAdminDetailsById,
  getAllCustomersDetails,
  getUserDetailsById,
  userImageUpload,
  getAllUsersDetails,
  getAllAdminsDetails,
};
