"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlashcardList from '../components/FlashcardList';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import { useSession } from 'next-auth/react';

interface FlashcardType {
  id: number;
  question: string;
  answer: string;
  order: number;
}

const exampleFlashcards: FlashcardType[] = [
  { id: 1, question: "What is the capital of France?", answer: "Paris", order: 1 },
  { id: 2, question: "Who wrote 'Romeo and Juliet'?", answer: "William Shakespeare", order: 2 },
  { id: 3, question: "What is the chemical symbol for gold?", answer: "Au", order: 3 },
  { id: 4, question: "What year did World War II end?", answer: "1945", order: 4 },
  { id: 5, question: "What is the largest planet in our solar system?", answer: "Jupiter", order: 5 },
];

const CardPage = () => {
  const { data: session } = useSession();
  const [flashcards, setFlashcards] = useState<FlashcardType[]>(exampleFlashcards);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const handleNext = () => {
    if (currentFlashcard < flashcards.length - 1) {
      setCurrentFlashcard(currentFlashcard + 1);
      setFlipped(false);
    }
  };

  const handlePrev = () => {
    if (currentFlashcard > 0) {
      setCurrentFlashcard(currentFlashcard - 1);
      setFlipped(false);
    }
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  return (
    <div className="min-h-screen bg-gray-400 flex flex-col items-center py-10 relative">
      <KeyboardShortcuts onFlip={handleFlip} onNext={handleNext} onPrev={handlePrev} />
      <Link href="/deck">
        <button className="absolute top-4 left-4 px-4 py-2 bg-gray-700 text-white rounded">
          Edit Decks
        </button>
      </Link>
      <Link href="/dashboard">
        <button className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-white rounded">
          Dashboard
        </button>
      </Link>
      <div className="p-10 rounded-lg w-full max-w-3xl mb-0">
        <div className="flex flex-col items-center">
          <div
            className={`p-32 w-full rounded-lg shadow-lg cursor-pointer ${
              flipped ? 'bg-white text-black' : 'bg-white text-black'
            }`}
            onClick={handleFlip}
          >
            {flipped ? (
              <div className="text-center text-xl font-semibold">
                {flashcards[currentFlashcard]?.answer}
              </div>
            ) : (
              <div className="text-center text-xl font-semibold">
                {flashcards[currentFlashcard]?.question}
              </div>
            )}
          </div>
          <div className="flex gap-4 mt-4 items-center">
            <button onClick={handlePrev} className="btn btn-primary">Previous</button>
            <span className="text-sm">
              {currentFlashcard + 1} / {flashcards.length}
            </span>
            <button onClick={handleNext} className="btn btn-primary">Next</button>
          </div>
        </div>
      </div>
      <FlashcardList flashcards={flashcards} setFlashcards={setFlashcards} />
    </div>
  );
};

export default CardPage;
