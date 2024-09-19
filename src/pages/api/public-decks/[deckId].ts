import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deckId } = req.query;

  if (typeof deckId !== 'string') {
    return res.status(400).json({ error: 'Invalid deck ID' });
  }

  if (req.method === 'GET') {
    try {
      const publicDeck = await prisma.deck.findUnique({
        where: { id: deckId, isPublic: true },
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

      const formattedDeck = {
        ...publicDeck,
        _count: {
          stars: publicDeck.starCount
        }
      };

      res.status(200).json(formattedDeck);
    } catch (error) {
      console.error('Error fetching public deck:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  } else if (req.method === 'POST') {
    try {
      // Get the current deck
      const currentDeck = await prisma.deck.findUnique({
        where: { id: deckId },
        select: { starCount: true }
      });

      if (!currentDeck) {
        return res.status(404).json({ error: 'Deck not found' });
      }

      // Toggle the star count
      const newStarCount = currentDeck.starCount > 0 ? currentDeck.starCount - 1 : currentDeck.starCount + 1;

      // Update the deck
      const updatedDeck = await prisma.deck.update({
        where: { id: deckId },
        data: { starCount: newStarCount },
        select: {
          id: true,
          starCount: true,
        }
      });

      res.status(200).json({
        id: updatedDeck.id,
        starCount: updatedDeck.starCount,
        isStarred: updatedDeck.starCount > currentDeck.starCount,
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