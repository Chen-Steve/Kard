import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { id, email, password, avatarSeed } = req.body;

    if (!id || !email || !password || !avatarSeed) {
      res.status(400).json({ error: 'ID, email, password, and avatarSeed are required' });
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
          id,
          email,
          password: hashedPassword,
          avatarSeed,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Signup error:', error as Error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default signupHandler;