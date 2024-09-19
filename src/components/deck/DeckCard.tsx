import React, { useState } from 'react';
import Link from 'next/link';
import { Trash2 } from 'lucide-react';
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Deck } from '../../types/deck';

interface DeckCardProps {
  deck: Deck;
  isSelected: boolean;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, isSelected, onEdit, onDelete }) => {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <Card className={`hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700 ${
      isSelected ? 'border-2 border-blue-500' : ''
    } relative`}>
      <button
        onClick={() => setIsFavorite(!isFavorite)}
        className="absolute top-2 right-2 text-yellow-500 hover:text-yellow-600 transition-colors duration-200"
      >
        {isFavorite ? <IoMdStar size={24} /> : <IoMdStarOutline size={24} />}
      </button>
      <CardHeader>
        <CardTitle className="text-black dark:text-gray-100 text-lg sm:text-xl">{deck.name}</CardTitle>
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
      <CardContent className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
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
      </CardContent>
    </Card>
  );
};

export default DeckCard;