import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

interface FlashcardNodeData {
  question: string;
  answer: string;
  lastReviewed?: Date;
  confidence?: number;
}

const getConfidenceColor = (confidence?: number) => {
  if (!confidence) return 'bg-gray-100 dark:bg-gray-800';
  const colors = {
    1: 'bg-red-100 dark:bg-red-900',
    2: 'bg-orange-100 dark:bg-orange-900',
    3: 'bg-yellow-100 dark:bg-yellow-900',
    4: 'bg-green-100 dark:bg-green-900',
    5: 'bg-emerald-100 dark:bg-emerald-900'
  };
  return colors[confidence as keyof typeof colors];
};

interface FlashcardNodeProps {
  data: FlashcardNodeData;
  isHighlighted?: boolean;
}

const FlashcardNode: React.FC<FlashcardNodeProps> = ({ data, isHighlighted }) => {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <div 
      className={`
        px-4 py-3 shadow-lg rounded-lg 
        ${getConfidenceColor(data.confidence)} 
        ${isHighlighted ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
        cursor-pointer border-2 border-[#637FBF] 
        min-w-[200px] max-w-[300px] 
        transition-all duration-300 hover:scale-105
      `}
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
      {data.confidence && (
        <div className="mt-2 text-xs opacity-70">
          Confidence: {data.confidence}/5
        </div>
      )}
    </div>
  );
};

export default FlashcardNode; 