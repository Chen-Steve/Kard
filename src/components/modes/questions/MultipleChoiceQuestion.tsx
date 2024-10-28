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
    <div className="p-1">
      <h3 
        className="text-sm mb-1"
        dangerouslySetInnerHTML={renderFormattedText(question.question)}
      />
      <div className="flex flex-col space-y-0.5">
        {question.options.map((option, index) => (
          <CustomButton 
            key={index} 
            onClick={() => onAnswer(option)}
            className={`
              text-center text-sm w-1/3 mx-auto
              py-0.25 px-1
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
        <div className={`mt-2 ${isCorrect ? 'text-green-600' : 'text-red-600'} text-xs`}>
          <span className="font-semibold">Correct answer: </span>
          <span dangerouslySetInnerHTML={renderFormattedText(question.correctAnswer)} />
        </div>
      )}
    </div>
  );
};

export default MultipleChoiceQuestion;
