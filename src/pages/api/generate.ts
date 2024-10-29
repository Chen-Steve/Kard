import { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

// Load environment variables from .env file
dotenv.config();

// Initialize OpenAI API client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory storage for user generations
const userGenerations: { [key: string]: { count: number; lastReset: number } } = {};

interface OpenAIRequest {
  prompt: string;
  max_tokens: number;
}

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, max_tokens }: OpenAIRequest = req.body;
  const userIp = Array.isArray(req.headers['x-forwarded-for']) 
    ? req.headers['x-forwarded-for'][0] 
    : req.headers['x-forwarded-for'] || req.socket.remoteAddress;

  if (!prompt || !max_tokens) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  if (!userIp) {
    res.status(500).json({ error: 'Unable to determine user identity' });
    return;
  }

  // Check for profanity
  if (matcher.hasMatch(prompt)) {
    res.status(400).json({ error: 'Your input contains inappropriate content. Please revise and try again.' });
    return;
  }

  const now = Date.now();
  const dayInMs = 24 * 60 * 60 * 1000;

  // Initialize or update the user's generation count
  if (typeof userIp === 'string' && !userGenerations[userIp]) {
    userGenerations[userIp] = { count: 0, lastReset: now };
  } else if (typeof userIp === 'string' && now - userGenerations[userIp].lastReset >= dayInMs) {
    // Reset the count after a day
    userGenerations[userIp] = { count: 0, lastReset: now };
  }

  // Check if the user has reached their daily limit
  if (userGenerations[userIp].count >= 5) {
    res.status(429).json({ error: 'Daily generation limit reached. Please try again tomorrow.' });
    return;
  }

  try {
    // Create a completion using the OpenAI API
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.min(max_tokens, 4000),
    });

    // Extract the generated text from the response
    const generatedText = response.choices[0].message.content;

    // Increment the user's generation count
    userGenerations[userIp].count += 1;

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