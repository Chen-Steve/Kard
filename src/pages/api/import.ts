import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { deckId } = req.query;

    if (!deckId || typeof deckId !== 'string') {
      return res.status(400).json({ error: 'Invalid deck ID' });
    }

    try {
      const flashcards = await prisma.flashcard.findMany({
        where: { deckId: deckId },
        orderBy: { order: 'asc' },
        select: {
          id: true,
          question: true,
          answer: true,
          order: true,
        },
      });

      res.status(200).json(flashcards);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}