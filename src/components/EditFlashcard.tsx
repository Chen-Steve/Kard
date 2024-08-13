import React, { useState, useEffect, useRef } from 'react';
import { FaTrashAlt, FaSave, FaHighlighter } from 'react-icons/fa';
import { PiHighlighterBold } from "react-icons/pi";

interface EditFlashcardProps {
  id: string;
  question: string;
  answer: string;
  onSave: (id: string, question: string, answer: string) => void;
  onDelete: (id: string) => void;
}

const EditFlashcard: React.FC<EditFlashcardProps> = ({
  id,
  question,
  answer,
  onSave,
  onDelete,
}) => {
  const [editedQuestion, setEditedQuestion] = useState(question);
  const [editedAnswer, setEditedAnswer] = useState(answer);
  const [isEditing, setIsEditing] = useState(false);
  const questionRef = useRef<HTMLDivElement>(null);
  const answerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing) {
      questionRef.current?.focus();
    }
  }, [isEditing]);

  const handleSave = () => {
    onSave(id, editedQuestion, editedAnswer);
    setIsEditing(false);
  };

  const saveSelection = () => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      return {
        startContainer: range.startContainer,
        startOffset: range.startOffset,
        endContainer: range.endContainer,
        endOffset: range.endOffset,
      };
    }
    return null;
  };

  const restoreSelection = (savedSelection: any) => {
    if (savedSelection) {
      const selection = window.getSelection();
      const range = document.createRange();
      
      try {
        range.setStart(savedSelection.startContainer, savedSelection.startOffset);
        range.setEnd(savedSelection.endContainer, savedSelection.endOffset);
        selection?.removeAllRanges();
        selection?.addRange(range);
      } catch (error) {
        console.error('Failed to restore selection:', error);
        // If restoring fails, set selection to the end of the content
        const div = savedSelection.startContainer.parentElement;
        if (div) {
          range.selectNodeContents(div);
          range.collapse(false);
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  };

  const handleHighlight = (divRef: React.RefObject<HTMLDivElement>) => {
    const div = divRef.current;
    if (div) {
      const savedSelection = saveSelection();
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const selectedText = range.toString();
        const parentElement = range.commonAncestorContainer.parentElement;

        if (parentElement && parentElement.tagName === 'MARK') {
          // Unhighlight
          const unhighlightedText = parentElement.innerHTML;
          parentElement.outerHTML = unhighlightedText;
        } else {
          // Highlight
          const highlightedText = `<mark>${selectedText}</mark>`;
          range.deleteContents();
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = highlightedText;
          const frag = document.createDocumentFragment();
          let node;
          while ((node = tempDiv.firstChild)) {
            frag.appendChild(node);
          }
          range.insertNode(frag);
        }

        if (divRef === questionRef) {
          setEditedQuestion(div.innerHTML);
        } else {
          setEditedAnswer(div.innerHTML);
        }
      }
      restoreSelection(savedSelection);
    }
  };

  const handleInput = (divRef: React.RefObject<HTMLDivElement>, setState: React.Dispatch<React.SetStateAction<string>>) => {
    const div = divRef.current;
    if (div) {
      const selection = window.getSelection();
      const range = selection?.getRangeAt(0);
      const offset = range?.startOffset;

      setState(div.innerHTML);

      if (selection && range && offset !== undefined) {
        requestAnimationFrame(() => {
          const newRange = document.createRange();
          let node = div.firstChild;
          let currentOffset = 0;

          while (node) {
            if (node.nodeType === Node.TEXT_NODE) {
              const length = node.textContent?.length || 0;
              if (currentOffset + length >= offset) {
                newRange.setStart(node, offset - currentOffset);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);
                break;
              }
              currentOffset += length;
            }
            node = node.nextSibling;
          }

          if (!node) {
            // If we couldn't find the right position, set cursor at the end
            newRange.selectNodeContents(div);
            newRange.collapse(false);
            selection.removeAllRanges();
            selection.addRange(newRange);
          }
        });
      }
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === ' ') {
      event.stopPropagation();
    }
  };

  return (
    <div className="border-2 border-black dark:border-gray-600 rounded-sm p-4 mb-4 relative">
      <div className="flex flex-col space-y-2">
        <div className="flex-grow">
          <div
            ref={questionRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: editedQuestion }}
            onInput={() => handleInput(questionRef, setEditedQuestion)}
            onFocus={() => setIsEditing(true)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 dark:bg-gray-500 dark:border-gray-600 rounded resize-none overflow-hidden"
            title="Question"
          />
          <button
            onClick={() => handleHighlight(questionRef)}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors mt-2"
            title="Highlight"
          >
            <PiHighlighterBold className="text-lg" />
          </button>
        </div>
        <div className="flex-grow">
          <div
            ref={answerRef}
            contentEditable
            dangerouslySetInnerHTML={{ __html: editedAnswer }}
            onInput={() => handleInput(answerRef, setEditedAnswer)}
            onFocus={() => setIsEditing(true)}
            onKeyDown={handleKeyDown}
            className="w-full p-2 border border-gray-300 dark:bg-gray-500 dark:border-gray-600 rounded resize-none overflow-hidden"
            title="Answer"
          />
          <button
            onClick={() => handleHighlight(answerRef)}
            className="bg-yellow-500 text-white p-2 rounded hover:bg-yellow-600 transition-colors mt-2"
            title="Highlight"
          >
            <PiHighlighterBold className="text-lg" />
          </button>
        </div>
      </div>
      <div className="flex justify-end mt-2 space-x-2">
        <button
          onClick={() => onDelete(id)}
          className="bg-red-500 text-white p-2 rounded hover:bg-red-600 transition-colors"
          title="Delete"
        >
          <FaTrashAlt />
        </button>
        <button
          onClick={handleSave}
          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
          title="Save"
        >
          <FaSave size={16} />
        </button>
      </div>
    </div>
  );
};

export default EditFlashcard;