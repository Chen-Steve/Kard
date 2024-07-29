// src/pages/api/flashcard.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const userId = req.query.userId as string;

    if (!userId) {
      res.status(400).json({ error: 'Bad Request', details: 'userId is required' });
      return;
    }

    try {
      const flashcards = await prisma.flashcard.findMany({
        where: { userId },
        orderBy: { order: 'asc' },
      });
      res.status(200).json(flashcards);
    } catch (error) {
      console.error('GET flashcards error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'POST') {
    try {
      const { question, answer, userId } = req.body;

      if (!userId) {
        res.status(400).json({ error: 'Bad Request', details: 'userId is required' });
        return;
      }

      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        res.status(404).json({ error: 'Not Found', details: 'User not found' });
        return;
      }

      const flashcardsCount = await prisma.flashcard.count({ where: { userId } });
      const newFlashcard = await prisma.flashcard.create({
        data: { 
          question, 
          answer, 
          order: flashcardsCount, 
          userId 
        },
      });
      res.status(201).json(newFlashcard);
    } catch (error) {
      console.error('POST flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'PUT') {
    try {
      const { id, question, answer, order } = req.body;

      if (!id) {
        res.status(400).json({ error: 'Bad Request', details: 'Flashcard id is required' });
        return;
      }

      const updatedFlashcard = await prisma.flashcard.update({
        where: { id },
        data: { 
          question, 
          answer,
          order,
        },
      });
      res.status(200).json(updatedFlashcard);
    } catch (error) {
      console.error('PUT flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
