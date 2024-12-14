import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Deck } from '../../types/deck';
import MiniatureFlashcards from './MiniatureFlashcards';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Badge } from '../ui/badge';
import { useRouter } from 'next/router';

interface DeckCardProps {
  deck: Deck;
  index?: number;
  isSelected: boolean;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => Promise<void>;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, index, isSelected, onEdit, onDelete }) => {
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    router.push(`/dashboard?deckId=${deck.id}`);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(deck);
  };

  const content = (
    <Card className={`relative bg-white dark:bg-gray-800/40 border dark:border-gray-700/50 ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader 
        className="cursor-default"
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-gray-900 dark:text-gray-100 text-lg sm:text-xl">{deck.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDropdown}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            {isDropdownOpen ? (
              <Icon icon="pepicons-print:angle-up" className="h-4 w-4" />
            ) : (
              <Icon icon="pepicons-print:angle-down" className="h-4 w-4" />
            )}
          </Button>
        </div>
        <CardDescription className="text-gray-600 dark:text-gray-400 text-sm">
          {deck.description}
        </CardDescription>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {Array.isArray(deck.tags) && deck.tags.map((tag) => (
            <Badge
              key={tag.id}
              variant="outline"
              className="text-xs bg-gray-100 dark:bg-gray-700/50 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 border-gray-300 dark:border-gray-600/50"
            >
              {tag.name}
            </Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col space-y-2">
        <Droppable droppableId={deck.id} type="FLASHCARD">
          {(provided, snapshot) => (
            <div
              ref={provided.innerRef}
              {...provided.droppableProps}
              className={`min-h-[50px] rounded-md transition-colors ${
                snapshot.isDraggingOver ? 'bg-blue-100/50 dark:bg-blue-900/20' : ''
              }`}
            >
              {isDropdownOpen && <MiniatureFlashcards deckId={deck.id} />}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
          <Link href={`/dashboard?deckId=${deck.id}`}>
            <Button 
              variant="outline" 
              className="w-full sm:w-auto bg-transparent dark:bg-transparent border-gray-300 dark:border-gray-600/50 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700/50"
            >
              Edit Deck
            </Button>
          </Link>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="flex-grow sm:flex-grow-0 bg-transparent dark:bg-transparent border-blue-500 dark:border-blue-400/50 text-blue-500 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
            >
              Update
            </Button>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(deck.id);
              }}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <Icon icon="pepicons-print:trash" className="h-6 w-6" />
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
