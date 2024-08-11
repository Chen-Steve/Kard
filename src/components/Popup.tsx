import React, { useState } from 'react';
import { Button } from '../components/ui/Button';
import { Textarea } from '../components/ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../components/ui/Card';
import { generateFlashcards } from '../lib/openai';
import { AiOutlineExperiment } from 'react-icons/ai';

interface PopupProps {
  onClose: () => void;
  onFlashcardsGenerated: (flashcards: { question: string, answer: string }[]) => void;
}

const Popup: React.FC<PopupProps> = ({ onClose, onFlashcardsGenerated }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const flashcards = await generateFlashcards(description);
      console.log('Generated Flashcards:', flashcards);

      // Filter out invalid flashcards
      const validFlashcards = flashcards.filter(flashcard => flashcard.question && flashcard.answer);
      console.log('Valid Flashcards:', validFlashcards); // Log valid flashcards
      onFlashcardsGenerated(validFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);
    } finally {
      setLoading(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black opacity-50" onClick={onClose}></div>
      <div className="relative z-20 w-full max-w-2xl mx-auto">
        <Card>
          <CardHeader>
            <div className="flex items-center">
              <CardTitle>Generate Flashcards</CardTitle>
              <span className="ml-2 px-2 py-1 text-xs font-semibold text-black bg-blue-200 rounded flex items-center">
                <AiOutlineExperiment className="mr-1" /> Experimental
              </span>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Description
              </label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1 block w-full"
                placeholder="Enter description"
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button variant="outline" onClick={onClose} className="mr-2">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Generating...' : 'Submit'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Popup;