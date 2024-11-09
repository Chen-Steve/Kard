import React, { useEffect, useState, useCallback } from 'react';
import NavMenu from '../components/dashboard/NavMenu';
import { useToast } from "@/components/ui/use-toast";
import supabase from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Switch } from '../components/ui/switch';
import ErrorMessage from '@/components/public-deck/ErrorMessage';
import DeckCard from '../components/public-deck/DeckCard';

interface PublicDeck {
  id: string;
  name: string;
  description: string;
  userId: string;
  user: {
    name: string;
  };
  _count: {
    stars: number;
  };
  isStarred: boolean;
}

const PublicDecksPage: React.FC = () => {
  const [publicDecks, setPublicDecks] = useState<PublicDeck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();
  const [showOnlyUserDecks, setShowOnlyUserDecks] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchPublicDecks = useCallback(async () => {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        throw new Error('Please sign in to view public decks');
      }

      setUserId(session.user.id);
      const response = await fetch('/api/public-decks');

      if (!response.ok) {
        throw new Error('Failed to fetch public decks');
      }

      const data = await response.json();
      const updatedData = data.map((deck: PublicDeck) => ({
        ...deck,
        isStarred: localStorage.getItem(`deck-${deck.id}-starred`) === 'true'
      }));

      setPublicDecks(updatedData);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicDecks();
  }, [fetchPublicDecks]);

  const handleStarClick = async (deckId: string) => {
    try {
      const response = await fetch(`/api/public-decks/${deckId}/star`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const updatedDeck = await response.json();
        setPublicDecks(prevDecks =>
          prevDecks.map(deck =>
            deck.id === deckId 
              ? { ...deck, _count: { stars: updatedDeck.starCount }, isStarred: updatedDeck.isStarred } 
              : deck
          )
        );

        // Save star status in localStorage
        localStorage.setItem(`deck-${deckId}-starred`, updatedDeck.isStarred.toString());

        toast({
          title: updatedDeck.isStarred ? "Deck Starred" : "Star Removed",
          description: updatedDeck.isStarred ? "You've starred this deck." : "You've removed your star from this deck.",
        });
      } else {
        throw new Error('Failed to update star');
      }
    } catch (error) {
      console.error('Error updating star:', error);
      toast({
        title: "Error",
        description: "Failed to update star. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleCopyClick = () => {
    toast({
      title: "Coming Soon!",
      description: "The Copy feature is coming soon.",
    });
  };

  const filteredDecks = publicDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (!showOnlyUserDecks || deck.userId === userId)
  );

  // Sort decks by star count in descending order
  const sortedDecks = [...filteredDecks].sort((a, b) => b._count.stars - a._count.stars);

  // Get top 5 decks and the rest
  const topDecks = sortedDecks.slice(0, 5);
  const restDecks = sortedDecks.slice(5);

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return <ErrorMessage message={error} />;

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col md:flex-row">
      <NavMenu onDeckSelect={handleStarClick} />
      <div className="flex-1 p-4 md:pl-64 md:pt-20">
        <main className="max-w-7xl mx-auto">
          <div className="mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-1/3 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          
          <div className="flex items-center gap-4 mb-4 md:mb-6">
            <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white">Popular Decks</h2>
            <div className="flex items-center">
              <Switch
                id="show-user-decks"
                checked={showOnlyUserDecks}
                onCheckedChange={setShowOnlyUserDecks}
              />
              <label htmlFor="show-user-decks" className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                Show only my decks
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {topDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStarClick={handleStarClick}
                onCopyClick={handleCopyClick}
              />
            ))}
          </div>

          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-4 md:mb-8">Latest Decks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {restDecks.map((deck) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                onStarClick={handleStarClick}
                onCopyClick={handleCopyClick}
              />
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicDecksPage;