import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from './ui/Card';
import CustomButton from '../components/ui/CustomButton';
import { shuffle } from 'lodash';
import DOMPurify from 'dompurify';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface LearningModeProps {
  flashcards: Flashcard[];
}

const LearningMode: React.FC<LearningModeProps> = ({ flashcards }) => {
  const [currentCards, setCurrentCards] = useState<Flashcard[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [isSessionComplete, setIsSessionComplete] = useState(false);
  const [showNextPrompt, setShowNextPrompt] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [lastAnswerWasIncorrect, setLastAnswerWasIncorrect] = useState(false);
  const incorrectCards = useRef<Set<string>>(new Set());

  useEffect(() => {
    setCurrentCards(shuffle([...flashcards]));
  }, [flashcards]);

  const generateOptions = useCallback(() => {
    if (currentCards.length === 0) return;

    const currentCard = currentCards[0];
    const otherAnswers = flashcards
      .filter((card) => card.id !== currentCard.id)
      .map((card) => card.answer);
    const allOptions = shuffle([currentCard.answer, ...otherAnswers.slice(0, 3)]);
    setOptions(allOptions);
  }, [currentCards, flashcards]);

  useEffect(() => {
    generateOptions();
  }, [generateOptions]);

  const handleNextCard = useCallback(() => {
    setIsTransitioning(true);
    setCurrentCards((prevCards) => {
      const newCards = prevCards.slice(1);
      if (newCards.length === 0 && incorrectCards.current.size > 0) {
        return shuffle(flashcards.filter(card => incorrectCards.current.has(card.id)));
      }
      return newCards;
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowNextPrompt(false);

    if (currentCards.length === 1 && incorrectCards.current.size === 0) {
      setIsSessionComplete(true);
    }

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentCards.length, flashcards, incorrectCards]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && showNextPrompt && !isTransitioning) {
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [showNextPrompt, handleNextCard, isTransitioning]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null || isTransitioning) return;

    setSelectedAnswer(answer);
    const isAnswerCorrect = answer === currentCards[0].answer;
    setIsCorrect(isAnswerCorrect);
    setShowNextPrompt(true);

    if (isAnswerCorrect) {
      setCorrectAnswers(prev => Math.min(prev + 1, flashcards.length));
      incorrectCards.current.delete(currentCards[0].id);
      setLastAnswerWasIncorrect(false);
    } else {
      incorrectCards.current.add(currentCards[0].id);
      setLastAnswerWasIncorrect(true);
    }
  };

  const renderFormattedText = (text: string) => {
    const htmlText = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/__(.*?)__/g, '<u>$1</u>');
    
    const sanitizedHtml = DOMPurify.sanitize(htmlText);
    
    return { __html: sanitizedHtml };
  };

  if (currentCards.length === 0 && !isSessionComplete) {
    return <div>Loading...</div>;
  }

  if (isSessionComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Great job!</h2>
        <p className="mb-4">You&apos;ve completed all the flashcards in this deck.</p>
        <p className="mb-4">Final score: {correctAnswers}/{flashcards.length}</p>
      </div>
    );
  }

  const currentCard = currentCards[0];

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 
              className="text-xl font-bold text-center flex-grow"
              dangerouslySetInnerHTML={renderFormattedText(currentCard.question)}
            />
            <div className={`text-lg font-bold ${lastAnswerWasIncorrect ? 'text-orange-500' : 'text-blue-600'}`}>
              {correctAnswers}/{flashcards.length}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {options.map((option, index) => (
              <CustomButton
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`flex items-center justify-center ${
                  selectedAnswer === option
                    ? isCorrect
                      ? 'bg-green-500 text-white'
                      : 'bg-red-500 text-white'
                    : 'bg-white text-black border border-gray-300'
                }`}
                disabled={isTransitioning || selectedAnswer !== null}
              >
                <span 
                  className="text-center w-full break-words"
                  dangerouslySetInnerHTML={renderFormattedText(option)} 
                />
              </CustomButton>
            ))}
          </div>
        </CardContent>
      </Card>
      <div className="flex flex-col items-center">
        <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4 dark:bg-gray-700">
          <div 
            className="bg-blue-600 h-2.5 rounded-full dark:bg-blue-500" 
            style={{ width: `${(correctAnswers / flashcards.length) * 100}%` }}
          ></div>
        </div>
        {showNextPrompt && (
          <p className="text-center mb-4">
            Press space to move to the next question
          </p>
        )}
        {selectedAnswer && (
          <p className={`font-bold ${isCorrect ? 'text-green-500' : 'text-red-500'}`}>
            {isCorrect ? 'Correct!' : 'Incorrect. This card will appear again later.'}
          </p>
        )}
      </div>
    </div>
  );
};

export default LearningMode;