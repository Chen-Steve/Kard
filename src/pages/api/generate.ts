import { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';
import { checkAndUpdateIPUsage } from '@/utils/ipTracking';

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

// Add interface for the rate limit response
interface RateLimitResponse {
  canProceed: boolean;
  remainingAttempts: number;
}

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

  // Type assertion for the rate limit check
  const rateLimitCheck: RateLimitResponse = await checkAndUpdateIPUsage(userIp);
  if (!rateLimitCheck.canProceed) {
    res.status(429).json({ 
      error: 'Daily generation limit reached. Please try again tomorrow.',
      remainingAttempts: rateLimitCheck.remainingAttempts
    });
    return;
  }

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: Math.min(max_tokens, 4000),
    });

    const generatedText = response.choices[0].message.content;
    res.status(200).json({ 
      text: generatedText,
      remainingAttempts: rateLimitCheck.remainingAttempts
    });
  } catch (error) {
    console.error('Error generating text:', error);
    if (error instanceof Error) {
      res.status(500).json({ error: 'Internal Server Error', details: error.message });
    } else {
      res.status(500).json({ error: 'Internal Server Error', details: 'An unknown error occurred' });
    }
  }
}