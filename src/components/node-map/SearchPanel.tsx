import React, { useState, useMemo } from 'react';
import { Panel } from 'reactflow';
import debounce from 'lodash/debounce';

interface SearchPanelProps {
  onSearch: (term: string) => void;
  resultsCount?: number;
  searchTerm?: string;
}

const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, resultsCount, searchTerm: initialSearchTerm = '' }) => {
  const [localSearchTerm, setLocalSearchTerm] = useState(initialSearchTerm);

  // Create memoized debounced search function
  const debouncedSearch = useMemo(
    () => debounce((term: string) => {
      onSearch(term);
    }, 300),
    [onSearch]
  );

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    const term = e.target.value;
    setLocalSearchTerm(term);
    debouncedSearch(term);
  };

  return (
    <Panel position="top-center" className="translate-x-[-50%]">
      <div className="p-2 rounded-lg">
        <div className="relative">
          <input 
            type="text"
            value={localSearchTerm}
            placeholder="Search cards or decks..."
            className="w-[300px] px-4 py-2 rounded-md border border-gray-200 
                       bg-transparent backdrop-blur-sm
                       dark:border-gray-700 dark:text-white 
                       focus:outline-none focus:ring-2 focus:ring-black"
            onChange={handleSearch}
          />
          {localSearchTerm && resultsCount !== undefined && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500 dark:text-gray-400">
              {resultsCount} {resultsCount === 1 ? 'match' : 'matches'}
            </div>
          )}
        </div>
      </div>
    </Panel>
  );
};

export default SearchPanel; 