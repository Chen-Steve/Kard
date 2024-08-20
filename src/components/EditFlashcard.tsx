import React, { useState, useCallback, useRef } from 'react';
import { FaTrashAlt, FaSave, FaEdit } from 'react-icons/fa';
import Markdown from 'markdown-to-jsx';

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
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const handleSave = () => {
    onSave(id, editedQuestion, editedAnswer);
    setIsEditMode(false);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLTextAreaElement>, setText: React.Dispatch<React.SetStateAction<string>>, ref: React.RefObject<HTMLTextAreaElement>) => {
    if (e.ctrlKey) {
      let start = e.currentTarget.selectionStart;
      let end = e.currentTarget.selectionEnd;
      let value = e.currentTarget.value;
      let newValue = '';
      let newCursorPos = start;

      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          newValue = value.slice(0, start) + '**' + value.slice(start, end) + '**' + value.slice(end);
          newCursorPos = end + 4;
          break;
        case 'i':
          e.preventDefault();
          newValue = value.slice(0, start) + '*' + value.slice(start, end) + '*' + value.slice(end);
          newCursorPos = end + 2;
          break;
        case 'u':
          e.preventDefault();
          newValue = value.slice(0, start) + '__' + value.slice(start, end) + '__' + value.slice(end);
          newCursorPos = end + 4;
          break;
        default:
          return;
      }

      setText(newValue);
      setTimeout(() => {
        if (ref.current) {
          ref.current.setSelectionRange(newCursorPos, newCursorPos);
          ref.current.focus();
        }
      }, 0);
    }
  }, []);

  return (
    <div className="border-2 border-black dark:border-gray-600 rounded-sm p-4 mb-4 relative">
      <div className="flex flex-col space-y-4">
        <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
          {isEditMode ? (
            <textarea
              ref={questionRef}
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, setEditedQuestion, questionRef)}
              className="w-full p-2 border-none focus:outline-none bg-transparent"
              placeholder="Enter question here..."
            />
          ) : (
            <div className="p-2">
              <Markdown>{editedQuestion}</Markdown>
            </div>
          )}
        </div>
        {showDefinitions && (
          <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
            {isEditMode ? (
              <textarea
                ref={answerRef}
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, setEditedAnswer, answerRef)}
                className="w-full p-2 border-none focus:outline-none bg-transparent"
                placeholder="Enter answer here..."
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