import express from 'express';
import {
  getUserProfileById,
  uploadUserImage,
  getAllUsers,
  getSingleCustomerById,
  getAllCustomers,
  getAllAdmins,
  getSingleAdminById,
  changeAdminToCustomer,
} from '../controllers/user.controller';
import { verifyAccessToken } from '../middlewares/jwtAuth';
import upload from '../middlewares/multer';
import { permission } from '../middlewares/authorization';

const router = express.Router();

router.use(verifyAccessToken);
router.get('/profile', getUserProfileById);
router.post('/upload-user-image', upload.single('file'), uploadUserImage);

// ADMIN ROUTES
router.get(
  '/admin/single-customer/:customer_id',
  permission(['admin', 'super_admin']),
  getSingleCustomerById
);
router.get(
  '/all-customers',
  permission(['admin', 'super_admin']),
  getAllCustomers
);

// SUPER ADMIN ROUTES
router.get('/all-admins', permission(['super_admin']), getAllAdmins);
router.put(
  '/super-admin/remove-admin/:admin_id',
  permission(['super_admin']),
  changeAdminToCustomer
);
router.get(
  '/super-admin/single-admin/:admin_id',
  permission(['super_admin']),
  getSingleAdminById
);

// THIS ROUTE IS NOT YET WORKING
router.get('/all', permission(['super_admin']), getAllUsers);

export default router;
