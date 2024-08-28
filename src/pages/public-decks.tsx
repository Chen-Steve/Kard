import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import NavMenu from '../components/NavMenu';

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

  return (
    <div className="min-h-screen bg-blue-100 dark:bg-gray-800 flex">
      <NavMenu onDeckSelect={handleDeckSelect} />
      <div className="flex-1 pl-64 pt-20">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-black dark:text-white mb-8">Public Decks</h1>
          <div className="mb-6 flex justify-left">
            <input
              type="text"
              placeholder="Search decks..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full max-w-md p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-black dark:text-white"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              <Card key={deck.id} className="bg-white dark:bg-gray-700">
                <CardHeader>
                  <CardTitle className="text-black dark:text-gray-100">{deck.name}</CardTitle>
                  <CardDescription className="text-gray-600 dark:text-gray-400">
                    {deck.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Created by: {deck.user.name}</p>
                  <Link href={`/public-decks/${deck.id}`}>
                    <Button variant="outline" className="text-black dark:text-gray-200">View Public Deck</Button>
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