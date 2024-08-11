import { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

interface OpenAIRequest {
  prompt: string;
  max_tokens: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, max_tokens }: OpenAIRequest = req.body;

  if (!prompt || !max_tokens) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // Create a completion using the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens,
    });

    // Extract the generated text from the response
    const generatedText = response.choices[0].message.content;

    // Return the generated text as JSON
    res.status(200).json({ text: generatedText });
  } catch (error) {
    console.error('Error generating text:', error);

    // Type guard to check if error is an instance of Error
    if (error instanceof Error) {
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error', details: 'An unknown error occurred' });
    }
  }
}