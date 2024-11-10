import React from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';

interface FlashcardDisplayProps {
  card: { question: string; answer: string } | null;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  isFlipped,
  currentIndex,
  totalCards,
  onFlip,
  onPrevious,
  onNext,
}) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div
        className="border-2 border-black dark:border-gray-600 w-full h-64 sm:h-96 bg-card dark:bg-gray-600 shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer text-center p-4 relative"
        onClick={onFlip}
      >
        <div className="absolute top-2 left-2 text-xs sm:text-sm font-semibold text-muted-foreground dark:text-gray-400">
          {isFlipped ? 'Answer' : 'Question'}
        </div>
        {card ? (
          <div className="w-full sm:w-5/6 max-w-lg overflow-y-auto overflow-x-hidden text-sm sm:text-base">
            <div className="whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: isFlipped ? card.answer : card.question }} />
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-muted-foreground dark:text-gray-400">No cards</p>
        )}
      </div>
      <div className="flex items-center mt-0">
        <button
          type="button"
          onClick={onPrevious}
          className="mr-4 text-2xl text-black dark:text-white"
          aria-label="Previous"
          disabled={currentIndex === 0}
        >
          <FaChevronLeft />
        </button>
        <span className="text-lg text-foreground dark:text-gray-200">
          {card ? `${currentIndex + 1} / ${totalCards}` : '0 / 0'}
        </span>
        <button
          type="button"
          onClick={onNext}
          className="ml-4 text-2xl text-black dark:text-white"
          aria-label="Next"
          disabled={currentIndex === totalCards - 1}
        >
          <FaChevronRight />
        </button>
      </div>
    </div>
  );
};

export default FlashcardDisplay;