import React, { useState, useEffect, useCallback } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaEye, FaEyeSlash } from 'react-icons/fa';
import KeyboardShortcuts from './KeyboardShortcuts';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import EditFlashcard from './EditFlashcard';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { MdSettings } from "react-icons/md";

interface FlashcardProps {
  userId: string;
  deckId: string;
  decks: Deck[];
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface Deck {
  id: string;
  name: string;
}

const FlashcardComponent: React.FC<FlashcardProps> = ({ userId, deckId, decks = [] }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDefinitions, setShowDefinitions] = useState(true); 
  const [showList, setShowList] = useState(true);
  const [selectedDeckId, setSelectedDeckId] = useState<string>(deckId);
  const [isDeckSelectVisible, setIsDeckSelectVisible] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredDecks = decks.filter(deck =>
    deck.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const fetchFlashcards = useCallback(async () => {
    try {
      const response = await fetch(`/api/flashcard?userId=${userId}&deckId=${selectedDeckId}`);
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
      setFlashcards(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to fetch flashcards. Please try again.');
    }
  }, [userId, selectedDeckId]);

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
      deckId: selectedDeckId, // Include deckId
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
      toast.error('Failed to add flashcard. Please try again.');
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
  }, 500);

  const handleDrop = async (result: DropResult) => {
    if (!result.destination) return;

    const reorderedFlashcards = Array.from(flashcards);
    const [movedCard] = reorderedFlashcards.splice(result.source.index, 1);
    reorderedFlashcards.splice(result.destination.index, 0, movedCard);

    const updatedWithOrder = reorderedFlashcards.map((card, index) => ({
      ...card,
      order: index + 1,
    }));

    setFlashcards(updatedWithOrder);

    try {
      const response = await fetch('/api/flashcard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flashcards: updatedWithOrder }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to update flashcards: ${errorData.error}, ${errorData.details}`);
      }
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
          className="w-full h-96 bg-card shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer"
          onClick={handleFlip}
        >
          {getCurrentCard() ? (
            <p className="text-2xl font-semibold text-card-foreground">
              {isFlipped ? getCurrentCard()?.answer : getCurrentCard()?.question}
            </p>
          ) : (
            <p className="text-xl text-muted-foreground">No cards</p>
          )}
        </div>
        <div className="flex justify-between w-full mt-0">
          <div className="flex items-center">
            <button
              onClick={() => setIsDeckSelectVisible(!isDeckSelectVisible)}
              className="bg-primary text-primary-foreground px-2 py-2 rounded"
            >
              Select Deck
            </button>
            {isDeckSelectVisible && (
              <>
                <label htmlFor="deck-select" className="sr-only">Select Deck</label>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Search decks..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="p-1 ml-2 border-2 border-input rounded"
                  />
                  <select
                    id="deck-select"
                    value={selectedDeckId}
                    onChange={(e) => setSelectedDeckId(e.target.value)}
                    className="p-1 border-2 border-input rounded"
                  >
                    {filteredDecks.length > 0 ? (
                      filteredDecks.map((deck) => (
                        <option key={deck.id} value={deck.id}>
                          {deck.name}
                        </option>
                      ))
                    ) : (
                      <option value="" disabled>
                        No decks available
                      </option>
                    )}
                  </select>
                </div>
              </>
            )}
          </div>
          <MdSettings className="text-3xl text-muted-foreground cursor-pointer" />
        </div>
        <div className="flex items-center mt-0">
          <button
            type="button"
            onClick={handlePrevious}
            className="mr-4 text-2xl"
            aria-label="Previous"
            disabled={currentCardIndex === 0}
          >
            <FaChevronLeft />
          </button>
          <span className="text-lg text-foreground">
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

      <div className="flex justify-between space-x-4">
        <button
          onClick={handleAddCard}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center"
        >
          <FaPlus className="mr-2" /> Add Flashcard
        </button>
        <button
          onClick={() => setShowList(!showList)}
          className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center"
        >
          {showList ? 'Hide List' : 'Show List'}
        </button>
      </div>
      <hr className="border-t-2 border-border w-full mx-auto mt-2" />

      {showList && (
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
                            onSave={debouncedSaveCard}
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
      )}

      {flashcards.length > 0 && (
        <button
          onClick={() => setShowDefinitions(!showDefinitions)}
          className="fixed bottom-4 right-4 bg-muted text-muted-foreground px-4 py-2 rounded-full shadow-lg flex items-center"
        >
          {showDefinitions ? <FaEyeSlash className="mr-2" /> : <FaEye className="mr-2" />}
          {showDefinitions ? 'Hide Definitions' : 'Show Definitions'}
        </button>
      )}
    </div>
  );
};

export default FlashcardComponent;