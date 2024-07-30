import type { NextApiRequest, NextApiResponse } from 'next'
import { MailerSend, EmailParams, Sender, Recipient } from "mailersend";

const apiKey = process.env.MAILERSEND_API_KEY;
if (!apiKey) {
  throw new Error('MAILERSEND_API_KEY is not defined');
}

const mailerSend = new MailerSend({
  apiKey: apiKey,
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    const { to, subject, text } = req.body;

    const sentFrom = new Sender("your@email.com", "Your Name");
    const recipients = [
      new Recipient(to)
    ];

    const emailParams = new EmailParams()
      .setFrom(sentFrom)
      .setTo(recipients)
      .setSubject(subject)
      .setText(text);

    try {
      await mailerSend.email.send(emailParams);
      res.status(200).json({ message: 'Email sent successfully' });
    } catch (error) {
      console.error('Error sending email:', error);
      res.status(500).json({ error: 'Failed to send email' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}