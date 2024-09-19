import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { deckId } = req.query;

  if (!deckId || typeof deckId !== 'string') {
    return res.status(400).json({ error: 'Invalid deck ID' });
  }

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
}