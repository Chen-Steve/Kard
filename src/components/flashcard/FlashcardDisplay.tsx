import React, { useCallback } from 'react';
import { Icon } from '@iconify/react';
import DeckSelector from '../dashboard/DeckSelector';

interface FlashcardDisplayProps {
  card: { question: string; answer: string } | null;
  isFlipped: boolean;
  currentIndex: number;
  totalCards: number;
  onFlip: () => void;
  onPrevious: () => void;
  onNext: () => void;
  isStudyMode: boolean;
  decks?: { id: string; name: string }[];
  selectedDeckId?: string | null;
  onDeckSelect?: (deckId: string) => void;
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
  decks = [],
  selectedDeckId = null,
  onDeckSelect,
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
    <div 
      className={`
        ${isStudyMode 
          ? 'fixed inset-0 w-full flex flex-col items-center justify-center bg-background dark:bg-background'
          : 'flex flex-col items-center mb-8'}
      `}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <div
        className={`
          ${isStudyMode 
            ? 'border-2 border-black dark:border-gray-600 w-[90vw] sm:w-[70vw] h-[70vh] sm:h-[75vh] md:h-[80vh] bg-card dark:bg-gray-600 shadow-lg rounded-lg flex items-center justify-center cursor-pointer text-center p-8 relative overflow-hidden'
            : 'border-2 border-black dark:border-gray-600 w-full h-64 sm:h-64 md:h-96 bg-card dark:bg-gray-600 shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer text-center p-4 relative'}
        `}
        onClick={onFlip}
      >
        <div className="absolute top-2 left-2 text-xs sm:text-sm font-semibold text-muted-foreground dark:text-gray-400">
          {isFlipped ? 'Answer' : 'Question'}
        </div>
        {card ? (
          <div className="w-full sm:w-5/6 max-w-lg h-full flex items-center justify-center">
            <div className="whitespace-pre-wrap break-words text-sm sm:text-base" dangerouslySetInnerHTML={{ __html: isFlipped ? card.answer : card.question }} />
          </div>
        ) : (
          <p className="text-lg sm:text-xl text-muted-foreground dark:text-gray-400">No cards</p>
        )}
      </div>

      <div className="md:hidden mb-4">
        {!isStudyMode && (
          <span className="text-lg text-foreground dark:text-gray-200">
            {card ? `${currentIndex + 1} / ${totalCards}` : '0 / 0'}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between w-full mt-0">
        {!isStudyMode && (
          <div className="flex items-center space-x-4 relative z-50">
            <button
              type="button"
              onClick={() => onPrevious()}
              disabled={currentIndex === 0}
              className={`text-2xl p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentIndex === 0 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-black dark:text-white cursor-pointer'
              } relative z-50 pointer-events-auto`}
              aria-label="Previous"
            >
              <Icon icon="pepicons-print:arrow-left" className="w-6 h-6" />
            </button>
            
            <span className="text-lg text-foreground dark:text-gray-200">
              {card ? `${currentIndex + 1} / ${totalCards}` : '0 / 0'}
            </span>

            <button
              type="button"
              onClick={() => onNext()}
              disabled={currentIndex === totalCards - 1}
              className={`text-2xl p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 ${
                currentIndex === totalCards - 1 
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed' 
                  : 'text-black dark:text-white cursor-pointer'
              } relative z-50 pointer-events-auto`}
              aria-label="Next"
            >
              <Icon icon="pepicons-print:arrow-right" className="w-6 h-6" />
            </button>
          </div>
        )}

        {!isStudyMode && decks && onDeckSelect && (
          <div className="w-48">
            <DeckSelector
              decks={decks}
              selectedDeckId={selectedDeckId}
              onDeckSelect={onDeckSelect}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default FlashcardDisplay;