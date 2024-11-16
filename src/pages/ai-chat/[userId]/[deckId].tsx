import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AIChatComponent from '../../../components/modes/AIChatComponent';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
}

const AIChatPage: React.FC = () => {
  const router = useRouter();
  const { userId, deckId } = router.query;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    if (!userId) return;
  
    console.log('Fetching decks for userId:', userId);
    try {
      const response = await fetch(`/api/decks?userId=${userId}`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }
      const data: Deck[] = await response.json();
      console.log('Fetched decks:', data);
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
      setError('Failed to fetch decks. Please try again.');
    }
  }, [userId]);

  const fetchFlashcards = useCallback(async (deckId: string) => {
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
  }, [userId]);

  useEffect(() => {
    if (!router.isReady) return;
  
    if (userId && typeof userId === 'string') {
      fetchDecks();
      if (deckId && typeof deckId === 'string') {
        setSelectedDeckId(deckId);
        fetchFlashcards(deckId);
      }
    }
  }, [router.isReady, userId, deckId, fetchDecks, fetchFlashcards]);

  const handleDeckChange = (newDeckId: string) => {
    setSelectedDeckId(newDeckId);
    fetchFlashcards(newDeckId);
    router.push(`/ai-chat/${userId}/${newDeckId}`, undefined, { shallow: true });
  };

  return (
    <div className="container mx-auto p-4 max-w-full min-h-screen dark:bg-gray-800 dark:text-white">
      <AIChatComponent 
        flashcards={flashcards} 
        decks={decks} 
        selectedDeckId={selectedDeckId} 
        onDeckChange={handleDeckChange} 
      />
    </div>
  );
};

export default AIChatPage;
