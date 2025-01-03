import React from 'react';
import { Input } from '../ui/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Button } from '../ui/Button';
import { Dialog, DialogTrigger } from '@/components/ui/Dialog';
import DeckFormDialog from './DeckFormDialog';
import { Deck } from '../../types/deck';
import { Icon } from '@iconify/react';

interface DeckSearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  selectedTag: string;
  setSelectedTag: (tag: string) => void;
  uniqueTags: string[];
  isCreateDialogOpen: boolean;
  setIsCreateDialogOpen: (isOpen: boolean) => void;
  handleCreateDeck: (newDeck: Partial<Deck>) => void;
  existingTags: { id: number; name: string; }[];
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
  existingTags,
}) => {
  return (
    <div className="flex flex-col mt-4 space-y-4 w-full px-4 sm:px-0 sm:flex-row sm:space-y-0 sm:space-x-4 sm:items-center">
      <div className="relative w-full sm:w-80">
        <Icon 
          icon="mdi:magnify" 
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-300" 
        />
        <Input
          type="text"
          placeholder="Search Decks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 w-full bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md"
        />
      </div>
      <div className="w-full sm:w-48">
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
      <div className="w-full sm:w-auto">
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button 
              variant="outline" 
              className="whitespace-nowrap w-full sm:w-auto bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon 
                icon="mdi:plus" 
                className="h-4 w-4 mr-2" 
              /> 
              Create Deck
            </Button>
          </DialogTrigger>
          <DeckFormDialog
            isOpen={isCreateDialogOpen}
            onClose={() => setIsCreateDialogOpen(false)}
            onSubmit={handleCreateDeck}
            existingTags={existingTags}
          />
        </Dialog>
      </div>
    </div>
  );
};

export default DeckSearchAndFilter;
