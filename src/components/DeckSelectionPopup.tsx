import React, { useState, useEffect } from 'react';
import { Deck } from '../types/deck';

interface DeckSelectionPopupProps {
  onClose: () => void;
  onDeckSelected: (deckId: string) => void;
  userId: string;
}

const DeckSelectionPopup: React.FC<DeckSelectionPopupProps> = ({ onClose, onDeckSelected, userId }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDecks = async () => {
      if (!userId) {
        setError('User ID not provided');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/decks?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch decks');
        }
        const data = await response.json();
        setDecks(data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching decks:', error);
        setError('Failed to load decks. Please try again.');
        setLoading(false);
      }
    };

    fetchDecks();
  }, [userId]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold mb-4 text-black dark:text-white">Select a Deck</h2>
        {loading && <p>Loading decks...</p>}
        {error && <p className="text-red-500">{error}</p>}
        {!loading && !error && (
          <ul className="space-y-2 mb-4">
            {decks.map((deck) => (
              <li key={deck.id}>
                <button
                  onClick={() => onDeckSelected(deck.id)}
                  className="w-full text-left px-4 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white"
                >
                  {deck.name}
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          onClick={onClose}
          className="w-full bg-blue-500 text-white py-2 rounded hover:bg-blue-600"
        >
          Close
        </button>
      </div>
    </div>
  );
};

export default DeckSelectionPopup;