import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

const FlashcardNode = ({ data }: { data: { question: string; answer: string } }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className="px-4 py-3 shadow-lg rounded-lg bg-white dark:bg-gray-700 cursor-pointer border-2 border-[#637FBF] min-w-[200px] max-w-[300px] transition-all duration-300 hover:scale-105"
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="!bg-[#637FBF] !w-3 !h-3" 
      />
      <div className="text-sm text-black dark:text-white">
        {isFlipped ? data.answer : data.question}
      </div>
    </div>
  );
};

export default FlashcardNode; 