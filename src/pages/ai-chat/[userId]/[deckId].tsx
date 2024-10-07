import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import AIChatComponent from '../../../components/modes/AIChatComponent';
import { toast } from 'react-toastify';

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
  const [userMembership, setUserMembership] = useState<boolean | null>(null);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkMembership = async () => {
      if (userId && typeof userId === 'string') {
        try {
          const response = await fetch(`/api/user?userId=${userId}`);
          if (response.ok) {
            const userData = await response.json();
            console.log('User data:', userData);
            setUserMembership(userData.membership === 'pro');
            if (userData.membership !== 'pro') {
              toast.error('This feature is only available for pro members.');
              router.push('/dashboard');
            }
          } else {
            throw new Error('Failed to fetch user data');
          }
        } catch (error) {
          console.error('Error checking membership:', error);
          toast.error('Failed to verify user membership. Please try again.');
          setUserMembership(false);
        }
      }
    };
    checkMembership();
  }, [userId, router]);

  const fetchDecks = useCallback(async () => {
    if (!userId) return;
  
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
    fetchDecks();
  }, [fetchDecks]);

  useEffect(() => {
    if (deckId && typeof deckId === 'string') {
      setSelectedDeckId(deckId);
      fetchFlashcards(deckId);
    }
  }, [deckId, fetchFlashcards]);

  const handleDeckChange = (newDeckId: string) => {
    setSelectedDeckId(newDeckId);
    fetchFlashcards(newDeckId);
    router.push(`/ai-chat/${userId}/${newDeckId}`, undefined, { shallow: true });
  };

  if (userMembership === null) {
    return <div>Loading...</div>;
  }

  if (userMembership === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[85vh] bg-white dark:bg-gray-800 dark:text-white">
        <p className="text-xl mb-4">Unable to access AI Chat</p>
        <p>Please check your membership status or try again later.</p>
      </div>
    );
  }

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