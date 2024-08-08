import { findUserByIdFunction } from '../middlewares/functions';

const getUserProfileService = async (user_id: string) => {
  const userDetails = await findUserByIdFunction(user_id);
  const user = userDetails[0];
  if (!user) {
    throw new Error('User not found');
  }

  const { password, ...others } = user;

  console.log(others);

  return others;
};

export { getUserProfileService };
