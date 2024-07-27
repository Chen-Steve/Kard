import React, { useState, useEffect, useCallback } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';
import styled from 'styled-components';
import { useSession } from 'next-auth/react';
import supabase from '../lib/supabaseClient';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
  userId?: number;
}

interface FlashcardListProps {
  flashcards: Flashcard[];
  setFlashcards: (flashcards: Flashcard[]) => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, setFlashcards }) => {
  const { data: session } = useSession();
  const [isVisible, setIsVisible] = useState(true);
  const [isDecksVisible, setIsDecksVisible] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const loadFlashcards = useCallback(async () => {
    if (!session || !session.user) {
      const storedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
      setFlashcards(storedFlashcards);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('flashcards')
        .select('*')
        .eq('userId', session.user.id);

      if (error) {
        console.error('Error loading flashcards from database:', error);
      } else {
        setFlashcards(data);
      }
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    }
  }, [session, setFlashcards]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = flashcards.findIndex((flashcard) => flashcard.id === active.id);
      const newIndex = flashcards.findIndex((flashcard) => flashcard.id === over.id);
      setFlashcards(arrayMove(flashcards, oldIndex, newIndex));
    }
  };

  return (
    <div className="w-full max-w-4xl mt-8">
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={() => setIsVisible(!isVisible)}
          className="btn btn-secondary flex items-center"
        >
          All Flashcards
          <svg
            className={`ml-2 h-4 w-4 transform transition-transform ${isVisible ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <button
          onClick={() => setIsDecksVisible(!isDecksVisible)}
          className="btn btn-secondary flex items-center"
        >
          Decks
          <svg
            className={`ml-2 h-4 w-4 transform transition-transform ${isDecksVisible ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
      <hr className="border-t-2 border-gray-300 mb-6" />
      {isVisible && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={flashcards.map((flashcard) => flashcard.id)} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {flashcards.map((flashcard) => (
                <SortableItem key={flashcard.id} id={flashcard.id}>
                  <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow duration-300">
                    <h3 className="text-lg font-semibold mb-2 truncate">{flashcard.question}</h3>
                    <p className="text-gray-600 h-20 overflow-y-auto">{flashcard.answer}</p>
                  </div>
                </SortableItem>
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}
    </div>
  );
};

export default FlashcardList;