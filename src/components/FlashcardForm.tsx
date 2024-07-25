import { useState } from 'react';

interface FlashcardFormProps {
  onSave: (question: string, answer: string) => void;
}

const FlashcardForm: React.FC<FlashcardFormProps> = ({ onSave }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(question, answer);
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
