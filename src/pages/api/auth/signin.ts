// src/pages/api/auth/signin.ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

const signinHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(200).json(data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default signinHandler;
