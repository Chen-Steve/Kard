import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { toast } from '../ui/use-toast';

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

  return (
    <Card className="w-full max-w-2xl border-2 shadow-lg max-h-[80vh] overflow-y-auto animate-slide-in-right">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Review Generated Flashcards</CardTitle>
        <p className="text-sm text-muted-foreground">
          Edit or remove flashcards before saving to your deck
        </p>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {editedFlashcards.map((card, index) => (
          <Card key={index} className="p-4 border">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Question:</label>
                <Textarea
                  value={card.question}
                  onChange={(e) => handleEdit(index, 'question', e.target.value)}
                  className="mt-1"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Answer:</label>
                <Textarea
                  value={card.answer}
                  onChange={(e) => handleEdit(index, 'answer', e.target.value)}
                  className="mt-1"
                  rows={3}
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
        ))}
      </CardContent>

      <CardFooter className="flex justify-end gap-3 pt-6">
        <Button 
          variant="outline" 
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button 
          onClick={() => onSave(editedFlashcards)}
          disabled={editedFlashcards.length === 0}
        >
          Save Flashcards
        </Button>
      </CardFooter>
    </Card>
  );
};

export default FlashcardQualityControl; 