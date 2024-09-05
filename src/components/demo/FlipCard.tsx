import React, { useState } from 'react';
import Markdown from 'markdown-to-jsx';

interface FlipCardProps {
  question: string;
  answer: string;
  isDarkMode: boolean;
}

const FlipCard: React.FC<FlipCardProps> = ({ question, answer, isDarkMode }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  const handleFlipClick = () => {
    setIsFlipped(!isFlipped);
  };

  return (
    <div
      className={`border-2 ${isDarkMode ? 'border-gray-600 bg-white' : 'border-black bg-card'} w-full h-64 shadow-lg rounded-lg flex items-center justify-center mb-4 cursor-pointer text-center p-4`}
      onClick={handleFlipClick}
    >
      <div className="w-5/6 max-w-lg overflow-auto text-black dark:text-black">
        <Markdown>{isFlipped ? answer : question}</Markdown>
      </div>
    </div>
  );
};

export default FlipCard;