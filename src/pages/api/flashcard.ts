import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

async function retry<T>(fn: () => Promise<T>, retries: number = 3, delay: number = 1000): Promise<T> {
  let lastError: Error | null = null;

  for (let i = 0; i < retries; i++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      console.error(`Retrying due to error: ${lastError.message}`);
      if (i < retries - 1) {
        await new Promise(res => setTimeout(res, delay * Math.pow(2, i)));
      }
    }
  }

  throw lastError;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question, answer, userId } = req.body;

    if (!question || !answer || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const flashcardCount = await retry(() => prisma.flashcard.count({ where: { userId } }));

      const newFlashcard = await retry(() => prisma.flashcard.create({
        data: {
          question,
          answer,
          order: flashcardCount + 1,
          userId,
        },
      }));
      res.status(201).json(newFlashcard);
    } catch (error) {
      console.error('POST flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'Bad Request', details: 'userId is required' });
      return;
    }

    try {
      const flashcards = await retry(() => prisma.flashcard.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      }));
      res.status(200).json(flashcards);
    } catch (error) {
      console.error('GET flashcards error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PUT') {
    console.log('PUT request body:', req.body); // Add this line to log the request body
    const { id, question, answer, order } = req.body;

    if (!id || !question || !answer || order === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const updatedFlashcard = await retry(() => prisma.flashcard.update({
        where: { id },
        data: {
          question,
          answer,
          order,
        },
      }));
      res.status(200).json(updatedFlashcard);
    } catch (error) {
      console.error('PUT flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      await retry(() => prisma.flashcard.delete({ where: { id } }));
      res.status(204).end();
    } catch (error) {
      console.error('DELETE flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
