import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { verifyHcaptcha } from '../../../utils/verifyHcaptcha';

const prisma = new PrismaClient();

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password, recaptchaToken } = req.body;

  if (!email || !password || !recaptchaToken) {
    return res.status(400).json({ error: 'Email, password, and hCaptcha token are required' });
  }

  try {
    console.log('Verifying hCaptcha token...');
    const isRecaptchaValid = await verifyHcaptcha(recaptchaToken);
    console.log('hCaptcha verification result:', isRecaptchaValid);

    if (!isRecaptchaValid) {
      return res.status(400).json({ error: 'Invalid hCaptcha token' });
    }

    console.log('Checking if user already exists...');
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    console.log('Hashing password...');
    const hashedPassword = await bcrypt.hash(password, 10);

    console.log('Creating new user...');
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
      },
    });

    console.log('User created successfully:', user);
    return res.status(201).json(user);
  } catch (error) {
    console.error('Signup error:', error);
    return res.status(500).json({ error: 'Internal Server Error' });
  } finally {
    await prisma.$disconnect();
  }
};

export default signupHandler;