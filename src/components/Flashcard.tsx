import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus } from 'react-icons/fa';
import KeyboardShortcuts from './KeyboardShortcuts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import EditFlashcard from './EditFlashcard';

interface FlashcardProps {
  userId: string;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const FlashcardComponent: React.FC<FlashcardProps> = ({ userId }) => {
  console.log("User ID:", userId);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFlashcards = useCallback(async () => {
    try {
      const response = await fetch(`/api/flashcards?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to fetch flashcards: ${errorData.error}, ${errorData.details}`);
      }
      const data = await response.json();
      setFlashcards(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to fetch flashcards. Please try again.');
    }
  }, [userId]);

  useEffect(() => {
    fetchFlashcards();
  }, [fetchFlashcards]);

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
    try {
      const response = await fetch('/api/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question: 'Term', 
          answer: 'Definition', 
          userId: userId
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add flashcard: ${errorData.error}, ${errorData.details}`);
      }
      const newCard = await response.json();
      setFlashcards((prevFlashcards) => [...prevFlashcards, newCard]);
      setCurrentCardIndex(flashcards.length);
      setError(null);
    } catch (error) {
      console.error('Error adding flashcard:', error);
      setError('Failed to add flashcard. Please try again.');
    }
  };

  const getCurrentCard = () => {
    if (flashcards.length === 0) {
      return null;
    }
    return flashcards[currentCardIndex];
  };

  const handleSaveCard = async (id: string, updatedQuestion: string, updatedAnswer: string) => {
    try {
      const response = await fetch('/api/flashcards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, question: updatedQuestion, answer: updatedAnswer }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update flashcard: ${errorData.error}, ${errorData.details}`);
      }
      const updatedCard = await response.json();
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) => (card.id === id ? updatedCard : card))
      );
      setError(null);
    } catch (error) {
      console.error('Error updating flashcard:', error);
      setError('Failed to update flashcard. Please try again.');
    }
  };

  const handleDrop = async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const updatedFlashcards = Array.from(flashcards);
    const [removed] = updatedFlashcards.splice(result.source.index, 1);
    updatedFlashcards.splice(result.destination.index, 0, removed);

    const updatedWithOrder = updatedFlashcards.map((card, index) => ({
      ...card,
      order: index,
    }));

    try {
      await Promise.all(
        updatedWithOrder.map((card) =>
          fetch('/api/flashcards', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: card.id, question: card.question, answer: card.answer, order: card.order }),
          })
        )
      );
      setFlashcards(updatedWithOrder);
      setError(null);
    } catch (error) {
      console.error('Error updating flashcard order:', error);
      setError('Failed to update flashcard order. Please try again.');
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <KeyboardShortcuts onPrevious={handlePrevious} onNext={handleNext} onFlip={handleFlip} />
      {error && <div className="text-red-500 mb-4">{error}</div>}
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
          <button
            type="button"
            onClick={handleNext}
            className="ml-4 text-2xl"
            aria-label="Next"
            disabled={currentCardIndex === flashcards.length - 1}
          >
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

      <div className="mt-2">
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

export default FlashcardComponent;