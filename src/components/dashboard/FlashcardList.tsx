import React, { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineSave } from "react-icons/md";
import { Draggable } from '@hello-pangea/dnd';
import { toast } from 'react-toastify';
import EditableDiv from '../flashcard/EditableDiv';

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
                <MdDeleteOutline size={20} />
              </button>
            )}
          </div>
          <div className="space-y-2">
            <div className="rounded-lg">
              <h3 className="font-semibold text-base mb-1">Question:</h3>
              {isEditing ? (
                <EditableDiv
                  htmlContent={editedQuestion}
                  onChange={setEditedQuestion}
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
                    onChange={setEditedAnswer}
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
                  className="bg-green-700 text-white p-1 rounded-full hover:bg-green-800 transition-colors"
                  title="Save"
                >
                  <MdOutlineSave size={16} />
                </button>
              ) : (
                <button
                  onClick={handleEdit}
                  className="bg-blue-500 text-white p-1 rounded-full hover:bg-blue-600 transition-colors"
                  title="Edit"
                >
                  <TbEdit size={16} />
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