import React from 'react';
import { Handle, Position } from 'reactflow';

const DeckNode = ({ data }: { data: { label: string } }) => {
  return (
    <div className="px-6 py-3 shadow-lg rounded-lg bg-[#637FBF] text-white border-2 border-white dark:border-gray-700 min-w-[150px] text-center">
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="!bg-[#637FBF] !w-3 !h-3" 
      />
      <div className="font-bold text-lg">{data.label}</div>
    </div>
  );
};

export default DeckNode; 