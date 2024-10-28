import React, { useRef, useEffect } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import Papa from 'papaparse';
import { toast } from 'react-toastify';
import Popup from './AIGenerateModal';
import { Icon } from '@iconify/react';
import { BsFiletypeCsv } from "react-icons/bs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

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

interface ImportOption {
  id: string;
  label: string;
  icon: React.ReactNode;
  accept: string;
  description: string;
}

const importOptions: ImportOption[] = [
  {
    id: 'csv',
    label: 'CSV File',
    icon: <BsFiletypeCsv className="w-10 h-10 ml-1 text-green-600" />,
    accept: '.csv',
    description: 'Import from a CSV file with question and answer columns'
  },
  {
    id: 'pdf',
    label: 'PDF Document',
    icon: <Icon icon="mingcute:pdf-line" width="48" height="48" className="text-red-600" />,
    accept: '.pdf',
    description: 'Extract flashcards from a PDF document'
  },
  {
    id: 'doc',
    label: 'Word Document',
    icon: <Icon icon="icon-park:file-word" width="48" height="48" />,
    accept: '.doc,.docx',
    description: 'Import from Word document format'
  }
];

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

        onToggleImport();
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
      return newFlashcards[0];
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
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label='generate-flashcards'
              onClick={onToggleGenerate}
              className="text-green-500 hover:text-green-600 transition-colors duration-200"
            >
              <Icon icon="fa6-solid:wand-magic-sparkles" width="24" height="24" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Generate Flashcards</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label='import-flashcards'
              ref={importButtonRef}
              onClick={onToggleImport}
              className="text-blue-500 hover:text-blue-600 transition-colors duration-200"
            >
              <Icon icon="tabler:table-import" width="24" height="24" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
            <p>Import Flashcards</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isImportVisible && (
        <div className="fixed inset-0 z-50">
          <div 
            className="fixed inset-0 bg-black/50 backdrop-blur-md transition-all"
            onClick={onToggleImport}
          />
          
          <div className="fixed inset-0 flex items-center justify-center p-4">
            <div 
              ref={importModalRef}
              className="relative z-50 w-full max-w-md bg-white dark:bg-gray-800 rounded-lg p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Import Flashcards</h2>
                <button 
                  onClick={onToggleImport}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>

              <div className="space-y-4">
                {importOptions.map((option) => (
                  <div
                    key={option.id}
                    className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      aria-label='import-file'
                      type="file"
                      accept={option.accept}
                      onChange={handleCsvUpload}
                      ref={fileInputRef}
                      className="hidden"
                    />
                    <div className="flex items-center space-x-4">
                      <div className="text-blue-500">
                        {option.icon}
                      </div>
                      <div>
                        <h3 className="font-medium">{option.label}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {option.description}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 text-xs text-gray-500 dark:text-gray-400 flex items-center">
                <FaQuestionCircle className="mr-2" />
                <span>Select a file type to import your flashcards</span>
              </div>

              <div className="mt-6 border-t dark:border-gray-700 pt-4">
                <div className="relative border dark:border-gray-700 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 opacity-60 cursor-not-allowed">
                  <div className="absolute top-2 right-2">
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded dark:bg-blue-900 dark:text-blue-300">
                      Coming Soon
                    </span>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div>
                      <Icon icon="logos:google-drive" width="32" height="32" />
                    </div>
                    <div>
                      <h3 className="font-medium">Google Drive</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Import directly from your Google Drive
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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