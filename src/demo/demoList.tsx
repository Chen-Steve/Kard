import { FC } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface Flashcard {
  id: string;
  content: string;
}

interface FlashcardListProps {
  id: string;
  flashcards: Flashcard[];
}

const FlashcardList: FC<FlashcardListProps> = ({ id, flashcards }) => {
  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="bg-gray-200 p-4 rounded-md shadow-md w-64 border-2 border-black"
        >
          {flashcards.map((flashcard, index) => (
            <Draggable key={flashcard.id} draggableId={flashcard.id} index={index}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className="bg-white p-4 mb-2 rounded-md shadow-md"
                >
                  {flashcard.content}
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );
};

export default FlashcardList;
