import '../app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Flashcard from '../components/Flashcard';

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        router.push('/signin');
      } else {
        setUser(session.user);
      }
    };

    getSession();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        router.push('/signin');
      } else {
        setUser(session?.user || null);
      }
    });

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [router]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/signin');
  };

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col">
      <header className="w-full bg-white-700 text-black p-4 flex justify-center items-center relative">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mt-4">WorkSpace</h1>
          <p>Welcome, {user.email}!</p>
        </div>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-2 py-2 rounded-md shadow-md hover:bg-red-700 transition absolute right-4 top-4"
        >
          Sign Out
        </button>
      </header>
      <main className="flex-grow p-4">
        <Flashcard userId={user.id} />
      </main>
      <footer className="w-full bg-white-700 text-black p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;