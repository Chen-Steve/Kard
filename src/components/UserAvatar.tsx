import React from 'react';

interface UserAvatarProps {
  avatarSvg: string;
  alt: string;
  onClick: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarSvg, alt, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
    >
      <img
        src={`data:image/svg+xml;utf8,${encodeURIComponent(avatarSvg)}`}
        alt={alt}
        className="w-full h-full object-cover"
      />
    </button>
  );
};

export default UserAvatar;