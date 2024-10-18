import React, { useRef, useEffect, useCallback } from 'react';

interface EditableDivProps {
  htmlContent: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

const EditableDiv: React.FC<EditableDivProps> = ({ htmlContent, onChange, disabled = false, placeholder = '' }) => {
  const divRef = useRef<HTMLDivElement>(null);

  const updateContent = useCallback(() => {
    if (divRef.current) {
      const content = divRef.current.innerHTML;
      if (content !== htmlContent) {
        onChange(content);
      }
    }
  }, [htmlContent, onChange]);

  useEffect(() => {
    if (divRef.current && divRef.current.innerHTML !== htmlContent) {
      divRef.current.innerHTML = htmlContent;
    }
  }, [htmlContent]);

  const handleInput = () => {
    updateContent();
  };

  const handleBlur = () => {
    updateContent();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();

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
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className={`w-full p-1 border ${disabled ? 'bg-gray-100' : 'bg-white'} focus:outline-none resize-none text-sm`}
      data-placeholder={placeholder}
      style={{ minHeight: '1.5em' }}
    />
  );
};

export default EditableDiv;
