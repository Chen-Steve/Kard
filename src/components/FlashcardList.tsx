import React, { useState } from 'react';
import { DndContext, useSensor, useSensors, PointerSensor, closestCenter, KeyboardSensor } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { SortableContext, verticalListSortingStrategy, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { SortableItem } from './SortableItem';
import styled from 'styled-components';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface FlashcardListProps {
  flashcards: Flashcard[];
  setFlashcards: (flashcards: Flashcard[]) => void;
}

const FlashcardList: React.FC<FlashcardListProps> = ({ flashcards, setFlashcards }) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isDecksVisible, setIsDecksVisible] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: any) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      const oldIndex = flashcards.findIndex((flashcard) => flashcard.id === active.id);
      const newIndex = flashcards.findIndex((flashcard) => flashcard.id === over.id);
      setFlashcards(arrayMove(flashcards, oldIndex, newIndex));
    }
  };

  return (
    <Container>
      <Title>
        <Toggle onClick={() => setIsVisible(!isVisible)}>
          All Flashcards
          <ToggleIcon $isVisible={isVisible}>▼</ToggleIcon>
        </Toggle>
        <Toggle onClick={() => setIsDecksVisible(!isDecksVisible)}>
          Decks
          <ToggleIcon $isVisible={isDecksVisible}>▼</ToggleIcon>
        </Toggle>
      </Title>
      <Separator />
      {isVisible && (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={flashcards.map((flashcard) => flashcard.id)} strategy={verticalListSortingStrategy}>
            <Grid>
              {flashcards.map((flashcard) => (
                <SortableItem key={flashcard.id} id={flashcard.id}>
                  <Card>
                    <CardTitle>{flashcard.question}</CardTitle>
                    <CardContent>{flashcard.answer}</CardContent>
                  </Card>
                </SortableItem>
              ))}
            </Grid>
          </SortableContext>
        </DndContext>
      )}
    </Container>
  );
};

export default FlashcardList;

const Container = styled.div`
  margin-top: 2.5rem;
  width: 100%;
  max-width: 64rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Toggle = styled.span`
  cursor: pointer;
  font-size: 1rem;
  padding: 0.25rem 0.5rem;
  display: flex;
  align-items: center;
`;

const ToggleIcon = styled.span<{ $isVisible: boolean }>`
  margin-left: 0.5rem;
  transition: transform 0.3s;
  transform: ${({ $isVisible }) => ($isVisible ? 'rotate(180deg)' : 'rotate(0)')};
  font-size: 0.875rem;
`;

const Separator = styled.hr`
  border-top: 2px solid #4a5568;
  margin-bottom: 1rem;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(1, minmax(0, 1fr));
  gap: 1rem;

  @media (min-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const Card = styled.div`
  padding: 1rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
  overflow: hidden;
`;

const CardTitle = styled.h3`
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  word-break: break-words;
`;

const CardContent = styled.p`
  word-break: break-words;
  max-height: 12rem;
  overflow: auto;
`;