import React from 'react';
import { FlashcardImportModal } from './FlashcardImportModal';
import Popup from './AIGenerateModal';
import { Icon } from '@iconify/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import toast from 'react-hot-toast';
import { Flashcard, FlashcardInput } from '@/types/flashcard';

interface FlashcardActionsProps {
  userId: string;
  deckId: string;
  onFlashcardsAdded: (newFlashcards: Flashcard[]) => void;
  onToggleImport: () => void;
  onToggleGenerate: () => void;
  isImportVisible: boolean;
  isGenerateVisible: boolean;
}

const FlashcardActions: React.FC<FlashcardActionsProps> = ({
  userId,
  deckId,
  onFlashcardsAdded,
  onToggleImport,
  onToggleGenerate,
  isImportVisible,
  isGenerateVisible
}) => {
  const filterValidFlashcards = (flashcards: FlashcardInput[]) => {
    return flashcards.filter(card => 
      card.question.trim() !== '' && 
      card.answer.trim() !== ''
    );
  };

  const saveFlashcards = async (flashcards: FlashcardInput[]): Promise<Flashcard[]> => {
    try {
      const response = await fetch('/api/flashcard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flashcards,
          userId,
          deckId,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save flashcards');
      }

      const savedFlashcards: Flashcard[] = await response.json();
      toast.success(`Successfully added ${savedFlashcards.length} flashcards!`);
      return savedFlashcards;
    } catch (error) {
      console.error('Error saving flashcards:', error);
      toast.error('Failed to save flashcards. Please try again.');
      throw error;
    }
  };

  const handleFlashcardsGenerated = async (generatedFlashcards: FlashcardInput[]) => {
    const validFlashcards = filterValidFlashcards(generatedFlashcards);
    const newFlashcards = await saveFlashcards(validFlashcards);
    onFlashcardsAdded(newFlashcards);
  };

  return (
    <div className="flex items-center gap-3 relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label='generate-flashcards'
              onClick={onToggleGenerate}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-purple-500 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
            >
              <Icon icon="pepicons-print:stars" width="24" height="24" />
              <span className="hidden sm:inline text-sm font-medium">Generate</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="sm:hidden">
            <p>Generate Flashcards</p>
          </TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label='import-flashcards'
              onClick={onToggleImport}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-all duration-200"
            >
              <Icon icon="pepicons-print:cloud-up" width="24" height="24" />
              <span className="hidden sm:inline text-sm font-medium">Import</span>
            </button>
          </TooltipTrigger>
          <TooltipContent className="sm:hidden">
            <p>Import Flashcards</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {isImportVisible && (
        <FlashcardImportModal
          onClose={onToggleImport}
          onFlashcardsAdded={onFlashcardsAdded}
          userId={userId}
          deckId={deckId}
        />
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

export default FlashcardActions;