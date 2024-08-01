// components/UserAvatar.tsx
import Image from 'next/image';

interface UserAvatarProps {
  avatarUrl: string;
  alt: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarUrl, alt }) => (
  <Image
    src={avatarUrl}
    alt={alt}
    width={50} // or the desired width
    height={50} // or the desired height
    className="rounded-full"
  />
);

export default UserAvatar;
