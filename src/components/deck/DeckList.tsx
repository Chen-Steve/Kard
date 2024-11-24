import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Deck } from '@/types/deck';
import DeckCard from './DeckCard';

interface DeckListProps {
  decks: Deck[];
  selectedDeckId: string | null;
  onDragEnd: (result: DropResult) => void;
  onEdit: (deck: Deck) => void;
  onDelete: (deckId: string) => Promise<void>;
}

const DeckList = ({ 
  decks, 
  selectedDeckId, 
  onDragEnd, 
  onEdit, 
  onDelete 
}: DeckListProps) => {
  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="decks" type="DECK">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
          >
            {decks.map((deck, index) => (
              deck && deck.id ? (
                <Draggable key={deck.id} draggableId={deck.id} index={index}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                    >
                      <DeckCard
                        deck={deck}
                        isSelected={deck.id === selectedDeckId}
                        onEdit={onEdit}
                        onDelete={onDelete}
                      />
                    </div>
                  )}
                </Draggable>
              ) : null
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default DeckList; 