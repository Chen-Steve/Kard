import React, { useRef } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

interface UserAvatarProps {
  avatarUrl: string | null;
  alt: string;
  onClick?: () => void;
  onFileUpload?: (file: File) => Promise<void>;
  isUploading?: boolean;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ 
  avatarUrl, 
  alt, 
  onClick,
  onFileUpload,
  isUploading = false
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isDataUrl = avatarUrl?.startsWith('data:');
  const isSvgString = avatarUrl?.startsWith('<svg');

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    } else if (onFileUpload) {
      fileInputRef.current?.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && onFileUpload) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please upload an image file');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      await onFileUpload(file);
      // Clear the input value to allow uploading the same file again
      e.target.value = '';
    }
  };

  return (
    <div className="relative">
      <div 
        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden cursor-pointer relative group"
        onClick={handleClick}
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
        
        {/* Upload overlay */}
        {onFileUpload && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            {isUploading ? (
              <Icon 
                icon="eos-icons:loading" 
                className="text-white w-8 h-8 animate-spin drop-shadow-lg"
              />
            ) : (
              <Icon 
                icon="solar:camera-add-bold" 
                className="text-white w-8 h-8 opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg"
              />
            )}
          </div>
        )}
      </div>

      {/* Hidden file input */}
      {onFileUpload && (
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          aria-label="Upload profile picture"
        />
      )}
    </div>
  );
};

export default UserAvatar;