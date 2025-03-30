import { NextFunction, Request, Response } from 'express';
import { AppError } from '../utils/app.error';
import { knexConnect } from '../knex-db/knex';
import { UserDocument } from '../constants/types';

const permission = (
  requiredRoles: Array<'customer' | 'admin' | 'super_admin'>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        return next(new AppError('User not authenticated', 401));
      }

      const userId = req.user?.userId;
      const user = await knexConnect<UserDocument>('users')
        .select('*')
        .where('id', userId)
        .first();

      if (!user) {
        return next(new AppError('User not found', 404));
      }

      const hasRole = requiredRoles.includes(user.role);

      if (!hasRole) {
        return next(
          new AppError('You are not authorized to view this resource.', 403)
        );
      }
      next();
    } catch (error) {
      next(error);
    }
  };
};

export { permission };
