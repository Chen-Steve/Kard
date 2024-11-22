import React from 'react';
import { useRouter } from 'next/router';
import { Icon } from '@iconify/react';

interface ModesButtonsProps {
  userId: string;
  selectedDeckId: string | null;
  selectedDeckName: string | null;
}

const ModesButtons: React.FC<ModesButtonsProps> = ({ userId, selectedDeckId, selectedDeckName }) => {
  const router = useRouter();

  const handleLearnClick = () => {
    if (selectedDeckId) {
      router.push(`/learning-mode/${userId}/${selectedDeckId}`);
    }
  };

  const handleTestClick = () => {
    if (selectedDeckId) {
      router.push(`/test-mode/${userId}/${selectedDeckId}`);
    }
  };

  const handleMatchClick = () => {
    if (selectedDeckId) {
      router.push(`/matching-game/${userId}/${selectedDeckId}`);
    }
  };

  const handleKChatClick = () => {
    if (selectedDeckId) {
      router.push(`/ai-chat/${userId}/${selectedDeckId}`);
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <ModeButton 
        icon={<Icon icon="pepicons-print:comet" className="text-red-500" style={{ fontSize: '1.8rem' }} />} 
        text="Learn" 
        onClick={handleLearnClick} 
      />
      <ModeButton 
        icon={<Icon icon="pepicons-print:list" className="text-emerald-500" style={{ fontSize: '1.8rem' }} />} 
        text="Test" 
        onClick={handleTestClick} 
      />
      <ModeButton 
        icon={<Icon icon="pepicons-print:duplicate" className="text-purple-500" style={{ fontSize: '1.8rem' }} />} 
        text="Match" 
        onClick={handleMatchClick} 
      />
      <ModeButton 
        icon={<Icon icon="pepicons-print:text-bubbles" className="text-sky-500" style={{ fontSize: '1.8rem' }} />} 
        text="K-Chat" 
        onClick={handleKChatClick} 
      />
    </div>
  );
};

interface ModeButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, text, onClick }) => (
  <div className="relative">
    <button
      className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
      onClick={onClick}
    >
      {icon}
      <span className="font-semibold">{text}</span>
    </button>
  </div>
);

export default ModesButtons;
