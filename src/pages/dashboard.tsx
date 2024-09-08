import '../app/globals.css';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import UserAvatar from '../components/UserAvatar';
import { getMicahAvatarSvg } from '../utils/avatar';
import { SiStagetimer } from "react-icons/si";
import { RiTimerFill } from "react-icons/ri";
import { PiCardsFill } from "react-icons/pi";
import { BiSolidMessageSquareDots } from "react-icons/bi";
import { MdDarkMode } from "react-icons/md"; 
import { FaSun } from "react-icons/fa";
import NavMenu from '../components/NavMenu';
import FlashcardComponent from '../components/Flashcard';
import { toast, useToast } from '../components/ui/use-toast';
import { Toaster } from '../components/ui/toaster';
import Cookies from 'js-cookie';
import { HiLightningBolt } from "react-icons/hi";
import { initCursor, updateCursor, customCursorStyle } from 'ipad-cursor';
import DashSettings from '../components/DashSettings';
import { DashboardComponent } from '../types/dashboard';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const [selectedDeckName, setSelectedDeckName] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dismiss } = useToast();
  const [userMembership, setUserMembership] = useState('free');
  const [dashboardComponents, setDashboardComponents] = useState<DashboardComponent[]>([
    { id: 'flashcards', name: 'Flashcards', visible: true, order: 0 },
    { id: 'buttons', name: 'Modes', visible: true, order: 1 },
    // Add more components as needed
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

    const getSession = async () => {
      const sessionData = Cookies.get('session');
      if (sessionData) {
        const session = JSON.parse(sessionData);
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          if (userError.code === 'PGRST116') {
            console.error('No user data found for this ID');
          } else {
            console.error('Error fetching user data:', userError);
          }
        } else {
          userData.avatarUrl = getMicahAvatarSvg(userData.email);
          setUser(userData);
          setUserMembership(userData.membership || 'free');
        }

        const { data: decksData, error: decksError } = await supabase
          .from('decks')
          .select('*')
          .eq('userId', session.user.id);

        if (decksError) {
          console.error('Error fetching decks:', decksError);
        } else {
          setDecks(decksData);
          const savedDeckId = localStorage.getItem('selectedDeckId');
          if (savedDeckId && decksData.some(deck => deck.id === savedDeckId)) {
            setSelectedDeckId(savedDeckId);
            const selectedDeck = decksData.find(deck => deck.id === savedDeckId);
            setSelectedDeckName(selectedDeck ? selectedDeck.name : null);
          } else if (decksData.length > 0) {
            setSelectedDeckId(decksData[0].id);
            setSelectedDeckName(decksData[0].name);
          }
        }
      } else {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session) {
          console.error('No active session found.');
          router.push('/signin');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (userError) {
          if (userError.code === 'PGRST116') {
            console.error('No user data found for this ID');
          } else {
            console.error('Error fetching user data:', userError);
          }
        } else {
          userData.avatarUrl = getMicahAvatarSvg(userData.email);
          setUser(userData);
          setUserMembership(userData.membership || 'free');
        }

        const { data: decksData, error: decksError } = await supabase
          .from('decks')
          .select('*')
          .eq('userId', session.user.id);

        if (decksError) {
          console.error('Error fetching decks:', decksError);
        } else {
          setDecks(decksData);
          const savedDeckId = localStorage.getItem('selectedDeckId');
          if (savedDeckId && decksData.some(deck => deck.id === savedDeckId)) {
            setSelectedDeckId(savedDeckId);
            const selectedDeck = decksData.find(deck => deck.id === savedDeckId);
            setSelectedDeckName(selectedDeck ? selectedDeck.name : null);
          } else if (decksData.length > 0) {
            setSelectedDeckId(decksData[0].id);
            setSelectedDeckName(decksData[0].name);
          }
        }
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        Cookies.remove('session'); // Remove session from cookies on sign out
        router.push('/signin');
      } else {
        const fetchUserData = async () => {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', session?.user.id)
            .single();

          if (error) {
            console.error('Error fetching user data:', error);
          } else {
            userData.avatarUrl = getMicahAvatarSvg(userData.email);
            setUser(userData);
            setUserMembership(userData.membership || 'free');
          }
        };

        fetchUserData();
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  useEffect(() => {
    if (selectedDeckId) {
      localStorage.setItem('selectedDeckId', selectedDeckId);
    }
  }, [selectedDeckId]);

  useEffect(() => {
    updateCursor(); // Call updateCursor after DOM updates
  }, [isDarkMode, selectedDeckId, decks]);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  const handleLearnClick = () => {
    if (selectedDeckId) {
      router.push(`/learning-mode/${user.id}/${selectedDeckId}`);
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
    if (selectedDeckId) {
      router.push(`/matching-game/${user.id}/${selectedDeckId}`);
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
  };

  const updateDashboardComponents = (newComponents: DashboardComponent[]) => {
    setDashboardComponents(newComponents);
  };

  if (!user) return <p data-cursor="text">Loading...</p>;

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col" data-cursor="normal">
      <header className="w-full text-black dark:text-white p-4 flex justify-between items-center relative" data-cursor="normal">
        <div className="flex items-center">
          <DashSettings
            components={dashboardComponents}
            onUpdateComponents={updateDashboardComponents}
          />
          <NavMenu onDeckSelect={handleDeckSelect} />
        </div>
        <div className="flex items-center">
          {user.avatarUrl && (
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
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
                    >
                      {isDarkMode ? <FaSun className="mr-2" /> : <MdDarkMode className="mr-2" />}
                      {isDarkMode ? 'Light Mode' : 'Dark Mode'}
                    </button>
                  </div>
                  <div className="border-t border-gray-200 dark:border-gray-600">
                    {userMembership === 'pro' ? (
                      <div className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 flex items-center">
                        <HiLightningBolt className="mr-2" />
                        Pro
                      </div>
                    ) : (
                      <button
                        onClick={() => router.push('/pricing')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 flex items-center"
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
      
      <main className="flex-grow p-4" data-cursor="normal">
        {decks.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-col sm:flex-row items-center justify-center">
              <div className="flex flex-col sm:flex-row items-center sm:items-center">
                {selectedDeckName && (
                  <h2 className="text-xl sm:text-2xl font-bold text-black dark:text-white text-center sm:text-left mb-4 sm:mb-0" data-cursor="text">
                    {selectedDeckName}
                  </h2>
                )}
                <div className="flex flex-wrap justify-center gap-2 sm:ml-4">
                  {dashboardComponents
                    .filter(comp => comp.visible && comp.id === 'buttons')
                    .map(comp => (
                      <div key={comp.id} className="flex flex-wrap justify-center gap-2">
                        <button
                          className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
                          onClick={handleLearnClick}
                          data-cursor="block"
                        >
                          <SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1rem' }} />
                          <span className="font-semibold">Learn</span>
                        </button>
                        <button
                          className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
                          onClick={handleTestClick}
                          data-cursor="block"
                        >
                          <RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
                          <span className="font-semibold">Test</span>
                        </button>
                        <button
                          className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
                          onClick={handleMatchClick}
                          data-cursor="block"
                        >
                          <PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
                          <span className="font-semibold">Match</span>
                        </button>
                        <div className="relative">
                          <button
                            title="K-Chat"
                            className={`
                              flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12
                              hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base
                              focus:outline-none focus:ring-2 focus:ring-blue-300 dark:focus:ring-blue-700
                            `}
                            onClick={async () => {
                              if (userMembership === 'pro') {
                                if (selectedDeckId) {
                                  router.push(`/ai-chat/${user.id}/${selectedDeckId}`);
                                } else {
                                  toast({
                                    title: 'No Deck Selected',
                                    description: 'Please select a deck to start the AI chat.',
                                  });
                                }
                              } else {
                                toast({
                                  title: 'Upgrade to Pro',
                                  description: 'K-Chat is a Pro feature. Upgrade your account to access it!',
                                  action: (
                                    <button
                                      onClick={() => router.push('/pricing')}
                                      className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
                                    >
                                      Upgrade
                                    </button>
                                  ),
                                });
                              }
                            }}
                            data-cursor="block"
                          >
                            <BiSolidMessageSquareDots className="text-[#637FBF] font-bold" style={{ fontSize: '1.2rem' }} />
                            <span className="font-semibold">K-Chat</span>
                          </button>
                          {userMembership !== 'pro' && (
                            <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 opacity-30 rounded-lg pointer-events-none"
                                 style={{
                                   backgroundImage: `repeating-linear-gradient(
                                   45deg,
                                  transparent,
                                  transparent 10px,
                                  rgba(0,0,0,0.1) 10px,
                                  rgba(0,0,0,0.1) 20px
                                )`
                                 }}
                            />
                          )}
                          {userMembership !== 'pro' && (
                            <div className="absolute top-0 right-0 bg-yellow-400 text-xs text-black px-1 py-0.5 rounded-bl">
                              <HiLightningBolt className="inline-block mr-1" />
                              PRO
                            </div>
                          )}
                        </div>
                      </div>
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
                    // Add more cases for other components
                    default:
                      return null;
                  }
                })}
            </div>
          </div>
        )}
        {decks.length === 0 && (
          <div className="flex justify-center mt-20 items-center h-full">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300" data-cursor="text">Go to your library and create some decks!</p>
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