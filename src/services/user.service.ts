import { Request } from 'express';
import {
  findUserById,
  saveImageToDatabase,
} from '../repository/user.repository';
import { AppError } from '../utils/app.error';
import { PayloadWithoutPassword, UserInJwt } from '../constants/types';
import { cloudinaryDestroy, handleFileUpload } from '../utils/cloudinary';

const getUserDetailsById = async (user_id: string) => {
  const userDetails = await findUserById(user_id);
  const user = userDetails[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { password, ...others } = user;

  console.log(others);

  return others;
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

export { getUserDetailsById, userImageUpload };
