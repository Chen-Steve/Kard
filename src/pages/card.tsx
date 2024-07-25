"use client";

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import FlashcardList from '../components/FlashcardList';
import KeyboardShortcuts from '../components/KeyboardShortcuts';
import { useSession } from 'next-auth/react';
import supabase from '../lib/supabaseClient';

interface FlashcardType {
  id: number;
  question: string;
  answer: string;
  order: number;
}

const CardPage = () => {
  const { data: session } = useSession();
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const loadFlashcardsFromDB = useCallback(async () => {
    if (session) {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .select('*')
          .eq('user_id', session.user.id);

        if (error) {
          throw new Error(error.message);
        }

        if (data) {
          console.log('Loaded flashcards from DB:', data);
          setFlashcards(data);
        }
      } catch (error) {
        console.error('Failed to load flashcards from database:', error);
      }
    }
  }, [session]);

  const loadFlashcardsFromLocalStorage = useCallback(() => {
    const storedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    console.log('Stored flashcards:', storedFlashcards);
    setFlashcards(storedFlashcards);
  }, []);

  useEffect(() => {
    if (session) {
      loadFlashcardsFromDB();
    } else {
      loadFlashcardsFromLocalStorage();
    }
  }, [session, loadFlashcardsFromDB, loadFlashcardsFromLocalStorage]);

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
