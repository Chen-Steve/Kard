import React, { useState } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { generateFlashcards } from '../../lib/openai';
import { AiOutlineExperiment, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from '../ui/use-toast';
import { isAxiosError } from '../../lib/axiosErrorGuard';
import { extractTextFromPDF } from '../../lib/pdfUtils';
import { FiUpload } from 'react-icons/fi';

interface PopupProps {
  onClose: () => void;
  onFlashcardsGenerated: (flashcards: { question: string, answer: string }[]) => void;
  userId: string; 
}

const Popup: React.FC<PopupProps> = ({ onClose, onFlashcardsGenerated, userId }) => {
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [pdfText, setPdfText] = useState<string>('');
  const [isProcessingPDF, setIsProcessingPDF] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const flashcards = await generateFlashcards(description, userId);
      console.log('Generated Flashcards:', flashcards);

      const validFlashcards = flashcards.filter(flashcard => flashcard.question && flashcard.answer);
      console.log('Valid Flashcards:', validFlashcards);
      onFlashcardsGenerated(validFlashcards);
    } catch (error) {
      console.error('Error generating flashcards:', error);

      if (isAxiosError(error)) {
        if (error.response && error.response.status === 429) {
          toast({
            title: 'Limit Reached',
            description: 'Daily generation limit reached. Please try again tomorrow.',
            variant: 'destructive',
          });
        } else if (error.response && error.response.status === 400) {
          const errorMessage = (error.response.data as { error: string }).error;
          toast({
            title: 'Invalid Input',
            description: errorMessage,
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Failed to generate flashcards. Please try again.',
            variant: 'destructive',
          });
        }
      } else if (error instanceof Error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Unknown Error',
          description: 'An unknown error occurred. Please try again.',
          variant: 'destructive',
        });
      }
    } finally {
      setLoading(false);
      onClose();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setIsProcessingPDF(true);
    try {
      const text = await extractTextFromPDF(file);
      setPdfText(text);
      setDescription(text);
      toast({
        title: 'PDF Processed',
        description: 'Your PDF has been processed successfully.',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process PDF file.',
        variant: 'destructive',
      });
    } finally {
      setIsProcessingPDF(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50">
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-md transition-all"
        onClick={onClose}
      />
      
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <Card className="relative z-50 w-full max-w-2xl border-2 shadow-lg">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CardTitle className="text-2xl font-bold">Generate Flashcards</CardTitle>
                <span className="px-3 py-1 text-xs font-semibold text-blue-700 bg-blue-100 dark:bg-blue-900 dark:text-blue-100 rounded-full flex items-center">
                  <AiOutlineExperiment className="mr-1.5" /> Experimental
                </span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Enter your text, notes, or topic, and we&apos;ll generate relevant flashcards for you.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label htmlFor="description" className="block text-sm font-medium">
                    What would you like to create flashcards about?
                  </label>
                  <p className="text-sm text-muted-foreground mt-1">
                    Enter text directly or upload a PDF file
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <label htmlFor="pdf-upload" className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800">
                      <FiUpload className="h-4 w-4" />
                      <span className="text-sm">Upload PDF</span>
                    </div>
                    <input
                      id="pdf-upload"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isProcessingPDF}
                    />
                  </label>
                </div>
              </div>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] resize-none focus:ring-2 focus:ring-blue-500"
                placeholder="Example: The water cycle process, including evaporation, condensation, and precipitation..."
                disabled={isProcessingPDF}
              />
            </div>
          </CardContent>
          <CardFooter className="flex justify-end gap-3 pt-6">
            <Button 
              variant="outline" 
              onClick={onClose}
              className="hover:bg-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit} 
              disabled={loading}
              className="bg-black hover:bg-gray-800 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <AiOutlineLoading3Quarters className="animate-spin h-4 w-4" />
                  Generating...
                </span>
              ) : (
                'Generate Flashcards'
              )}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Popup;