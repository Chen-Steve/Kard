// src/pages/api/auth/signup.ts
import { NextApiRequest, NextApiResponse } from 'next';
import supabase from '../../../lib/supabaseClient';

const signupHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method === 'POST') {
    const { email, password } = req.body;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    res.status(201).json(data);
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
};

export default signupHandler;
