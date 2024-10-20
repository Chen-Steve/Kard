import '../app/globals.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import { getGlassAvatarSvg } from '../utils/avatar';
import NavMenu from '../components/dashboard/NavMenu';
import FlashcardComponent from '../components/dashboard/Flashcard';
import { useToast } from '../components/ui/use-toast';
import { Toaster } from '../components/ui/toaster';
import Cookies from 'js-cookie';
import { initCursor } from 'ipad-cursor';
import DashSettings from '../components/dashboard/DashSettings';
import { DashboardComponent } from '../types/dashboard';
import StickerSelector from '../components/sticker-selector';
import DeckSelector from '../components/dashboard/DeckSelector';
import ModesButtons from '../components/modes/ModesButtons';
import UserAvatarDropdown from '../components/dashboard/UserAvatarDropdown';
import { UserType } from '../types/user';

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

const Dashboard = () => {
  const [user, setUser] = useState<UserType | null>(null);
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
  const [showFlashcardList, setShowFlashcardList] = useState(true);
  const [streak, setStreak] = useState(0);

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
          .select('id, name, email, avatar_url, membership, streak')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser(userData as UserType);
        }

        fetchUserDecksAndSetSelected(session.user.id);

        // Set streak from user data
        setStreak(userData?.streak || 0);
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

  const handleToggleFlashcardList = () => {
    setShowFlashcardList(!showFlashcardList);
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
            showFlashcardList={showFlashcardList}
            onToggleFlashcardList={handleToggleFlashcardList}
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
          {user && (
            <UserAvatarDropdown
              user={user}
              isDarkMode={isDarkMode}
              toggleDarkMode={toggleDarkMode}
              handleSignOut={handleSignOut}
            />
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
                            showFlashcardList={showFlashcardList}
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
