import { Job, Queue, Worker } from 'bullmq';
import { Redis, RedisOptions } from 'ioredis';
import { sendEmailVerification, sendPasswordReset } from './nodemailer';
import { EmailJobData } from '../constants/types';
import { createBullBoard } from 'bull-board';
import { BullMQAdapter } from 'bull-board/bullmqAdapter';

// Redis connection options
const redisOptions: RedisOptions = {
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
    const { email, first_name, link, type } = job.data;
    if (type === 'email-verification') {
      const sendEmail = await sendEmailVerification({
        email,
        first_name,
        link,
      });

      console.log(`Email sent to ${email}`);
      console.log('sendEmail from bullmq:', sendEmail);
      return sendEmail;
    } else if (type === 'forgot-password') {
      const sendEmail = await sendPasswordReset({
        first_name,
        email,
        link,
      });

      console.log(`Email sent to ${email}`);
      console.log('sendEmail from bullmq:', sendEmail);
      return sendEmail;
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

const { router } = createBullBoard([new BullMQAdapter(queue)]);

export { queue, worker, router };
