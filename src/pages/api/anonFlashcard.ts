import type { NextApiRequest, NextApiResponse } from 'next';
import { v4 as uuidv4 } from 'uuid';

// Define the Flashcard type
interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
  deckId: string;
}

// In-memory storage for anonymous flashcards
const anonFlashcards: { [deckId: string]: Flashcard[] } = {};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { question, answer, deckId } = req.body;

    if (!question || !answer || !deckId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const newFlashcard: Flashcard = {
        id: uuidv4(),
        question,
        answer,
        order: (anonFlashcards[deckId]?.length || 0) + 1,
        deckId,
      };

      if (!anonFlashcards[deckId]) {
        anonFlashcards[deckId] = [];
      }
      anonFlashcards[deckId].push(newFlashcard);

      res.status(201).json(newFlashcard);
    } catch (error) {
      console.error('POST flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'GET') {
    const { deckId } = req.query;

    if (!deckId || typeof deckId !== 'string') {
      res.status(400).json({ error: 'Bad Request', details: 'deckId is required' });
      return;
    }

    try {
      const flashcards = anonFlashcards[deckId] || [];
      res.status(200).json(flashcards);
    } catch (error) {
      console.error('GET flashcards error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PUT') {
    const { id, question, answer, order, deckId } = req.body;

    if (!id || !question || !answer || order === undefined || !deckId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const deckFlashcards = anonFlashcards[deckId];
      if (!deckFlashcards) {
        res.status(404).json({ error: 'Deck not found' });
        return;
      }

      const flashcardIndex = deckFlashcards.findIndex(f => f.id === id);
      if (flashcardIndex === -1) {
        res.status(404).json({ error: 'Flashcard not found' });
        return;
      }

      deckFlashcards[flashcardIndex] = { ...deckFlashcards[flashcardIndex], question, answer, order };
      res.status(200).json(deckFlashcards[flashcardIndex]);
    } catch (error) {
      console.error('PUT flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'DELETE') {
    const { id, deckId } = req.body;

    if (!id || !deckId) {
      res.status(400).json({ error: 'Missing required fields' });
      return;
    }

    try {
      const deckFlashcards = anonFlashcards[deckId];
      if (!deckFlashcards) {
        res.status(404).json({ error: 'Deck not found' });
        return;
      }

      const flashcardIndex = deckFlashcards.findIndex(f => f.id === id);
      if (flashcardIndex === -1) {
        res.status(404).json({ error: 'Flashcard not found' });
        return;
      }

      deckFlashcards.splice(flashcardIndex, 1);
      res.status(204).end();
    } catch (error) {
      console.error('DELETE flashcard error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else if (req.method === 'PATCH') {
    const { flashcards, deckId } = req.body;

    if (!Array.isArray(flashcards) || flashcards.length === 0 || !deckId) {
      res.status(400).json({ error: 'Invalid flashcards data' });
      return;
    }

    try {
      if (!anonFlashcards[deckId]) {
        res.status(404).json({ error: 'Deck not found' });
        return;
      }

      anonFlashcards[deckId] = flashcards;
      res.status(200).json({ message: 'Flashcards updated successfully' });
    } catch (error) {
      console.error('PATCH flashcards error:', error);
      res.status(500).json({ error: 'Internal Server Error', details: (error as Error).message });
    }
  } else {
    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}