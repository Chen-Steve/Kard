import '../app/globals.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/UserAvatar';
import { getMicahAvatarSvg } from '../utils/avatar';
import { MdDarkMode } from "react-icons/md"; 
import { FaSun } from "react-icons/fa";
import NavMenu from '../components/dashboard/NavMenu';
import FlashcardComponent from '../components/dashboard/Flashcard';
import { toast, useToast } from '../components/ui/use-toast';
import { Toaster } from '../components/ui/toaster';
import Cookies from 'js-cookie';
import { HiLightningBolt } from "react-icons/hi";
import { initCursor } from 'ipad-cursor';
import DashSettings from '../components/dashboard/DashSettings';
import { DashboardComponent } from '../types/dashboard';
import StickerSelector from '../components/sticker-selector';
import DeckSelector from '../components/dashboard/DeckSelector';
import ModesButtons from '../components/modes/ModesButtons';

interface StickerWithUrl {
  id: string;
  path: string;
  signedUrl: string;
  publicUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl: string | null;
  membership: string;
  // Add other properties as needed
}

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
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
  const [stickers, setStickers] = useState<StickerWithUrl[]>([]);

  const fetchUserDecksAndSetSelected = useCallback(async (userId: string) => {
    const { data: decksData, error: decksError } = await supabase
      .from('decks')
      .select('*')
      .eq('userId', userId);

    if (decksError) {
      console.error('Error fetching decks:', decksError);
    } else {
      setDecks(decksData);
      if (decksData.length > 0) {
        setSelectedDeckId(decksData[0].id);
        setSelectedDeckName(decksData[0].name);
      }
    }
  }, []);

  useEffect(() => {
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

    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && session.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          console.error('Error fetching user data:', userError);
        } else {
          setUser({
            ...userData,
            avatarUrl: userData.avatar_url || getMicahAvatarSvg(userData.email)
          });
          fetchUserDecksAndSetSelected(session.user.id);
        }
      } else {
        router.push('/signin');
      }
    };

    getSession();

    const darkMode = document.documentElement.classList.contains('dark');
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, [router, fetchUserDecksAndSetSelected]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    Cookies.remove('session');
    router.push('/');
  };

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode;
    setIsDarkMode(newDarkMode);
    document.documentElement.classList.toggle('dark', newDarkMode);
  };

  const handleDeckSelect = useCallback((deckId: string) => {
    setSelectedDeckId(deckId);
    const selectedDeck = decks.find(deck => deck.id === deckId);
    setSelectedDeckName(selectedDeck ? selectedDeck.name : null);
  }, [decks]);

  const updateDashboardComponents = (newComponents: DashboardComponent[]) => {
    setDashboardComponents(newComponents);
  };

  if (!user) return <p data-cursor="text">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col" data-cursor="normal">
      <header className="w-full text-black dark:text-white p-4 flex justify-between items-center relative z-50" data-cursor="normal">
        {/* Left section */}
        <div className="flex items-center space-x-4 w-1/3">
          <DashSettings
            components={dashboardComponents}
            onUpdateComponents={updateDashboardComponents}
          />
          <NavMenu />
        </div>
        
        {/* Center section */}
        <div className="flex-grow flex justify-center w-1/3">
          {decks.length > 0 && (
            <DeckSelector
              decks={decks}
              selectedDeckId={selectedDeckId}
              onDeckSelect={handleDeckSelect}
            />
          )}
        </div>
        
        {/* Right section */}
        <div className="flex items-center justify-end w-1/3">
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
                      onClick={() => router.push('/profile')}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600"
                    >
                      Profile
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    <button
                      onClick={toggleDarkMode}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                    >
                      {isDarkMode ? <FaSun className="mr-2" /> : <MdDarkMode className="mr-2" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    {user.membership === 'pro' ? (
                      <div className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <HiLightningBolt className="mr-2" />
                        Pro
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push('/pricing')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                      >
                        <HiLightningBolt className="mr-2" />
                        Upgrade
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      
      <main className="flex-grow p-4 relative" data-cursor="normal">
        <div className="absolute inset-0">
          {dashboardComponents.find(comp => comp.id === 'stickers')?.visible && (
            <StickerSelector
              stickers={stickers}
              setStickers={setStickers}
            />
          )}
        </div>
        {decks.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center sm:items-center">
                {selectedDeckName && (
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white text-center sm:text-left mb-4 mr-4 sm:mb-0" data-cursor="text">
                    {selectedDeckName}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center gap-2 sm:ml-4">
                  {dashboardComponents
                    .filter(comp => comp.visible && comp.id === 'buttons')
                    .map(comp => (
                      <ModesButtons
                        key={comp.id}
                        userId={user.id}
                        selectedDeckId={selectedDeckId}
                        selectedDeckName={selectedDeckName}
                        userMembership={user.membership}
                      />
                    ))}
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
                          <FlashcardComponent
                            userId={user.id}
                            deckId={selectedDeckId}
                            decks={decks}
                            onDeckChange={(newDeckId) => setSelectedDeckId(newDeckId)}
                          />
                        </div>
                      ) : null;
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
              Go to your library and create some decks!
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

export default Dashboard;