import React, { useState } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import KeyboardShortcuts from './KeyboardShortcuts';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import EditFlashcard from './EditFlashcard';

interface FlashcardProps {
  userId: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const Flashcard: React.FC<FlashcardProps> = ({ userId }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const handlePrevious = () => {
    if (flashcards.length === 0) return;
    setCurrentCardIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : 0));
    setIsFlipped(false);
  };

  const handleNext = () => {
    if (flashcards.length === 0) return;
    setCurrentCardIndex((prevIndex) =>
      prevIndex < flashcards.length - 1 ? prevIndex + 1 : flashcards.length - 1
    );
    setIsFlipped(false);
  };

  const handleFlip = () => {
    setIsFlipped((prev) => !prev);
  };

  const handleAddCard = async () => {
    const newCard: Flashcard = {
      id: `${Date.now()}`,
      question: 'Term',
      answer: 'Definition',
    };

    setFlashcards((prevFlashcards) => [...prevFlashcards, newCard]);
    setCurrentCardIndex(flashcards.length);
  };

  const getCurrentCard = () => {
    if (flashcards.length === 0) {
      return null;
    }
    return flashcards[currentCardIndex];
  };

  const handleSaveCard = (id: string, updatedQuestion: string, updatedAnswer: string) => {
    const updatedFlashcards = flashcards.map((card) =>
      card.id === id ? { ...card, question: updatedQuestion, answer: updatedAnswer } : card
    );
    setFlashcards(updatedFlashcards);
  };

  const handleDrop = (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const updatedFlashcards = Array.from(flashcards);
    const [removed] = updatedFlashcards.splice(result.source.index, 1);
    updatedFlashcards.splice(result.destination.index, 0, removed);

    setFlashcards(updatedFlashcards);
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <KeyboardShortcuts onPrevious={handlePrevious} onNext={handleNext} onFlip={handleFlip} />
      <div className="flex flex-col items-center mb-8">
        <h2 className="text-2xl font-bold mb-4">Flashcards</h2>
        <div
          className="w-128 h-64 bg-white shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer"
          onClick={handleFlip}
        >
          {getCurrentCard() ? (
            <p className="text-2xl font-semibold">
              {isFlipped ? getCurrentCard()?.answer : getCurrentCard()?.question}
            </p>
          ) : (
            <p className="text-xl text-gray-500">No cards available</p>
          )}
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={handlePrevious}
            className="mr-4 text-2xl"
            aria-label="Previous"
            disabled={currentCardIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <span className="text-lg">
            {getCurrentCard() ? `${currentCardIndex + 1} / ${flashcards.length}` : '0 / 0'}
          </span>
          <button type="button" onClick={handleNext} className="ml-4 text-2xl" aria-label="Next" disabled={currentCardIndex === flashcards.length - 1}>
            <FaChevronRight />
          </button>
        </div>
      </div>

      <div className="flex space-x-4">
        <button
          onClick={handleAddCard}
          className="bg-blue-500 text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add Flashcard
        </button>
      </div>

      <div className="mt-8">
        <DragDropContext onDragEnd={handleDrop}>
          <Droppable droppableId="flashcards">
            {(provided) => (
              <div {...provided.droppableProps} ref={provided.innerRef}>
                {flashcards.map((card, index) => (
                  <Draggable key={card.id} draggableId={card.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <EditFlashcard
                          id={card.id}
                          question={card.question}
                          answer={card.answer}
                          onSave={handleSaveCard}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>
    </div>
  );
};

export default Flashcard;
