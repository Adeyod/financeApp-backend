import { AsyncHandler } from '../constants/types';

const catchError =
  (controller: AsyncHandler): AsyncHandler =>
  async (req, res, next) => {
    try {
      await controller(req, res, next);
    } catch (error) {
      next(error);
    }
  };

export default catchError;
