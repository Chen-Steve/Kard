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

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { prompt, userId } = req.body;

  if (!prompt || !userId) {
    res.status(400).json({ error: 'Missing required fields' });
    return;
  }

  try {
    // console.log('Processing generation request for user:', userId);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that creates educational flashcards. Return the flashcards as a JSON array of objects with 'question' and 'answer' fields. Follow the exact number of flashcards requested in the prompt."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const generatedText = completion.choices[0].message?.content;
    
    // Check if we have a valid response
    if (!generatedText) {
      throw new Error('No response content from AI');
    }

    // console.log('Generated response:', generatedText);

    // Validate JSON format
    try {
      const parsedResponse = JSON.parse(generatedText);
      if (!Array.isArray(parsedResponse)) {
        throw new Error('Response is not an array');
      }
      res.status(200).json({ text: generatedText });
    } catch (e) {
      console.error('Invalid JSON response:', e);
      res.status(500).json({ error: 'Invalid response format from AI' });
    }
  } catch (error) {
    console.error('Error in generate endpoint:', error);
    res.status(500).json({ 
      error: error instanceof Error ? error.message : 'Failed to generate flashcards'
    });
  }
}