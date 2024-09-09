import React, { useEffect, useCallback } from 'react';
import { initCursor, updateCursor, customCursorStyle } from 'ipad-cursor';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const EmailModal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      if (typeof window !== 'undefined') {
        initCursor({
          normalStyle: { 
            background: 'rgba(255, 255, 255, 0.3)',
            border: '2px solid black'
          },
          textStyle: { 
            background: 'rgba(255, 255, 255, 0.5)',
            border: '2px solid black'
          },
          blockStyle: { 
            background: 'rgba(255, 255, 255, 0.2)',
            radius: 'auto',
            border: '2px solid black'
          },
        });
        updateCursor();
      }
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl relative">
        <button
          className="absolute top-2 left-2 px-2 py-1 text-sm font-semibold text-gray-600 bg-gray-200 rounded hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400"
          onClick={onClose}
          data-cursor="block"
        >
          Esc
        </button>
        {children}
      </div>
    </div>
  );
};

export default EmailModal;