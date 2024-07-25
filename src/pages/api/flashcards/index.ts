import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const flashcards = await prisma.flashcard.findMany({
      orderBy: { order: 'asc' },
    });
    res.status(200).json(flashcards);
  } else if (req.method === 'POST') {
    const { question, answer, deckId } = req.body;
    const maxOrder = await prisma.flashcard.findFirst({
      where: { deckId },
      orderBy: { order: 'desc' },
    });
    const newOrder = maxOrder ? maxOrder.order + 1 : 0;
    const newFlashcard = await prisma.flashcard.create({
      data: { question, answer, order: newOrder, deckId },
    });
    res.status(201).json(newFlashcard);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
