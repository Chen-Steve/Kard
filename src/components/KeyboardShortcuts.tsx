import React, { useEffect, useCallback } from 'react';

interface KeyboardShortcutsProps {
  onPrevious: () => void;
  onNext: () => void;
  onFlip: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onPrevious, onNext, onFlip }) => {
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.target instanceof HTMLTextAreaElement) {
      return; // Allow default behavior for text areas
    }
    if (e.key === 'ArrowLeft') onPrevious();
    if (e.key === 'ArrowRight') onNext();
    if (e.key === ' ') {
      e.preventDefault();
      onFlip();
    }
  }, [onPrevious, onNext, onFlip]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  return null;
};

export default KeyboardShortcuts;