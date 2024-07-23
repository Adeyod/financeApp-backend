import nodemailer from 'nodemailer';
import ejs from 'ejs';
import fs from 'fs';
import path from 'path';
import {
  NODEMAILER_PORT,
  NODEMAILER_HOST,
  NODEMAILER_PASS,
  NODEMAILER_SECURE,
  NODEMAILER_USER,
} from '../constants/env';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

import catchError from './tryCatch';

type EmailType = {
  email: string;
  first_name: string;
  link: string;
};

const getMailTemplate = (filePath: string, data: {}) => {
  const templatePath = path.join(__dirname, './templates', filePath);
  const template = fs.readFileSync(templatePath, 'utf8');
  return ejs.render(template, data);
};

const transporter = nodemailer.createTransport({
  host: NODEMAILER_HOST,
  port: NODEMAILER_PORT,
  secure: NODEMAILER_SECURE,
  tls: {
    rejectUnauthorized: false,
  },
  auth: {
    user: NODEMAILER_USER,
    pass: NODEMAILER_PASS,
  },
} as SMTPTransport.Options);

const sendEmailVerification = async ({
  email,
  first_name,
  link,
}: EmailType) => {
  const emailVerificationContent = getMailTemplate('emailTemplate.ejs', {
    first_name,
    link,
  });
  const info = await transporter.sendMail({
    from: NODEMAILER_USER,
    to: email,
    subject: 'Email verification',
    html: emailVerificationContent,
  });

  return info;
};

export { sendEmailVerification };
