import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { verifyHcaptcha } from '../../../utils/verifyHcaptcha';

const prisma = new PrismaClient();

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password, recaptchaToken } = req.body;

    if (!email || !password || !recaptchaToken) {
      res.status(400).json({ error: 'Email, password, and hCaptcha token are required' });
      return;
    }

    const isRecaptchaValid = await verifyHcaptcha(recaptchaToken);
    if (!isRecaptchaValid) {
      res.status(400).json({ error: 'Invalid hCaptcha token' });
      return;
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          email,
          password: hashedPassword,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Signup error:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default signupHandler;
