import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { toast } from 'react-hot-toast';

interface FlashcardQualityControlProps {
  flashcards: { question: string; answer: string }[];
  onSave: (flashcards: { question: string; answer: string }[]) => void;
  onCancel: () => void;
}

const FlashcardQualityControl: React.FC<FlashcardQualityControlProps> = ({
  flashcards,
  onSave,
  onCancel,
}) => {
  const [editedFlashcards, setEditedFlashcards] = useState(flashcards);

  const handleEdit = (index: number, field: 'question' | 'answer', value: string) => {
    const newFlashcards = [...editedFlashcards];
    newFlashcards[index] = {
      ...newFlashcards[index],
      [field]: value,
    };
    setEditedFlashcards(newFlashcards);
  };

  const handleDelete = (index: number) => {
    setEditedFlashcards(cards => cards.filter((_, i) => i !== index));
  };

  // Validate flashcards before saving
  const handleSave = () => {
    const validFlashcards = editedFlashcards.filter(card => 
      card.question.trim() !== '' && 
      card.answer.trim() !== ''
    );

    if (validFlashcards.length === 0) {
      toast.error('Please ensure at least one flashcard has both question and answer.');
      return;
    }

    onSave(validFlashcards);
  };

  // Add flashcard
  const handleAdd = () => {
    setEditedFlashcards([
      ...editedFlashcards,
      { question: '', answer: '' }
    ]);
  };

  return (
    <Card className="w-full max-w-2xl border-2 shadow-lg max-h-[80vh] overflow-y-auto animate-slide-in-right">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Review Generated Flashcards</CardTitle>
        <p className="text-sm text-muted-foreground">
          Edit or remove flashcards before saving to your deck
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {editedFlashcards.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No flashcards available. Try generating new ones or add manually.
          </div>
        ) : (
          editedFlashcards.map((card, index) => (
            <Card key={index} className="p-4 border">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Question:</label>
                  <Textarea
                    value={card.question}
                    onChange={(e) => handleEdit(index, 'question', e.target.value)}
                    className="mt-1"
                    rows={2}
                    placeholder="Enter your question..."
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Answer:</label>
                  <Textarea
                    value={card.answer}
                    onChange={(e) => handleEdit(index, 'answer', e.target.value)}
                    className="mt-1"
                    rows={3}
                    placeholder="Enter your answer..."
                  />
                </div>
                <Button
                  variant="destructive"
                  onClick={() => handleDelete(index)}
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            </Card>
          ))
        )}
      </CardContent>

      <CardFooter className="flex justify-between gap-3 pt-6">
        <Button 
          variant="outline" 
          onClick={handleAdd}
        >
          Add Flashcard
        </Button>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleSave}
            disabled={editedFlashcards.length === 0}
          >
            Save Flashcards
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};

export default FlashcardQualityControl; 