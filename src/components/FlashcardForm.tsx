import { useState } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '../lib/supabaseClient';

interface FlashcardType {
  id: number;
  question: string;
  answer: string;
  order: number;
  userId?: number; // Made userId optional since it might not be available initially
}

interface FlashcardFormProps {
  onSave: (flashcard: FlashcardType) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ onSave }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFlashcard = { question, answer, order: Date.now() }; // Simplified order logic

    if (session && session.user) {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .insert([{ ...newFlashcard, userId: session.user.id }]);

        if (error) {
          console.error('Error saving flashcard to database:', error);
        } else if (data) { // Add null check for data
          onSave(data[0]);
        }
      } catch (error) {
        console.error('Failed to save flashcard:', error);
      }
    } else {
      const localFlashcard = { ...newFlashcard, id: Date.now() };
      onSave(localFlashcard);
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
      </div>
    </form>
  );
};

export default FlashcardForm;