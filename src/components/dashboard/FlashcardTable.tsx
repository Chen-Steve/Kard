import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';
import { MdDeleteOutline, MdOutlineSave, MdEdit } from "react-icons/md";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

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
}

const FlashcardTable: React.FC<FlashcardTableProps> = ({ flashcards, onDelete, onSave, onReorder, readOnly }) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');

  const handleEdit = (card: Flashcard) => {
    setEditingId(card.id);
    setEditedQuestion(card.question);
    setEditedAnswer(card.answer);
  };

  const handleSave = (id: string) => {
    onSave(id, editedQuestion, editedAnswer);
    setEditingId(null);
  };

  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="flashcards" direction="vertical">
        {(provided) => (
          <div 
            {...provided.droppableProps} 
            ref={provided.innerRef} 
            className="grid grid-cols-3 gap-4"
            style={{ display: 'grid' }} // This ensures the grid layout is maintained
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
                      {editingId === card.id ? (
                        <textarea  
                          aria-label="Edit question"
                          value={editedQuestion}
                          onChange={(e) => setEditedQuestion(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="text-sm"><Markdown>{card.question}</Markdown></div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg mb-1">Answer:</h3>
                      {editingId === card.id ? (
                        <textarea
                          aria-label="Edit answer"
                          value={editedAnswer}
                          onChange={(e) => setEditedAnswer(e.target.value)}
                          className="w-full p-2 border border-gray-300 rounded resize-none"
                          rows={3}
                        />
                      ) : (
                        <div className="text-sm"><Markdown>{card.answer}</Markdown></div>
                      )}
                    </div>
                    {!readOnly && (
                      <div className="mt-4 flex justify-between items-center">
                        <button 
                          onClick={() => onDelete(card.id)} 
                          className="text-red-500 hover:text-red-700 text-sm"
                          aria-label="Delete card"
                        >
                          <MdDeleteOutline size={20} />
                        </button>
                        {editingId === card.id ? (
                          <div className="flex space-x-2">
                            <button 
                              onClick={() => handleSave(card.id)} 
                              className="text-green-500 hover:text-green-700 text-sm"
                              aria-label="Save changes"
                            >
                              <MdOutlineSave size={20} />
                            </button>
                          </div>
                        ) : (
                          <button 
                            onClick={() => handleEdit(card)} 
                            className="text-blue-500 hover:text-blue-700 text-sm"
                            aria-label="Edit card"
                          >
                            <MdEdit size={20} />
                          </button>
                        )}
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