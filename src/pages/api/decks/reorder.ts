import { NextApiRequest, NextApiResponse } from 'next';
import prisma from '../../../lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'PUT') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const { userId, decks } = req.body;

  if (!userId || !decks || !Array.isArray(decks)) {
    return res.status(400).json({
      error: 'Bad Request',
      details: 'userId and decks array are required'
    });
  }

  try {
    // Update all deck orders in a transaction
    await prisma.$transaction(
      decks.map(({ id, order }) =>
        prisma.deck.update({
          where: { id, userId },
          data: { order },
        })
      )
    );

    res.status(200).json({ message: 'Deck order updated successfully' });
  } catch (error) {
    console.error('Error updating deck order:', error);
    res.status(500).json({
      error: 'Internal Server Error',
      details: (error as Error).message
    });
  }
} 