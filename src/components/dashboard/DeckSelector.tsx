import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaSearch } from "react-icons/fa";
import debounce from 'lodash/debounce';
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from "@/components/ui/popover";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const [filteredDecks, setFilteredDecks] = useState<Deck[]>(decks);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const filterDecks = useCallback(
    debounce((term: string) => {
      const filtered = decks.filter(deck => 
        deck.name.toLowerCase().includes(term.toLowerCase())
      );
      setFilteredDecks(filtered);
    }, 300),
    [decks]
  );

  useEffect(() => {
    filterDecks(searchTerm);
  }, [searchTerm, filterDecks]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (!open) setOpen(true);
  };

  const handleSelect = (deckId: string) => {
    onDeckSelect(deckId);
    setOpen(false);
    setSearchTerm('');
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverAnchor asChild>
        <div className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={() => setOpen(true)}
            placeholder="Search decks..."
            className="w-full p-2 pl-10 pr-4 border border-gray-300 rounded-md dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
        </div>
      </PopoverAnchor>
      <PopoverContent className="w-[calc(50vw-6rem)] sm:w-[300px] p-0" align="center">
        <ul className="max-h-[50vh] sm:max-h-[300px] overflow-auto">
          {filteredDecks.map((deck) => (
            <li
              key={deck.id}
              className={cn(
                "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none",
                selectedDeckId === deck.id ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
              )}
              onClick={() => handleSelect(deck.id)}
            >
              <Check
                className={cn(
                  "mr-2 h-4 w-4",
                  selectedDeckId === deck.id ? "opacity-100" : "opacity-0"
                )}
              />
              {deck.name}
            </li>
          ))}
        </ul>
      </PopoverContent>
    </Popover>
  );
};

export default DeckSelector;