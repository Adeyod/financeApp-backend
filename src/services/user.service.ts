import { findUserById } from '../repository/user.repository';
import { AppError } from '../utils/app.error';

const getUserProfileByIdService = async (user_id: string) => {
  const userDetails = await findUserById(user_id);
  const user = userDetails[0];
  if (!user) {
    throw new AppError('User not found', 404);
  }

  const { password, ...others } = user;

  console.log(others);

  return others;
};

export { getUserProfileByIdService };
