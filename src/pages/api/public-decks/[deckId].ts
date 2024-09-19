import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  console.log('API route called. Method:', req.method);

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
  } else if (req.method === 'POST') {
    // Assuming you're passing the user ID in the request body or headers
    const userId = req.body.userId || req.headers['user-id'];
    const { deckId } = req.query;

    if (!userId) {
      return res.status(401).json({
        error: 'not_authenticated',
        description: 'User ID is required',
      });
    }

    if (!deckId || typeof deckId !== 'string') {
      return res.status(400).json({ error: 'Invalid deck ID' });
    }

    try {
      const existingStar = await prisma.deckStar.findUnique({
        where: {
          deckId_userId: {
            deckId: deckId,
            userId: userId,
          },
        },
      });

      if (existingStar) {
        // If star exists, remove it
        await prisma.deckStar.delete({
          where: {
            deckId_userId: {
              deckId: deckId,
              userId: userId,
            },
          },
        });
      } else {
        // If star doesn't exist, add it
        await prisma.deckStar.create({
          data: {
            deckId: deckId,
            userId: userId,
          },
        });
      }

      // Fetch the updated deck with star count
      const updatedDeck = await prisma.deck.findUnique({
        where: { id: deckId },
        include: {
          _count: {
            select: { stars: true },
          },
        },
      });

      if (!updatedDeck) {
        return res.status(404).json({ error: 'Updated deck not found' });
      }

      res.status(200).json({
        id: updatedDeck.id,
        starCount: updatedDeck._count.stars,
        isStarred: !existingStar,
      });
    } catch (error) {
      console.error('Error updating deck star:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}