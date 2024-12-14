import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import CustomButton from '../../components/ui/CustomButton';
import { shuffle } from 'lodash';
import DOMPurify from 'dompurify';
import PerformanceSummary from './mode-components/PerformanceSummary';
import Link from 'next/link';
import { Icon } from '@iconify/react';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface LearningModeProps {
  flashcards: Flashcard[];
  initialMode?: 'normal' | 'timed';
}

const LearningMode: React.FC<LearningModeProps> = ({ flashcards, initialMode = 'normal' }) => {
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
  const [maxStreak, setMaxStreak] = useState(0);
  const [currentStreak, setCurrentStreak] = useState(0);
  const [retriedCards, setRetriedCards] = useState(new Set<string>());
  const [mode, setMode] = useState<'normal' | 'timed'>(initialMode);
  const [timeLeft, setTimeLeft] = useState(5);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isAnswerSelected, setIsAnswerSelected] = useState(false);
  const [timerExpired, setTimerExpired] = useState(false);  // Add a new state to track timer expiration

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
    if (currentCardIndex + 1 >= flashcards.length) {
      setIsSessionComplete(true);
      return;
    }

    setIsTransitioning(true);
    // Only increment the card index if the last answer was correct or if it's timed mode
    if (isCorrect || mode === 'timed') {
      setCurrentCardIndex(prev => prev + 1);
    }
    setCurrentCards((prevCards) => {
      if (!isCorrect && mode === 'normal') {
        // If the answer was incorrect in normal mode, add the current card to the end of the deck
        return [...prevCards.slice(1), prevCards[0]];
      } else {
        // Otherwise, just move to the next card
        return prevCards.slice(1);
      }
    });
    setSelectedAnswer(null);
    setIsCorrect(null);
    setShowNextPrompt(false);
    setIsAnswerSelected(false);
    setTimeLeft(5);

    setTimeout(() => {
      setIsTransitioning(false);
    }, 300);
  }, [currentCardIndex, flashcards.length, isCorrect, mode]);

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.code === 'Space' && mode === 'normal' && showNextPrompt) {
        event.preventDefault();
        handleNextCard();
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [mode, showNextPrompt, handleNextCard]);

  useEffect(() => {
    // console.log("Timer useEffect setup", { mode, isTransitioning, isSessionComplete, isAnswerSelected });
    if (mode === 'timed' && !isTransitioning && !isSessionComplete && !isAnswerSelected && !timerExpired) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prevTime) => {
          // console.log("Timer tick", { prevTime });
          if (prevTime <= 1) {
            // console.log("Timer about to expire, should clear and call handleNextCard");
            if (timerRef.current !== null) {
              clearInterval(timerRef.current as NodeJS.Timeout);  // Type assertion here
              timerRef.current = null;
              // console.log("Timer cleared");
            }
            setTimerExpired(true);
            return 5;
          }
          return prevTime - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current !== null) {
        clearInterval(timerRef.current as NodeJS.Timeout);  // Type assertion here
        timerRef.current = null;
      }
    };
  }, [mode, isTransitioning, handleNextCard, isSessionComplete, isAnswerSelected, timerExpired]);

  useEffect(() => {
    if (timerExpired) {
      handleNextCard();
      setTimerExpired(false);  // Reset the flag after handling the card transition
    }
  }, [timerExpired, handleNextCard]);

  const handleAnswerSelect = (answer: string) => {
    if (selectedAnswer !== null || isTransitioning) {
      // console.log("handleAnswerSelect early exit", { selectedAnswer, isTransitioning });
      return;
    }

    // console.log("Answer selected", { answer });
    setSelectedAnswer(answer);
    setIsAnswerSelected(true);
    const isAnswerCorrect = answer === currentCards[0].answer;
    setIsCorrect(isAnswerCorrect);

    if (isAnswerCorrect) {
      setCorrectAnswers(prev => Math.min(prev + 1, flashcards.length));
      incorrectCards.current.delete(currentCards[0].id);
      setLastAnswerWasIncorrect(false);
      setCurrentStreak(prev => prev + 1);
      setMaxStreak(prev => Math.max(prev, currentStreak + 1));
    } else {
      incorrectCards.current.add(currentCards[0].id);
      setLastAnswerWasIncorrect(true);
      setRetriedCards(prev => new Set(prev).add(currentCards[0].id));
      setCurrentStreak(0);
    }

    if (mode === 'normal') {
      setShowNextPrompt(true);
    } else {
      // In timed mode, move to next card after a brief delay
      setTimeout(() => {
        // console.log("Moving to next card after answer in timed mode");
        handleNextCard();
      }, 1000);
    }

    if (mode === 'timed') {
      setTimeLeft(5);
      if (timerRef.current) {
        // console.log("Clearing timer after answer selection");
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
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

  const resetSession = () => {
    setCurrentCards(shuffle([...flashcards]));
    setCorrectAnswers(0);
    setMaxStreak(0);
    setCurrentStreak(0);
    setRetriedCards(new Set<string>());
    setIsSessionComplete(false);
    setCurrentCardIndex(0);
    incorrectCards.current.clear();
  };

  const toggleMode = () => {
    setMode((prevMode) => (prevMode === 'normal' ? 'timed' : 'normal'));
    setTimeLeft(5);
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };

  if (currentCards.length === 0 && !isSessionComplete) {
    return <div>Loading...</div>;
  }

  if (isSessionComplete) {
    return (
      <div className="max-w-2xl mx-auto mt-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Great job!</h2>
        <p className="mb-4">You&apos;ve completed all the flashcards in this deck.</p>
        <Card className="mb-8">
          <CardContent className="p-6">
            <PerformanceSummary
              totalCards={flashcards.length}
              correctAnswers={correctAnswers}
              maxStreak={maxStreak}
              retriedCards={retriedCards.size}
            />
            <div className="mt-8">
              <CustomButton
                onClick={resetSession}
                className="w-full flex items-center justify-center"
              >
                <Icon icon="pepicons-print:play" className="mr-2" /> Learn Again
              </CustomButton>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const currentCard = currentCards[0];

  return (
    <div className="max-w-2xl mx-auto mt-20">
      <div className="flex items-center max-w-[672px] mx-auto">
        <div>
          <Link href="/dashboard" passHref>
            <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer flex items-center">
              <Icon icon="pepicons-print:arrow-left" className="mr-2 text-4xl" />
            </span>
          </Link>
        </div>
        <div className="ml-auto">
          <CustomButton onClick={toggleMode} className="flex items-center">
            {mode === 'normal' ? 
              <Icon icon="pepicons-print:clock" className="mr-2 text-4xl" /> : 
              <Icon icon="pepicons-print:play" className="mr-2" />}
            {mode === 'normal' ? 'Switch to Timed' : 'Switch to Normal'}
          </CustomButton>
        </div>
      </div>
      <Card className="mb-4">
        <CardContent className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 
              className="text-xl font-bold text-center flex-grow"
              dangerouslySetInnerHTML={renderFormattedText(currentCard.question)}
            />
            <div className={`text-lg font-bold ${lastAnswerWasIncorrect ? 'text-orange-500' : 'text-blue-600'}`}>
              {currentCardIndex + 1}/{flashcards.length}
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
        {mode === 'normal' && showNextPrompt && (
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
      {mode === 'timed' && (
        <div className="mt-4 text-center">
          <p className="text-lg font-bold">Time left: {timeLeft}s</p>
        </div>
      )}
    </div>
  );
};

export default LearningMode;