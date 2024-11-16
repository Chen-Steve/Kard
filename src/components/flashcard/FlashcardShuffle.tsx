import React from 'react';
import { FaShuffle } from 'react-icons/fa6';
import toast from 'react-hot-toast';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface FlashcardShuffleProps {
  flashcards: Flashcard[];
  onShuffleComplete: (shuffledCards: Flashcard[]) => void;
  isPublicDeck?: boolean;
}

const FlashcardShuffle: React.FC<FlashcardShuffleProps> = ({ flashcards, onShuffleComplete, isPublicDeck = false }) => {
  const shuffleFlashcards = async () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const updatedFlashcards = shuffled.map((card, index) => ({
      ...card,
      order: index + 1
    }));

    console.log('Shuffling flashcards:', updatedFlashcards);

    if (isPublicDeck) {
      // For public decks, just update the local state
      onShuffleComplete(updatedFlashcards);
    } else {
      try {
        const response = await fetch('/api/flashcard', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ flashcards: updatedFlashcards }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to shuffle flashcards: ${errorData.error}, ${errorData.details}`);
        }

        const result = await response.json();
        console.log('Shuffle response:', result);

        onShuffleComplete(updatedFlashcards);
        toast.success('Flashcards shuffled!');
      } catch (error) {
        console.error('Error shuffling flashcards:', error);
        toast.error('Failed to shuffle flashcards');
      }
    }
  };

  return (
    <button
      onClick={shuffleFlashcards}
      className="flex items-center justify-center px-3 py-1 bg-black dark:bg-gray-700 text-white dark:text-gray-200 rounded-md hover:bg-gray-800 dark:hover:bg-gray-600 transition-colors duration-200"
      aria-label="Shuffle flashcards"
    >
      <FaShuffle className="text-lg" />
    </button>
  );
};

export default FlashcardShuffle;
