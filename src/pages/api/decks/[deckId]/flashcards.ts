import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { deckId } = req.query;

  if (req.method === 'GET') {
    const flashcards = await prisma.flashcard.findMany({
      where: { deckId: Number(deckId) },
      orderBy: { order: 'asc' },
    });
    res.status(200).json(flashcards);
  } else if (req.method === 'POST') {
    const { question, answer, order } = req.body;
    const newFlashcard = await prisma.flashcard.create({
      data: { question, answer, order, deckId: Number(deckId) },
    });
    res.status(201).json(newFlashcard);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
