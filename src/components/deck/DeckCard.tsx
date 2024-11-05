import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import { Button } from '../ui/Button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../ui/Card';
import { Deck } from '../../types/deck';
import MiniatureFlashcards from './MiniatureFlashcards';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import { Badge } from '../ui/badge';

interface DeckCardProps {
  deck: Deck;
  index?: number;
  isSelected: boolean;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => Promise<void>;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, index, isSelected, onEdit, onDelete }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const toggleDropdown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDropdownOpen(!isDropdownOpen);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(deck);
  };

  const content = (
    <Card className={`relative ${isSelected ? 'ring-2 ring-blue-500' : ''}`}>
      <CardHeader 
        className="cursor-pointer" 
        onClick={(e) => {
          if (!(e.target as HTMLElement).closest('button')) {
            setIsDropdownOpen(!isDropdownOpen);
          }
        }}
      >
        <div className="flex justify-between items-center">
          <CardTitle className="text-black dark:text-gray-100 text-lg sm:text-xl">{deck.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleDropdown}
            className="text-gray-500 dark:text-gray-400"
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
              className="text-xs bg-background hover:bg-background"
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
                snapshot.isDraggingOver ? 'bg-blue-100 dark:bg-blue-900' : ''
              }`}
            >
              {isDropdownOpen && <MiniatureFlashcards deckId={deck.id} />}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
          <Link href={`/decks/${deck.id}`}>
            <Button variant="outline" className="text-black dark:text-gray-200 w-full sm:w-auto">View Deck</Button>
          </Link>
          <div className="flex space-x-2 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleEdit}
              className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-600 flex-grow sm:flex-grow-0"
            >
              Edit
            </Button>
            <Button
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(deck.id);
              }}
              className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
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
