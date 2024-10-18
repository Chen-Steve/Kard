import React, { useRef, useEffect } from 'react';

interface EditableDivProps {
  htmlContent: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EditableDiv: React.FC<EditableDivProps> = ({ htmlContent, onChange, disabled = false, placeholder = '' }) => {
  const divRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (divRef.current && divRef.current.innerHTML !== htmlContent) {
      divRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  const handleInput = () => {
    if (divRef.current) {
      onChange(divRef.current.innerHTML);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Prevent space bar from propagating
    if (e.key === ' ') {
      e.stopPropagation();
    }

    if (e.ctrlKey) {
      switch (e.key.toLowerCase()) {
        case 'b':
          e.preventDefault();
          document.execCommand('bold');
          break;
        case 'i':
          e.preventDefault();
          document.execCommand('italic');
          break;
        case 'u':
          e.preventDefault();
          document.execCommand('underline');
          break;
        default:
          break;
      }
    }
  };

  return (
    <div
      ref={divRef}
      contentEditable={!disabled}
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      className={`w-full p-1 border ${disabled ? 'bg-gray-100' : 'bg-transparent'} focus:outline-none resize-none text-sm`}
      placeholder={placeholder}
      suppressContentEditableWarning={true}
    />
  );
};

export default EditableDiv;
