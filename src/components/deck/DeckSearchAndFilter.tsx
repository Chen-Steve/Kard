import React, { useEffect } from 'react';
import { Search, Plus } from 'lucide-react';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/Button';
import { Dialog, DialogTrigger } from '../ui/Dialog';
import DeckFormDialog from './DeckFormDialog';
import { Deck } from '../../types/deck';
import { updateCursor, customCursorStyle } from 'ipad-cursor';

interface DeckSearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  uniqueTags: string[];
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  handleCreateDeck: (newDeck: Partial<Deck>) => void;
}

const DeckSearchAndFilter: React.FC<DeckSearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  selectedTag,
  setSelectedTag,
  uniqueTags,
  isCreateDialogOpen,
  setIsCreateDialogOpen,
  handleCreateDeck,
}) => {
  useEffect(() => {
    updateCursor();
  });

  const roundedBlockStyle = customCursorStyle({
    radius: '0.375rem', // This matches the default Tailwind 'rounded-md' class
    background: 'rgba(59, 130, 246, 0.2)', // Light blue with opacity
    border: '1px solid rgb(59, 130, 246)', // Solid blue border
  });

  return (
    <div className="flex flex-col mt-4 space-y-4 w-full px-4 sm:px-0 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
      <div className="relative w-full sm:w-auto sm:flex-grow" data-cursor="block" data-cursor-style={roundedBlockStyle}>
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" />
        <Input
          type="text"
          placeholder="Search Decks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
          data-cursor="text"
        />
      </div>
      <div className="w-full sm:w-48" data-cursor="block" data-cursor-style={roundedBlockStyle}>
        <Select onValueChange={setSelectedTag} value={selectedTag}>
          <SelectTrigger className="w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md">
            <SelectValue placeholder="Filter by Tag" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tags</SelectItem>
            {uniqueTags.map(tag => (
              <SelectItem key={tag} value={tag}>{tag}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="w-full sm:w-auto" data-cursor="block" data-cursor-style={roundedBlockStyle}>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="whitespace-nowrap w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" /> Create Deck
            </Button>
          </DialogTrigger>
          <DeckFormDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onSubmit={handleCreateDeck}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default DeckSearchAndFilter;