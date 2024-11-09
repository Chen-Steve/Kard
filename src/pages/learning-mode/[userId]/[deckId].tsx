import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import LearningMode from '../../../components/modes/LearningMode';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const LearningModePage: React.FC = () => {
  const router = useRouter();
  const { userId, deckId } = router.query;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    if (!userId || !deckId) {
      setError('Invalid user ID or deck ID.');
      return;
    }

    try {
      const response = await fetch(`/api/flashcard?userId=${userId}&deckId=${deckId}`);
      if (!response.ok) {
        throw new Error(`Failed to fetch flashcards: ${response.status} ${response.statusText}`);
      }
      const data: Flashcard[] = await response.json();
      setFlashcards(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to fetch flashcards. Please try again.');
    }
  }, [userId, deckId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <LearningMode flashcards={flashcards} />
    </div>
  );
};

export default LearningModePage;