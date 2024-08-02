interface UserAvatarProps {
  avatarSvg: string;
  alt: string;
  onClick?: () => void;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ avatarSvg, alt, onClick }) => (
  <div
    onClick={onClick}
    dangerouslySetInnerHTML={{ __html: avatarSvg }}
    aria-label={alt}
    className="rounded-full w-12 h-12 cursor-pointer"
  />
);

export default UserAvatar;
