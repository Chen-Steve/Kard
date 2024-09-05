import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import NavMenu from '../components/NavMenu';
import { FaCopy } from 'react-icons/fa';
import { useToast } from "@/components/ui/use-toast";

interface PublicDeck {
  id: string;
  name: string;
  description: string;
  userId: string;
  user: {
    name: string;
  };
}

const PublicDecksPage: React.FC = () => {
  const [publicDecks, setPublicDecks] = useState<PublicDeck[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredDecks = publicDecks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const fetchPublicDecks = async () => {
      const response = await fetch('/api/public-decks');
      if (response.ok) {
        const data = await response.json();
        setPublicDecks(data);
      }
    };

    fetchPublicDecks();
  }, []);

  const handleDeckSelect = (deckId: string) => {
    console.log(`Selected deck: ${deckId}`);
  };

  const handleCopyClick = () => {
    toast({
      title: "Coming Soon!",
      description: "The Copy feature is coming soon.",
    });
  };

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-gray-800 flex flex-col md:flex-row">
      <NavMenu onDeckSelect={handleDeckSelect} />
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {filteredDecks.map((deck) => (
              <Card key={deck.id} className="bg-white dark:bg-gray-700">
                <CardHeader>
                  <CardTitle className="text-lg md:text-xl text-black dark:text-gray-100">{deck.name}</CardTitle>
                  <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
                    {deck.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">Created by: {deck.user.name}</p>
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <Link href={`/public-decks/${deck.id}`}>
                      <Button variant="outline" className="w-full sm:w-auto text-black dark:text-gray-200">View Public Deck</Button>
                    </Link>
                    <Button
                      variant="outline"
                      className="w-full sm:w-auto text-black dark:text-gray-200 flex items-center justify-center"
                      onClick={handleCopyClick}
                    >
                      <FaCopy className="mr-2" />
                      Copy Deck
                    </Button>
                  </div>
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