import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { flashcardId, sourceDeckId, destinationDeckId, userId } = req.body;

  if (!flashcardId || !sourceDeckId || !destinationDeckId || !userId) {
    return res.status(400).json({ 
      error: 'Bad Request', 
      details: 'flashcardId, sourceDeckId, destinationDeckId, and userId are required' 
    });
  }

  try {
    // Verify ownership of both decks
    const [sourceDeck, destinationDeck] = await Promise.all([
      prisma.deck.findFirst({
        where: { id: sourceDeckId, userId },
      }),
      prisma.deck.findFirst({
        where: { id: destinationDeckId, userId },
      }),
    ]);

    if (!sourceDeck || !destinationDeck) {
      return res.status(403).json({ 
        error: 'Forbidden', 
        details: 'You do not have permission to access one or both decks' 
      });
    }

    // Update the flashcard
    const updatedFlashcard = await prisma.flashcard.update({
      where: {
        id: flashcardId,
        userId, // Ensure user owns the flashcard
      },
      data: {
        deckId: destinationDeckId,
      },
    });

    res.status(200).json(updatedFlashcard);
  } catch (error) {
    console.error('Error moving flashcard:', error);
    res.status(500).json({ 
      error: 'Internal Server Error', 
      details: (error as Error).message 
    });
  }
}