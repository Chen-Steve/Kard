import React from 'react';
import { FlashcardImportModal } from './FlashcardImportModal';
import Popup from './AIGenerateModal';
import { Icon } from '@iconify/react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from 'react-toastify';
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
    <div className="flex items-center space-x-2 relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              aria-label='generate-flashcards'
              onClick={onToggleGenerate}
              className="text-purple-500 hover:text-purple-600 transition-colors duration-200"
            >
              <Icon icon="pepicons-print:stars" width="24" height="24" />
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
              onClick={onToggleImport}
              className="text-emerald-500 hover:text-emerald-600 transition-colors duration-200"
            >
              <Icon icon="pepicons-print:cloud-up" width="26" height="26" />
            </button>
          </TooltipTrigger>
          <TooltipContent>
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