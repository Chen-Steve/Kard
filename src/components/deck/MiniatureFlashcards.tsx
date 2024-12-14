import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '../ui/Card';
import supabase from '../../lib/supabaseClient';
import { Button } from '../ui/Button';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Icon } from '@iconify/react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  isFlipped: boolean;
}

interface MiniatureFlashcardsProps {
  deckId: string;
}

const MiniatureFlashcards: React.FC<MiniatureFlashcardsProps> = ({ deckId }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchFlashcards = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      if (sessionError || !session) {
        console.error('Session error:', sessionError || 'No session found');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/flashcard?userId=${session.user.id}&deckId=${deckId}`, {
          headers: {
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Failed to fetch flashcards');
        }

        const data = await response.json();
        setFlashcards(data.map((card: Omit<Flashcard, 'isFlipped'>) => ({ ...card, isFlipped: false })));
      } catch (error) {
        console.error('Error fetching flashcards:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFlashcards();
  }, [deckId]);

  const flipCard = (id: string) => {
    setFlashcards(cards =>
      cards.map(card =>
        card.id === id ? { ...card, isFlipped: !card.isFlipped } : card
      )
    );
  };

  if (loading) {
    return <div className="text-gray-600 dark:text-gray-400">Loading flashcards...</div>;
  }

  const displayedFlashcards = showAll ? flashcards : flashcards.slice(0, 3);

  return (
    <Droppable droppableId={deckId} type="FLASHCARD">
      {(provided) => (
        <div
          {...provided.droppableProps}
          ref={provided.innerRef}
          className="space-y-2 mb-4"
        >
          {displayedFlashcards.map((flashcard, index) => (
            <Draggable key={flashcard.id} draggableId={flashcard.id} index={index}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  style={{
                    ...provided.draggableProps.style,
                    transform: snapshot.isDragging
                      ? provided.draggableProps.style?.transform
                      : 'translate(0px, 0px)',
                  }}
                >
                  <Card 
                    className={`bg-gray-50 dark:bg-gray-700/40 cursor-pointer relative border dark:border-gray-600/50 hover:bg-gray-100 dark:hover:bg-gray-700/60 transition-colors ${
                      snapshot.isDragging ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => flipCard(flashcard.id)}
                  >
                    <CardContent className="p-2">
                      <div 
                        className="text-sm text-gray-700 dark:text-gray-200 whitespace-pre-wrap pr-8"
                        dangerouslySetInnerHTML={{ __html: flashcard.isFlipped ? flashcard.answer : flashcard.question }}
                      />
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          flipCard(flashcard.id);
                        }}
                        className="absolute top-1 right-1 w-6 h-6 p-0 bg-blue-400/80 hover:bg-blue-400 dark:bg-blue-500/40 dark:hover:bg-blue-500/60 rounded-full transition-colors duration-200 flex items-center justify-center"
                        title="Flip card"
                      >
                        <Icon 
                          icon="pepicons-print:arrow-spin" 
                          className="w-4 h-4 text-white dark:text-gray-100 scale-x-[-1] rotate-180" 
                        />
                      </Button>
                    </CardContent>
                  </Card>
                </div>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
          {!showAll && flashcards.length > 3 && (
            <Button
              onClick={() => setShowAll(true)}
              className="w-full bg-transparent hover:bg-gray-100 dark:hover:bg-gray-700/30 text-xs text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 mt-2 border dark:border-gray-700/50"
            >
              {flashcards.length - 3} more flashcard(s)... (Click to show all)
            </Button>
          )}
        </div>
      )}
    </Droppable>
  );
};

export default MiniatureFlashcards;
