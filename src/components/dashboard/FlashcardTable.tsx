import React from 'react';
import { Icon } from '@iconify/react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import EditableDiv from '../flashcard/EditableDiv';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface FlashcardTableProps {
  flashcards: Flashcard[];
  onDelete: (id: string) => void;
  onSave: (id: string, updatedQuestion: string, updatedAnswer: string) => void;
  onReorder: (result: DropResult) => void;
  readOnly: boolean;
  showDefinitions: boolean;
}

const FlashcardTable: React.FC<FlashcardTableProps> = ({ flashcards, onDelete, onSave, onReorder, readOnly, showDefinitions }) => {
  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="flashcards" direction="vertical">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className="grid grid-cols-3 gap-4"
            style={{ display: 'grid' }}
          >
            {flashcards.map((card, index) => (
              <Draggable key={card.id} draggableId={card.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg p-4 shadow-sm"
                    style={{
                      ...provided.draggableProps.style,
                      gridColumn: snapshot.isDragging ? 'span 3' : 'auto',
                    }}
                  >
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Card {index + 1}
                      </span>
                    </div>
                    <div className="mb-2">
                      <h3 className="font-semibold text-lg mb-1">Question:</h3>
                      <EditableDiv
                        htmlContent={card.question}
                        onChange={(content) => onSave(card.id, content, card.answer)}
                        disabled={readOnly}
                        placeholder="Enter question here..."
                      />
                    </div>
                    {showDefinitions && (
                      <div>
                        <h3 className="font-semibold text-lg mb-1">Answer:</h3>
                        <EditableDiv
                          htmlContent={card.answer}
                          onChange={(content) => onSave(card.id, card.question, content)}
                          disabled={readOnly}
                          placeholder="Enter answer here..."
                        />
                      </div>
                    )}
                    {!readOnly && (
                      <div className="mt-4 flex justify-end">
                        <button 
                          onClick={() => onDelete(card.id)} 
                          className="text-red-500 hover:text-red-700 text-sm"
                          aria-label="Delete card"
                        >
                          <Icon icon="pepicons-print:trash" width={20} />
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default FlashcardTable;