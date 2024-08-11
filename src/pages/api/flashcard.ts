import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';
import { toast } from 'react-toastify';

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
    const { question, answer, userId, deckId } = req.body;

    if (!question || !answer || !userId || !deckId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      console.log('Creating flashcard with data:', { question, answer, userId, deckId }); // Log incoming data

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const flashcardCount = await retry(() => prisma.flashcard.count({ where: { deckId } }));

      const newFlashcard = await retry(() => prisma.flashcard.create({
        data: {
          question,
          answer,
          order: flashcardCount + 1,
          user: { connect: { id: userId } }, // Connect the user
          deck: { connect: { id: deckId } }, // Connect the deck
        },
      }));
      console.log('New flashcard created:', newFlashcard); // Log created flashcard
      res.status(201).json(newFlashcard);
    } catch (error) {
      console.error('POST flashcard error:', error);
      toast.error('Internal Server Error: ' + (error as Error).message);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    const { userId, deckId } = req.query;

    if (!userId || !deckId) {
      res.status(400).json({ error: 'Bad Request', details: 'userId and deckId are required' });
      return;
    }

    try {
      const flashcards = await prisma.flashcard.findMany({
        where: { userId: String(userId), deckId: String(deckId) },
        orderBy: { order: 'asc' },
      });
      res.status(200).json(flashcards);
    } catch (error) {
      console.error('GET flashcards error:', error);
      toast.error('Internal Server Error: ' + (error as Error).message);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PUT') {
    console.log('PUT request body:', req.body);
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
      toast.error('Internal Server Error: ' + (error as Error).message);
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
      toast.error('Internal Server Error: ' + (error as Error).message);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PATCH') {
    const { flashcards } = req.body;

    if (!Array.isArray(flashcards) || flashcards.length === 0) {
      res.status(400).json({ error: 'Invalid flashcards data' });
      return;
    }

    try {
      const updatePromises = flashcards.map(card =>
        retry(() => prisma.flashcard.update({
          where: { id: card.id },
          data: { order: card.order },
        }))
      );
      await Promise.all(updatePromises);
      res.status(200).json({ message: 'Flashcards updated successfully' });
    } catch (error) {
      console.error('PATCH flashcards error:', error);
      toast.error('Internal Server Error: ' + (error as Error).message);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}