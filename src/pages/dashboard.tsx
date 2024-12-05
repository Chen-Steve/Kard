import '../app/globals.css';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import NavMenu from '../components/dashboard/NavMenu';
import FlashcardComponent from '../components/dashboard/Flashcard';
import Cookies from 'js-cookie';
import DashSettings from '../components/dashboard/DashSettings';
import { DashboardComponent } from '../types/dashboard';
import ModesButtons from '../components/modes/ModesButtons';
import UserAvatarDropdown from '../components/dashboard/UserAvatarDropdown';
import { UserType } from '../types/user';
import StudyMode from '../components/dashboard/StudyMode';

// New type definitions
interface Deck {
  id: string;
  name: string;
  userId: string;
}

interface UIPreferences {
  isDarkMode: boolean;
  showFlashcardList: boolean;
  showDefinitions: boolean;
}

// Custom hook for device detection
const useDeviceDetection = () => {
  const [deviceState, setDeviceState] = useState({
    isLandscape: false,
    isMobile: false
  });

  useEffect(() => {
    const checkOrientation = () => {
      setDeviceState({
        isLandscape: window.orientation === 90 || window.orientation === -90,
        isMobile: window.innerWidth <= 768
      });
    };

    checkOrientation();
    window.addEventListener('orientationchange', checkOrientation);
    window.addEventListener('resize', checkOrientation);

    return () => {
      window.removeEventListener('orientationchange', checkOrientation);
      window.removeEventListener('resize', checkOrientation);
    };
  }, []);

  return deviceState;
};

const Dashboard = () => {
  const [user, setUser] = useState<UserType | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedDeckName, setSelectedDeckName] = useState<string | null>(null);
  const router = useRouter();
  
  // Grouped UI preferences
  const [uiPreferences, setUiPreferences] = useState<UIPreferences>({
    isDarkMode: false,
    showFlashcardList: true,
    showDefinitions: true
  });

  const [dashboardComponents, setDashboardComponents] = useState<DashboardComponent[]>([
    { id: 'flashcards', name: 'Flashcards', visible: true, order: 0 },
    { id: 'buttons', name: 'Modes', visible: true, order: 1 },
  ]);

  const { isLandscape, isMobile } = useDeviceDetection();

  // Memoized callbacks
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

  const handleDeckSelect = useCallback((deckId: string) => {
    setSelectedDeckId(deckId);
    const selectedDeck = decks.find(deck => deck.id === deckId);
    setSelectedDeckName(selectedDeck ? selectedDeck.name : null);
  }, [decks]);

  const toggleDarkMode = useCallback(() => {
    setUiPreferences(prev => {
      const newDarkMode = !prev.isDarkMode;
      document.documentElement.classList.toggle('dark', newDarkMode);
      return { ...prev, isDarkMode: newDarkMode };
    });
  }, []);

  const handleToggleFlashcardList = useCallback(() => {
    setUiPreferences(prev => ({
      ...prev,
      showFlashcardList: !prev.showFlashcardList
    }));
  }, []);

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut();
    Cookies.remove('session');
    router.push('/');
  }, [router]);

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
    setUiPreferences(prev => ({
      ...prev,
      isDarkMode: darkMode
    }));
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

  const updateDashboardComponents = (newComponents: DashboardComponent[]) => {
    setDashboardComponents(newComponents);
  };

  // Memoize the selected deck to avoid recalculation on every render
  const selectedDeck = useMemo(() => 
    decks.find(deck => deck.id === selectedDeckId),
    [decks, selectedDeckId]
  );

  // Memoize visible dashboard components
  const visibleComponents = useMemo(() => 
    dashboardComponents
      .filter(comp => comp.visible)
      .sort((a, b) => a.order - b.order),
    [dashboardComponents]
  );

  // Memoize visible buttons components separately since they're used differently
  const visibleButtonsComponents = useMemo(() => 
    visibleComponents.filter(comp => comp.id === 'buttons'),
    [visibleComponents]
  );

  // Memoize visible non-buttons components
  const visibleNonButtonsComponents = useMemo(() => 
    visibleComponents.filter(comp => comp.id !== 'buttons'),
    [visibleComponents]
  );

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
        <div className="flex items-center space-x-4 w-1/3">
          <DashSettings
            components={dashboardComponents}
            onUpdateComponents={updateDashboardComponents}
            showFlashcardList={uiPreferences.showFlashcardList}
            onToggleFlashcardList={handleToggleFlashcardList}
            showDefinitions={uiPreferences.showDefinitions}
            onToggleDefinitions={() => setUiPreferences(prev => ({
              ...prev,
              showDefinitions: !prev.showDefinitions
            }))}
          />
        </div>
        
        <div className="flex-grow flex justify-center w-1/3" />
        
        <div className="flex items-center justify-end w-1/3">
          {user && (
            <UserAvatarDropdown
              user={user}
              isDarkMode={uiPreferences.isDarkMode}
              toggleDarkMode={toggleDarkMode}
              handleSignOut={handleSignOut}
            />
          )}
        </div>
      </header>

      <NavMenu />
      
      <main className="flex-grow p-4 relative z-0">
        {decks.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center sm:items-center">
                {selectedDeck && (
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white text-center sm:text-left mb-4 mr-4 sm:mb-0">
                    {selectedDeck.name}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center gap-2 sm:ml-4">
                  {visibleButtonsComponents.map(comp => (
                    <ModesButtons
                      key={comp.id}
                      userId={user.id}
                      selectedDeckId={selectedDeckId}
                      selectedDeckName={selectedDeck?.name ?? null}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center justify-center mt-4">
              {visibleNonButtonsComponents.map(comp => {
                switch (comp.id) {
                  case 'flashcards':
                    return selectedDeckId ? (
                      <div key={comp.id} className="w-full max-w-3xl">
                        <FlashcardComponent
                          userId={user.id}
                          deckId={selectedDeckId}
                          decks={decks}
                          onDeckChange={(newDeckId) => setSelectedDeckId(newDeckId)}
                          showFlashcardList={uiPreferences.showFlashcardList}
                          showDefinitions={uiPreferences.showDefinitions}
                          selectedDeckId={selectedDeckId}
                          onDeckSelect={handleDeckSelect}
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