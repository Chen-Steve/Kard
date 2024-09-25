import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { v4 as uuidv4 } from 'uuid';
import Link from 'next/link';
import { SiStagetimer } from "react-icons/si";
import { RiTimerFill } from "react-icons/ri";
import { PiCardsFill } from "react-icons/pi";
import { MdDarkMode } from "react-icons/md"; 
import { FaSun } from "react-icons/fa";
import { HiLightningBolt } from "react-icons/hi";
import { differenceInDays } from 'date-fns';
import { toast, useToast } from '../components/ui/use-toast';
import { Toaster } from '../components/ui/toaster';
import AnonFlashcardComponent from '../components/anon/AnonFlashcard';
import DashSettings from '../components/dashboard/DashSettings';
import NavMenu from '../components/NavMenu';
import { initCursor, updateCursor, customCursorStyle } from 'ipad-cursor';
import UserAvatar from '../components/UserAvatar';
import { getMicahAvatarSvg } from '../utils/avatar';

interface Deck {
  id: string;
  name: string;
  description: string;
}

interface AnonUser {
  id: string;
  name: string;
  email: string;
  avatarUrl: string;
  membership: string;
  streak: number;
  last_login: string;
}

interface DashboardComponent {
  id: string;
  name: string;
  visible: boolean;
  order: number;
}

const AnonDashboard: React.FC = () => {
  const [user, setUser] = useState<AnonUser | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedDeckName, setSelectedDeckName] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dismiss } = useToast();
  const [dashboardComponents, setDashboardComponents] = useState<DashboardComponent[]>([
    { id: 'flashcards', name: 'Flashcards', visible: true, order: 0 },
    { id: 'buttons', name: 'Modes', visible: true, order: 1 },
    { id: 'stickers', name: 'Stickers', visible: false, order: 2 },
  ]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCursor({
        normalStyle: { 
          background: 'rgba(255, 255, 255, 0.3)',
          border: '2px solid black'
        },
        textStyle: { 
          background: 'rgba(255, 255, 255, 0.5)',
          border: '2px solid black'
        },
        blockStyle: { 
          background: 'rgba(255, 255, 255, 0.2)',
          radius: 'auto',
          border: '2px solid black'
        },
      });
    }

    const getSession = () => {
      const anonymousUserId = localStorage.getItem('anonymousUserId');
      if (anonymousUserId) {
        const localUserData = JSON.parse(localStorage.getItem('anonymousUserData') || '{}');
        setUser({
          id: anonymousUserId,
          name: localUserData.name || 'Anonymous User',
          email: '',
          avatarUrl: localUserData.avatar_url || getMicahAvatarSvg(anonymousUserId),
          membership: 'free',
          streak: localUserData.streak || 0,
          last_login: localUserData.last_login || new Date().toISOString(),
        });
        fetchAnonymousDecks(anonymousUserId);
      } else {
        router.push('/signin');
      }
    };

    getSession();

    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [router]);

  const fetchAnonymousDecks = (userId: string) => {
    const storedDecks = localStorage.getItem(`decks_${userId}`);
    if (storedDecks) {
      setDecks(JSON.parse(storedDecks));
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('anonymousUserId');
    localStorage.removeItem('anonymousUserData');
    router.push('/');
  };

  const handleLearnClick = () => {
    if (user && selectedDeckId) {
      router.push(`/anon-learning-mode/${user.id}/${selectedDeckId}`);
    } else if (!user) {
      toast({
        title: 'User Not Found',
        description: 'Please sign in to access learning mode.',
      });
    } else {
      toast({
        title: 'No Deck Selected',
        description: 'Please select a deck to start learning.',
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
    if (user && selectedDeckId) {
      router.push(`/anon-matching-game/${user.id}/${selectedDeckId}`);
    } else if (!user) {
      toast({
        title: 'User Not Found',
        description: 'Please sign in to access the matching game.',
      });
    } else {
      toast({
        title: 'No Deck Selected',
        description: 'Please select a deck to play the matching game.',
      });
    }
  };

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
    const selectedDeck = decks.find(deck => deck.id === deckId);
    setSelectedDeckName(selectedDeck ? selectedDeck.name : null);
    localStorage.setItem('selectedDeckId', deckId);
  };

  const updateDashboardComponents = (newComponents: DashboardComponent[]) => {
    setDashboardComponents(newComponents);
    localStorage.setItem('dashboardComponents', JSON.stringify(newComponents));
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    localStorage.setItem('darkMode', newDarkMode.toString());
    if (newDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleCreateDeck = () => {
    const newDeck: Deck = {
      id: uuidv4(),
      name: `New Deck ${decks.length + 1}`,
      description: 'A new deck for anonymous users',
    };
    const updatedDecks = [...decks, newDeck];
    setDecks(updatedDecks);
    localStorage.setItem(`decks_${user?.id}`, JSON.stringify(updatedDecks));
    setSelectedDeckId(newDeck.id);
    setSelectedDeckName(newDeck.name);
  };

  if (!user) return <p data-cursor="text">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col" data-cursor="normal">
      <header className="w-full text-black dark:text-white p-4 flex justify-between items-center relative z-50" data-cursor="normal">
        <div className="flex items-center">
          <DashSettings
            components={dashboardComponents}
            onUpdateComponents={updateDashboardComponents}
          />
          <NavMenu onDeckSelect={handleDeckSelect} />
        </div>
        <div className="flex items-center">
          {user && user.avatarUrl && (
            <div className="relative" ref={dropdownRef}>
              <UserAvatar
                avatarSvg={user.avatarUrl}
                alt="User Avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-0 mt-2 sm:mt-3 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10" data-cursor="normal">
                  <div className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300">
                    <span className="block font-medium">{user.name}</span>
                    <span className="block">{user.email}</span>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={handleSignOut}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Log Out
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={toggleDarkMode}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                    >
                      {isDarkMode ? <FaSun className="mr-2" /> : <MdDarkMode className="mr-2" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow p-4 relative">
        {decks.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center sm:items-center">
                {selectedDeckName && (
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white text-center sm:text-left mb-4 mr-4 sm:mb-0">
                    {selectedDeckName}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center gap-2 sm:ml-4">
                  <button
                    className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
                    onClick={handleLearnClick}
                  >
                    <SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1rem' }} />
                    <span className="font-semibold">Learn</span>
                  </button>
                  <button
                    className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
                    onClick={handleTestClick}
                  >
                    <RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
                    <span className="font-semibold">Test</span>
                  </button>
                  <button
                    className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
                    onClick={handleMatchClick}
                  >
                    <PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
                    <span className="font-semibold">Match</span>
                  </button>
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              {dashboardComponents
                .filter(comp => comp.visible && comp.id !== 'buttons')
                .sort((a, b) => a.order - b.order)
                .map(comp => {
                  switch (comp.id) {
                    case 'flashcards':
                      return selectedDeckId ? (
                        <div key={comp.id} className="w-full max-w-3xl">
                          <AnonFlashcardComponent
                            deckId={selectedDeckId}
                            decks={decks}
                            onDeckChange={(newDeckId) => setSelectedDeckId(newDeckId)}
                          />
                        </div>
                      ) : null;
                    // Add more cases for other components
                    default:
                      return null;
                  }
                })}
            </div>
          </div>
        )}
        {decks.length === 0 && (
          <div className="flex flex-col justify-center items-center h-full mt-20">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4" data-cursor="text">
              Create your first deck to get started!
            </p>
            <button
              onClick={handleCreateDeck}
              className="mt-4 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Deck
            </button>
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-md mt-4" data-cursor="text">
              You are using an anonymous account. Your data is stored locally in your browser.
            </p>
          </div>
        )}
      </main>
      <footer className="w-full bg-white-700 dark:bg-gray-800 text-black dark:text-white p-6 text-center" data-cursor="normal">
        <p data-cursor="text">&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
      <Toaster />
    </div>
  );
};

export default AnonDashboard;