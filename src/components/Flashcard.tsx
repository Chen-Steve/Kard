import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import KeyboardShortcuts from './KeyboardShortcuts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import EditFlashcard from './EditFlashcard';
import { debounce } from 'lodash';

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
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDefinitions, setShowDefinitions] = useState(true); // New state for toggling definitions

  const fetchFlashcards = useCallback(async () => {
    try {
      const response = await fetch(`/api/flashcard?userId=${userId}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Flashcards not found for this user');
        }
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.indexOf("application/json") !== -1) {
          const errorData = await response.json();
          throw new Error(`Failed to fetch flashcards: ${errorData.error}, ${errorData.details}`);
        } else {
          const text = await response.text();
          throw new Error(`Failed to fetch flashcards: ${response.status} ${response.statusText}\n${text}`);
        }
      }
      const data = await response.json();
      setFlashcards(data.sort((a: Flashcard, b: Flashcard) => a.order - b.order));
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
    console.log('Adding card for userId:', userId);
    const newCardOrder = flashcards.length + 1; // Ensure order starts from 1
    const newCard = {
      id: `temp-${newCardOrder}`,
      question: 'Term',
      answer: 'Definition',
      order: newCardOrder,
      userId: userId,
    };

    setFlashcards((prevFlashcards) => [...prevFlashcards, newCard]);
    setCurrentCardIndex(flashcards.length);
    setError(null);

    try {
      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add flashcard: ${errorData.error}, ${errorData.details}`);
      }
      const savedCard = await response.json();
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) => (card.id === newCard.id ? savedCard : card))
      );
    } catch (error) {
      console.error('Error adding flashcard:', error);
      setError('Failed to add flashcard. Please try again.');
      setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== newCard.id));
    }
  };

  const getCurrentCard = () => {
    if (flashcards.length === 0) {
      return null;
    }
    return flashcards[currentCardIndex];
  };

  const debouncedSaveCard = debounce(async (id: string, updatedQuestion: string, updatedAnswer: string) => {
    const cardToUpdate = flashcards.find(card => card.id === id);
    if (!cardToUpdate) {
      setError('Flashcard not found');
      return;
    }
    try {
      const response = await fetch('/api/flashcard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          id, 
          question: updatedQuestion, 
          answer: updatedAnswer,
          order: cardToUpdate.order,
        }),
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
  }, 300);

  const handleSaveCard = (id: string, updatedQuestion: string, updatedAnswer: string) => {
    debouncedSaveCard(id, updatedQuestion, updatedAnswer);
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
      order: index + 1, // Ensure order starts from 1
    }));

    try {
      await Promise.all(
        updatedWithOrder.map((card) =>
          fetch('/api/flashcard', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              id: card.id,
              question: card.question,
              answer: card.answer,
              order: card.order,
            }),
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

  const handleDeleteCard = async (id: string) => {
    const originalFlashcards = [...flashcards];
    setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== id));
    setError(null);

    try {
      const response = await fetch('/api/flashcard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to delete flashcard: ${errorData.error}, ${errorData.details}`);
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      setError('Failed to delete flashcard. Please try again.');
      setFlashcards(originalFlashcards);
    }
  };

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <KeyboardShortcuts onPrevious={handlePrevious} onNext={handleNext} onFlip={handleFlip} />
      {error && <div className="text-red-500 mb-4">{error}</div>}
      <div className="flex flex-col items-center mb-8">
        <div
          className="w-184 h-88 bg-white shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer"
          onClick={handleFlip}
        >
          {getCurrentCard() ? (
            <p className="text-2xl font-semibold">
              {isFlipped ? getCurrentCard()?.answer : getCurrentCard()?.question}
            </p>
          ) : (
            <p className="text-xl text-gray-500">No cards</p>
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
          className="bg-[#1B2B4F] text-white px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add Flashcard
        </button>
      </div>
      <hr className="border-t-2 border-black w-1/2 mx-auto" />

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
                          answer={showDefinitions ? card.answer : ''}
                          onSave={handleSaveCard}
                          onDelete={handleDeleteCard}
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

      {/* Conditional rendering of the button */}
      {flashcards.length > 0 && (
        <button
          onClick={() => setShowDefinitions(!showDefinitions)}
          className="fixed bottom-4 right-4 bg-gray-800 text-white px-4 py-2 rounded-full shadow-lg flex items-center"
        >
          {showDefinitions ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
          {showDefinitions ? 'Hide Definitions' : 'Show Definitions'}
        </button>
      )}
    </div>
  );
};

export default FlashcardComponent;