import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { createAvatar } from '@dicebear/core';
import { bottts } from '@dicebear/collection';

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { id, email, password } = req.body;

    if (!id || !email || !password) {
      res.status(400).json({ error: 'ID, email, and password are required' });
      return;
    }

    if (email.length > 255 || password.length > 255 || id.length > 255) {
      res.status(400).json({ error: 'ID, email, and password must be 255 characters or less' });
      return;
    }

    try {
      const existingUser = await prisma.user.findUnique({ where: { email } });
      if (existingUser) {
        res.status(400).json({ error: 'User already exists' });
        return;
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Generate avatar URL
      const avatar = createAvatar(bottts, {
        seed: email,
      });
      const avatarUri = await avatar.toDataUri(); // Use await here

      const user = await prisma.user.create({
        data: {
          id,
          email,
          password: hashedPassword,
          avatarUrl: avatarUri,
        },
      });

      res.status(201).json(user);
    } catch (error) {
      console.error('Signup error:', (error as Error).message);
      if ((error as Error).message.includes('does not exist in the current database')) {
        res.status(500).json({ error: 'Table not found', details: (error as Error).message });
      } else {
        res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
      }
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default signupHandler;
