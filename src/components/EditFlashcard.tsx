import React, { useState, useEffect, useRef } from 'react';
import { FaTrashAlt, FaSave } from 'react-icons/fa';

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  onSave: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({
  id,
  question,
  answer,
  onSave,
  onDelete,
}) => {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [isEditing, setIsEditing] = useState(false);
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing) {
      questionRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(id, editedQuestion, editedAnswer);
    setIsEditing(false);
  };

  const adjustTextareaHeight = (textarea: HTMLTextAreaElement) => {
    textarea.style.height = 'auto';
    textarea.style.height = `${textarea.scrollHeight}px`;
  };

  return (
    <div className="border-2 border-black dark:border-gray-600 rounded-sm p-4 mb-4 relative">
      <div className="flex flex-col space-y-2">
        <div className="flex-grow">
          <textarea
            ref={questionRef}
            value={editedQuestion}
            onChange={(e) => {
              setEditedQuestion(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            onFocus={() => setIsEditing(true)}
            className="w-full p-2 border border-gray-300 dark:bg-gray-500 dark:border-gray-600 rounded resize-none overflow-hidden"
            rows={1}
            title="Question"
          />
        </div>
        <div className="flex-grow">
          <textarea
            ref={answerRef}
            value={editedAnswer}
            onChange={(e) => {
              setEditedAnswer(e.target.value);
              adjustTextareaHeight(e.target);
            }}
            onFocus={() => setIsEditing(true)}
            className="w-full p-2 border border-gray-300 dark:bg-gray-500 dark:border-gray-600 rounded resize-none overflow-hidden"
            rows={1}
            title="Answer"
          />
        </div>
      </div>
      <div className="flex justify-end mt-2 space-x-2">
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
      </div>
    </div>
  );
};

export default EditFlashcard;