import React from 'react';
import dynamic from 'next/dynamic';

const ExcalidrawWrapper = dynamic(
  () => import('../components/ExcalidrawWrapper'),
  { ssr: false }
);

const DrawingBoardPage: React.FC = () => {
  return (
    <div className="h-screen w-full">
      <ExcalidrawWrapper />
    </div>
  );
};

export default DrawingBoardPage;