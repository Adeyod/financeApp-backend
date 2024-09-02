import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';

import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import accountRoutes from './routes/account.route';
import { router } from './utils/queue';

dotenv.config();
const app = express();

const port = process.env.SERVER_PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/admin/queues', router);
app.use(errorHandler);

app.listen(port, () => {
  console.log(`Bull Board is running at http://localhost:${port}/admin/queues`);
  console.log(`Server listening on port ${port}`);
});
