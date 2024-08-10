import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import prisma from '../../../lib/prisma';
import { getMicahAvatarSvg } from '../../../utils/avatar';
import rateLimit from '../../../middleware/rateLimit';
import axios from 'axios';

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  console.log(`Received ${req.method} request at /api/auth/signup`);
  if (req.method === 'POST') {
    await rateLimit(req, res, () => {}); // Apply rate limiting
    const { id, email, password, name, hcaptchaToken } = req.body;

    if (!id || !email || !name || !hcaptchaToken) {
      res.status(400).json({ error: 'ID, email, name, and hCaptcha token are required' });
      return;
    }

    if (email.length > 255 || (password && password.length > 255) || id.length > 255 || name.length > 255) {
      res.status(400).json({ error: 'ID, email, password, and name must be 255 characters or less' });
      return;
    }

    // Verify hCaptcha token
    try {
      const hcaptchaResponse = await axios.post<{ success: boolean }>(
        `https://hcaptcha.com/siteverify`,
        {},
        {
          params: {
            secret: process.env.HCAPTCHA_SECRET_KEY,
            response: hcaptchaToken,
          },
        }
      );

      if (!hcaptchaResponse.data.success) {
        res.status(400).json({ error: 'Invalid hCaptcha token' });
        return;
      }
    } catch (error) {
      console.error('hCaptcha verification error:', error);
      res.status(500).json({ error: 'hCaptcha verification failed' });
      return;
    }

    try {
      const existingUser = await prisma.user.findFirst({
        where: {
          OR: [
            { email },
            { name }
          ]
        }
      });
      if (existingUser) {
        res.status(400).json({ error: 'User with this email or name already exists' });
        return;
      }

      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;

      // Generate Micah avatar SVG with email as seed
      const avatarSvg = getMicahAvatarSvg(email);

      const user = await prisma.user.create({
        data: {
          id,
          email,
          password: hashedPassword,
          name,
          avatarUrl: avatarSvg,
        },
      });

      console.log('User created in database:', user); // Add logging here
      res.status(201).json(user);
    } catch (error) {
      console.error('Signup error:', error as any); // Log the full error
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