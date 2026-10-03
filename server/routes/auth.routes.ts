import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { prisma } from '../db';
import { sendError } from '../utils';
import { issueAuthToken } from '../auth/token';

const router = Router();

// Store OTPs temporarily in memory. In a real production app, this should be in Redis or DB.
const otpStore = new Map<string, { otp: string, expires: number }>();

import nodemailer from 'nodemailer';

// Configure a basic nodemailer transporter (user should configure their own for production)
const transporter = nodemailer.createTransport({
  service: 'gmail', // You can change this to your email provider
  auth: {
    user: process.env.EMAIL_USER || 'test@example.com',
    pass: process.env.EMAIL_PASS || 'password',
  },
});

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phone, role, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        fullName, 
        email, 
        phone, 
        role,
        password: hashedPassword
      }
    });
    const { password: _, ...userWithoutPassword } = user;
    res.status(201).json(userWithoutPassword);
  } catch (error: any) {
    if (error.code === 'P2002') return res.status(400).json({ error: 'Email already exists', success: false });
    sendError(res, error, 'Registration failed');
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    if (user.isActive === false) {
      return res.status(403).json({ error: 'This account has been deactivated. Please contact an administrator.' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid credentials' });

    const { password: _, ...userWithoutPassword } = user;
    const token = issueAuthToken(user.id, user.role);
    res.json({ ...userWithoutPassword, token });
  } catch (error) {
    sendError(res, error, 'Login failed');
  }
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Even if user doesn't exist, we send 200 to prevent email enumeration attacks
      return res.status(200).json({ success: true, message: 'If an account exists, an OTP will be sent.' });
    }

    // Generate 6 digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 10 * 60 * 1000; // 10 minutes

    otpStore.set(email, { otp, expires });

    // Send email
    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER || 'no-reply@pfamysuru.org',
        to: email,
        subject: 'Password Reset OTP - PFA Portal',
        text: `Your OTP for password reset is: ${otp}. It will expire in 10 minutes.`,
        html: `<p>Your OTP for password reset is: <b>${otp}</b></p><p>It will expire in 10 minutes.</p>`,
      });
      console.log(`OTP for ${email} is ${otp}`); // Helpful for local development
    } catch (emailError) {
      console.error("Failed to send email, you probably need to configure EMAIL_USER and EMAIL_PASS in .env", emailError);
      // In dev mode, we might still want to proceed so we can test the UI with the console.log output
    }

    res.status(200).json({ success: true, message: 'OTP sent to email.' });
  } catch (error) {
    sendError(res, error, 'Forgot password request failed');
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({ error: 'No OTP requested for this email.' });
    }

    if (Date.now() > record.expires) {
      otpStore.delete(email);
      return res.status(400).json({ error: 'OTP has expired.' });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP.' });
    }

    // Mark as verified for password reset step (optional, but good practice).
    // For simplicity, we just return success and let the client call reset-password next,
    // where they must provide the OTP again.
    res.status(200).json({ success: true, message: 'OTP verified successfully.' });
  } catch (error) {
    sendError(res, error, 'OTP verification failed');
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const record = otpStore.get(email);

    if (!record || record.otp !== otp || Date.now() > record.expires) {
      return res.status(400).json({ error: 'Invalid or expired OTP.' });
    }

    // Verify user
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(404).json({ error: 'User not found.' });

    // Hash new password and save
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    // Invalidate OTP
    otpStore.delete(email);

    res.status(200).json({ success: true, message: 'Password reset successful.' });
  } catch (error) {
    sendError(res, error, 'Password reset failed');
  }
});

export default router;
