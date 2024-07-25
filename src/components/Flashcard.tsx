import React from 'react';

interface FlashcardProps {
  flashcard: {
    id: number;
    question: string;
    answer: string;
    order: number;
  };
  flipped: boolean;
  setFlipped: (flipped: boolean) => void;
}

const Flashcard: React.FC<FlashcardProps> = ({ flashcard, flipped, setFlipped }) => {
  return (
    <div
      className="w-72 bg-white border border-black-300 rounded-lg shadow-md cursor-pointer transition-transform transform hover:scale-105"
      style={{ height: '30rem' }}
      onClick={() => setFlipped(!flipped)}
    >
      <div className="flex items-center justify-center h-full">
        <div className={`text-lg ${flipped ? 'hidden' : 'block'}`}>
          {flashcard.question}
        </div>
        <div className={`text-lg ${flipped ? 'block' : 'hidden'}`}>
          {flashcard.answer}
        </div>
      </div>
    </div>
  );
};

export default Flashcard;