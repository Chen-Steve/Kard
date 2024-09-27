import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaEye, FaEyeSlash, FaQuestionCircle } from 'react-icons/fa';
import { GrFormViewHide, GrFormView } from "react-icons/gr";
import KeyboardShortcuts from '../KeyboardShortcuts';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import EditFlashcard from './FlashcardList';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import FlashcardTable from './FlashcardTable';
import FlashcardDisplay from '../flashcard/FlashcardDisplay';
import FlashcardToolbar from '../flashcard/FlashcardToolbar';
import FlashcardImportGenerate from '../flashcard/FlashcardImportGenerate';

interface FlashcardProps {
  userId: string;
  deckId: string;
  decks: Deck[];
  onDeckChange?: (newDeckId: string) => void;
  readOnly?: boolean;
  isTableView?: boolean;
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

const FlashcardComponent: React.FC<FlashcardProps> = ({ userId, deckId, decks = [], onDeckChange, readOnly = false, isTableView = false }) => {
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

  const flashcardRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const fetchFlashcards = useCallback(async () => {
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
    const newCardOrder = flashcards.length + 1; // Ensure order starts from 1
    const newCard = {
      id: `temp-${newCardOrder}`,
      question: 'Term',
      answer: 'Definition',
      order: newCardOrder,
      userId: userId,
      deckId: deckId, // Include deckId
    };

    // Check character limit before adding
    if (newCard.question.length > MAX_CHAR_LIMIT || newCard.answer.length > MAX_CHAR_LIMIT) {
      setError(`Flashcard content exceeds ${MAX_CHAR_LIMIT} character limit`);
      return;
    }

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

    // Check character limit (consider the HTML content)
    if (updatedQuestion.length > MAX_CHAR_LIMIT || updatedAnswer.length > MAX_CHAR_LIMIT) {
      setError(`Flashcard content exceeds ${MAX_CHAR_LIMIT} character limit`);
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

  const handleReorder = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(flashcards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFlashcards(items);

    // You might want to add an API call here to update the order on the server
  }, [flashcards]);

  const handleDeleteCard = (id: string) => {
    setFlashcards((prevFlashcards) => prevFlashcards.filter((card) => card.id !== id));
    setError(null);
  };

  const handleFlashcardsAdded = (newFlashcards: Flashcard[]) => {
    setFlashcards(prevFlashcards => [...prevFlashcards, ...newFlashcards]);
  };

  const handleSaveCard = (id: string, updatedQuestion: string, updatedAnswer: string) => {
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((card) =>
        card.id === id ? { ...card, question: updatedQuestion, answer: updatedAnswer } : card
      )
    );
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

        <div className="flex justify-between items-center mt-4">
          <FlashcardToolbar
            onAddCard={handleAddCard}
            onToggleList={() => setShowList(!showList)}
            onToggleScroll={() => setIsScrollable(!isScrollable)}
            onToggleView={() => setIsTableViewActive(!isTableViewActive)}
            showList={showList}
            isScrollable={isScrollable}
            isTableViewActive={isTableViewActive}
            readOnly={readOnly}
          />
          
          <FlashcardImportGenerate
            userId={userId}
            deckId={deckId}
            onFlashcardsAdded={handleFlashcardsAdded}
            currentFlashcardsCount={flashcards.length}
            onToggleImport={() => setIsImportVisible(!isImportVisible)}
            onToggleGenerate={() => setIsGenerateVisible(!isGenerateVisible)}
            isImportVisible={isImportVisible}
            isGenerateVisible={isGenerateVisible}
          />
        </div>

        <hr className="border-t-2 border-black dark:border-gray-600 w-full mx-auto mt-4" />

        {showList && (
          <div className={`mt-4 ${isScrollable ? 'max-h-96 overflow-y-auto pr-4 custom-scrollbar' : ''}`}>
            {isTableViewActive ? (
              <FlashcardTable 
                flashcards={flashcards}
                onDelete={handleDeleteCard}
                onSave={handleSaveCard}
                onReorder={handleReorder}
                readOnly={readOnly}
              />
            ) : (
              <DragDropContext onDragEnd={handleReorder}>
                <Droppable droppableId="flashcards">
                  {(provided) => (
                    <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                      {flashcards.map((card, index) => (
                        <EditFlashcard
                          key={card.id}
                          id={card.id}
                          question={card.question}
                          answer={card.answer}
                          showDefinitions={showDefinitions}
                          onSave={(id, updatedQuestion, updatedAnswer) => {
                            debouncedSaveCard(id, updatedQuestion, updatedAnswer);
                          }}
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
        )}

        {flashcards.length > 0 && (
          <button
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="fixed text-md border-2 border-black dark:border-gray-600 bottom-4 right-4 bg-muted dark:bg-gray-600 text-muted-foreground dark:text-gray-200 px-1 sm:px-2 py-1 rounded-full shadow-lg flex items-center"
          >
            {showDefinitions ? <GrFormViewHide className="text-xl sm:mr-2" /> : <GrFormView className="text-xl sm:mr-2" />}
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