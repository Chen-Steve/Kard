import React, { useState, useEffect, useCallback, useRef } from 'react';
import KeyboardShortcuts from '../KeyboardShortcuts';
import { DragDropContext, Droppable, DropResult } from '@hello-pangea/dnd';
import EditFlashcard from './FlashcardList';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import FlashcardTable from './FlashcardTable';
import FlashcardDisplay from '../flashcard/FlashcardDisplay';
import FlashcardToolbar from '../flashcard/FlashcardToolbar';
import FlashcardActions from '../flashcard/FlashcardActions';
import { Icon } from "@iconify/react";

interface FlashcardProps {
  userId: string;
  deckId: string;
  decks: Deck[];
  onDeckChange?: (newDeckId: string) => void;
  readOnly?: boolean;
  isTableView?: boolean;
  showFlashcardList: boolean;
  isPublicDeck?: boolean;
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

const MAX_CHAR_LIMIT = 930;

const FlashcardComponent: React.FC<FlashcardProps> = ({ userId, deckId, decks = [], onDeckChange, readOnly = false, isTableView = false, showFlashcardList, isPublicDeck = false }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [showList, setShowList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isScrollable, setIsScrollable] = useState(false);
  const [isTableViewActive, setIsTableViewActive] = useState(isTableView);
  const [isImportVisible, setIsImportVisible] = useState(false);
  const [isGenerateVisible, setIsGenerateVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const flashcardRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const fetchFlashcards = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/flashcard?userId=${userId}&deckId=${deckId}`);
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
      setCurrentCardIndex(0);
      setError(null);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
      setError('Failed to fetch flashcards. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [userId, deckId]);

  useEffect(() => {
    if (deckId) {
      fetchFlashcards();
    }
  }, [deckId, fetchFlashcards]);

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'childList') {
          console.log('A child node has been added or removed.');
        }
      });
    });

    if (flashcardRef.current) {
      observer.observe(flashcardRef.current, { childList: true, subtree: true });
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  useEffect(() => {
    // Safely check for meta tag
    const checkMetaTag = () => {
      const metaTag = document.querySelector("meta[property='og:type']") as HTMLMetaElement | null;
      if (metaTag) {
        console.log("Meta tag content:", metaTag.content);
        // Do something with the meta tag content if needed
      } else {
        console.log("Meta tag not found");
      }
    };

    // Run the check after a short delay to ensure DOM is loaded
    const timeoutId = setTimeout(checkMetaTag, 0);

    return () => clearTimeout(timeoutId);
  }, []);

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

  const handleFlip = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLElement;
    if (target && (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target.isContentEditable)) {
      return; // Do not flip if the target is an input, textarea, or contenteditable
    }
    setIsFlipped((prev) => !prev);
  };

  const handleFlipClick = () => {
    const customEvent = { target: { tagName: '' } } as unknown as React.KeyboardEvent;
    handleFlip(customEvent);
  };

  const handleFlipWrapper = () => {
    const customEvent = {
      altKey: false,
      charCode: 0,
      ctrlKey: false,
      code: '',
      key: '',
      keyCode: 0,
      metaKey: false,
      repeat: false,
      shiftKey: false,
      getModifierState: () => false,
      preventDefault: () => {},
      isTrusted: true,
      target: null,
      // Add other necessary properties if needed
    } as unknown as React.KeyboardEvent<Element>;
  
    handleFlip(customEvent);
  };

  const handleAddCard = async () => {
    console.log('Adding card for userId:', userId);
    
    // Update all existing flashcards' order
    const updatedFlashcards = flashcards.map(card => ({
      ...card,
      order: card.order + 1
    }));

    // Create new card with order 1
    const newCard = {
      question: 'Term',
      answer: 'Definition',
      order: 1,
    };

    if (newCard.question.length > MAX_CHAR_LIMIT || newCard.answer.length > MAX_CHAR_LIMIT) {
      setError(`Flashcard content exceeds ${MAX_CHAR_LIMIT} character limit`);
      return;
    }

    const tempId = `temp-${Date.now()}`;
    // Add new card at the beginning of the array
    setFlashcards([{ ...newCard, id: tempId }, ...updatedFlashcards]);
    setCurrentCardIndex(0);
    setError(null);

    try {
      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcards: [{ ...newCard, id: tempId }], // Send new card
          updatedOrders: updatedFlashcards.map(({ id, order }) => ({ id, order })), // Send updated orders
          userId,
          deckId,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add flashcard: ${errorData.error}, ${errorData.details}`);
      }
      const savedCards = await response.json();
      const savedCard = savedCards[0];
      setFlashcards((prevFlashcards) =>
        prevFlashcards.map((card) => (card.id === tempId ? savedCard : card))
      );
    } catch (error) {
      console.error('Error adding flashcard:', error);
      toast.error('Failed to add flashcard. Please try again.');
      setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== tempId));
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

    // Immediately update local state
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((card) =>
        card.id === id ? { ...card, question: updatedQuestion, answer: updatedAnswer } : card
      )
    );

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
      toast.error('Failed to update flashcard. Please try again.');
    }
  }, 500);

  const handleReorder = useCallback(async (result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(flashcards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update the order property for each flashcard
    const updatedItems = items.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setFlashcards(updatedItems);

    try {
      // Send the updated order to the server
      const response = await fetch('/api/flashcard', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcards: updatedItems.map(({ id, order }) => ({ id, order })),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard order');
      }

      // If successful, you might want to fetch the updated flashcards from the server
      // or just keep the local state as is, assuming the server update was successful
    } catch (error) {
      console.error('Error updating flashcard order:', error);
      toast.error('Failed to update flashcard order. Please try again.');
      // Optionally, revert the changes if the server update fails
      fetchFlashcards();
    }
  }, [flashcards, fetchFlashcards]);

  const handleDeleteCard = (id: string) => {
    setFlashcards((prevFlashcards) => {
      const updatedFlashcards = prevFlashcards.filter((card) => card && card.id !== id);
      if (currentCardIndex >= updatedFlashcards.length) {
        setCurrentCardIndex(Math.max(0, updatedFlashcards.length - 1));
      }
      return updatedFlashcards;
    });
    setError(null);
  };

  const handleFlashcardsAdded = (newFlashcards: Flashcard[]) => {
    setFlashcards(prevFlashcards => [...prevFlashcards, ...newFlashcards]);
  };

  const handleToggleImport = () => {
    setIsImportVisible(!isImportVisible);
  };

  const handleToggleGenerate = () => {
    setIsGenerateVisible(!isGenerateVisible);
  };

  const handleShuffleComplete = (shuffledCards: Flashcard[]) => {
    setFlashcards(shuffledCards);
    setCurrentCardIndex(0);
    setIsFlipped(false);
  };

  return (
    <div className="relative">
      <div className="container mx-auto p-4 max-w-3xl">
        <KeyboardShortcuts onPrevious={handlePrevious} onNext={handleNext} onFlip={handleFlipWrapper} />
        {error && <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>}
        
        <FlashcardDisplay
          card={getCurrentCard()}
          isFlipped={isFlipped}
          currentIndex={currentCardIndex}
          totalCards={flashcards.length}
          onFlip={handleFlipClick}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />

        {showFlashcardList && (
          <>
            <FlashcardToolbar
              onAddCard={handleAddCard}
              onToggleScroll={() => setIsScrollable(!isScrollable)}
              onToggleView={() => setIsTableViewActive(!isTableViewActive)}
              isScrollable={isScrollable}
              isTableViewActive={isTableViewActive}
              readOnly={readOnly}
              flashcards={flashcards}
              onShuffleComplete={handleShuffleComplete}
              isPublicDeck={isPublicDeck}
            >
              {!isPublicDeck && (
                <FlashcardActions
                  userId={userId}
                  deckId={deckId}
                  onFlashcardsAdded={handleFlashcardsAdded}
                  onToggleImport={handleToggleImport}
                  onToggleGenerate={handleToggleGenerate}
                  isImportVisible={isImportVisible}
                  isGenerateVisible={isGenerateVisible}
                />
              )}
            </FlashcardToolbar>

            <div className={`mt-4 ${isScrollable ? 'max-h-96 overflow-y-auto pr-4 custom-scrollbar' : ''}`}>
              {isTableViewActive ? (
                <FlashcardTable 
                  flashcards={flashcards}
                  onDelete={handleDeleteCard}
                  onSave={debouncedSaveCard}
                  onReorder={handleReorder}
                  readOnly={readOnly}
                />
              ) : (
                <DragDropContext onDragEnd={handleReorder}>
                  <Droppable droppableId="flashcards">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                        {flashcards.filter(card => card !== undefined).map((card, index) => (
                          <EditFlashcard
                            key={card.id}
                            id={card.id}
                            question={card.question}
                            answer={card.answer}
                            showDefinitions={showDefinitions}
                            onSave={debouncedSaveCard}
                            onDelete={handleDeleteCard}
                            readOnly={readOnly}
                            index={index}
                          />
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </div>
          </>
        )}

        {flashcards.length > 0 && (
          <button
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="fixed text-md border-2 border-black dark:border-gray-600 bottom-4 right-4 bg-muted dark:bg-gray-600 text-muted-foreground dark:text-gray-200 px-1 sm:px-2 py-1 rounded-full shadow-lg flex items-center"
          >
            {showDefinitions ? 
              <Icon icon="pepicons-print:eye-closed" className="text-xl sm:mr-2" /> : 
              <Icon icon="pepicons-print:eye" className="text-xl sm:mr-2" />
            }
            <span className="hidden sm:inline">
              {showDefinitions ? 'Hide Definitions' : 'Show Definitions'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FlashcardComponent;
