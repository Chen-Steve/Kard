import React, { useState } from 'react';
import { FaTrashAlt, FaSave, FaEdit } from 'react-icons/fa';

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  showDefinitions: boolean;
  onSave: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({
  id,
  question,
  answer,
  showDefinitions,
  onSave,
  onDelete,
}) => {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [isEditMode, setIsEditMode] = useState(false);

  const handleSave = () => {
    onSave(id, editedQuestion, editedAnswer);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  return (
    <div className="border-2 border-black dark:border-gray-600 rounded-sm p-4 mb-4 relative">
      <div className="flex flex-col space-y-4">
        <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
          {isEditMode ? (
            <textarea
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              className="w-full p-2 border-none focus:outline-none bg-transparent"
              placeholder="Enter question here..."
            />
          ) : (
            <div className="p-2">{editedQuestion}</div>
          )}
        </div>
        {showDefinitions && (
          <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
            {isEditMode ? (
              <textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                className="w-full p-2 border-none focus:outline-none bg-transparent"
                placeholder="Enter answer here..."
              />
            ) : (
              <div className="p-2">{editedAnswer}</div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2 space-x-2">
        {isEditMode ? (
          <>
            <button
              onClick={() => onDelete(id)}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
              title="Delete"
            >
              <FaTrashAlt />
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
              title="Save"
            >
              <FaSave size={16} />
            </button>
          </>
        ) : (
          <button
            onClick={handleEdit}
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
            title="Edit"
          >
            <FaEdit size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default EditFlashcard;