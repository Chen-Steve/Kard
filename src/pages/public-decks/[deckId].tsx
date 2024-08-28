import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import FlashcardComponent from '../../components/Flashcard';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface PublicDeck {
  id: string;
  name: string;
  description: string;
  userId: string;
  user: {
    name: string;
  };
  flashcards: Flashcard[];
}

const PublicDeckPage = () => {
  const router = useRouter();
  const { deckId } = router.query;
  const [deck, setDeck] = useState<PublicDeck | null>(null);

  useEffect(() => {
    const fetchPublicDeck = async () => {
      if (deckId) {
        const response = await fetch(`/api/public-decks/${deckId}`);
        if (response.ok) {
          const data = await response.json();
          setDeck(data);
        }
      }
    };

    fetchPublicDeck();
  }, [deckId]);

  if (!deck) return <p>Loading...</p>;

  // Create a Deck object that matches the expected structure
  const deckForFlashcardComponent = {
    id: deck.id,
    name: deck.name,
    description: deck.description,
    flashcards: deck.flashcards.map(fc => ({
      id: fc.id,
      front: fc.question,
      back: fc.answer
    }))
  };

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center p-4">
      <header className="w-full bg-white-700 text-black p-4 flex justify-between items-center">
        <Link href="/public-decks" className="text-black">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </header>
      <main className="flex-grow w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center my-4">{deck.name}</h1>
        <p className="text-center mb-4">Created by: {deck.user.name}</p>
        <FlashcardComponent 
          userId={deck.userId} 
          deckId={deck.id} 
          decks={[deckForFlashcardComponent]} 
          readOnly={true} 
        />
      </main>
    </div>
  );
};

export default PublicDeckPage;