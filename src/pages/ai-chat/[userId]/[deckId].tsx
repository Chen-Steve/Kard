import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import AIChatComponent from '../../../components/AIChatComponent';
import supabase from '../../../lib/supabaseClient';
import { v4 as uuidv4 } from 'uuid';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Deck {
  id: string;
  name: string;
  uuid: string;
}

const AIChatPage: React.FC = () => {
  const router = useRouter();
  const { funnelUUID, deckUUID } = router.query;
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckUUID, setSelectedDeckUUID] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDecks = useCallback(async () => {
    if (!funnelUUID) return;

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('funnel_uuid', funnelUUID)
        .single();

      if (userError) throw userError;

      const { data: decksData, error: decksError } = await supabase
        .from('decks')
        .select('*')
        .eq('userId', userData.id);

      if (decksError) throw decksError;

      const decksWithUUID = decksData.map(deck => ({
        ...deck,
        uuid: uuidv4()
      }));

      setDecks(decksWithUUID);

      // Store the mapping in the session
      await supabase.auth.updateUser({
        data: { deck_uuid_mapping: decksWithUUID.reduce((acc, deck) => ({ ...acc, [deck.uuid]: deck.id }), {}) }
      });

    } catch (error) {
      console.error('Error fetching decks:', error);
      setError('Failed to fetch decks. Please try again.');
    }
  }, [funnelUUID]);

  const fetchFlashcards = useCallback(async (deckUUID: string) => {
    if (!funnelUUID || !deckUUID) {
      setError('Invalid user ID or deck ID.');
      return;
    }

    try {
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      const deckId = sessionData.session?.user.user_metadata.deck_uuid_mapping[deckUUID];
      if (!deckId) throw new Error('Deck not found');

      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('deckId', deckId);

      if (error) throw error;
      setFlashcards(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to fetch flashcards. Please try again.');
    }
  }, [funnelUUID]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  useEffect(() => {
    if (deckUUID && typeof deckUUID === 'string') {
      setSelectedDeckUUID(deckUUID);
      fetchFlashcards(deckUUID);
    }
  }, [deckUUID, fetchFlashcards]);

  const handleDeckChange = (newDeckUUID: string) => {
    setSelectedDeckUUID(newDeckUUID);
    fetchFlashcards(newDeckUUID);
    router.push(`/ai-chat/${funnelUUID}/${newDeckUUID}`, undefined, { shallow: true });
  };

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
      <AIChatComponent 
        flashcards={flashcards} 
        decks={decks} 
        selectedDeckUUID={selectedDeckUUID} 
        onDeckChange={handleDeckChange} 
      />
    </div>
  );
};

export default AIChatPage;