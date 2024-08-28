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
        orderBy: { order: 'asc' },
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
    const { name, description, userId, tags, isPublic } = req.body;

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
          isPublic: isPublic || false,
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
  } else if (req.method === 'PUT') {
    const { deckId, name, description, userId, tags, isPublic } = req.body;

    if (!deckId || !name || !description || !userId) {
      res.status(400).json({ error: 'Bad Request', details: 'deckId, name, description, and userId are required' });
      return;
    }

    try {
      const updatedDeck = await prisma.deck.update({
        where: { id: deckId },
        data: {
          name,
          description,
          isPublic: isPublic || false,
          deckTags: {
            deleteMany: {},
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
        ...updatedDeck,
        tags: updatedDeck.deckTags.map(dt => dt.tag),
      };

      res.status(200).json(deckWithTags);
    } catch (error) {
      console.error('PUT deck error:', error as Error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'DELETE') {
    const { deckId, userId } = req.body;

    if (!deckId || !userId) {
      res.status(400).json({ error: 'Bad Request', details: 'deckId and userId are required' });
      return;
    }

    console.log('DELETE request body:', req.body);

    try {
      const deck = await prisma.deck.findUnique({
        where: { id: deckId },
        include: {
          deckTags: true,
        },
      });

      if (!deck || deck.userId !== userId) {
        res.status(404).json({ error: 'Not Found', details: 'Deck not found or unauthorized' });
        return;
      }

      // Delete all related tags
      await prisma.deckTag.deleteMany({
        where: {
          deckId,
        },
      });

      // Delete the deck
      await prisma.deck.delete({
        where: { id: deckId },
      });

      res.status(204).end();
    } catch (error) {
      console.error('DELETE deck error:', error as Error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PATCH') {
    const { decks } = req.body;

    if (!Array.isArray(decks) || decks.length === 0) {
      res.status(400).json({ error: 'Invalid decks data' });
      return;
    }

    try {
      const updatePromises = decks.map((deck, index) =>
        prisma.deck.update({
          where: { id: deck.id },
          data: { order: index + 1 },
        })
      );
      await Promise.all(updatePromises);
      res.status(200).json({ message: 'Decks updated successfully' });
    } catch (error) {
      console.error('PATCH decks error:', error as Error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}