"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import FlashcardForm from '../components/FlashcardForm';
import FlashcardList from '../components/FlashcardList';
import { FaCog } from 'react-icons/fa'; // Import the settings gear icon

interface FlashcardType {
  id: number;
  question: string;
  answer: string;
  order: number;
}

export default function Home() {
  const [flashcards, setFlashcards] = useState<FlashcardType[]>([]);
  const [currentFlashcard, setCurrentFlashcard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [shortcuts, setShortcuts] = useState({
    flip: 'Space',
    prev: 'ArrowLeft',
    next: 'ArrowRight',
  });
  const [changingShortcut, setChangingShortcut] = useState<string | null>(null);

  useEffect(() => {
    loadFlashcards();
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (changingShortcut) {
        setShortcuts({ ...shortcuts, [changingShortcut]: event.code });
        setChangingShortcut(null);
      } else {
        if (event.code === shortcuts.prev) {
          if (currentFlashcard > 0) {
            setCurrentFlashcard(currentFlashcard - 1);
            setFlipped(false);
          }
        } else if (event.code === shortcuts.next) {
          if (currentFlashcard < flashcards.length - 1) {
            setCurrentFlashcard(currentFlashcard + 1);
            setFlipped(false);
          }
        } else if (event.code === shortcuts.flip) {
          event.preventDefault(); // Prevent default space bar action (like scrolling)
          setFlipped(!flipped);
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentFlashcard, flashcards.length, flipped, shortcuts, changingShortcut]);

  const loadFlashcards = () => {
    const storedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
    setFlashcards(storedFlashcards);
  };

  const handleAddFlashcard = (flashcard: Omit<FlashcardType, 'id'>) => {
    const newFlashcard = { ...flashcard, id: Date.now() }; // Ensure id is assigned
    const updatedFlashcards = [...flashcards, newFlashcard];
    setFlashcards(updatedFlashcards);
    localStorage.setItem('flashcards', JSON.stringify(updatedFlashcards));
  };

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

  const handleShortcutChange = (action: string) => {
    setChangingShortcut(action);
  };

  const getFriendlyKeyName = (code: string) => {
    switch (code) {
      case 'Space':
        return 'Space';
      case 'ArrowLeft':
        return 'Left Arrow';
      case 'ArrowRight':
        return 'Right Arrow';
      default:
        return code;
    }
  };

  return (
    <div className="min-h-screen bg-gray-400 flex flex-col items-center py-10 relative">
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
      <button
        className="absolute top-4 right-4 px-4 py-2 bg-gray-700 text-white rounded"
        aria-label="Settings"
        onClick={() => setShowSettings(true)}
      >
        <FaCog />
      </button>
      {showSettings && (
        <div className="fixed inset-0 bg-gray-800 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white p-6 rounded-lg">
            <h2 className="text-2xl mb-4">Change Shortcuts</h2>
            <div className="mb-4">
              <label className="block mb-2">Flip Card:</label>
              <button
                onClick={() => handleShortcutChange('flip')}
                className="px-2 py-2 bg-gray-600 text-white rounded"
              >
                {changingShortcut === 'flip' ? 'Press any key...' : getFriendlyKeyName(shortcuts.flip)}
              </button>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Previous Card:</label>
              <button
                onClick={() => handleShortcutChange('prev')}
                className="px-2 py-2 bg-gray-600 text-white rounded"
              >
                {changingShortcut === 'prev' ? 'Press any key...' : getFriendlyKeyName(shortcuts.prev)}
              </button>
            </div>
            <div className="mb-4">
              <label className="block mb-2">Next Card:</label>
              <button
                onClick={() => handleShortcutChange('next')}
                className="px-2 py-2 bg-gray-600 text-white rounded"
              >
                {changingShortcut === 'next' ? 'Press any key...' : getFriendlyKeyName(shortcuts.next)}
              </button>
            </div>
            <button
              onClick={() => setShowSettings(false)}
              className="px-2 py-2 bg-gray-600 text-white rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}
      {flashcards.length > 0 ? (
        <>
          <div className="p-10 rounded-lg w-full max-w-3xl mb-0">
            <div className="flex flex-col items-center">
              <div
                className={`p-32 w-full rounded-lg shadow-lg cursor-pointer ${
                  flipped ? 'bg-white text-black' : 'bg-white text-black'
                }`}
                onClick={() => setFlipped(!flipped)}
              >
                {flipped ? (
                  <div className="text-center text-xl font-semibold">
                    {flashcards[currentFlashcard].answer}
                  </div>
                ) : (
                  <div className="text-center text-xl font-semibold">
                    {flashcards[currentFlashcard].question}
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
          <FlashcardForm onSave={handleAddFlashcard} />
          <FlashcardList flashcards={flashcards} setFlashcards={setFlashcards} />
        </>
      ) : (
        <p>Loading flashcards...</p>
      )}
    </div>
  );
}
