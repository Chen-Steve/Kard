import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  avatarUrl: string | null;
  alt: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, alt, onClick }) => {
  const isDataUrl = avatarUrl?.startsWith('data:');
  const isSvgString = avatarUrl?.startsWith('<svg');

  return (
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
  );
};

export default UserAvatar;
