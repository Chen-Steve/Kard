import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import NavMenu from '../components/dashboard/NavMenu';
import NodeMapVisualization from '../components/node-map/NodeMapVisualization';
import { Deck } from '../types/deck';

const NodeMapPage = () => {
  const router = useRouter();
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/signin');
        return;
      }

      try {
        const { data: decksData, error } = await supabase
          .from('decks')
          .select(`
            *,
            flashcards (*)
          `)
          .eq('userId', session.user.id);

        if (error) throw error;
        
        console.log('Fetched decks with flashcards:', decksData);
        setDecks(decksData);
      } catch (error) {
        console.error('Error fetching decks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDecks();
  }, [router]);

  if (loading) return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex items-center justify-center">
      <div className="text-xl text-black dark:text-white">Loading...</div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex items-center justify-center">
      <div className="text-xl text-red-500">Error: {error}</div>
    </div>
  );

  console.log('Rendering with decks:', decks);

  return (
    <div className="h-screen bg-[#F8F7F6] dark:bg-gray-800 overflow-hidden">
      <NavMenu />
      <div className="h-full w-full">
        <NodeMapVisualization decks={decks} />
      </div>
    </div>
  );
};

export default NodeMapPage; 