import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { id, email, password } = req.body;

    if (!id || !email || !password) {
      res.status(400).json({ error: 'ID, email, and password are required' });
      return;
    }

    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      // Hash the password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Create the user with Supabase ID
      const user = await prisma.user.create({
        data: {
          id,
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
