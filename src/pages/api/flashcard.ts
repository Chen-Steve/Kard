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
    const { flashcards, userId, deckId } = req.body;

    if (!flashcards || !Array.isArray(flashcards) || flashcards.length === 0 || !userId || !deckId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      console.log('Creating flashcards with data:', { flashcardsCount: flashcards.length, userId, deckId });

      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const newFlashcards = await prisma.$transaction(async (prisma) => {
        const flashcardCount = await prisma.flashcard.count({ where: { deckId } });

        return await Promise.all(flashcards.map((flashcard, index) => 
          prisma.flashcard.create({
            data: {
              question: flashcard.question,
              answer: flashcard.answer,
              order: flashcardCount + index + 1,
              user: { connect: { id: userId } },
              deck: { connect: { id: deckId } },
            },
          })
        ));
      });

      console.log('New flashcards created:', newFlashcards);
      res.status(201).json(newFlashcards);
    } catch (error) {
      console.error('POST flashcards error:', error);
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
        prisma.flashcard.update({
          where: { id: card.id },
          data: { order: card.order },
        })
      );
      await Promise.all(updatePromises);
      res.status(200).json({ message: 'Flashcards updated successfully' });
    } catch (error) {
      console.error('PATCH flashcards error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PUT' && req.query.action === 'shuffle') {
    console.log('Received shuffle request:', req.body);
    const { deckId, newOrder } = req.body;

    if (!deckId || !newOrder || !Array.isArray(newOrder)) {
      console.log('Invalid request body:', { deckId, newOrder });
      res.status(400).json({ error: 'Missing required fields', details: 'deckId and newOrder array are required' });
      return;
    }

    try {
      console.log('Shuffling flashcards with data:', { deckId, newOrder });

      await retry(async () => {
        const updatePromises = newOrder.map((id, index) =>
          prisma.flashcard.update({
            where: { id },
            data: { order: index + 1 },
          })
        );

        await prisma.$transaction(updatePromises);
      });

      res.status(200).json({ message: 'Flashcards shuffled successfully' });
    } catch (error) {
      console.error('Shuffle flashcards error:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      res.status(500).json({ 
        error: 'Internal Server Error', 
        details: (error as Error).message,
        stack: (error as Error).stack
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}