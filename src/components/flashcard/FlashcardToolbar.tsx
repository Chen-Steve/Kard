import React, { ReactNode } from 'react';
import { FaPlus, FaEllipsisH, FaList, FaTable } from 'react-icons/fa';
import { BiCloudUpload } from "react-icons/bi";
import { PiSparkleBold } from "react-icons/pi";

interface FlashcardToolbarProps {
  onAddCard: () => void;
  onToggleList: () => void;
  onToggleScroll: () => void;
  onToggleView: () => void;
  showList: boolean;
  isScrollable: boolean;
  isTableViewActive: boolean;
  readOnly: boolean;
  children?: ReactNode;  // Add this line
}

const FlashcardToolbar: React.FC<FlashcardToolbarProps> = ({
  onAddCard,
  onToggleList,
  onToggleScroll,
  onToggleView,
  showList,
  isScrollable,
  isTableViewActive,
  readOnly,
  children,
}) => {
  return (
    <div className="flex justify-between space-x-4 flex-wrap">
      {!readOnly && (
        <button
          onClick={onAddCard}
          className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-2 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
          aria-label="Add flashcard"
        >
          <FaPlus className="sm:mr-2" /> <span className="hidden sm:inline">Add Flashcard</span>
        </button>
      )}
      <div className="flex space-x-2">
        <button
          onClick={onToggleList}
          className="bg-primary dark:bg-gray-600 text-primary-foreground dark:text-gray-200 px-2 py-1 sm:px-4 sm:py-2 rounded flex items-center text-sm sm:text-base"
          aria-label={showList ? "Hide list" : "Show list"}
        >
          {showList ? <span className="hidden sm:inline">Hide List</span> : <span className="hidden sm:inline">Show List</span>}
          <span className="sm:hidden">{showList ? 'Hide' : 'Show'}</span>
        </button>
        <button
          onClick={onToggleScroll}
          className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-center"
          aria-label={isScrollable ? "Expand list" : "Make list scrollable"}
        >
          <FaEllipsisH />
        </button>
        <button
          onClick={onToggleView}
          className="bg-white border-2 border-black dark:border-gray-600 dark:bg-gray-600 text-black dark:text-gray-200 px-2 py-1 sm:px-3 sm:py-2 rounded flex items-center"
          aria-label={isTableViewActive ? "Switch to list view" : "Switch to table view"}
        >
          {isTableViewActive ? <FaList /> : <FaTable />}
        </button>
      </div>
      {!readOnly && children}  {/* Add this line */}
    </div>
  );
};

export default FlashcardToolbar;