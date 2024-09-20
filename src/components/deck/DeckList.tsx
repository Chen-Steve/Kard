import React from 'react';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import DeckCard from './DeckCard';
import { Deck } from '../../types/deck';

interface DeckListProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onDeckUpdate: (updatedDeck: Deck) => void;
  onDeckDelete: (deckId: string) => Promise<void>;
  onFlashcardMove: (flashcardId: string, sourceDeckId: string, destinationDeckId: string) => void;
}

const DeckList: React.FC<DeckListProps> = ({ decks, selectedDeckId, onDeckUpdate, onDeckDelete, onFlashcardMove }) => {
  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      return;
    }

    onFlashcardMove(draggableId, source.droppableId, destination.droppableId);
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="deck-list" type="DECK" direction="horizontal">
        {(provided) => (
          <div
            {...provided.droppableProps}
            ref={provided.innerRef}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {decks.map((deck, index) => (
              <DeckCard
                key={deck.id}
                deck={deck}
                index={index}
                isSelected={deck.id === selectedDeckId}
                onEdit={onDeckUpdate}
                onDelete={onDeckDelete}
              />
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DeckList;