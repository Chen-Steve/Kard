import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question, answer, order, deckId } = req.body;
    try {
      if (!question || !answer || order === undefined || !deckId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const newCard = await prisma.flashcard.create({
        data: {
          question,
          answer,
          order,
          deck: { connect: { id: deckId } },
        },
      });
      res.status(200).json(newCard);
    } catch (error) {
      console.error('Failed to add flashcard:', error);
      res.status(500).json({ error: 'Failed to add flashcard' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
