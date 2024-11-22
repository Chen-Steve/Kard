import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import FlashcardComponent from '../../components/dashboard/Flashcard';
import ModesButtons from '@/components/modes/ModesButtons';
import { Icon } from '@iconify/react';

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

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const PublicDeckPage = () => {
  const router = useRouter();
  const { deckId } = router.query;
  const [deck, setDeck] = useState<PublicDeck | null>(null);
  const [showDefinitions, setShowDefinitions] = useState(true);

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

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-gray-800 flex flex-col items-center p-4">
      <header className="w-full bg-white-700 text-black dark:text-white p-4 flex justify-between items-center">
        <Link href="/public-decks" className="text-black dark:text-white">
          <Icon icon="pepicons-pencil:arrow-left" className="text-2xl" />
        </Link>
      </header>
      <main className="flex-grow w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center my-4 text-black dark:text-white">{deck.name}</h1>
        <p className="text-center mb-4 text-black dark:text-white">Created by: {deck.user.name}</p>
        
        <div className="mb-4">
          <ModesButtons 
            userId={deck.userId}
            selectedDeckId={deck.id}
            selectedDeckName={deck.name}
          />
        </div>

        <FlashcardComponent 
          userId={deck.userId} 
          deckId={deck.id} 
          decks={[deck]} 
          readOnly={true} 
          showFlashcardList={true}
          isPublicDeck={true}
        />

        <button
          onClick={() => setShowDefinitions(!showDefinitions)}
          className="fixed bottom-4 right-4 bg-muted dark:bg-gray-600 text-muted-foreground dark:text-gray-200 px-4 py-2 rounded-full shadow-lg flex items-center"
        >
          <Icon 
            icon={showDefinitions ? "pepicons-pencil:eye-closed" : "pepicons-pencil:eye"} 
            className="mr-2"
            width="20"
          />
          {showDefinitions ? 'Hide Definitions' : 'Show Definitions'}
        </button>
      </main>
    </div>
  );
};

export default PublicDeckPage;