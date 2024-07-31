import React from 'react';
import Image from 'next/image';

interface AvatarProps {
  seed: string;
}

const Avatar: React.FC<AvatarProps> = ({ seed }) => {
  const avatarUrl = `https://avatars.dicebear.com/api/bottts/${seed}.svg`;

  return <Image src={avatarUrl} alt="User Avatar" width={64} height={64} className="rounded-full" />;
};

export default Avatar;