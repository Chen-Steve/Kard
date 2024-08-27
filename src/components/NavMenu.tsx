import { useState, useEffect } from "react";
import { RiMenu4Fill } from "react-icons/ri";
import { FaFolderOpen } from "react-icons/fa";
import { BsPinAngle, BsPinAngleFill } from "react-icons/bs";
import Link from 'next/link';
import supabase from '../lib/supabaseClient';

interface Deck {
  id: string;
  name: string;
  description?: string;
}

interface NavMenuProps {
  onDeckSelect: (deckId: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ onDeckSelect }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);

  const toggleSidebar = () => {
    if (!isPinned) {
      setIsOpen(!isOpen);
    }
  };

  const togglePin = () => {
    setIsPinned(!isPinned);
    setIsOpen(true);
  };

  useEffect(() => {
    const fetchDecks = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase.from('decks').select('*').eq('userId', session.user.id);
        if (error) {
          console.error('Error fetching decks:', error);
        } else {
          setDecks(data);
        }
      }
    };

    fetchDecks();
  }, []);

  const handleDeckClick = (deckId: string) => {
    onDeckSelect(deckId);
    if (!isPinned) {
      toggleSidebar();
    }
  };

  return (
    <div className="relative">
      <div className="fixed top-6 left-6 z-50">
        <button
          aria-label={isOpen ? "Close Menu" : "Open Menu"}
          onClick={toggleSidebar}
        >
          <RiMenu4Fill className="text-6xl text-black dark:text-white" />
        </button>
        {isOpen && (
          <button
            className="absolute left-40 top-1/2 -translate-y-1/2 p-2"
            aria-label={isPinned ? "Unpin Menu" : "Pin Menu"}
            onClick={togglePin}
          >
            {isPinned ? (
              <BsPinAngleFill className="text-4xl text-black dark:text-white" />
            ) : (
              <BsPinAngle className="text-4xl text-black dark:text-white" />
            )}
          </button>
        )}
      </div>
      <div
        className={`fixed top-0 left-0 bg-blue-100 dark:bg-gray-800 h-full transition-all duration-300 ease-in-out ${
          isOpen ? "w-56" : "w-0"
        } overflow-hidden z-40`}
      >
        <div className="p-4 pt-20"> {/* Added top padding to accommodate the menu icon */}
          {isOpen && (
            <>
              <hr className="my-4 border-gray-600 dark:border-gray-400" />
              <div className="flex items-center text-black dark:text-white">
                <FaFolderOpen className="text-xl" />
                <Link href="/decks" className="ml-2 text-lg">
                  Your Library
                </Link>
              </div>
              <div className="mt-4">
                {decks.map((deck) => (
                  <button
                    key={deck.id}
                    onClick={() => handleDeckClick(deck.id)}
                    className="block w-full text-left px-2 py-1 mt-2 text-sm text-black dark:text-white hover:bg-blue-200 dark:hover:bg-gray-700 rounded"
                  >
                    {deck.name}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavMenu;