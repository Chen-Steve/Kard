import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;

  try {
    const userDecks = await prisma.deck.findMany({
      where: { userId: userId as string },
      include: { flashcards: { orderBy: { order: 'asc' } } },
    });
    res.status(200).json(userDecks);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch decks' });
  }
}
