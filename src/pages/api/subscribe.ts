import type { NextApiRequest, NextApiResponse } from 'next';
import nodemailer from 'nodemailer';

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

    console.log('Sending confirmation email...');
    await transporter.sendMail({
      from: process.env.ZOHO_EMAIL,
      to: email,
      subject: 'Welcome to Kard Updates',
      text: 'Thank you for subscribing to Kard updates!',
      html: '<p>Thank you for subscribing to Kard updates!</p>',
    });
    console.log('Confirmation email sent successfully');

    res.status(200).json({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Subscription error:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Subscription failed', error: (error as Error).message });
  }
}