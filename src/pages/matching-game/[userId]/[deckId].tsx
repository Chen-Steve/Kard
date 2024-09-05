import React, { useState, useEffect, useCallback } from 'react';
import MatchingGame from '../../../components/modes/MatchingGame';
import { useRouter } from 'next/router';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardResponse {
  id: string;
  question: string;
  answer: string;
}

const MatchingGamePage: React.FC = () => {
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
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch flashcards: ${errorData.error}, ${errorData.details}`);
        } else {
          const text = await response.text();
          throw new Error(`Failed to fetch flashcards: ${response.status} ${response.statusText}\n${text}`);
        }
      }
      const data: FlashcardResponse[] = await response.json();
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

  const cards = flashcards.map(flashcard => ({
    id: flashcard.id,
    term: flashcard.question,
    definition: flashcard.answer,
  }));

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <MatchingGame cards={cards} deckTitle="" />    
    </div>
  );
};

export default MatchingGamePage;