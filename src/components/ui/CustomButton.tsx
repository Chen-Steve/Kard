import React from 'react';

interface CustomButtonProps {
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
}

const CustomButton: React.FC<CustomButtonProps> = ({ onClick, className, children, disabled }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[100px] p-4 rounded-md transition-colors duration-200 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

export default CustomButton;