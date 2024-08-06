import React from 'react';

interface UserAvatarProps {
  avatarSvg: string;
  alt: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarSvg, alt, onClick }) => {
  return (
    <div
      onClick={onClick}
      dangerouslySetInnerHTML={{ __html: avatarSvg }}
      aria-label={alt}
      className="rounded-full w-12 h-12 cursor-pointer m-2"
    />
  );
};

export default UserAvatar;