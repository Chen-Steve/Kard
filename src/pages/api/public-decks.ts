import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
          user: {
            select: {
              name: true,
            },
          },
        },
      });

      res.status(200).json(publicDecks);
    } catch (error) {
      console.error('Error fetching public decks:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}