import React from 'react';
import { useRouter } from 'next/router';
import { SiStagetimer } from "react-icons/si";
import { RiTimerFill } from "react-icons/ri";
import { PiCardsFill } from "react-icons/pi";
import { BiSolidMessageSquareDots } from "react-icons/bi";
import { HiLightningBolt } from "react-icons/hi";
import { toast } from '../../components/ui/use-toast';

interface ModesButtonsProps {
  userId: string;
  selectedDeckId: string | null;
  selectedDeckName: string | null;
  userMembership: string;
}

const ModesButtons: React.FC<ModesButtonsProps> = ({ userId, selectedDeckId, selectedDeckName, userMembership }) => {
  const router = useRouter();

  const handleLearnClick = () => {
    if (userId && selectedDeckId) {
      router.push(`/learning-mode/${userId}/${selectedDeckId}`);
    } else if (!userId) {
      toast({
        title: 'User Not Found',
        description: 'Please sign in to access learning mode.',
      });
    } else {
      toast({
        title: 'No Deck Selected',
        description: 'Please select a deck to start learning.',
      });
    }
  };

  const handleTestClick = () => {
    toast({
      title: 'Coming Soon!',
      description: 'The Test feature is coming soon.',
    });
  };

  const handleMatchClick = () => {
    if (userId && selectedDeckId) {
      router.push(`/matching-game/${userId}/${selectedDeckId}`);
    } else if (!userId) {
      toast({
        title: 'User Not Found',
        description: 'Please sign in to access the matching game.',
      });
    } else {
      toast({
        title: 'No Deck Selected',
        description: 'Please select a deck to play the matching game.',
      });
    }
  };

  const handleKChatClick = () => {
    if (userMembership === 'pro') {
      if (selectedDeckId) {
        router.push(`/ai-chat/${userId}/${selectedDeckId}`);
      } else {
        toast({
          title: 'No Deck Selected',
          description: 'Please select a deck to start the AI chat.',
        });
      }
    } else {
      toast({
        title: 'Upgrade to Pro',
        description: 'K-Chat is a Pro feature. Upgrade your account to access it!',
        action: (
          <button
            onClick={() => router.push('/pricing')}
            className="bg-blue-500 text-white px-5 py-2 rounded hover:bg-blue-600"
          >
            Upgrade
          </button>
        ),
      });
    }
  };

  return (
    <div className="flex flex-wrap justify-center gap-2">
      <ModeButton icon={<SiStagetimer className="text-[#637FBF]" style={{ fontSize: '1rem' }} />} text="Learn" onClick={handleLearnClick} />
      <ModeButton icon={<RiTimerFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />} text="Test" onClick={handleTestClick} />
      <ModeButton icon={<PiCardsFill className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />} text="Match" onClick={handleMatchClick} />
      <ModeButton 
        icon={<BiSolidMessageSquareDots className="text-[#637FBF] font-bold" style={{ fontSize: '1.2rem' }} />} 
        text="K-Chat" 
        onClick={handleKChatClick} 
        isPro={true}
        userMembership={userMembership}
      />
    </div>
  );
};

interface ModeButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick: () => void;
  isPro?: boolean;
  userMembership?: string;
}

const ModeButton: React.FC<ModeButtonProps> = ({ icon, text, onClick, isPro = false, userMembership }) => (
  <div className="relative">
    <button
      className="flex items-center space-x-2 bg-white border-2 border-black dark:bg-gray-700 dark:border-gray-600 shadow-md rounded-lg p-2 sm:p-4 h-10 sm:h-12 hover:bg-gray-100 dark:hover:bg-gray-600 text-sm sm:text-base"
      onClick={onClick}
    >
      {icon}
      <span className="font-semibold">{text}</span>
    </button>
    {isPro && userMembership !== 'pro' && (
      <>
        <div className="absolute inset-0 bg-gray-200 dark:bg-gray-600 opacity-30 rounded-lg pointer-events-none"
             style={{
               backgroundImage: `repeating-linear-gradient(
               45deg,
              transparent,
              transparent 10px,
              rgba(0,0,0,0.1) 10px,
              rgba(0,0,0,0.1) 20px
            )`
             }}
        />
        <div className="absolute top-0 right-0 bg-yellow-400 text-xs text-black px-1 py-0.5 rounded-bl">
          <HiLightningBolt className="inline-block mr-1" />
          PRO
        </div>
      </>
    )}
  </div>
);

export default ModesButtons;