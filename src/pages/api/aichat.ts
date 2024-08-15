import { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { Message } from '../../lib/openai';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_HISTORY_LENGTH = 10;

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { message, flashcards, history } = req.body;

  if (!message || !flashcards || !history) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    const limitedHistory = history.slice(-MAX_HISTORY_LENGTH) as Message[];
    const messages: Message[] = [
      { role: "system", content: "You are a helpful assistant that discusses flashcards. Here are the flashcards:" + JSON.stringify(flashcards) },
      ...limitedHistory,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: messages,
    });

    const aiResponse = response.choices[0].message?.content || '';
    res.status(200).json({ text: aiResponse });
  } catch (error) {
    console.error('Error generating AI response:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error', details: 'An unknown error occurred' });
    }
  }
}