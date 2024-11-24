import '../app/globals.css';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import NavMenu from '../components/dashboard/NavMenu';
import FlashcardComponent from '../components/dashboard/Flashcard';
import Cookies from 'js-cookie';
import DashSettings from '../components/dashboard/DashSettings';
import { DashboardComponent } from '../types/dashboard';
import DeckSelector from '../components/dashboard/DeckSelector';
import ModesButtons from '../components/modes/ModesButtons';
import UserAvatarDropdown from '../components/dashboard/UserAvatarDropdown';
import { UserType } from '../types/user';
import StudyMode from '../components/dashboard/StudyMode';

const Dashboard = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedDeckName, setSelectedDeckName] = useState<string | null>(null);
  const router = useRouter();
  const [dashboardComponents, setDashboardComponents] = useState<DashboardComponent[]>([
    { id: 'flashcards', name: 'Flashcards', visible: true, order: 0 },
    { id: 'buttons', name: 'Modes', visible: true, order: 1 },
  ]);
  const [showFlashcardList, setShowFlashcardList] = useState(true);
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [isLandscape, setIsLandscape] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

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
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();

      if (session && session.user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('id, name, email, avatar_url, membership')
          .eq('id', session.user.id)
          .single();

        if (userData) {
          setUser(userData as UserType);
        }

        fetchUserDecksAndSetSelected(session.user.id);
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

  useEffect(() => {
    if (router.isReady && router.query.deckId) {
      const deckId = router.query.deckId as string;
      setSelectedDeckId(deckId);
      const selectedDeck = decks.find(deck => deck.id === deckId);
      if (selectedDeck) {
        setSelectedDeckName(selectedDeck.name);
      }
    }
  }, [router.isReady, router.query.deckId, decks]);

  useEffect(() => {
    const checkOrientation = () => {
      setIsLandscape(window.orientation === 90 || window.orientation === -90);
      setIsMobile(window.innerWidth <= 768); // Common mobile breakpoint
    };

    // Check initial orientation
    checkOrientation();

    // Add event listeners
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

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

  if (!user) return <p>Loading...</p>;

  if (isLandscape && isMobile && selectedDeckId) {
    return (
      <StudyMode
        userId={user.id}
        deckId={selectedDeckId}
        decks={decks}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col">
      <header className="w-full text-black dark:text-white p-4 flex justify-between items-center relative z-50">
        {/* Left section */}
        <div className="flex items-center space-x-4 w-1/3">
          <DashSettings
            components={dashboardComponents}
            onUpdateComponents={updateDashboardComponents}
            showFlashcardList={showFlashcardList}
            onToggleFlashcardList={handleToggleFlashcardList}
            showDefinitions={showDefinitions}
            onToggleDefinitions={() => setShowDefinitions(!showDefinitions)}
          />
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

      {/* Move NavMenu here, outside of header */}
      <NavMenu />
      
      <main className="flex-grow p-4 relative">
        <div className="absolute inset-0">
          {/* {dashboardComponents.find(comp => comp.id === 'stickers')?.visible && (
            <StickerSelector
              stickers={stickers}
              setStickers={setStickers}
            />
          )} */}
        </div>
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
                  {dashboardComponents
                    .filter(comp => comp.visible && comp.id === 'buttons')
                    .map(comp => (
                      <ModesButtons
                        key={comp.id}
                        userId={user.id}
                        selectedDeckId={selectedDeckId}
                        selectedDeckName={selectedDeckName}

                        
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
                            showDefinitions={showDefinitions}
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
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Go to your library and create some decks!
            </p>
          </div>
        )}
      </main>
      <footer className="w-full bg-white-700 dark:bg-gray-800 text-black dark:text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;