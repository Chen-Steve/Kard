import React, { useCallback } from 'react';
import { Icon } from '@iconify/react';

interface FlashcardDisplayProps {
  card: { question: string; answer: string } | null;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isStudyMode: boolean;
}

const FlashcardDisplay: React.FC<FlashcardDisplayProps> = ({
  card,
  isFlipped,
  currentIndex,
  totalCards,
  onFlip,
  onPrevious,
  onNext,
  isStudyMode,
}) => {
  const [touchStart, setTouchStart] = React.useState<number | null>(null);
  const [touchEnd, setTouchEnd] = React.useState<number | null>(null);

  // the required distance between touchStart and touchEnd to be detected as a swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;
    
    if (isLeftSwipe && currentIndex < totalCards - 1) {
      onNext();
    }
    if (isRightSwipe && currentIndex > 0) {
      onPrevious();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  }, [touchStart, touchEnd, currentIndex, totalCards, onNext, onPrevious]);

  return (
    <div className={`
      ${isStudyMode 
        ? 'h-[70vh] max-w-full flex flex-col items-center justify-center'
        : 'flex flex-col items-center mb-8'}
    `}>
      <div
        className={`
          ${isStudyMode 
            ? 'border-2 border-black dark:border-gray-600 w-[90vw] sm:w-[60vw] h-64 sm:h-64 md:h-96 bg-card dark:bg-gray-600 shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer text-center p-4 relative'
            : 'border-2 border-black dark:border-gray-600 w-full h-64 sm:h-64 md:h-96 bg-card dark:bg-gray-600 shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer text-center p-4 relative'}
          touch-pan-y
        `}
        onClick={onFlip}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
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

      <div className="md:hidden mb-4">
        <span className="text-lg text-foreground dark:text-gray-200">
          {card ? `${currentIndex + 1} / ${totalCards}` : '0 / 0'}
        </span>
      </div>

      <div className="hidden md:flex items-center mt-0">
        <button
          type="button"
          onClick={onPrevious}
          className="mr-4 text-2xl text-black dark:text-white"
          aria-label="Previous"
          disabled={currentIndex === 0}
        >
          <Icon icon="pepicons-print:arrow-left" />
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
          <Icon icon="pepicons-print:arrow-right" />
        </button>
      </div>
    </div>
  );
};

export default FlashcardDisplay;