import express from 'express';
import cors, { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import helmet from 'helmet';
import cron from 'node-cron';
// import ngrok from '@ngrok/ngrok';

import { errorHandler } from './middlewares/errorHandler';
import authRoutes from './routes/auth.route';
import userRoutes from './routes/user.route';
import accountRoutes from './routes/account.route';
import notificationRoutes from './routes/notification.route';
import transactionRoutes from './routes/transaction.route';
import { serverAdapter } from './utils/queue';
import authenticateCustomHeader from './middlewares/customHeader';

dotenv.config();
const app = express();

const port = process.env.SERVER_PORT || 3000;

const allowedOrigins: string[] = [
  process.env.FRONTEND_URL || '',
  process.env.MOBILE_URL || '',
  'https://financeapp-web.onrender.com',
];

const corsOptions: CorsOptions = {
  origin: (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Access Not allowed by CORS'));
    }
  },
  credentials: true,
};

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(helmet());
app.use(authenticateCustomHeader);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/accounts', accountRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/admin/queues', serverAdapter.getRouter());
app.use(errorHandler);

app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the server side of the FundFlow FinTech application',
    status: 200,
    success: true,
  });
});

const header = {
  'Content-Type': 'application/json',
  'x-fund-flow': 'web-fund-flow',
};

cron.schedule('*/30 * * * *', async () => {
  console.log('API is running');
  try {
    const response = await fetch(
      'https://financeapp-backend-atuh.onrender.com/api',
      {
        headers: header,
      }
    );

    console.log(response);

    if (response.ok) {
      const data = await response.json();
      console.log(`Backend API call successful:`);
      console.log(data.message);
    } else {
      console.error(`Unexpected status code`);
    }
  } catch (error) {
    console.log(error);
  }
});

app.listen(port, () => {
  console.log(`Bull Board is running at http://localhost:${port}/admin/queues`);
  console.log(`Server listening on port ${port}`);
});

// ngrok
//   .connect({ addr: port, authtoken: process.env.NGROK_AUTHTOKEN || '' })
//   .then((listener) => console.log(`Ingress established at: ${listener.url()}`))
//   .catch((error) => {
//     console.error(error);
//   });
