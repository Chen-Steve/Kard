import React, { useState, useEffect, useCallback } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';
import EditableDiv from '../flashcard/EditableDiv';
import { Icon } from "@iconify/react";

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  showDefinitions: boolean;
  onSave: (id: string, updatedQuestion: string, updatedAnswer: string) => void;
  onDelete: (id: string) => void;
  readOnly?: boolean;
  index: number;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({
  id,
  question,
  answer,
  showDefinitions,
  onSave,
  onDelete,
  readOnly = false,
  index
}) => {
  const [editedQuestion, setEditedQuestion] = useState<string>(question);
  const [editedAnswer, setEditedAnswer] = useState<string>(answer);

  useEffect(() => {
    setEditedQuestion(question);
    setEditedAnswer(answer);
  }, [question, answer]);

  const handleQuestionChange = useCallback((content: string) => {
    setEditedQuestion(content);
    if (!readOnly) {
      onSave(id, content, editedAnswer);
    }
  }, [id, editedAnswer, onSave, readOnly]);

  const handleAnswerChange = useCallback((content: string) => {
    setEditedAnswer(content);
    if (!readOnly) {
      onSave(id, editedQuestion, content);
    }
  }, [id, editedQuestion, onSave, readOnly]);

  const handleDelete = async () => {
    if (!readOnly) {
      try {
        const response = await fetch('/api/flashcard', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id }),
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(`Failed to delete flashcard: ${errorData.error}, ${errorData.details}`);
        }
        onDelete(id);
        toast.success('Flashcard deleted successfully');
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        toast.error('Failed to delete flashcard. Please try again.');
      }
    }
  };

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-3 mb-3 text-sm"
        >
          <div className="flex justify-between items-center mb-1">
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
              Card {index + 1}
            </span>
            {!readOnly && (
              <button
                onClick={handleDelete}
                className="text-red-500 hover:text-red-700 text-xs"
                aria-label="Delete card"
              >
                <Icon icon="pepicons-print:trash" width={26} />
              </button>
            )}
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-base mb-1">Question:</h3>
              <EditableDiv
                htmlContent={editedQuestion}
                onChange={handleQuestionChange}
                disabled={readOnly}
                placeholder="Enter question here..."
              />
            </div>
            {showDefinitions && (
              <div>
                <h3 className="font-semibold text-base mb-1">Answer:</h3>
                <EditableDiv
                  htmlContent={editedAnswer}
                  onChange={handleAnswerChange}
                  disabled={readOnly}
                  placeholder="Enter answer here..."
                />
              </div>
            )}
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default EditFlashcard;
