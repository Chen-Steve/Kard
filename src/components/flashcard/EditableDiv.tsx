import React, { useRef, useEffect, useCallback } from 'react';
import debounce from 'lodash/debounce';

interface EditableDivProps {
  htmlContent: string;
  onChange: (content: string) => void;
  disabled?: boolean;
  placeholder?: string;
  className?: string;
}

const EditableDiv: React.FC<EditableDivProps> = ({
  htmlContent,
  onChange,
  disabled = false,
  placeholder,
  className = '',
}) => {
  const divRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef(htmlContent);

  // Initialize content on mount and when htmlContent changes
  useEffect(() => {
    if (divRef.current) {
      divRef.current.innerHTML = htmlContent;
      contentRef.current = htmlContent;
    }
  }, []); // Run only on mount

  // Debounced onChange handler
  const debouncedOnChange = useCallback(
    debounce((content: string) => {
      onChange(content);
    }, 300),
    [onChange]
  );

  // Update content when prop changes
  useEffect(() => {
    if (divRef.current && htmlContent !== contentRef.current) {
      const isActive = document.activeElement === divRef.current;
      if (!isActive) {
        divRef.current.innerHTML = htmlContent;
        contentRef.current = htmlContent;
      }
    }
  }, [htmlContent]);

  const handleInput = useCallback(() => {
    if (divRef.current) {
      const newContent = divRef.current.innerHTML;
      contentRef.current = newContent;
      debouncedOnChange(newContent);
    }
  }, [debouncedOnChange]);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedOnChange.cancel();
    };
  }, [debouncedOnChange]);

  return (
    <div
      ref={divRef}
      contentEditable={!disabled}
      onInput={handleInput}
      onKeyDown={(e) => e.stopPropagation()}
      className={`w-full p-1 border-0 border-b ${disabled ? 'bg-gray-100' : 'bg-white'} focus:outline-none resize-none text-sm ${className}`}
      data-placeholder={placeholder}
      style={{ minHeight: '1.5em' }}
      suppressContentEditableWarning
    />
  );
};

export default EditableDiv;
