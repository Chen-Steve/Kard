import { useState } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '../lib/supabaseClient';

interface FlashcardFormProps {
  onSave: (flashcard: { id?: number; question: string; answer: string; order: number }) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ onSave }) => {
  const { data: session } = useSession();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFlashcard = { question, answer, order: Date.now() }; // Assign a default order value

    if (session) {
      const { data, error } = await supabase
        .from('flashcards')
        .insert([{ ...newFlashcard, user_id: session.user.id }]);

      if (error) {
        setMessage('Failed to save flashcard: ' + error.message);
      } else {
        if (data && data[0]) {
          setMessage('Flashcard saved successfully!');
          onSave(data[0]);
        } else {
          setMessage('Failed to save flashcard: No data returned.');
        }
      }
    } else {
      setMessage('Flashcard created locally. It will not be saved permanently.');
      onSave(newFlashcard);
    }

    setQuestion('');
    setAnswer('');
  };

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          className="input input-bordered border-black border-2"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          type="text"
          className="input input-bordered border-black border-2"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">Save Flashcard</button>
        {message && <p className="mt-2 text-red-500">{message}</p>}
      </div>
    </form>
  );
};

export default FlashcardForm;