import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Deck } from '../../types/deck';
import MiniatureFlashcards from './MiniatureFlashcards';
import { Draggable } from '@hello-pangea/dnd';

interface DeckCardProps {
  deck: Deck;
  index?: number;
  isSelected: boolean;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => Promise<void>;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, index, isSelected, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  // If index is provided, wrap with Draggable, otherwise just render the Card
  const content = (
    <Card
      className={`hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700 ${
        isSelected ? 'border-2 border-blue-500' : ''
      }`}
    >
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-black dark:text-gray-100 text-lg sm:text-xl">{deck.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDropdown}
            className="text-gray-500 dark:text-gray-400"
          >
            {isDropdownOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
          {deck.description}
        </CardDescription>
        <div className="mt-2 flex flex-wrap">
          {deck.tags.map((tag) => (
            <span key={tag.id} className="inline-block text-gray-800 text-xs px-2 py-1 rounded mr-2 mb-2" style={{ backgroundColor: tag.color }}>
              {tag.name}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        {isDropdownOpen && <MiniatureFlashcards deckId={deck.id} />}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="outline" className="text-black dark:text-gray-200 w-full sm:w-auto">View Deck</Button>
          </Link>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={() => onEdit(deck)}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 flex-grow sm:flex-grow-0"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={() => onDelete(deck.id)}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return index !== undefined ? (
    <Draggable draggableId={deck.id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          {content}
        </div>
      )}
    </Draggable>
  ) : content;
};

export default DeckCard;