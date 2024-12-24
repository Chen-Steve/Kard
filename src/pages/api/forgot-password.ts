import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Check required environment variables
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SECRET_ROLE_KEY) {
    console.error('Missing required Supabase credentials');
    return res.status(500).json({ 
      message: 'Server configuration error',
      error: 'Missing Supabase credentials'
    });
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.error('Missing NEXT_PUBLIC_SITE_URL environment variable');
    return res.status(500).json({ 
      message: 'Server configuration error',
      error: 'Missing site URL configuration'
    });
  }

  // Initialize Supabase client
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SECRET_ROLE_KEY
  );

  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  // Basic email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ message: 'Invalid email format' });
  }

  try {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password`,
    });

    if (error) {
      console.error('Supabase error:', error);
      return res.status(400).json({ 
        message: 'Failed to send reset password email',
        error: error.message 
      });
    }

    return res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    return res.status(500).json({ 
      message: 'An unexpected error occurred',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}
