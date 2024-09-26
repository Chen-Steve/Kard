import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Move this outside of the handler function
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
    console.log('Initiating password reset for email:', email);

    // Generate a password reset token using Supabase
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
      options: {
        redirectTo: `${baseUrl}/reset-password`,
      },
    });

    console.log('Supabase generateLink response:', { data, error });

    if (error) {
      console.error('Error generating reset link:', error);
      throw error;
    }

    if (!data || !data.properties || !data.properties.action_link) {
      throw new Error('Failed to generate reset link');
    }

    const resetLink = data.properties.action_link;

    // Create Nodemailer transporter using Zoho SMTP
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true,
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    // Send the password reset email
    const info = await transporter.sendMail({
      from: process.env.ZOHO_EMAIL,
      to: email,
      subject: 'Reset Your Password',
      text: `Please click on the following link to reset your password: ${resetLink}`,
      html: `<p>Please click on the following link to reset your password:</p><p><a href="${resetLink}">${resetLink}</a></p>`,
    });

    console.log('Password reset email sent successfully. Message ID:', info.messageId);
    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({ message: 'Failed to send password reset email', error: error instanceof Error ? error.message : String(error) });
  }
}