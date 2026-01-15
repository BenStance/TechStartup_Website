import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { MailConfig } from '../../config/mail.config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: MailConfig.host,
      port: MailConfig.port,
      secure: MailConfig.secure,
      auth: {
        user: MailConfig.auth.user,
        pass: MailConfig.auth.pass,
      },
    });
  }

  async sendOTP(email: string, otp: string, subject: string = 'Your OTP Code'): Promise<void> {
    const mailOptions = {
      from: MailConfig.auth.user,
      to: email,
      subject: subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Origin Technologies</h2>
          <p>Your OTP code is:</p>
          <h1 style="background-color: #f0f0f0; padding: 20px; font-size: 36px; letter-spacing: 5px; text-align: center;">
            ${otp}
          </h1>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr>
          <p style="font-size: 12px; color: #999;">
            This is an automated message from Origin Technologies. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }

  async sendEmail(email: string, subject: string, text: string, html?: string): Promise<void> {
    const mailOptions = {
      from: MailConfig.auth.user,
      to: email,
      subject: subject,
      text: text,
      html: html || `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Origin Technologies</h2>
          <p>${text.replace(/\n/g, '<br>')}</p>
          <hr>
          <p style="font-size: 12px; color: #999;">
            This is an automated message from Origin Technologies. Please do not reply to this email.
          </p>
        </div>
      `,
    };

    await this.transporter.sendMail(mailOptions);
  }
}