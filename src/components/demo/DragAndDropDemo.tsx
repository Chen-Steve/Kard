import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

marked.setOptions({
  async: false
});

interface Card {
  id: string;
  question: string;
  answer: string;
}

interface Column {
  id: string;
  title: string;
  cards: Card[];
}

const initialColumns: Column[] = [
  {
    id: 'column-1',
    title: 'Math',
    cards: [
      { id: 'card-1', question: 'What is 2 + 2?', answer: '4' },
      { id: 'card-2', question: 'What is the square root of 16?', answer: '4' },
      { id: 'card-3', question: 'What is 5 x 7?', answer: '35' },
    ],
  },
  {
    id: 'column-2',
    title: 'Chemistry',
    cards: [
      { id: 'card-4', question: 'What is the chemical symbol for water?', answer: 'H<sub>2</sub>O' },
      { id: 'card-5', question: 'What is the difference between a sigma bond (σ bond) and a pi bond (π bond) in molecular orbital theory?', 
        answer: 'A sigma bond (σ bond) is formed by the direct overlap of atomic orbitals along the internuclear axis, leading to stronger bonding... ' },
    ],
  },
  {
    id: 'column-3',
    title: 'Español',
    cards: [
      { id: 'card-6', question: 'El felino doméstico que dice "miau"', answer: 'El gato ' },
      { id: 'card-7', question: 'Un mueble con una superficie plana y patas', answer: 'La mesa' },
      { id: 'card-8', question: 'Una abertura en la pared que deja entrar luz', answer: 'La ventana' },
    ],
  },
];

const DragAndDropDemo: React.FC = () => {
  const [columns, setColumns] = useState(initialColumns);
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    // Dropped outside the list
    if (!destination) return;

    // Moved within the same list
    if (source.droppableId === destination.droppableId) {
      const column = columns.find(col => col.id === source.droppableId);
      if (!column) return;

      const newCards = Array.from(column.cards);
      const [reorderedItem] = newCards.splice(source.index, 1);
      newCards.splice(destination.index, 0, reorderedItem);

      const newColumns = columns.map(col =>
        col.id === source.droppableId ? { ...col, cards: newCards } : col
      );

      setColumns(newColumns);
    } else {
      // Moved to a different list
      const sourceColumn = columns.find(col => col.id === source.droppableId);
      const destColumn = columns.find(col => col.id === destination.droppableId);
      if (!sourceColumn || !destColumn) return;

      const sourceCards = Array.from(sourceColumn.cards);
      const destCards = Array.from(destColumn.cards);
      const [movedItem] = sourceCards.splice(source.index, 1);
      destCards.splice(destination.index, 0, movedItem);

      const newColumns = columns.map(col => {
        if (col.id === source.droppableId) {
          return { ...col, cards: sourceCards };
        }
        if (col.id === destination.droppableId) {
          return { ...col, cards: destCards };
        }
        return col;
      });

      setColumns(newColumns);
    }
  };

  const handleFlip = (cardId: string) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div className="flex flex-col sm:flex-row sm:space-x-6 max-w-6xl mx-auto px-4">
        {columns.map((column) => (
          <div 
            key={column.id} 
            className="w-[280px] sm:w-1/3 mb-8 sm:mb-0 mx-auto"
          >
            <h3 className="text-xl font-semibold mb-4 text-center">{column.title}</h3>
            <Droppable droppableId={column.id}>
              {(provided) => (
                <ul
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="bg-gray-100 p-4 rounded min-h-[300px]"
                >
                  {column.cards.map((card, index) => (
                    <div key={card.id}>
                      <Draggable draggableId={card.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-3 mb-3 text-sm relative h-[160px] w-[260px] sm:h-[160px] sm:w-[320px] mx-auto flex flex-col justify-center"
                          >
                            <span className="absolute top-2 left-2 text-xs font-medium text-gray-500 dark:text-gray-400">
                              {flippedCards.has(card.id) ? 'Definition' : 'Term'}
                            </span>
                            <div 
                              className="text-black dark:text-white text-center px-2 text-xs sm:text-base"
                              dangerouslySetInnerHTML={{ 
                                __html: DOMPurify.sanitize(
                                  marked.parse(flippedCards.has(card.id) ? card.answer : card.question, {
                                    async: false
                                  }) as string
                                ) 
                              }}
                            />
                            <button
                              onClick={() => handleFlip(card.id)}
                              className="absolute top-2 right-2 w-5 h-5 sm:w-7 sm:h-7 bg-blue-500 rounded-full z-20 flex items-center justify-center text-white text-xs"
                              title="Flip card"
                            >
                              ↻
                            </button>
                          </div>
                        )}
                      </Draggable>
                    </div>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default DragAndDropDemo;