import { createClient } from '@supabase/supabase-js'
import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

// Move this outside of the handler function
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.ZOHO_EMAIL,
    pass: process.env.ZOHO_PASSWORD,
  },
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ message: 'Email is required' });
  }

  try {
    console.log('Creating transporter...');
    const transporter = nodemailer.createTransport({
      host: 'smtp.zoho.com',
      port: 465,
      secure: true, // use SSL
      auth: {
        user: process.env.ZOHO_EMAIL,
        pass: process.env.ZOHO_PASSWORD,
      },
    });

    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('Transporter verified successfully');

    // Generate a password reset token without sending an email
    const { data, error } = await supabase.auth.admin.generateLink({
      type: 'recovery',
      email: email,
    });

    if (error) throw error;

    if (!data || !data.properties || !data.properties.action_link) {
      throw new Error('Failed to generate reset link');
    }

    const resetLink = `${process.env.NEXT_PUBLIC_SITE_URL}/reset-password?token=${data.properties.action_link.split('token=')[1]}&email=${encodeURIComponent(email)}`;

    // Log the generated link (remove this in production)
    console.log('Generated reset link:', resetLink);

    // Send email using nodemailer
    const mailOptions = {
      from: process.env.ZOHO_EMAIL,
      to: email,
      subject: 'Password Reset',
      text: `Click this link to reset your password: ${resetLink}`,
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password.</p>`,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent successfully. Message ID:', info.messageId);

    res.status(200).json({ message: 'Password reset email sent successfully' });
  } catch (error) {
    console.error('Error in forgot-password:', error);
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
    }
  }
}
