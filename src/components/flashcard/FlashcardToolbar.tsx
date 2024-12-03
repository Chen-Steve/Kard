import React, { ReactNode, useState, useRef, useEffect } from 'react';
import { Icon } from '@iconify/react';
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
  isPublicDeck?: boolean;
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
  isPublicDeck = false,
}) => {
  return (
    <div className="flex justify-between items-center space-x-4 flex-wrap">
      <div className="flex space-x-2">
        {!readOnly && (
          <button
            onClick={onAddCard}
            className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-3 py-2 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
            aria-label="Add flashcard"
          >
            <Icon icon="mdi:plus" className="sm:mr-2 text-xl sm:text-base" /> <span className="hidden sm:inline">Add Flashcard</span>
          </button>
        )}
        <button
          onClick={onToggleScroll}
          className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-3 py-2 sm:px-3 sm:py-2 rounded flex items-center"
          aria-label={isScrollable ? "Expand list" : "Make list scrollable"}
        >
          <Icon icon="pepicons-print:dots-x" className="text-xl sm:text-base" />
        </button>
        <ViewSelector isTableViewActive={isTableViewActive} onToggleView={onToggleView} />
        <FlashcardShuffle 
          flashcards={flashcards}
          onShuffleComplete={onShuffleComplete}
          isPublicDeck={isPublicDeck}
        />
      </div>
      <div className="flex space-x-2">
        {children}
      </div>
    </div>
  );
};

interface ViewSelectorProps {
  isTableViewActive: boolean;
  onToggleView: () => void;
}

const ViewSelector: React.FC<ViewSelectorProps> = ({ isTableViewActive, onToggleView }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 767);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleViewChange = (isTable: boolean) => {
    if (isTable !== isTableViewActive) {
      onToggleView();
    }
    setIsOpen(false);
  };

  if (isMobile) {
    return null;
  }

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          aria-label="Display Mode"
          type="button"
          className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-3 py-2 sm:px-3 sm:py-2 rounded flex items-center"
          id="view-options-menu"
          onClick={() => setIsOpen(!isOpen)}
        >
          Display Mode
          <Icon icon="mdi:chevron-down" className="ml-2 text-xl sm:text-base" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 min-w-full rounded-md shadow-lg bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="view-options-menu">
            <button
              className={`${
                isTableViewActive ? 'bg-gray-100 dark:bg-gray-600' : ''
              } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600`}
              role="menuitem"
              onClick={() => handleViewChange(true)}
            >
              Table View
            </button>
            <button
              className={`${
                !isTableViewActive ? 'bg-gray-100 dark:bg-gray-600' : ''
              } block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600`}
              role="menuitem"
              onClick={() => handleViewChange(false)}
            >
              List View
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FlashcardToolbar;
