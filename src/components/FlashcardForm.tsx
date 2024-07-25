import { useState } from 'react';
import { useSession } from 'next-auth/react';
import supabase from '../lib/supabaseClient';

interface FlashcardFormProps {
  onSave: (flashcard: { id: number; question: string; answer: string; order: number }) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ onSave }) => {
  const { data: session } = useSession();
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const newFlashcard = { id: Date.now(), question, answer, order: Date.now() };

    if (session) {
      try {
        const { data, error } = await supabase
          .from('flashcards')
          .insert([{ ...newFlashcard, user_id: session.user.id }])
          .select(); // Add .select() to ensure data is typed

        if (error) {
          throw new Error(error.message);
        }

        if (data && data.length > 0) {
          console.log('Flashcard saved to DB:', data);
          onSave(data[0]);
        } else {
          console.error('No data returned from database');
        }
      } catch (error) {
        console.error('Failed to save flashcard to database:', error);
      }
    } else {
      console.log('Flashcard saved to local storage:', newFlashcard);
      onSave(newFlashcard);
      const storedFlashcards = JSON.parse(localStorage.getItem('flashcards') || '[]');
      storedFlashcards.push(newFlashcard);
      localStorage.setItem('flashcards', JSON.stringify(storedFlashcards));
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