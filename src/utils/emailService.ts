import nodemailer from 'nodemailer';
import { env } from '../config/env';
import { formatDuration } from './timeFormat';

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_SECURE,
  auth: {
    user: env.SMTP_USER,
    pass: env.SMTP_PASSWORD,
  },
});

export const sendEnrollmentConfirmationEmail = async (
  email: string,
  courseName: string,
): Promise<void> => {
  const mailOptions = {
    from: env.SMTP_FROM,
    to: email,
    subject: 'Course Enrollment Confirmation',
    html: `
      <h1>Enrollment Confirmation</h1>
      <p>Congratulations! You have successfully enrolled in the course:</p>
      <h2>${courseName}</h2>
      <p>You can now access your course materials through your dashboard.</p>
      <p>Happy learning!</p>
    `,
  };

  await transporter.sendMail(mailOptions);
};
