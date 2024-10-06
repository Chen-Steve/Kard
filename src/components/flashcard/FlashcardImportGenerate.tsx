import React, { useRef, useEffect } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import Popup from '../Popup';
import { BiCloudUpload } from 'react-icons/bi';
import { FaWandMagicSparkles } from "react-icons/fa6";

interface FlashcardImportGenerateProps {
  userId: string;
  deckId: string;
  onFlashcardsAdded: (newFlashcards: Flashcard[]) => void;
  currentFlashcardsCount: number;
  onToggleImport: () => void;
  onToggleGenerate: () => void;
  isImportVisible: boolean;
  isGenerateVisible: boolean;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const MAX_CHAR_LIMIT = 930;

const FlashcardImportGenerate: React.FC<FlashcardImportGenerateProps> = ({
  userId,
  deckId,
  onFlashcardsAdded,
  currentFlashcardsCount,
  onToggleImport,
  onToggleGenerate,
  isImportVisible,
  isGenerateVisible
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const importModalRef = useRef<HTMLDivElement>(null);
  const importButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isImportVisible &&
        importModalRef.current &&
        !importModalRef.current.contains(event.target as Node) &&
        !importButtonRef.current?.contains(event.target as Node)
      ) {
        onToggleImport();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isImportVisible, onToggleImport]);

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.type !== 'text/csv') {
        toast.error('File not supported. Please upload a .csv file.');
        return;
      }
      importFlashcardsFromCsv(file);
    }
  };

  const importFlashcardsFromCsv = (file: File) => {
    Papa.parse(file, {
      header: true,
      complete: async (results) => {
        const importedFlashcards = results.data
          .map((row: any) => ({
            question: row.question || '',
            answer: row.answer || '',
          }))
          .filter(card => card.question.length <= MAX_CHAR_LIMIT && card.answer.length <= MAX_CHAR_LIMIT);

        const savedFlashcards = await saveFlashcards(importedFlashcards);
        onFlashcardsAdded(savedFlashcards);

        onToggleImport(); // Close the import dialog
      },
      error: (error) => {
        console.error('Error parsing CSV:', error);
        toast.error('Failed to import flashcards. Please check the CSV format.');
      },
    });
  };

  const handleFlashcardsGenerated = async (generatedFlashcards: { question: string, answer: string }[]) => {
    const validFlashcards = filterValidFlashcards(generatedFlashcards);
    const newFlashcards = await saveFlashcards(validFlashcards);
    onFlashcardsAdded(newFlashcards);
  };

  const filterValidFlashcards = (flashcards: { question: string, answer: string }[]) => {
    return flashcards.filter(flashcard => 
      flashcard.question && 
      flashcard.answer && 
      flashcard.question.length <= MAX_CHAR_LIMIT && 
      flashcard.answer.length <= MAX_CHAR_LIMIT
    );
  };

  const saveFlashcard = async (flashcard: { question: string, answer: string }) => {
    try {
      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcards: [{
            question: flashcard.question,
            answer: flashcard.answer,
          }],
          userId: userId,
          deckId: deckId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add flashcard: ${errorData.error}, ${errorData.details}`);
      }

      const newFlashcards = await response.json();
      return newFlashcards[0]; // Return the first (and only) flashcard
    } catch (error) {
      console.error('Error adding flashcard:', error);
      toast.error('Failed to add flashcard. Please try again.');
      return null;
    }
  };

  const saveFlashcards = async (flashcards: { question: string, answer: string }[]) => {
    try {
      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcards: flashcards,
          userId: userId,
          deckId: deckId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add flashcards: ${errorData.error}, ${errorData.details}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding flashcards:', error);
      toast.error('Failed to add flashcards. Please try again.');
      return [];
    }
  };

  return (
    <div className="flex items-center space-x-2 relative">
      <button
        onClick={onToggleGenerate}
        className="text-green-500 hover:text-green-600 transition-colors duration-200"
        title="Generate Flashcards"
      >
        <FaWandMagicSparkles className="text-2xl" />
      </button>
      <button
        ref={importButtonRef}
        onClick={onToggleImport}
        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
        title="Import Flashcards"
      >
        <BiCloudUpload className="text-3xl" />
      </button>

      {isImportVisible && (
        <div ref={importModalRef} className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-10">
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
            className="bg-gray-700 dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-4 py-2 rounded w-full mb-2"
            aria-label="Choose csv file"
          >
            Choose csv file
          </button>
          <div className="flex items-center mt-2 text-xs text-muted-foreground dark:text-gray-400">
            <FaQuestionCircle className="mr-2" />
            <span>Format: question, answer</span>
          </div>
        </div>
      )}

      {isGenerateVisible && (
        <Popup 
          onClose={onToggleGenerate} 
          onFlashcardsGenerated={handleFlashcardsGenerated} 
          userId={userId}
        />
      )}
    </div>
  );
};

export default FlashcardImportGenerate;