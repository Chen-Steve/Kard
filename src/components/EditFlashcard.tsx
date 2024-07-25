import '../app/globals.css';
import { useState, useEffect, useCallback } from 'react';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface EditFlashcardProps {
  deckId: number;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({ deckId }) => {
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [editingFlashcardId, setEditingFlashcardId] = useState<number | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');

  const loadFlashcards = useCallback(async () => {
    try {
      const response = await fetch(`/decks/${deckId}/flashcards`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      setFlashcards(data);
      console.log('Loaded flashcards:', data);
    } catch (error) {
      console.error('Failed to load flashcards:', error);
    }
  }, [deckId]);

  useEffect(() => {
    loadFlashcards();
  }, [loadFlashcards]);

  const handleDeleteClick = async (id: number) => {
    await fetch(`/flashcards/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    loadFlashcards();
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (question && answer) {
      await fetch('/flashcards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, answer, deckId })
      });
      setQuestion('');
      setAnswer('');
      loadFlashcards();
    }
  };

  const handleFlashcardChange = (id: number, field: 'question' | 'answer', value: string) => {
    setFlashcards((prevFlashcards) =>
      prevFlashcards.map((flashcard) =>
        flashcard.id === id ? { ...flashcard, [field]: value } : flashcard
      )
    );
  };

  const handleFlashcardSave = async (flashcard: Flashcard) => {
    await fetch(`/flashcards/${flashcard.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: flashcard.question, answer: flashcard.answer })
    });
    loadFlashcards();
  };

  const autoResizeTextarea = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    e.target.style.height = 'auto';
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      <div className="w-full max-w-4xl flex justify-start mb-4">
      </div>
      <h1 className="text-4xl font-bold text-black mb-10">Edit Flashcards</h1>
      <form onSubmit={handleFormSubmit} className="w-full max-w-4xl mb-8">
        <div className="flex flex-col gap-2">
          <textarea
            className="input input-bordered border-2 border-black p-2 text-black w-full"
            placeholder="Question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            rows={1}
            style={{ resize: 'none' }}
          />
          <textarea
            className="input input-bordered border-2 border-black p-2 text-black w-full"
            placeholder="Answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            rows={1}
            style={{ resize: 'none' }}
          />
          <button type="submit" className="btn btn-primary mt-2">Save Flashcard</button>
        </div>
      </form>
      <div className="w-full max-w-4xl">
        {flashcards.length > 0 ? (
          <div className="flex flex-col gap-4">
            {flashcards.map((flashcard, index) => (
              <div key={flashcard.id} className="bg-white text-black p-4 rounded-lg shadow-md flex flex-col md:flex-row justify-between items-center">
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <span className="text-2xl font-bold">{index + 1}</span>
                  <div className="flex flex-col mr-10">
                    <textarea
                      className="input input-bordered border-2 border-black p-2 text-black w-full"
                      placeholder="Question"
                      value={flashcard.question}
                      onChange={(e) => {
                        handleFlashcardChange(flashcard.id, 'question', e.target.value);
                        autoResizeTextarea(e);
                      }}
                      rows={1}
                      style={{ resize: 'none', overflow: 'hidden' }}
                    />
                    <span className="text-sm text-gray-400 mt-0">TERM</span>
                  </div>
                  <div className="flex flex-col ml-10 mb-4 md:mb-0">
                    <textarea
                      className="input input-bordered border-2 border-black p-2 text-black w-full"
                      placeholder="Answer"
                      value={flashcard.answer}
                      onChange={(e) => {
                        handleFlashcardChange(flashcard.id, 'answer', e.target.value);
                        autoResizeTextarea(e);
                      }}
                      rows={1}
                      style={{ resize: 'none', overflow: 'hidden' }}
                    />
                    <span className="text-sm text-gray-400 mt-0">DEFINITION</span>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-4 md:mt-0">
                  <button onClick={() => handleFlashcardSave(flashcard)} className="btn btn-primary">Save</button>
                  <button onClick={() => handleDeleteClick(flashcard.id)} className="btn btn-danger">🗑️</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-black">Loading flashcards...</p>
        )}
      </div>
    </div>
  );
};

export default EditFlashcard;