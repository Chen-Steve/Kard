import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';
import prisma from '../../../lib/prisma';

const callbackHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { query } = req;
  const { code } = query;

  if (!code || typeof code !== 'string') {
    return res.status(400).json({ error: 'No code provided' });
  }

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    console.error('Error exchanging code for session:', error.message);
    return res.status(500).json({ error: 'Error exchanging code for session' });
  }

  const user = data?.user;

  if (user) {
    const email = user.email;

    if (!email) {
      return res.status(400).json({ error: 'Email is undefined' });
    }

    try {
      // Check if the user already exists
      const existingUser = await prisma.user.findUnique({ where: { email } });

      if (!existingUser) {
        // Create new user in the database
        const newUser = await prisma.user.create({
          data: {
            id: user.id,
            email,
            avatarUrl: user.user_metadata?.avatar_url ?? '',
          },
        });
        console.log('New user created:', newUser);
      }

      // Redirect to dashboard or any other page
      res.redirect('/dashboard');
    } catch (dbError) {
      console.error('Database error:', dbError);
      res.status(500).json({ error: 'Database error' });
    }
  } else {
    res.status(401).json({ error: 'Unauthorized' });
  }
};

export default callbackHandler;
