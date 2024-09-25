import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { FaTrash } from 'react-icons/fa';

interface FlashcardTableProps {
  flashcards: Flashcard[];
  onDelete: (id: string) => void;
  onSave: (id: string, updatedQuestion: string, updatedAnswer: string) => void;
  onReorder: (result: DropResult) => void;
  readOnly?: boolean;
}

interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
}

const AnonFlashcardTable: React.FC<FlashcardTableProps> = ({
  flashcards,
  onDelete,
  onSave,
  onReorder,
  readOnly = false,
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editedQuestion, setEditedQuestion] = useState('');
  const [editedAnswer, setEditedAnswer] = useState('');

  const handleEdit = (id: string, question: string, answer: string) => {
    setEditingId(id);
    setEditedQuestion(question);
    setEditedAnswer(answer);
  };

  const handleSave = (id: string) => {
    onSave(id, editedQuestion, editedAnswer);
    setEditingId(null);
  };

  return (
    <DragDropContext onDragEnd={onReorder}>
      <Droppable droppableId="flashcards">
        {(provided) => (
          <table className="w-full" {...provided.droppableProps} ref={provided.innerRef}>
            <thead>
              <tr>
                <th className="px-4 py-2 text-left">Question</th>
                <th className="px-4 py-2 text-left">Answer</th>
                {!readOnly && <th className="px-4 py-2 text-left">Actions</th>}
              </tr>
            </thead>
            <tbody>
              {flashcards.map((flashcard, index) => (
                <Draggable key={flashcard.id} draggableId={flashcard.id} index={index}>
                  {(provided) => (
                    <tr
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      className="border-t"
                    >
                      <td className="px-4 py-2">
                        {editingId === flashcard.id ? (
                          <textarea
                            title="Question"
                            value={editedQuestion}
                            onChange={(e) => setEditedQuestion(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          flashcard.question
                        )}
                      </td>
                      <td className="px-4 py-2">
                        {editingId === flashcard.id ? (
                          <textarea
                            title="Answer"
                            value={editedAnswer}
                            onChange={(e) => setEditedAnswer(e.target.value)}
                            className="w-full p-1 border rounded"
                          />
                        ) : (
                          flashcard.answer
                        )}
                      </td>
                      {!readOnly && (
                        <td className="px-4 py-2">
                          {editingId === flashcard.id ? (
                            <button
                              onClick={() => handleSave(flashcard.id)}
                              className="text-green-500 hover:text-green-700 mr-2"
                            >
                              Save
                            </button>
                          ) : (
                            <button
                              onClick={() => handleEdit(flashcard.id, flashcard.question, flashcard.answer)}
                              className="text-blue-500 hover:text-blue-700 mr-2"
                            >
                              Edit
                            </button>
                          )}
                          <button
                            title="Delete"
                            onClick={() => onDelete(flashcard.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <FaTrash />
                          </button>
                        </td>
                      )}
                    </tr>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </tbody>
          </table>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default AnonFlashcardTable;