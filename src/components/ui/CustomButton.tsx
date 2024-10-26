import React from 'react';

interface CustomButtonProps {
  onClick?: () => void;
  className?: string;
  children: React.ReactNode;
  disabled?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

const CustomButton: React.FC<CustomButtonProps> = ({ onClick, className, children, disabled, type = 'button' }) => {
  return (
    <button
      onClick={onClick}
      className={`w-full min-h-[100px] p-4 rounded-md transition-colors duration-200 ${className} ${
        disabled ? 'opacity-50 cursor-not-allowed' : ''
      }`}
      disabled={disabled}
      type={type}
    >
      {children}
    </button>
  );
};

export default CustomButton;
