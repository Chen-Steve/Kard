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
        orderBy: { created_at: 'desc' },
        include: {
          deckTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      const decksWithTags = decks.map(deck => ({
        ...deck,
        tags: deck.deckTags.map(dt => dt.tag),
      }));

      res.status(200).json(decksWithTags);
    } catch (error) {
      console.error('GET decks error:', error as Error);
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
          deckTags: {
            create: tags.map((tag: { name: string; color: string }) => ({
              tag: {
                connectOrCreate: {
                  where: { name: tag.name },
                  create: { name: tag.name, color: tag.color },
                },
              },
            })),
          },
        },
        include: {
          deckTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      const deckWithTags = {
        ...newDeck,
        tags: newDeck.deckTags.map(dt => dt.tag),
      };

      res.status(201).json(deckWithTags);
    } catch (error) {
      console.error('POST deck error:', error as Error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}