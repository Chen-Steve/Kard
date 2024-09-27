import React, { useState, useEffect, useCallback } from 'react';
import { FaSearch, FaChevronUp, FaChevronDown } from "react-icons/fa";
import debounce from 'lodash/debounce';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Deck {
  id: string;
  name: string;
}

interface DeckSelectorProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onDeckSelect: (deckId: string) => void;
}

const DeckSelector: React.FC<DeckSelectorProps> = ({ decks, selectedDeckId, onDeckSelect }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>([]);
  const [isOpen, setIsOpen] = useState(false);

  const filterDecks = useCallback((term: string) => {
    return decks.filter(deck => 
      deck.name.toLowerCase().includes(term.toLowerCase())
    );
  }, [decks]);

  const debouncedSearch = useCallback(
    (term: string) => {
      const filtered = decks.filter(deck => 
        deck.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredDecks(filtered);
    },
    [decks]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      debouncedSearch(searchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm, debouncedSearch]);

  const handleDeckSelect = (deckId: string) => {
    onDeckSelect(deckId);
    setSearchTerm('');
    setIsOpen(false);
  };

  return (
    <div className="relative w-full mb-1 max-w-full sm:max-w-md mx-auto">
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="Your decks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg p-2 pl-10 pr-10 appearance-none text-sm md:text-base"
        />
        <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400" />
        <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
          <DropdownMenuTrigger asChild>
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 cursor-pointer p-2 -mr-2">
              {isOpen ? (
                <FaChevronUp className="text-gray-500 dark:text-gray-400 text-lg md:text-xl" />
              ) : (
                <FaChevronDown className="text-gray-500 dark:text-gray-400 text-lg md:text-xl" />
              )}
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-full min-w-[200px] max-w-md mt-1">
            {decks.map((deck) => (
              <DropdownMenuItem
                key={deck.id}
                onClick={() => handleDeckSelect(deck.id)}
                className={`p-3 ${deck.id === selectedDeckId ? 'bg-accent' : ''}`}
              >
                {deck.name}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {searchTerm && filteredDecks.length > 0 && (
        <ul className="absolute mt-1 w-full bg-white dark:bg-gray-700 border-2 border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden shadow-lg z-10 max-h-60 overflow-y-auto">
          {filteredDecks.map((deck) => (
            <li 
              key={deck.id}
              onClick={() => handleDeckSelect(deck.id)}
              className={`p-3 cursor-pointer text-sm md:text-base hover:bg-gray-100 dark:hover:bg-gray-600 ${
                deck.id === selectedDeckId ? 'bg-accent' : ''
              }`}
            >
              {deck.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default DeckSelector;