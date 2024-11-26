import { Job, Queue, Worker } from 'bullmq';
import { Redis, RedisOptions } from 'ioredis';
import {
  sendEmailVerification,
  sendMobileEmailVerification,
  sendPasswordReset,
  sendPasswordResetMobile,
} from './nodemailer';
import { EmailJobData } from '../constants/types';
// import { BullMQAdapter } from '@bull-board/bullmqAdapter';
// import { createBullBoard } from 'bull-board';
import { createBullBoard } from '@bull-board/api';
// import { BullMQAdapter } from '@bull-board/api/bullmqAdapter';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';

// Redis connection options
const redisOptions: RedisOptions = {
  // host: '127.0.0.1',
  host: 'localhost',
  port: 6379,
  maxRetriesPerRequest: null,
};

// Create a redis connection
const connection = new Redis(redisOptions);

// Create a new queue
const queue = new Queue('emailQueue', { connection });

// Define a worker to process jobs in the queue
const worker = new Worker<EmailJobData>(
  'emailQueue',
  async (job: Job<EmailJobData>) => {
    const { email, first_name, link, type, device } = job.data;
    if (type === 'email-verification') {
      if (device === 'mobile-fund-flow') {
        const sendEmail = await sendMobileEmailVerification({
          email,
          first_name,
          token: Number(link),
        });

        console.log(`Email sent to ${email}`);
        console.log('sendEmail from bullmq:', sendEmail);
        return sendEmail;
      } else {
        const sendEmail = await sendEmailVerification({
          email,
          first_name,
          link,
        });

        console.log(`Email sent to ${email}`);
        console.log('sendEmail from bullmq:', sendEmail);
        return sendEmail;
      }
    } else if (type === 'forgot-password') {
      if (device === 'mobile-fund-flow') {
        const sendEmail = await sendPasswordResetMobile({
          email,
          first_name,
          token: Number(link),
        });

        console.log(`Email sent to ${email}`);
        console.log('sendEmail from bullmq:', sendEmail);
        return sendEmail;
      } else {
        const sendEmail = await sendPasswordReset({
          first_name,
          email,
          link,
        });

        console.log(`Email sent to ${email}`);
        console.log('sendEmail from bullmq:', sendEmail);
        return sendEmail;
      }
    }
  },
  { connection }
);

worker.on('completed', (job) => {
  console.log(`Job ${job.id} has been completed`);
});

worker.on('failed', (job: Job<EmailJobData> | undefined, err: Error) => {
  if (job) {
    console.error(`Job ${job.id} failed with error: ${err.message}`);
  } else {
    console.error(`Failed to process job due to error: ${err.message}`);
  }
});

const serverAdapter = new ExpressAdapter();
createBullBoard({
  queues: [new BullMQAdapter(queue)],
  serverAdapter,
});

serverAdapter.setBasePath('/bull-board');

// const { router } = createBullBoard([new BullMQAdapter(queue)]);

export { queue, worker, serverAdapter };
