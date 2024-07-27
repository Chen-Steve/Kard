import React, { useState } from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardListProps {
  id: string;
  flashcards: Flashcard[];
}

const FlashcardList: React.FC<FlashcardListProps> = ({ id, flashcards }) => {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const toggleCard = (cardId: string) => {
    setFlippedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <Droppable droppableId={id}>
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-4 min-h-[200px] min-w-[300px] bg-gray-50 p-4 rounded-lg"
        >
          {flashcards.map((flashcard, index) => (
            <Draggable key={flashcard.id} draggableId={flashcard.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`bg-white p-6 rounded-lg shadow-md transition-all duration-300 cursor-pointer
                    ${snapshot.isDragging ? 'shadow-lg scale-105' : 'hover:shadow-lg'}
                    ${flippedCards.has(flashcard.id) ? 'flipped' : ''}
                  `}
                  style={{ ...provided.draggableProps.style }}
                  onClick={() => toggleCard(flashcard.id)}
                >
                  <div className="flex justify-between items-center">
                    <div className="flex-grow">
                      <div className="text-lg font-semibold text-gray-800">
                        {flippedCards.has(flashcard.id) ? flashcard.answer : flashcard.question}
                      </div>
                    </div>
                    <div className="ml-4 cursor-move">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-6 h-6 text-gray-500"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 9l6 6 6-6" />
                      </svg>
                    </div>
                  </div>
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
