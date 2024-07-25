import { useEffect } from 'react';

interface KeyboardShortcutsProps {
  onFlip: () => void;
  onNext: () => void;
  onPrev: () => void;
}

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({ onFlip, onNext, onPrev }) => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.code) {
        case 'Space':
          event.preventDefault();
          onFlip();
          break;
        case 'ArrowRight':
          onNext();
          break;
        case 'ArrowLeft':
          onPrev();
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onFlip, onNext, onPrev]);

  return null;
};

export default KeyboardShortcuts;
