import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    try {
      const publicDecks = await prisma.deck.findMany({
        where: { isPublic: true },
        select: {
          id: true,
          name: true,
          description: true,
          userId: true,
          starCount: true,
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      // Transform the data to match the expected format
      const transformedDecks = publicDecks.map(deck => ({
        ...deck,
        _count: {
          stars: deck.starCount
        }
      }));

      res.status(200).json(transformedDecks);
    } catch (error) {
      console.error('Error fetching public decks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}