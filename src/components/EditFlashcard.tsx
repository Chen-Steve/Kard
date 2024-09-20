import React, { useState, useEffect } from 'react';
import Markdown from 'markdown-to-jsx';
import { TbEdit } from "react-icons/tb";
import { MdDeleteOutline, MdOutlineSave } from "react-icons/md";

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  showDefinitions: boolean;
  onSave: (id: string, updatedQuestion: string, updatedAnswer: string) => void;
  onDelete: (id: string) => Promise<void>;
  readOnly?: boolean;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({
  id,
  question,
  answer,
  showDefinitions,
  onSave,
  onDelete,
  readOnly = false
}) => {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [isEditing, setIsEditing] = useState(false);

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

  const handleDelete = () => {
    if (!readOnly) {
      onDelete(id);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  return (
    <div className="border-2 border-black dark:border-gray-600 rounded-sm p-4 mb-4 relative">
      <div className="flex flex-col space-y-4">
        <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
          {isEditing ? (
            <textarea
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              className="w-full p-2 border-none focus:outline-none bg-transparent"
              placeholder="Enter question here..."
              disabled={readOnly}
            />
          ) : (
            <div className="p-2">
              <Markdown>{editedQuestion}</Markdown>
            </div>
          )}
        </div>
        {showDefinitions && (
          <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
            {isEditing ? (
              <textarea
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                className="w-full p-2 border-none focus:outline-none bg-transparent"
                placeholder="Enter answer here..."
                disabled={readOnly}
              />
            ) : (
              <div className="p-2">
                <Markdown>{editedAnswer}</Markdown>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2 space-x-2">
        {!readOnly && (
          <>
            {isEditing ? (
              <button
                onClick={handleSave}
                className="bg-green-500 text-white p-1 rounded text-sm hover:bg-green-600 transition-colors"
                title="Save"
              >
                <MdOutlineSave size={20} />
              </button>
            ) : (
              <button
                onClick={handleEdit}
                className="bg-blue-500 text-white p-1 rounded text-sm hover:bg-blue-600 transition-colors"
                title="Edit"
              >
                <TbEdit size={20} />
              </button>
            )}
            <button
              onClick={handleDelete}
              className="p-1 rounded border-2 border-red-500"
              title="Delete"
            >
              <MdDeleteOutline size={20} />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditFlashcard;