// src/pages/dashboard.tsx
import '../app/globals.css';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';

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

  if (!user) return <p>Loading...</p>;

  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center">
      <header className="w-full bg-gray-800 text-white p-4 flex flex-col items-center">
        <h1 className="text-2xl font-semibold mt-4">Dashboard</h1>
        <p>Welcome, {user.email}!</p>
      </header>
      <main className="flex-grow flex flex-col items-center justify-center">
        <div className="flex gap-4 mb-8">
          <Link href="/card" legacyBehavior>
            <a className="bg-blue-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-blue-700 transition">
              Go to Cards
            </a>
          </Link>
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push('/signin');
            }}
            className="bg-red-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-red-700 transition"
          >
            Sign Out
          </button>
        </div>
      </main>
      <footer className="w-full bg-gray-800 text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
