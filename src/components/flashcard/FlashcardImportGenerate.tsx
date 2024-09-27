import React, { useRef } from 'react';
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
        const importedFlashcards: Flashcard[] = results.data
          .map((row: any, index: number) => ({
            id: `imported-${index}`,
            question: row.question || '',
            answer: row.answer || '',
            order: currentFlashcardsCount + index + 1,
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
          question: flashcard.question,
          answer: flashcard.answer,
          userId: userId,
          deckId: deckId,
          order: currentFlashcardsCount + 1,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to add flashcard: ${errorData.error}, ${errorData.details}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding flashcard:', error);
      toast.error('Failed to add flashcard. Please try again.');
      return null;
    }
  };

  const saveFlashcards = async (flashcards: { question: string, answer: string }[]) => {
    const savedFlashcards = await Promise.all(flashcards.map(saveFlashcard));
    return savedFlashcards.filter(card => card !== null);
  };

  return (
    <div className="flex items-center space-x-2">
      <button
        onClick={onToggleGenerate}
        className="text-green-600 hover:text-green-700 transition-colors duration-200"
        title="Generate Flashcards"
      >
        <FaWandMagicSparkles className="text-2xl" />
      </button>
      <button
        onClick={onToggleImport}
        className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
        title="Import Flashcards"
      >
        <BiCloudUpload className="text-3xl" />
      </button>

      {isImportVisible && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 shadow-lg rounded-lg p-4 z-10">
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
          <div className="flex items-center mt-2">
            <FaQuestionCircle className="text-xl text-muted-foreground dark:text-gray-400 cursor-pointer" title="CSV Format: 'question', 'answer'" />
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