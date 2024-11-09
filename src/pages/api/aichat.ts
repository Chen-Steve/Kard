import { VercelRequest, VercelResponse } from '@vercel/node';
import * as dotenv from 'dotenv';
import OpenAI from 'openai';
import { Message } from '../../lib/openai';
import { RegExpMatcher, englishDataset, englishRecommendedTransformers } from 'obscenity';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const MAX_HISTORY_LENGTH = 10;
const MAX_MESSAGE_LENGTH = 500;
const MAX_TOKENS = 4000;

const matcher = new RegExpMatcher({
  ...englishDataset.build(),
  ...englishRecommendedTransformers,
});

const whitelist = ['deck', 'flashcard'];

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

  // Input validation
  if (typeof message !== 'string' || message.length > MAX_MESSAGE_LENGTH) {
    res.status(400).json({ error: 'Invalid message format or length' });
    return;
  }

  // Content filtering
  const isWhitelisted = whitelist.some(word => message.includes(word));
  if (!isWhitelisted && matcher.hasMatch(message)) {
    res.status(422).json({ error: 'INAPPROPRIATE_CONTENT' });
    return;
  }

  try {
    const messages: Message[] = [
      { 
        role: "system", 
        content: `You are a focused AI tutor helping students learn using flashcards. Follow these guidelines:

1. Keep responses concise (2-3 sentences for simple questions, 4-5 for complex ones)
2. Always reference specific flashcard content in your responses when relevant
3. If the user's question isn't related to the flashcards, politely redirect them to the flashcard content
4. Use examples from the flashcards to explain concepts
5. Format important points using **bold** or *italic*
6. Maintain context from previous messages in the conversation
7. If referring to previous context, briefly mention what you're referring to

Here are the flashcards for reference: ${JSON.stringify(flashcards)}`
      },
      ...history,
      { role: "user", content: message }
    ];

    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: messages,
      temperature: 0.7,
      max_tokens: MAX_TOKENS,
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