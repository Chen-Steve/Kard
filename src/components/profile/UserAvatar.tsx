import React from 'react';
import Image from 'next/image';
import { FaShuffle } from "react-icons/fa6";
import { getGlassAvatarSvg } from '../../utils/avatar';

interface UserAvatarProps {
  avatarUrl: string | null;
  alt: string;
  onClick?: () => void;
  showOptions?: boolean;
  onAvatarChange?: (avatar: string) => void;
  avatarOptions?: string[];
  setAvatarOptions?: (options: string[]) => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  alt, 
  onClick,
  showOptions = false,
  onAvatarChange,
  avatarOptions = [],
  setAvatarOptions
}) => {
  const isDataUrl = avatarUrl?.startsWith('data:');
  const isSvgString = avatarUrl?.startsWith('<svg');

  const handleShuffleAvatars = () => {
    if (setAvatarOptions) {
      const newOptions = Array.from(
        { length: 5 },
        () => getGlassAvatarSvg(Math.random().toString())
      );
      setAvatarOptions(newOptions);
    }
  };

  return (
    <div className="flex items-center space-x-3">
      <div 
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden cursor-pointer"
        onClick={onClick}
      >
        {avatarUrl ? (
          isDataUrl || isSvgString ? (
            <div 
              dangerouslySetInnerHTML={{ 
                __html: isDataUrl ? atob(avatarUrl.split(',')[1]) : avatarUrl 
              }} 
              className="w-full h-full"
            />
          ) : (
            <Image
              src={avatarUrl}
              alt={alt}
              width={80}
              height={80}
              className="w-full h-full object-cover"
            />
          )
        ) : (
          <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
            {alt.charAt(0).toUpperCase()}
          </div>
        )}
      </div>

      {showOptions && onAvatarChange && (
        <div className="flex space-x-1">
          {avatarOptions.map((avatar, index) => (
            <button
              aria-label={`Avatar option ${index + 1}`}
              key={index}
              onClick={() => onAvatarChange(avatar)}
              className="w-6 h-6 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 hover:ring-2 hover:ring-black"
            >
              <Image
                src={`data:image/svg+xml;utf8,${encodeURIComponent(avatar)}`}
                alt={`Avatar option ${index + 1}`}
                width={24}
                height={24}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
          <button
            aria-label="Shuffle Avatar"
            onClick={handleShuffleAvatars}
            className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-black transition-all duration-200 hover:ring-2 hover:ring-black"
          >
            <FaShuffle className="text-gray-600 dark:text-gray-300 text-xs" />
          </button>
        </div>
      )}
    </div>
  );
};

export default UserAvatar;
