import { useState, useEffect } from "react";
import { RiMenu4Fill } from "react-icons/ri";
import { FaFolder, FaRegFolder } from "react-icons/fa";
import { FaCircleNotch } from "react-icons/fa";

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
  const [decks, setDecks] = useState<Deck[]>([]);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
    toggleSidebar();
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
      </div>
      <div
        className={`fixed top-0 left-0 bg-blue-100 dark:bg-gray-800 h-full transition-all duration-300 ease-in-out ${
          isOpen ? "w-64" : "w-0"
        } overflow-hidden z-40`}
      >
        <div className="p-4 pt-20">
          {isOpen && (
            <>
            <hr className="my-2" />
              <div className="px-2 space-y-2">
                <Link href="/dashboard" className="block hover:bg-blue-200 dark:hover:bg-gray-700 rounded transition-colors">
                  <div className="flex items-center text-black dark:text-white py-2 px-2">
                    <FaCircleNotch className="text-2xl mr-2" />
                    <span className="text-xl font-semibold">Home</span>
                  </div>
                </Link>
                <Link href="/decks" className="block hover:bg-blue-200 dark:hover:bg-gray-700 rounded transition-colors">
                  <div className="flex items-center text-black dark:text-white py-2 px-2">
                    <FaFolder className="text-2xl mr-2" />
                    <span className="text-xl font-semibold">Your Library</span>
                  </div>
                </Link>
                <Link href="/public-decks" className="block hover:bg-blue-200 dark:hover:bg-gray-700 rounded transition-colors">
                  <div className="flex items-center text-black dark:text-white py-2 px-2">
                    <FaRegFolder className="text-2xl mr-2" />
                    <span className="text-xl font-semibold">Public Decks</span>
                  </div>
                </Link>
                <hr className="my-2 border-gray-600 dark:border-gray-400" />
                <div className="px-2 mb-2">
                  <span className="text-lg font-semibold text-black dark:text-white">Load Decks</span>
                </div>
                <div className="space-y-1">
                  {decks.map((deck) => (
                    <button
                      key={deck.id}
                      onClick={() => handleDeckClick(deck.id)}
                      className="block w-full text-left py-1 px-2 text-base text-black dark:text-white hover:bg-blue-200 dark:hover:bg-gray-700 rounded transition-colors"
                    >
                      <span className="flex items-center">
                        <span className="w-2 h-2 bg-black dark:bg-white rounded-full mr-2"></span>
                        {deck.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default NavMenu;