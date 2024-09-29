import React from 'react';
import { FaShuffle } from 'react-icons/fa6';
import { toast } from 'react-toastify';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

interface FlashcardShuffleProps {
  flashcards: Flashcard[];
  onShuffleComplete: (shuffledCards: Flashcard[]) => void;
}

const FlashcardShuffle: React.FC<FlashcardShuffleProps> = ({ flashcards, onShuffleComplete }) => {
  const shuffleFlashcards = async () => {
    const shuffled = [...flashcards].sort(() => Math.random() - 0.5);
    const updatedFlashcards = shuffled.map((card, index) => ({
      ...card,
      order: index + 1
    }));

    console.log('Shuffling flashcards:', updatedFlashcards);

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
    } catch (error) {
      console.error('Error shuffling flashcards:', error);
      toast.error('Failed to shuffle flashcards. Please try again.');
    }
  };

  return (
    <button
      onClick={shuffleFlashcards}
      className="flex items-center justify-center px-3 py-1 bg-black text-white rounded-md"
      aria-label="Shuffle flashcards"
    >
      <FaShuffle />
      
    </button>
  );
};

export default FlashcardShuffle;