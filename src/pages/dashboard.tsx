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
import { v4 as uuidv4 } from 'uuid';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const router = useRouter();
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { dismiss } = useToast();

  useEffect(() => {
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
        }

        const { data: decksData, error: decksError } = await supabase
          .from('decks')
          .select('*')
          .eq('userId', session.user.id);

        if (decksError) {
          console.error('Error fetching decks:', decksError);
        } else {
          setDecks(decksData);
          if (decksData.length > 0) {
            setSelectedDeckId(decksData[0].id);
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
        }

        const { data: decksData, error: decksError } = await supabase
          .from('decks')
          .select('*')
          .eq('userId', session.user.id);

        if (decksError) {
          console.error('Error fetching decks:', decksError);
        } else {
          setDecks(decksData);
          if (decksData.length > 0) {
            setSelectedDeckId(decksData[0].id);
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

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-gray-800 flex flex-col">
      <header className="w-full text-black dark:text-white p-4 flex justify-between items-center relative">
        <NavMenu />
        <div className="absolute top-4 right-8 flex items-center">
          {user.avatarUrl && (
            <div className="relative" ref={dropdownRef}>
              <UserAvatar
                avatarSvg={user.avatarUrl}
                alt="User Avatar"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              />
              {dropdownOpen && (
                <div className="absolute right-2 mt-6 w-48 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-md shadow-lg z-10">
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
                </div>
              )}
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow p-4 mt-12">
        {decks.length > 0 && (
          <div className="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4 mb-2">
            <button
              className="flex items-center space-x-4 bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 h-12 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={handleLearnClick}
            >
              <SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
              <span className="text-xl font-semibold mb-1">Learn</span>
            </button>
            <button
              className="flex items-center space-x-4 bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 h-12 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={handleTestClick}
            >
              <RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.5rem' }} />
              <span className="text-xl font-semibold mb-1">Test</span>
            </button>
            <button
              className="flex items-center space-x-4 bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 h-12 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={handleMatchClick}
            >
              <PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.5rem' }} />
              <span className="text-xl font-semibold mb-1">Match</span>
            </button>
            <button
              className="flex items-center space-x-4 bg-white dark:bg-gray-700 shadow-md rounded-lg p-4 h-12 hover:bg-gray-100 dark:hover:bg-gray-600"
              onClick={async () => {
                if (selectedDeckId) {
                  router.push(`/ai-chat/${user.id}/${selectedDeckId}`);
                } else {
                  toast({
                    title: 'No Deck Selected',
                    description: 'Please select a deck to start the AI chat.',
                  });
                }
              }}
            >
              <BiSolidMessageSquareDots className="text-[#637FBF] font-bold" style={{ fontSize: '1.5rem' }} />
              <span className="text-xl font-semibold mb-1">K-Chat</span>
            </button>
          </div>
        )}
        {decks.length === 0 ? (
          <div className="flex justify-center mt-20 items-center h-full">
            <p className="text-xl font-semibold text-gray-700 dark:text-gray-300">Go to your library and create some decks!</p>
          </div>
        ) : (
          selectedDeckId && <FlashcardComponent userId={user.id} deckId={selectedDeckId} decks={decks} />
        )}
      </main>
      <footer className="w-full bg-white-700 dark:bg-gray-800 text-black dark:text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
      <Toaster />
    </div>
  );
};

export default Dashboard;