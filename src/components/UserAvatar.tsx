import React from 'react';
import Image from 'next/image';

interface UserAvatarProps {
  avatarSvg: string | null;
  alt: string;
  onClick: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarSvg, alt, onClick }) => {
  return (
    <button
      aria-label="Change Avatar"
      onClick={onClick}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
    >
      {avatarSvg ? (
        <Image
          src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`}
          alt={alt}
          width={80}
          height={80}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gray-300 flex items-center justify-center text-gray-600">
          No Avatar
        </div>
      )}
    </button>
  );
};

export default UserAvatar;