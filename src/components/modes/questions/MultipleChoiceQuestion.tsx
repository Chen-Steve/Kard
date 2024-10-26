import React from 'react';
import CustomButton from '../../ui/CustomButton';
import { renderFormattedText } from '@/utils/textFormatting';

interface MultipleChoiceQuestionProps {
  question: {
    question: string;
    options: string[];
    userAnswer?: string;
    correctAnswer: string;
  };
  onAnswer: (answer: string) => void;
  showSolution: boolean;
  isCorrect: boolean;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ question, onAnswer, showSolution, isCorrect }) => {
  return (
    <div>
      <h3 
        className="text-xl mb-4"
        dangerouslySetInnerHTML={renderFormattedText(question.question)}
      />
      <div className="flex flex-col space-y-2">
        {question.options.map((option, index) => (
          <CustomButton 
            key={index} 
            onClick={() => onAnswer(option)}
            className={`
              text-left 
              ${question.userAnswer === option ? 'bg-[#D0E8D9]' : 'bg-white text-black border border-gray-300'}
              ${showSolution && question.correctAnswer === option ? 'border-green-500 border-2' : ''}
            `}
            disabled={showSolution}
          >
            <span dangerouslySetInnerHTML={renderFormattedText(option)} />
          </CustomButton>
        ))}
      </div>
      {showSolution && (
        <div className={`mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
          <span className="font-semibold">Correct answer: </span>
          <span dangerouslySetInnerHTML={renderFormattedText(question.correctAnswer)} />
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceQuestion;
