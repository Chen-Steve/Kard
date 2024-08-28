import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { deckId } = req.query;

    try {
      const publicDeck = await prisma.deck.findUnique({
        where: { id: deckId as string, isPublic: true },
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          user: {
            select: {
              name: true,
            },
          },
          flashcards: {
            select: {
              id: true,
              question: true,
              answer: true,
            },
          },
        },
      });

      if (!publicDeck) {
        return res.status(404).json({ error: 'Public deck not found' });
      }

      res.status(200).json(publicDeck);
    } catch (error) {
      console.error('Error fetching public deck:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}