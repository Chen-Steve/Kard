import React, { useState } from 'react';
import { DragDropContext, DropResult } from '@hello-pangea/dnd';
import FlashcardList from './demoList';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

const FlashcardContainer: React.FC = () => {
  const [lists, setLists] = useState<Record<string, Flashcard[]>>({
    list1: [
      { id: 'card1', question: 'What is the capital of France?', answer: 'Paris' },
      { id: 'card2', question: 'What is 2 + 2?', answer: '4' },
    ],
    list2: [
      { id: 'card3', question: 'Who wrote "Romeo and Juliet"?', answer: 'William Shakespeare' },
      { id: 'card4', question: 'What is the tallest mountain in the world?', answer: 'Mount Everest' },
    ],
    list3: [
      { id: 'card5', question: 'What is the largest ocean on Earth?', answer: 'Pacific Ocean' },
    ],
  });

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    if (!lists[source.droppableId] || !lists[destination.droppableId]) return;

    if (source.droppableId === destination.droppableId) {
      // Moving within the same list
      const items = Array.from(lists[source.droppableId]);
      const [reorderedItem] = items.splice(source.index, 1);
      items.splice(destination.index, 0, reorderedItem);
      setLists((prev) => ({ ...prev, [source.droppableId]: items }));
    } else {
      // Moving to a different list
      const sourceItems = Array.from(lists[source.droppableId]);
      const destinationItems = Array.from(lists[destination.droppableId]);
      const [movedItem] = sourceItems.splice(source.index, 1);
      destinationItems.splice(destination.index, 0, movedItem);
      setLists((prev) => ({
        ...prev,
        [source.droppableId]: sourceItems,
        [destination.droppableId]: destinationItems,
      }));
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="p-4 bg-gray-100 rounded-lg shadow-inner flex space-x-4">
        <div className="min-w-[300px] w-1/3">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Deck 1</h2>
          <FlashcardList id="lis1" flashcards={lists.list1} />
        </div>
        <div className="min-w-[300px] w-1/3">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Deck 2</h2>
          <FlashcardList id="list2" flashcards={lists.list2} />
        </div>
        <div className="min-w-[300px] w-1/3">
          <h2 className="text-2xl font-bold text-center mb-4 text-gray-800">Deck 3</h2>
          <FlashcardList id="list3" flashcards={lists.list3} />
        </div>
      </div>
    </DragDropContext>
  );
};

export default FlashcardContainer;
