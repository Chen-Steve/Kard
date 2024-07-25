import { FC, useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import FlashcardList from './demoList';

interface Flashcard {
  id: string;
  content: string;
}

const FlashcardContainer: FC = () => {
  const [flashcards1, setFlashcards1] = useState<Flashcard[]>([
    { id: '1', content: 'Flashcard 1' },
    { id: '2', content: 'Flashcard 2' },
    { id: '3', content: 'Flashcard 3' },
  ]);

  const [flashcards2, setFlashcards2] = useState<Flashcard[]>([
    { id: '4', content: 'Flashcard 4' },
    { id: '5', content: 'Flashcard 5' },
  ]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(
        source.droppableId === 'flashcards1' ? flashcards1 : flashcards2,
        source.index,
        destination.index
      );

      if (source.droppableId === 'flashcards1') {
        setFlashcards1(items);
      } else {
        setFlashcards2(items);
      }
    } else {
      const result = move(
        source.droppableId === 'flashcards1' ? flashcards1 : flashcards2,
        source.droppableId === 'flashcards1' ? flashcards2 : flashcards1,
        source,
        destination
      );

      setFlashcards1(result.flashcards1);
      setFlashcards2(result.flashcards2);
    }
  };

  const reorder = (list: Flashcard[], startIndex: number, endIndex: number): Flashcard[] => {
    const result = Array.from(list);
    const [removed] = result.splice(startIndex, 1);
    result.splice(endIndex, 0, removed);

    return result;
  };

  const move = (
    source: Flashcard[],
    destination: Flashcard[],
    droppableSource: any,
    droppableDestination: any
  ) => {
    const sourceClone = Array.from(source);
    const destClone = Array.from(destination);
    const [removed] = sourceClone.splice(droppableSource.index, 1);

    destClone.splice(droppableDestination.index, 0, removed);

    const result = {
      flashcards1: droppableSource.droppableId === 'flashcards1' ? sourceClone : destClone,
      flashcards2: droppableSource.droppableId === 'flashcards2' ? sourceClone : destClone,
    };

    return result;
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex justify-center space-x-8">
        <FlashcardList id="flashcards1" flashcards={flashcards1} />
        <FlashcardList id="flashcards2" flashcards={flashcards2} />
      </div>
    </DragDropContext>
  );
};

export default FlashcardContainer;
