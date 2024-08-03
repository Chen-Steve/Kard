import { useRouter } from 'next/router';
import { useEffect, useState, useCallback } from 'react';
import FlashcardComponent from '../../components/Flashcard';
import supabase from '../../lib/supabaseClient';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';

interface Deck {
  id: string;
  name: string;
  description: string;
}

const DeckPage = () => {
  const router = useRouter();
  const { deckId } = router.query;
  const [userId, setUserId] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);

  const fetchDecks = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/signin');
    } else {
      setUserId(session.user.id);
      try {
        const { data, error } = await supabase.from('decks').select('*').eq('userId', session.user.id);
        if (error) {
          throw error;
        }
        setDecks(data);
      } catch (error) {
        console.error('Error fetching decks:', error);
      }
    }
  }, [router]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  if (!userId || !deckId) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center p-4">
      <header className="w-full bg-white-700 text-black p-4 flex justify-between items-center">
        <Link href="/decks" className="text-blue-500">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </header>
      <main className="flex-grow w-full max-w-3xl">
        <FlashcardComponent userId={userId} deckId={deckId as string} decks={decks} />
      </main>
    </div>
  );
};

export default DeckPage;