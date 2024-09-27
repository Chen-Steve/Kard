import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import NavMenu from '../components/dashboard/NavMenu';
import { FaCopy } from 'react-icons/fa';
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { useToast } from "@/components/ui/use-toast";
import supabase from '../lib/supabaseClient';
import { useRouter } from 'next/router';
import { Switch } from '../components/ui/switch';

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

  const fetchPublicDecks = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    setUserId(session.user.id);

    try {
      const response = await fetch('/api/public-decks', {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch public decks');
      }

      const data = await response.json();

      // Check localStorage for star status
      const updatedData = data.map((deck: PublicDeck) => {
        const isStarred = localStorage.getItem(`deck-${deck.id}-starred`) === 'true';
        return { ...deck, isStarred };
      });

      setPublicDecks(updatedData);
    } catch (error) {
      console.error('Error fetching public decks:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

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

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex flex-col md:flex-row">
      <NavMenu onDeckSelect={handleStarClick} />
      <div className="flex-1 p-4 md:pl-64 md:pt-20">
        <main className="max-w-7xl mx-auto">
          <h1 className="text-2xl md:text-3xl font-bold text-black dark:text-white mb-4 md:mb-8 mt-20 md:mt-0">Public Decks</h1>
          <div className="mb-4 md:mb-6">
            <input
              type="text"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          
          <div className="flex items-center justify-between mb-4 md:mb-6">
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
              <Card key={deck.id} className="bg-white dark:bg-gray-700 relative">
                <div 
                  className="absolute top-2 right-2 cursor-pointer text-2xl"
                  onClick={() => handleStarClick(deck.id)}
                >
                  {deck.isStarred ? (
                    <IoMdStar className="text-yellow-500" />
                  ) : (
                    <IoMdStarOutline className="text-gray-400 hover:text-yellow-500" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl text-black dark:text-gray-100">{deck.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {deck.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">Created by: {deck.user.name}</p>
                  <div className="flex justify-between items-center mb-2">
                    <Button
                      variant="outline"
                      className="text-yellow-500"
                    >
                      <IoMdStar className="mr-2" />
                      {deck._count?.stars || 0} {(deck._count?.stars || 0) === 1 ? 'Star' : 'Stars'}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-black dark:text-gray-200"
                      onClick={handleCopyClick}
                    >
                      <FaCopy className="mr-2" />
                      Copy Deck
                    </Button>
                  </div>
                  <Link href={`/public-decks/${deck.id}`}>
                    <Button variant="outline" className="w-full text-black dark:text-gray-200">View Public Deck</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <hr className="my-8 border-gray-300 dark:border-gray-600" />

          <h2 className="text-xl md:text-2xl font-bold text-black dark:text-white mb-4 md:mb-8">Latest Decks</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {restDecks.map((deck) => (
              <Card key={deck.id} className="bg-white dark:bg-gray-700 relative">
                <div 
                  className="absolute top-2 right-2 cursor-pointer text-2xl"
                  onClick={() => handleStarClick(deck.id)}
                >
                  {deck.isStarred ? (
                    <IoMdStar className="text-yellow-500" />
                  ) : (
                    <IoMdStarOutline className="text-gray-400 hover:text-yellow-500" />
                  )}
                </div>
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl text-black dark:text-gray-100">{deck.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {deck.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">Created by: {deck.user.name}</p>
                  <div className="flex justify-between items-center mb-2">
                    <Button
                      variant="outline"
                      className="text-yellow-500"
                    >
                      <IoMdStar className="mr-2" />
                      {deck._count?.stars || 0} {(deck._count?.stars || 0) === 1 ? 'Star' : 'Stars'}
                    </Button>
                    <Button
                      variant="outline"
                      className="text-black dark:text-gray-200"
                      onClick={handleCopyClick}
                    >
                      <FaCopy className="mr-2" />
                      Copy Deck
                    </Button>
                  </div>
                  <Link href={`/public-decks/${deck.id}`}>
                    <Button variant="outline" className="w-full text-black dark:text-gray-200">View Public Deck</Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};

export default PublicDecksPage;