import React, { ReactNode } from 'react';
import { FaPlus, FaEllipsisH, FaList, FaTable } from 'react-icons/fa';
import { FaShuffle } from 'react-icons/fa6';
import FlashcardShuffle from './FlashcardShuffle';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface FlashcardToolbarProps {
  onAddCard: () => void;
  onToggleScroll: () => void;
  onToggleView: () => void;
  isScrollable: boolean;
  isTableViewActive: boolean;
  readOnly: boolean;
  flashcards: Flashcard[];
  onShuffleComplete: (shuffledCards: Flashcard[]) => void;
  children?: ReactNode;
}

const FlashcardToolbar: React.FC<FlashcardToolbarProps> = ({
  onAddCard,
  onToggleScroll,
  onToggleView,
  isScrollable,
  isTableViewActive,
  readOnly,
  flashcards,
  onShuffleComplete,
  children,
}) => {
  return (
    <div className="flex justify-between items-center space-x-4 flex-wrap">
      <div className="flex space-x-2">
        {!readOnly && (
          <button
            onClick={onAddCard}
            className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-2 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
            aria-label="Add flashcard"
          >
            <FaPlus className="sm:mr-2" /> <span className="hidden sm:inline">Add Flashcard</span>
          </button>
        )}
        <button
          onClick={onToggleScroll}
          className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-center"
          aria-label={isScrollable ? "Expand list" : "Make list scrollable"}
        >
          <FaEllipsisH />
        </button>
        <button
          onClick={onToggleView}
          className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-center"
          aria-label={isTableViewActive ? "Switch to list view" : "Switch to table view"}
        >
          {isTableViewActive ? <FaList /> : <FaTable />}
        </button>
        <FlashcardShuffle 
          flashcards={flashcards}
          onShuffleComplete={onShuffleComplete}
        />
      </div>
      <div className="flex space-x-2">
        {children}
      </div>
    </div>
  );
};

export default FlashcardToolbar;