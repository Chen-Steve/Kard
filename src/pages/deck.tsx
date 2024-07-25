import '../app/globals.css';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import EditFlashcard from '../components/EditFlashcard';
import DeckManager from '../components/DeckManager';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface Deck {
  id: number;
  name: string;
  flashcards: Flashcard[];
}

const DeckPage: React.FC = () => {
  const [selectedDeckId, setSelectedDeckId] = useState<number | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);

  useEffect(() => {
    loadDecks();
  }, []);

  const loadDecks = async () => {
    try {
      const response = await fetch('/decks');
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Failed to load decks:', error);
    }
  };

  const handleDeckSelect = (deckId: number | null) => {
    setSelectedDeckId(deckId);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl flex justify-start mb-4">
        <Link href="/card">
          <button className="btn btn-secondary">Back to Page</button>
        </Link>
      </div>
      <h1 className="text-4xl font-bold text-black mb-10"></h1>
      <DeckManager decks={decks} onDeckSelect={handleDeckSelect} setDecks={setDecks} />
      {selectedDeckId !== null && <EditFlashcard deckId={selectedDeckId} />}
    </div>
  );
};

export default DeckPage;
