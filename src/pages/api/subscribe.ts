import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    // Check if the email already exists
    const { data: existingSubscription, error: checkError } = await supabase
      .from('newsletter_subscriptions')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      // PGRST116 means no rows returned, which is fine
      throw checkError;
    }

    if (existingSubscription) {
      return res.status(400).json({ message: 'Already signed up!' });
    }

    // Insert the email into the 'newsletter_subscriptions' table
    const { data, error } = await supabase
      .from('newsletter_subscriptions')
      .insert({ email })
      .select();

    if (error) throw error;

    console.log('Subscription added:', data);

    res.status(200).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Subscription error:', error);
    res.status(500).json({ message: 'Subscription failed', error: (error as Error).message });
  }
}
