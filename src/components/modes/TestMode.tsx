import React, { useState, useEffect } from 'react';
import { shuffle } from 'lodash';
import TrueFalseQuestion from './questions/TrueFalseQuestion';
import FillInTheBlankQuestion from './questions/FillInTheBlankQuestion';
import MultipleChoiceQuestion from './questions/MultipleChoiceQuestion';
import PerformanceSummary from './mode-components/PerformanceSummary';
import CustomButton from '../ui/CustomButton';
import { renderFormattedText } from '@/utils/textFormatting';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface TestModeProps {
  flashcards: Flashcard[];
}

type QuestionType = 'truefalse' | 'fillintheblank' | 'multiplechoice';

interface Question {
  type: QuestionType;
  question: string;
  options?: string[];
  correctAnswer: any;
  userAnswer?: any;
}

const TestMode: React.FC<TestModeProps> = ({ flashcards }) => {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [showSolutions, setShowSolutions] = useState(false);
  const [score, setScore] = useState(0);

  const initializeTest = () => {
    if (flashcards.length > 0) {
      const generatedQuestions = generateQuestions(flashcards);
      setQuestions(shuffle(generatedQuestions));
    }
    setIsTestComplete(false);
    setShowSolutions(false);
    setScore(0);
  };

  useEffect(() => {
    initializeTest();
  }, [flashcards]);

  const generateQuestions = (cards: Flashcard[]): Question[] => {
    const shuffledCards = shuffle([...cards]);
    const questions: Question[] = [];

    shuffledCards.forEach((card, index) => {
      const questionType = index % 3;
      switch (questionType) {
        case 0:
          questions.push(generateTrueFalseQuestion(card));
          break;
        case 1:
          questions.push(generateFillInTheBlankQuestion(card));
          break;
        case 2:
          questions.push(generateMultipleChoiceQuestion(card, shuffledCards));
          break;
      }
    });

    return shuffle(questions);
  };

  const generateTrueFalseQuestion = (card: Flashcard): Question => {
    const isTrue = Math.random() < 0.5;
    return {
      type: 'truefalse',
      question: card.question,
      correctAnswer: isTrue,
      userAnswer: undefined,
    };
  };

  const generateFillInTheBlankQuestion = (card: Flashcard): Question => {
    const words = card.answer.split(' ');
    const blankIndex = Math.floor(Math.random() * words.length);
    const answer = words[blankIndex];
    words[blankIndex] = '_____';
    return {
      type: 'fillintheblank',
      question: `${card.question}\n${words.join(' ')}`,
      correctAnswer: answer,
      userAnswer: undefined,
    };
  };

  const generateMultipleChoiceQuestion = (card: Flashcard, allCards: Flashcard[]): Question => {
    const correctAnswer = card.answer;
    const otherOptions = shuffle(allCards.filter((c) => c.id !== card.id))
      .slice(0, 3)
      .map((c) => c.answer);
    const options = shuffle([...otherOptions, correctAnswer]);
    return {
      type: 'multiplechoice',
      question: card.question,
      options,
      correctAnswer,
      userAnswer: undefined,
    };
  };

  const handleAnswer = (index: number, answer: any) => {
    setQuestions((prevQuestions) => {
      const updatedQuestions = [...prevQuestions];
      updatedQuestions[index] = { ...updatedQuestions[index], userAnswer: answer };
      return updatedQuestions;
    });
  };

  const handleSubmit = () => {
    const answeredQuestions = questions.filter((q) => q.userAnswer !== undefined);
    const correctAnswers = answeredQuestions.filter((q) => {
      if (q.type === 'fillintheblank') {
        return q.userAnswer.toLowerCase().trim() === q.correctAnswer.toLowerCase().trim();
      }
      return q.userAnswer === q.correctAnswer;
    });
    setScore(correctAnswers.length);
    setIsTestComplete(true);
    setShowSolutions(true);
  };

  const handleRetry = () => {
    initializeTest();
  };

  const renderQuestion = (question: Question, index: number) => {
    const commonProps = {
      question: question,
      onAnswer: (answer: any) => handleAnswer(index, answer),
      showSolution: showSolutions,
      isCorrect: question.type === 'fillintheblank'
        ? question.userAnswer?.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim()
        : question.userAnswer === question.correctAnswer,
    };

    switch (question.type) {
      case 'truefalse':
        return <TrueFalseQuestion {...commonProps} />;
      case 'fillintheblank':
        return <FillInTheBlankQuestion {...commonProps} />;
      case 'multiplechoice':
        return question.options ? (
          <MultipleChoiceQuestion {...commonProps} question={{...question, options: question.options}} />
        ) : null;
      default:
        return <div>Invalid question type.</div>;
    }
  };

  if (flashcards.length === 0) {
    return <div className="text-center text-gray-600 mt-8">No flashcards available for testing.</div>;
  }

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">Test Mode</h2>
        {questions.length > 0 ? (
          <>
            <div className="space-y-6 mb-8">
              {questions.map((question, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
                  <div className="bg-gray-800 text-white py-2 px-4">
                    <h3 className="font-semibold">Question {index + 1}</h3>
                  </div>
                  <div className="p-4">
                    {renderQuestion(question, index)}
                    {showSolutions && (
                      <div className={`mt-4 p-3 rounded-md ${
                        question.userAnswer === question.correctAnswer 
                          ? 'bg-green-50 border border-green-200' 
                          : 'bg-red-50 border border-red-200'
                      }`}>
                        <p className="font-semibold text-gray-800">Correct Answer:</p>
                        {question.type === 'truefalse' ? (
                          <p className="mt-1">{question.correctAnswer ? 'True' : 'False'}</p>
                        ) : (
                          <div className="mt-1" dangerouslySetInnerHTML={renderFormattedText(question.correctAnswer)} />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {!isTestComplete ? (
              <CustomButton 
                onClick={handleSubmit} 
                className="w-full bg-gray-800 hover:bg-gray-700 text-white font-bold py-3 rounded-lg transition duration-300"
              >
                Submit Test
              </CustomButton>
            ) : (
              <div className="space-y-6">
                <PerformanceSummary
                  totalCards={questions.length}
                  correctAnswers={score}
                />
                <CustomButton 
                  onClick={handleRetry} 
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 rounded-lg transition duration-300"
                >
                  Retry Test
                </CustomButton>
              </div>
            )}
          </>
        ) : (
          <p className="text-center text-gray-600">Loading questions...</p>
        )}
      </div>
    </div>
  );
};

export default TestMode;
