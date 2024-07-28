// src/pages/api/auth/signin.ts
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';
import { signIn } from 'next-auth/react';

const prisma = new PrismaClient();

const signinHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    // Check if user exists
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(400).json({ error: 'No user found with this email' });
      return;
    }

    // Check if password is correct
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      res.status(401).json({ error: 'Invalid password' });
      return;
    }

    // Create a session
    await signIn('credentials', {
      redirect: false,
      email: user.email,
      password,
    });

    res.status(200).json({ message: 'Sign in successful' });
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default signinHandler;
