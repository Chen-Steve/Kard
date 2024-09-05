import React from 'react';
import { Excalidraw, MainMenu } from "@excalidraw/excalidraw";
import { FaCircleNotch } from "react-icons/fa";
import { useRouter } from 'next/router';

const ExcalidrawWrapper: React.FC = () => {
  const router = useRouter();

  const handleHomeClick = () => {
    router.push('/dashboard');
  };

  return (
    <div className="w-full h-full">
      <Excalidraw
        UIOptions={{
          canvasActions: {
            export: false,
            loadScene: true,
            saveToActiveFile: false,
          },
        }}
      >
        <MainMenu>
          <MainMenu.DefaultItems.LoadScene />
          <MainMenu.Item onSelect={handleHomeClick} icon={<FaCircleNotch size={5} />}>
            Dashboard
          </MainMenu.Item>
        </MainMenu>
      </Excalidraw>
    </div>
  );
};

export default ExcalidrawWrapper;