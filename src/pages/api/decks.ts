import type { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'Bad Request', details: 'userId is required' });
      return;
    }

    try {
      const decks = await prisma.deck.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      res.status(200).json(decks);
    } catch (error) {
      console.error('GET decks error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'POST') {
    const { name, description, userId, tags } = req.body;

    if (!name || !description || !userId) {
      res.status(400).json({ error: 'Bad Request', details: 'name, description, and userId are required' });
      return;
    }

    try {
      const newDeck = await prisma.deck.create({
        data: {
          name,
          description,
          userId,
          tags,
        },
      });
      res.status(201).json(newDeck);
    } catch (error) {
      console.error('POST deck error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}