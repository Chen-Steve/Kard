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
          <Button onClick={handleLearnClick} className="flex items-center space-x-2">
            <SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1rem' }} />
            <span>Learn</span>
          </Button>
          <Button onClick={handleTestClick} className="flex items-center space-x-2">
            <RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
            <span>Test</span>
          </Button>
          <Button onClick={handleMatchClick} className="flex items-center space-x-2">
            <PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
            <span>Match</span>
          </Button>
          <Button onClick={handleKChatClick} className="flex items-center space-x-2">
            <BiSolidMessageSquareDots className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
            <span>K-Chat</span>
          </Button>
        </div>

        <FlashcardComponent 
          userId={deck.userId} 
          deckId={deck.id} 
          decks={[deck]} 
          readOnly={true} 
          showFlashcardList={true}
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