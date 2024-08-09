import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill/dist/quill.snow.css';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  onSave: (id: string, updatedQuestion: string, updatedAnswer: string) => void;
  onDelete: (id: string) => void;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({ id, question, answer, onSave, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [questionContent, setQuestionContent] = useState(question);
  const [answerContent, setAnswerContent] = useState(answer);

  const handleSave = () => {
    onSave(id, questionContent, answerContent);
    setIsEditing(false);
  };

  useEffect(() => {
    setQuestionContent(question);
    setAnswerContent(answer);
  }, [question, answer]);

  return (
    <div className="mb-4 p-4 bg-white dark:bg-gray-600 rounded shadow flex justify-between items-center">
      {isEditing ? (
        <>
          <div className="flex w-full space-x-4">
            <div className="w-1/2">
              <ReactQuill
                value={questionContent}
                onChange={setQuestionContent}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                  ],
                }}
                formats={[
                  'bold', 'italic', 'underline',
                ]}
              />
            </div>
            <div className="w-1/2">
              <ReactQuill
                value={answerContent}
                onChange={setAnswerContent}
                modules={{
                  toolbar: [
                    ['bold', 'italic', 'underline'],
                  ],
                }}
                formats={[
                  'bold', 'italic', 'underline',
                ]}
              />
            </div>
          </div>
          <button onClick={handleSave} className="ml-4 px-3 py-2 bg-green-700 text-white rounded">
            Save
          </button>
        </>
      ) : (
        <>
          <div className="flex w-full space-x-4">
            <div className="w-1/2 p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white">
              <p className="font-bold" dangerouslySetInnerHTML={{ __html: question ?? '' }} />
            </div>
            <div className="w-1/2 p-2 rounded bg-white dark:bg-gray-700 text-black dark:text-white">
              <p className="font-bold" dangerouslySetInnerHTML={{ __html: answer ?? '' }} />
            </div>
          </div>
          <button onClick={() => setIsEditing(true)} className="ml-4 px-3 py-2 bg-gray-300 dark:bg-gray-600 rounded">
            Edit
          </button>
          <button onClick={() => onDelete(id)} className="ml-4 px-1 py-2 bg-red-500 text-white rounded">
            Delete
          </button>
        </>
      )}
    </div>
  );
};

export default EditFlashcard;
