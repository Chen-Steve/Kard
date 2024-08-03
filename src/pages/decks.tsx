import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { FaArrowLeft, FaTrash } from 'react-icons/fa';
import { MdDelete } from "react-icons/md";

interface Deck {
  id: string;
  name: string;
  description: string;
}

const DecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const router = useRouter();

  const fetchDecks = useCallback(async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('userId', session.user.id);

      if (error) {
        throw error;
      }

      // Ensure data is an array and filter out invalid deck objects
      const validDecks = Array.isArray(data) ? data.filter((deck) => deck && deck.id) : [];
      setDecks(validDecks);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleCreateDeck = async () => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ name: newDeckName, description: newDeckDescription, userId: session.user.id }])
        .single();

      if (error) {
        throw error;
      }

      setDecks((prevDecks) => {
        const updatedDecks = [...prevDecks, data];
        return updatedDecks;
      });
      setNewDeckName('');
      setNewDeckDescription('');
    } catch (error) {
      console.error('Error creating deck:', error);
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId)
        .eq('userId', session.user.id);

      if (error) {
        throw error;
      }

      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center p-4">
      <header className="w-full bg-white-700 text-black p-4 flex justify-between items-center">
        <Link href="/dashboard" className="text-white-500">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </header>
      <main className="flex-grow w-full max-w-3xl">
        <div className="mb-4 flex items-center">
          <input
            type="text"
            placeholder="Deck Name"
            value={newDeckName}
            onChange={(e) => setNewDeckName(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-2"
          />
          <input
            type="text"
            placeholder="Deck Description"
            value={newDeckDescription}
            onChange={(e) => setNewDeckDescription(e.target.value)}
            className="p-2 border border-gray-300 rounded mr-2"
          />
          <button
            onClick={handleCreateDeck}
            className="p-2 bg-white text-black border border-gray-800 border-1 rounded mr-2"
          >
            Create Deck
          </button>
          <button
            onClick={fetchDecks}
            className="p-2 bg-[#1B2B4F] text-white rounded"
          >
            Refresh
          </button>
        </div>
        {decks.length === 0 ? (
          <p>No decks found. Create a new deck to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {decks.map((deck) =>
              deck && deck.id ? (
                <div key={deck.id} className="bg-white p-4 rounded shadow hover:bg-gray-100 cursor-pointer relative">
                  <Link href={`/decks/${deck.id}`}>
                    <h2 className="text-xl font-semibold">{deck.name}</h2>
                    <p className="text-gray-600">{deck.description}</p>
                  </Link>
                  <button
                    onClick={() => handleDeleteDeck(deck.id)}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                    aria-label="Delete Deck"
                  >
                    <MdDelete className="text-2xl" />
                  </button>
                </div>
              ) : null
            )}
          </div>
        )}
      </main>
    </div>
  );
};

export default DecksPage;
