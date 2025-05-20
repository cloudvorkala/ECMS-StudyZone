import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter = nodemailer.createTransport({
    host: process.env.MAIL_HOST,
    port: Number(process.env.MAIL_PORT),
    auth: {
      user: process.env.MAIL_USER,
      pass: process.env.MAIL_PASS,
    },
  });

  async sendBookingUpdateNotification(to: string, booking: any) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Booking Updated',
      text: `Your booking with ${booking.mentorName} has been updated to ${booking.time}.`,
    });
  }

  async sendBookingCancellation(to: string, booking: any) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Booking Cancelled',
      text: `Your booking with ${booking.mentorName} has been cancelled.`,
    });
  }

  async sendConfirmationCode(to: string, code: string) {
    await this.transporter.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject: 'Confirmation Code',
      text: `Use this code to confirm your study session: ${code}`,
    });
  }

  private async sendMail(to: string, subject: string, text: string) {
    await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        text,
    });
  }

  async sendCancellationNotice(studentEmail: string, mentorEmail: string, date: Date, cancelledBy: string) {
  const formattedDate = new Date(date).toLocaleString();
  const subject = `Booking Cancelled on ${formattedDate}`;
  const message = `
    The booking scheduled for ${formattedDate} has been cancelled by ${cancelledBy}.
  `;

  await this.sendMail(studentEmail, subject, message);
  await this.sendMail(mentorEmail, subject, message);
}

}
