import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question, answer, order, userId } = req.body;

    if (!question || !answer || order === undefined || !userId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      console.log('User found:', user); // Add this line

      if (!user) {
        res.status(404).json({ error: 'Not Found', details: 'User not found' });
        return;
      }

      const newFlashcard = await prisma.flashcard.create({
        data: {
          question,
          answer,
          order,
          userId,
        },
      });
      res.status(201).json(newFlashcard);
    } catch (error) {
      console.error('POST flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'GET') {
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
  } else if (req.method === 'PUT') {
    const { id, question, answer, order } = req.body;

    if (!id || !question || !answer || order === undefined) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
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
  } else if (req.method === 'DELETE') {
    const { id } = req.body;

    if (!id) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      await prisma.flashcard.delete({
        where: { id },
      });
      res.status(204).end();
    } catch (error) {
      console.error('DELETE flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}