import React, { useState } from 'react';
import { customCursorStyle } from 'ipad-cursor';

interface FlipCardProps {
  question: string;
  answer: string;
}

const FlipCard: React.FC<FlipCardProps> = ({ question, answer }) => {
  const [showAnswer, setShowAnswer] = useState(false);

  const handleClick = () => {
    setShowAnswer(!showAnswer);
  };

  return (
    <div
      className="w-full h-64 bg-white text-black p-6 rounded-lg shadow-md flex items-center justify-center cursor-pointer"
      onClick={handleClick}
      data-cursor="block"
      data-cursor-style={customCursorStyle({
        background: 'rgba(30, 64, 175, 0.2)',
        border: '2px solid black',
        radius: '8px'
      })}
    >
      <p className="text-center text-xl">
        {showAnswer ? answer : question}
      </p>
    </div>
  );
};

export default FlipCard;