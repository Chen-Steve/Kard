import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import LearningMode from '../../../components/modes/LearningMode';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

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
      <div className="mb-4">
        <Link href="/dashboard" passHref>
          <span className="text-black dark:text-white hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer flex items-center">
            <FaArrowLeft className="mr-2" /> Back to Dashboard
          </span>
        </Link>
      </div>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <LearningMode flashcards={flashcards} />
    </div>
  );
};

export default LearningModePage;