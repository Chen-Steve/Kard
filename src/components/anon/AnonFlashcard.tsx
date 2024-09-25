import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FaChevronLeft, FaChevronRight, FaPlus, FaEye, FaEyeSlash, FaQuestionCircle, FaEllipsisH, FaTable, FaList, FaTrash } from 'react-icons/fa';
import KeyboardShortcuts from '../KeyboardShortcuts';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import AnonFlashcardList from './AnonFlashcardList';
import AnonFlashcardTable from './AnonFlashcardTable';
import { debounce } from 'lodash';
import { toast } from 'react-toastify';
import { BiCloudUpload } from "react-icons/bi";
import Papa from 'papaparse';
import { v4 as uuidv4 } from 'uuid';

interface FlashcardProps {
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

const AnonFlashcardComponent: React.FC<FlashcardProps> = ({ deckId, decks = [], onDeckChange, readOnly = false, isTableView = false }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showDefinitions, setShowDefinitions] = useState(true);
  const [showList, setShowList] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isImportVisible, setIsImportVisible] = useState(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [isScrollable, setIsScrollable] = useState(false);
  const [isTableViewActive, setIsTableViewActive] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const flashcardRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  const fetchFlashcards = useCallback(() => {
    const storedFlashcards = localStorage.getItem(`flashcards_${deckId}`);
    if (storedFlashcards) {
      setFlashcards(JSON.parse(storedFlashcards));
    } else {
      setFlashcards([]);
    }
    setCurrentCardIndex(0);
    setError(null);
  }, [deckId]);

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

  const saveFlashcardsToLocalStorage = (updatedFlashcards: Flashcard[]) => {
    localStorage.setItem(`flashcards_${deckId}`, JSON.stringify(updatedFlashcards));
  };

  const handleAddCard = async () => {
    const newCardOrder = flashcards.length + 1;
    const newCard = {
      id: uuidv4(), // Generate a new UUID for the flashcard
      question: 'Term',
      answer: 'Definition',
      order: newCardOrder,
      deckId: deckId,
    };

    try {
      const response = await fetch('/api/anonFlashcard', { // Use the new endpoint
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newCard),
      });

      if (!response.ok) {
        throw new Error('Failed to add flashcard');
      }

      const savedCard = await response.json();
      setFlashcards(prevFlashcards => [...prevFlashcards, savedCard]);
      setCurrentCardIndex(flashcards.length);
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

  const debouncedSaveCard = debounce((id: string, updatedQuestion: string, updatedAnswer: string) => {
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

    const updatedFlashcards = flashcards.map((card) =>
      card.id === id ? { ...card, question: updatedQuestion, answer: updatedAnswer } : card
    );
    setFlashcards(updatedFlashcards);
    saveFlashcardsToLocalStorage(updatedFlashcards);
    setError(null);
  }, 500);

  const handleReorder = useCallback((result: DropResult) => {
    if (!result.destination) {
      return;
    }

    const items = Array.from(flashcards);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFlashcards(items);
    saveFlashcardsToLocalStorage(items);
  }, [flashcards]);

  const handleDeleteCard = async (id: string) => {
    try {
      const response = await fetch('/api/anonFlashcard', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, deckId }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete flashcard');
      }

      setFlashcards(prevFlashcards => prevFlashcards.filter(card => card.id !== id));
      if (currentCardIndex >= flashcards.length - 1) {
        setCurrentCardIndex(Math.max(0, flashcards.length - 2));
      }
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      setError('Failed to delete flashcard. Please try again.');
    }
  };

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'text/csv') {
        toast.error('File not supported. Please upload a .csv file.');
        return;
      }
      setCsvFile(file);
    }
  };

  const importFlashcardsFromCsv = () => {
    if (!csvFile) return;

    Papa.parse(csvFile, {
      header: true,
      complete: (results) => {
        const importedFlashcards: Flashcard[] = results.data
          .map((row: any, index: number) => ({
            id: `imported-${index}`,
            question: row.question || '',
            answer: row.answer || '',
            order: flashcards.length + index + 1,
          }))
          .filter(card => card.question.length <= MAX_CHAR_LIMIT && card.answer.length <= MAX_CHAR_LIMIT);

        const updatedFlashcards = [...flashcards, ...importedFlashcards];
        setFlashcards(updatedFlashcards);
        saveFlashcardsToLocalStorage(updatedFlashcards);

        setCsvFile(null);
        setIsImportVisible(false);
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to import flashcards. Please check the CSV format.');
      },
    });
  };

  const handleSaveCard = async (id: string, updatedQuestion: string, updatedAnswer: string) => {
    try {
      const response = await fetch('/api/anonFlashcard', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, question: updatedQuestion, answer: updatedAnswer, deckId }),
      });

      if (!response.ok) {
        throw new Error('Failed to update flashcard');
      }

      const updatedCard = await response.json();
      setFlashcards(prevFlashcards =>
        prevFlashcards.map(card => card.id === id ? updatedCard : card)
      );
    } catch (error) {
      console.error('Error updating flashcard:', error);
      setError('Failed to update flashcard. Please try again.');
    }
  };

  return (
    <div className="relative">
      <div className="container mx-auto p-4 max-w-3xl">
        <KeyboardShortcuts onPrevious={handlePrevious} onNext={handleNext} onFlip={handleFlipWrapper} />
        {error && <div className="text-red-500 dark:text-red-400 mb-4">{error}</div>}
        <div className="flex flex-col items-center mb-8">
          <div
            className="border-2 border-black dark:border-gray-600 w-full h-64 sm:h-96 bg-card dark:bg-gray-600 shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer text-center p-4 relative"
            onClick={handleFlipClick}
          >
            <div className="absolute top-2 left-2 text-xs sm:text-sm font-semibold text-muted-foreground dark:text-gray-400">
              {isFlipped ? 'Answer' : 'Question'}
            </div>
            {getCurrentCard() ? (
              <div className="w-full sm:w-5/6 max-w-lg overflow-auto text-sm sm:text-base">
                {isFlipped ? getCurrentCard()?.answer : getCurrentCard()?.question}
              </div>
            ) : (
              <p className="text-lg sm:text-xl text-muted-foreground dark:text-gray-400">No cards</p>
            )}
          </div>
          <div className="flex justify-between w-full mt-0">
            {!readOnly && (
              <div className="relative" ref={settingsRef}>
                <BiCloudUpload
                  className="text-3xl text-black dark:text-gray-400 cursor-pointer"
                  onClick={() => setIsImportVisible(!isImportVisible)}
                />
                {isImportVisible && (
                  <div className="absolute left-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-10">
                    <input
                      type="file"
                      accept=".csv"
                      onChange={handleCsvUpload}
                      ref={fileInputRef}
                      className="hidden"
                      title="input file"
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className={`px-4 py-2 rounded w-full mb-2 ${csvFile ? 'bg-green-500 text-white' : 'bg-gray-700 dark:bg-gray-600 text-primary-foreground dark:text-gray-200'}`}
                      style={csvFile ? { background: 'repeating-linear-gradient(45deg, rgba(0, 128, 0, 0.5), rgba(0, 128, 0, 0.5) 10px, rgba(0, 128, 0, 0.3) 10px, rgba(0, 128, 0, 0.3) 20px)' } : {}}
                      arial-Label="Choose csv file"
                    >
                      Choose csv file
                    </button>
                    <button
                      onClick={importFlashcardsFromCsv}
                      className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-4 py-2 rounded w-full"
                      arial-Label="Import flashcards"
                    >
                      Import Flashcards
                    </button>
                    <div className="flex items-center mt-2">
                      <FaQuestionCircle className="text-xl text-muted-foreground dark:text-gray-400 cursor-pointer" title="CSV Format: 'question', 'answer'" />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center mt-0">
            <button
              type="button"
              onClick={handlePrevious}
              className="mr-4 text-2xl text-black dark:text-white"
              aria-label="Previous"
              disabled={currentCardIndex === 0}
            >
              <FaChevronLeft />
            </button>
            <span className="text-lg text-foreground dark:text-gray-200">
              {getCurrentCard() ? `${currentCardIndex + 1} / ${flashcards.length}` : '0 / 0'}
            </span>
            <button
              type="button"
              onClick={handleNext}
              className="ml-4 text-2xl text-black dark:text-white"
              aria-label="Next"
              disabled={currentCardIndex === flashcards.length - 1}
            >
              <FaChevronRight />
            </button>
          </div>
        </div>

        <div className="flex justify-between space-x-4 flex-wrap">
          {!readOnly && (
            <button
              onClick={handleAddCard}
              className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-2 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
              aria-label="Add flashcard"
            >
              <FaPlus className="mr-1 sm:mr-2" /> <span className="hidden sm:inline">Add Flashcard</span>
            </button>
          )}
          <div className="flex space-x-2">
            <button
              onClick={() => setShowList(!showList)}
              className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-2 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
              aria-label={showList ? "Hide list" : "Show list"}
            >
              {showList ? <span className="hidden sm:inline">Hide List</span> : <span className="hidden sm:inline">Show List</span>}
              <span className="sm:hidden">{showList ? 'Hide' : 'Show'}</span>
            </button>
            <button
              onClick={() => setIsScrollable(!isScrollable)}
              className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-center"
              aria-label={isScrollable ? "Expand list" : "Make list scrollable"}
            >
              <FaEllipsisH />
            </button>
            <button
              onClick={() => setIsTableViewActive(!isTableViewActive)}
              className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-center"
              aria-label={isTableViewActive ? "Switch to list view" : "Switch to table view"}
            >
              {isTableViewActive ? <FaList /> : <FaTable />}
            </button>
          </div>
        </div>
        <hr className="border-t-2 border-black dark:border-gray-600 w-full mx-auto mt-2" />

        {showList && (
          <div className={`mt-4 ${isScrollable ? 'max-h-96 overflow-y-auto pr-4 custom-scrollbar' : ''}`}>
            {isTableViewActive ? (
              <AnonFlashcardTable 
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
                        <AnonFlashcardList
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
        )}

        {flashcards.length > 0 && (
          <button
            onClick={() => setShowDefinitions(!showDefinitions)}
            className="fixed border-2 border-black dark:border-gray-600 bottom-4 right-4 bg-muted dark:bg-gray-600 text-muted-foreground dark:text-gray-200 px-2 sm:px-4 py-2 rounded-full shadow-lg flex items-center"
          >
            {showDefinitions ? <FaEyeSlash className="text-lg sm:mr-2" /> : <FaEye className="text-lg sm:mr-2" />}
            <span className="hidden sm:inline">
              {showDefinitions ? 'Hide Definitions' : 'Show Definitions'}
            </span>
          </button>
        )}
      </div>
    </div>
  );
};

export default AnonFlashcardComponent;