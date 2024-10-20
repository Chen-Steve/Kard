import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaEye, FaEyeSlash } from 'react-icons/fa';
import { SiStagetimer } from 'react-icons/si';
import { RiTimerFill } from 'react-icons/ri';
import { PiCardsFill } from 'react-icons/pi';
import { BiSolidMessageSquareDots } from 'react-icons/bi';
import FlashcardComponent from '../../components/dashboard/Flashcard';
import { Button } from '../../components/ui/Button';
import { useToast } from "@/components/ui/use-toast";

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
  const { toast } = useToast();

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

  const handleLearnClick = () => {
    const userId = deck?.userId;
    if (userId) {
      router.push(`/learning-mode/${userId}/${deckId}`);
    } else {
      toast({
        title: 'Error',
        description: 'User ID is missing.',
      });
    }
  };

  const handleTestClick = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The Test feature is coming soon.',
    });
  };

  const handleMatchClick = () => {
    const userId = deck?.userId;
    if (userId) {
      router.push(`/matching-game/${userId}/${deckId}`);
    } else {
      toast({
        title: 'Error',
        description: 'User ID is missing.',
      });
    }
  };

  const handleKChatClick = () => {
    toast({
      title: 'K-Chat for Public Decks',
      description: 'This feature is not available for public decks.',
    });
  };

  return (
    <div className="min-h-screen bg-gray-300 dark:bg-gray-800 flex flex-col items-center p-4">
      <header className="w-full bg-white-700 text-black dark:text-white p-4 flex justify-between items-center">
        <Link href="/public-decks" className="text-black dark:text-white">
          <FaArrowLeft className="text-2xl" />
        </Link>
      </header>
      <main className="flex-grow w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center my-4 text-black dark:text-white">{deck.name}</h1>
        <p className="text-center mb-4 text-black dark:text-white">Created by: {deck.user.name}</p>
        
        <div className="flex flex-wrap justify-center gap-2 mb-4">
          <button
            onClick={handleLearnClick}
            className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1rem' }} />
            <span className="font-semibold">Learn</span>
          </button>
          <button
            onClick={handleTestClick}
            className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
            <span className="font-semibold">Test</span>
          </button>
          <button
            onClick={handleMatchClick}
            className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
            <span className="font-semibold">Match</span>
          </button>
          <button
            onClick={handleKChatClick}
            className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
          >
            <BiSolidMessageSquareDots className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
            <span className="font-semibold">K-Chat</span>
          </button>
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
          {showDefinitions ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
          {showDefinitions ? 'Hide Definitions' : 'Show Definitions'}
        </button>
      </main>
    </div>
  );
};

export default PublicDeckPage;
