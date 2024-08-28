import React, { useState, useEffect, useRef } from 'react';
import Markdown from 'markdown-to-jsx';

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
  const questionRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setEditedQuestion(question);
    setEditedAnswer(answer);
  }, [question, answer]);

  const handleSave = () => {
    if (!readOnly) {
      onSave(id, editedQuestion, editedAnswer);
    }
  };

  const handleDelete = () => {
    if (!readOnly) {
      onDelete(id);
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    setter: React.Dispatch<React.SetStateAction<string>>,
    ref: React.RefObject<HTMLTextAreaElement>
  ) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = ref.current!.selectionStart;
      const end = ref.current!.selectionEnd;
      setter((prev) => prev.substring(0, start) + '  ' + prev.substring(end));
      setTimeout(() => {
        ref.current!.selectionStart = ref.current!.selectionEnd = start + 2;
      }, 0);
    }
  };

  return (
    <div className="border-2 border-black dark:border-gray-600 rounded-sm p-4 mb-4 relative">
      <div className="flex flex-col space-y-4">
        <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
          {readOnly ? (
            <div className="p-2">
              <Markdown>{editedQuestion}</Markdown>
            </div>
          ) : (
            <textarea
              ref={questionRef}
              value={editedQuestion}
              onChange={(e) => setEditedQuestion(e.target.value)}
              onKeyDown={(e) => handleKeyDown(e, setEditedQuestion, questionRef)}
              className="w-full p-2 border-none focus:outline-none bg-transparent"
              placeholder="Enter question here..."
              disabled={readOnly}
            />
          )}
        </div>
        {showDefinitions && (
          <div className="border border-gray-300 dark:border-gray-500 rounded p-2">
            {readOnly ? (
              <div className="p-2">
                <Markdown>{editedAnswer}</Markdown>
              </div>
            ) : (
              <textarea
                ref={answerRef}
                value={editedAnswer}
                onChange={(e) => setEditedAnswer(e.target.value)}
                onKeyDown={(e) => handleKeyDown(e, setEditedAnswer, answerRef)}
                className="w-full p-2 border-none focus:outline-none bg-transparent"
                placeholder="Enter answer here..."
                disabled={readOnly}
              />
            )}
          </div>
        )}
      </div>
      <div className="flex justify-end mt-2 space-x-2">
        {!readOnly && (
          <>
            <button
              onClick={handleDelete}
              className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
              title="Delete"
            >
              Delete
            </button>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
              title="Save"
            >
              Save
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default EditFlashcard;