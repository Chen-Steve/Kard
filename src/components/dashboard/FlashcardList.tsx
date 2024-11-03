import React, { useState, useEffect, useCallback } from 'react';
import { Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
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
  const [isEditing, setIsEditing] = useState<boolean>(false);

  useEffect(() => {
    setEditedQuestion(question);
    setEditedAnswer(answer);
  }, [question, answer]);

  const handleQuestionChange = useCallback((content: string) => {
    setEditedQuestion(content);
  }, []);

  const handleAnswerChange = useCallback((content: string) => {
    setEditedAnswer(content);
  }, []);

  const handleSave = () => {
    if (!readOnly) {
      onSave(id, editedQuestion, editedAnswer);
      setIsEditing(false);
    }
  };

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
      } catch (error) {
        console.error('Error deleting flashcard:', error);
        toast.error('Failed to delete flashcard. Please try again.');
      }
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-3 mb-3 text-sm"
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
          <div className="space-y-2">
            <div className="rounded-lg">
              <h3 className="font-semibold text-base mb-1">Question:</h3>
              {isEditing ? (
                <EditableDiv
                  htmlContent={editedQuestion}
                  onChange={handleQuestionChange}
                  disabled={readOnly}
                  placeholder="Enter question here..."
                />
              ) : (
                <div className="prose dark:prose-invert max-w-none text-sm">
                  <div dangerouslySetInnerHTML={{ __html: editedQuestion }} />
                </div>
              )}
            </div>
            {showDefinitions && (
              <div className="rounded-lg">
                <h3 className="font-semibold text-base mb-1">Answer:</h3>
                {isEditing ? (
                  <EditableDiv
                    htmlContent={editedAnswer}
                    onChange={handleAnswerChange}
                    disabled={readOnly}
                    placeholder="Enter answer here..."
                  />
                ) : (
                  <div className="prose dark:prose-invert max-w-none text-sm">
                    <div dangerouslySetInnerHTML={{ __html: editedAnswer }} />
                  </div>
                )}
              </div>
            )}
          </div>
          {!readOnly && (
            <div className="flex justify-end mt-2 space-x-1">
              {isEditing ? (
                <button
                  onClick={handleSave}
                  className="text-emerald-500 hover:text-emerald-600 transition-colors"
                  title="Save"
                >
                  <Icon icon="pepicons-print:floppy-disk" width={22} />
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="text-blue-500 hover:text-blue-600 transition-colors"
                  title="Edit"
                >
                  <Icon icon="pepicons-print:pen" width={22} />
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

export default EditFlashcard;
