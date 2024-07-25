import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const decks = await prisma.deck.findMany();
    res.status(200).json(decks);
  } else if (req.method === 'POST') {
    const { name } = req.body;
    const newDeck = await prisma.deck.create({
      data: { name },
    });
    res.status(201).json(newDeck);
  } else {
    res.setHeader('Allow', ['GET', 'POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
