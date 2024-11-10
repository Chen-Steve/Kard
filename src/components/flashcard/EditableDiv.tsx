import React, { useRef, useEffect, useCallback } from 'react';

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
  const lastContentRef = useRef(htmlContent);

  const updateContent = useCallback(() => {
    if (divRef.current) {
      const content = divRef.current.innerHTML;
      if (content !== lastContentRef.current) {
        lastContentRef.current = content;
        onChange(content);
      }
    }
  }, [onChange]);

  useEffect(() => {
    if (divRef.current && htmlContent !== divRef.current.innerHTML) {
      // Only update if content is different from what's displayed
      const selection = window.getSelection();
      let cursorPosition: number | undefined;
      let isCurrentElement = false;

      // Safely get the range and cursor position
      try {
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          cursorPosition = range.startOffset;
          isCurrentElement = selection.focusNode?.parentElement === divRef.current;
        }
      } catch (e) {
        console.debug('No valid selection range');
      }
      
      divRef.current.innerHTML = htmlContent;
      lastContentRef.current = htmlContent;

      // Restore cursor position if it was in this element
      if (selection && cursorPosition !== undefined && isCurrentElement && divRef.current) {
        try {
          const newRange = document.createRange();
          const textNode = divRef.current.firstChild || divRef.current;
          const newPosition = Math.min(cursorPosition, textNode.textContent?.length || 0);
          newRange.setStart(textNode, newPosition);
          newRange.setEnd(textNode, newPosition);
          selection.removeAllRanges();
          selection.addRange(newRange);
        } catch (e) {
          console.debug('Failed to restore cursor position');
        }
      }
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
      className={`w-full p-1 border-0 border-b ${disabled ? 'bg-gray-100' : 'bg-white'} focus:outline-none resize-none text-sm ${className}`}
      data-placeholder={placeholder}
      style={{ minHeight: '1.5em' }}
    />
  );
};

export default EditableDiv;
