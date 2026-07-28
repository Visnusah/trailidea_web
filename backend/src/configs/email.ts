// src/config/email.ts
import nodemailer from 'nodemailer';
import { EMAIL_PASS, EMAIL_USER } from './constant';

export const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // true for port 465, prevents Render timeout issues
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS,
    },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
    const mailOptions = {
        from: `Trailidea <${EMAIL_USER}>`, // sender address
        to, // recipient address
        subject, // subject of the email
        html, // html body of the email
    };

    try {
        await transporter.sendMail(mailOptions);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendOTPEmail = async (to: string, otpCode: string) => {
    const subject = "Your Trailidea Verification Code";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #35775f; text-align: center;">Welcome to Trailidea!</h2>
        <p style="color: #4a5568; font-size: 16px;">Please use the following 6-digit code to verify your email address. This code will expire in 2 minutes.</p>
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1a202c;">${otpCode}</span>
        </div>
        <p style="color: #718096; font-size: 14px; text-align: center;">If you didn't request this code, you can safely ignore this email.</p>
    </div>
    `;
    await sendEmail(to, subject, html);
};

export const sendPasswordResetEmail = async (to: string, resetLink: string) => {
    const subject = "Reset Your Trailidea Password";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #35775f; text-align: center;">Reset Your Password</h2>
        <p style="color: #4a5568; font-size: 16px;">We received a request to reset the password for your Trailidea account. Click the button below to reset it. This link is valid for 15 minutes.</p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="${resetLink}" style="background-color: #35775f; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Reset Password</a>
        </div>
        <p style="color: #718096; font-size: 14px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    `;
    await sendEmail(to, subject, html);
};

export const sendPasswordResetOTPEmail = async (to: string, otpCode: string) => {
    const subject = "Reset Your Trailidea Password";
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #35775f; text-align: center;">Reset Your Password</h2>
        <p style="color: #4a5568; font-size: 16px;">Please use the following 6-digit code to reset your password. This code will expire in 5 minutes.</p>
        <div style="background-color: #f7fafc; padding: 20px; text-align: center; border-radius: 8px; margin: 20px 0;">
            <span style="font-size: 32px; font-weight: bold; letter-spacing: 4px; color: #1a202c;">${otpCode}</span>
        </div>
        <p style="color: #718096; font-size: 14px; text-align: center;">If you didn't request a password reset, you can safely ignore this email.</p>
    </div>
    `;
    await sendEmail(to, subject, html);
};