import { useState } from 'react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface FlashcardEditFormProps {
  flashcard: Flashcard;
  onSave: (id: number, question: string, answer: string) => void;
  onCancel: () => void;
}

const FlashcardEditForm: React.FC<FlashcardEditFormProps> = ({ flashcard, onSave, onCancel }) => {
  const [question, setQuestion] = useState(flashcard.question);
  const [answer, setAnswer] = useState(flashcard.answer);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(flashcard.id, question, answer);
    onCancel();
  };

  return (
    <form className="mt-4" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-2">
        <input
          type="text"
          className="input input-bordered"
          placeholder="Question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
        />
        <input
          type="text"
          className="input input-bordered"
          placeholder="Answer"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
        />
        <div className="flex gap-2">
          <button type="submit" className="btn btn-primary">Update Flashcard</button>
          <button type="button" className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </form>
  );
};

export default FlashcardEditForm;
