import React, { useState, useCallback } from 'react';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/textarea';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '../ui/Card';
import { generateFlashcards } from '../../lib/openai';
import { AiOutlineExperiment, AiOutlineLoading3Quarters } from 'react-icons/ai';
import { toast } from '../ui/use-toast';
import { isAxiosError } from '../../lib/axiosErrorGuard';
import { extractTextFromPDF } from '../../lib/pdfUtils';
import { FiUpload } from 'react-icons/fi';
import FlashcardQualityControl from './FlashcardQualityControl';

interface ErrorResponse {
  message: string;
}

interface PopupProps {
  onClose: () => void;
  onFlashcardsGenerated: (flashcards: { question: string, answer: string }[]) => void;
  userId: string; 
}

const Popup: React.FC<PopupProps> = ({ onClose, onFlashcardsGenerated, userId }) => {
  const [state, setState] = useState({
    description: '',
    pdfText: '',
    isProcessingPDF: false,
    loading: false,
    showQualityControl: false,
  });
  const [generatedFlashcards, setGeneratedFlashcards] = useState<{ question: string, answer: string }[]>([]);

  const handleError = useCallback((error: unknown) => {
    if (isAxiosError(error)) {
      if (error.response?.status === 429) {
        toast({
          title: "Generation Limit Reached",
          description: "You've used up your daily generations. Please try again tomorrow.",
          variant: "destructive",
        });
        return;
      }
      const errorData = error.response?.data as ErrorResponse;
      toast({
        title: "Error",
        description: errorData.message || "Failed to generate flashcards. Please try again.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "An unexpected error occurred. Please try again.",
        variant: "destructive",
      });
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true }));
    try {
      const prompt = `Create a set of 5 flashcards about: ${state.description}
        Format your response as an array of JSON objects, each with 'question' and 'answer' fields.
        Make questions clear and concise.
        Make answers comprehensive but not too long.
        Example format: [{"question": "What is X?", "answer": "X is Y"}]`;

      console.log('Sending prompt:', prompt);
      const flashcards = await generateFlashcards(prompt, userId);
      console.log('Received flashcards:', flashcards);

      if (!Array.isArray(flashcards) || flashcards.length === 0) {
        throw new Error('Invalid response format from AI');
      }

      setGeneratedFlashcards(flashcards);
      setState(prev => ({
        ...prev,
        loading: false,
        showQualityControl: true,
      }));
    } catch (error) {
      console.error('Error in handleSubmit:', error);
      setState(prev => ({ ...prev, loading: false }));
      toast({
        title: "Generation Failed",
        description: error instanceof Error ? error.message : "An error occurred while generating flashcards. Please try again.",
        variant: "destructive",
      });
    }
  }, [state.description, userId]);

  const handleSaveReviewedFlashcards = (reviewedFlashcards: { question: string; answer: string }[]) => {
    onFlashcardsGenerated(reviewedFlashcards);
    onClose();
  };

  const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.includes('pdf')) {
      toast({
        title: 'Invalid File',
        description: 'Please upload a PDF file.',
        variant: 'destructive',
      });
      return;
    }

    setState(prev => ({ ...prev, isProcessingPDF: true }));
    try {
      const text = await extractTextFromPDF(file);
      setState(prev => ({
        ...prev,
        pdfText: text,
        description: text,
        isProcessingPDF: false,
      }));
      toast({
        title: 'PDF Processed',
        description: 'Your PDF has been processed successfully.',
      });
    } catch (error) {
      setState(prev => ({ ...prev, isProcessingPDF: false }));
      toast({
        title: 'Error',
        description: 'Failed to process PDF file.',
        variant: 'destructive',
      });
    }
  }, []);

  const handleBackdropClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onClose();
  }, [onClose]);

  return (
    <>
      <div className="fixed inset-0 z-50">
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-md transition-all"
          onClick={handleBackdropClick}
        />
        <div className={`fixed inset-y-0 flex items-center justify-center p-4 transition-all duration-300 ease-in-out
          ${state.showQualityControl 
            ? 'right-[55%] w-[40%]'
            : 'inset-x-0'
          }`}
        >
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
                        disabled={state.isProcessingPDF}
                      />
                    </label>
                  </div>
                </div>
                <Textarea
                  id="description"
                  value={state.description}
                  onChange={(e) => setState(prev => ({ ...prev, description: e.target.value }))}
                  className="min-h-[150px] resize-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Example: The water cycle process, including evaporation, condensation, and precipitation..."
                  disabled={state.isProcessingPDF}
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
                disabled={state.loading}
                className="bg-black hover:bg-gray-800 text-white"
              >
                {state.loading ? (
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

      {state.showQualityControl && (
        <div className="fixed right-[5%] inset-y-0 w-[45%] flex items-center justify-center p-4 z-[51]">
          <FlashcardQualityControl
            flashcards={generatedFlashcards}
            onSave={handleSaveReviewedFlashcards}
            onCancel={() => setState(prev => ({ ...prev, showQualityControl: false }))}
          />
        </div>
      )}
    </>
  );
};

export default Popup;