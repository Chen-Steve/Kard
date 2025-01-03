import React, { useEffect, useCallback, useReducer, useState } from 'react';
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Icon } from "@iconify/react";
import toast from 'react-hot-toast';

interface Tag {
  id: number;
  name: string;
}

interface Deck {
  id: string;
  name: string;
  description: string;
  tags: Tag[];
  isPublic: boolean;
}

interface DeckFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (deck: Partial<Deck>) => void;
  initialDeck?: Deck;
  existingTags?: Tag[];
}

// Define the state shape
interface DeckFormState {
  name: string;
  description: string;
  tags: Tag[];
  newTagName: string;
  isPublic: boolean;
}

// Define the action types
type DeckFormAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_NEW_TAG_NAME'; payload: string }
  | { type: 'SET_IS_PUBLIC'; payload: boolean }
  | { type: 'ADD_TAG' }
  | { type: 'DELETE_TAG'; payload: number }
  | { type: 'RESET_FORM' }
  | { type: 'INITIALIZE_FORM'; payload: Deck };

// Reducer function
function deckFormReducer(state: DeckFormState, action: DeckFormAction): DeckFormState {
  switch (action.type) {
    case 'SET_NAME':
      return { ...state, name: action.payload };
    case 'SET_DESCRIPTION':
      return { ...state, description: action.payload };
    case 'SET_TAGS':
      return { ...state, tags: action.payload };
    case 'SET_NEW_TAG_NAME':
      return { ...state, newTagName: action.payload };
    case 'SET_IS_PUBLIC':
      return { ...state, isPublic: action.payload };
    case 'ADD_TAG':
      if (!state.newTagName.trim()) return state;
      if (state.tags.some(tag => tag.name === state.newTagName.trim())) {
        return state;
      }
      return {
        ...state,
        tags: [...state.tags, {
          id: Date.now(),
          name: state.newTagName.trim(),
        }],
        newTagName: '',
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter(tag => tag.id !== action.payload)
      };
    case 'RESET_FORM':
      return {
        name: '',
        description: '',
        tags: [],
        newTagName: '',
        isPublic: false
      };
    case 'INITIALIZE_FORM':
      return {
        name: action.payload.name,
        description: action.payload.description,
        tags: action.payload.tags,
        newTagName: '',
        isPublic: action.payload.isPublic
      };
    default:
      return state;
  }
}

interface TagInputProps {
  newTagName: string;
  onTagNameChange: (value: string) => void;
  onAddTag: () => void;
  tags: Tag[];
  existingTags?: Tag[];
}

const TagInput = React.memo<TagInputProps>(({ 
  newTagName, 
  onTagNameChange, 
  onAddTag, 
  tags = [],
  existingTags = []
}) => {
  const [open, setOpen] = useState(false);
  const isDuplicate = tags.some(tag => tag.name === newTagName.trim());
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newTagName.trim() && !isDuplicate) {
      e.preventDefault();
      onAddTag();
    }
  };

  const safeExistingTags = Array.isArray(existingTags) ? existingTags : [];
  const safeTags = Array.isArray(tags) ? tags : [];
  
  const filteredTags = safeExistingTags.filter(tag => 
    tag &&
    tag.name &&
    !safeTags.some(existingTag => existingTag.name === tag.name) &&
    tag.name.toLowerCase().includes(newTagName.toLowerCase())
  );

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center gap-2">
            <Input
              type="text"
              placeholder="Add a tag..."
              value={newTagName}
              onChange={(e) => onTagNameChange(e.target.value)}
              onKeyDown={handleKeyDown}
              className={`flex-1 h-8 text-sm ${isDuplicate ? 'border-red-500' : ''}`}
            />
            <Button
              size="sm"
              variant="outline"
              onClick={onAddTag}
              disabled={!newTagName.trim() || isDuplicate}
              className="h-8"
            >
              Add
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent className="p-0" align="start">
          <Command>
            <CommandInput 
              placeholder="Search existing tags..." 
              value={newTagName}
              onValueChange={onTagNameChange}
            />
            <CommandList>
              <CommandEmpty>No matching tags found.</CommandEmpty>
              <CommandGroup>
                {filteredTags.map((tag) => (
                  <CommandItem
                    key={tag.id}
                    value={tag.name}
                    onSelect={() => {
                      onTagNameChange(tag.name);
                      setOpen(false);
                    }}
                  >
                    <Icon icon="pepicons-print:tag" className="mr-2 h-4 w-4" />
                    {tag.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {isDuplicate && (
        <p className="text-xs text-red-500">This tag already exists</p>
      )}
    </div>
  );
});
TagInput.displayName = 'TagInput';

const DeckFormDialog: React.FC<DeckFormDialogProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialDeck,
  existingTags = []
}) => {
  const [state, dispatch] = useReducer(deckFormReducer, {
    name: '',
    description: '',
    tags: [],
    newTagName: '',
    isPublic: false
  });

  useEffect(() => {
    if (initialDeck) {
      dispatch({ type: 'INITIALIZE_FORM', payload: initialDeck });
    } else {
      dispatch({ type: 'RESET_FORM' });
    }
  }, [initialDeck, isOpen]);

  const handleSubmit = useCallback(() => {
    if (state.name.trim() === '' || state.description.trim() === '') {
      toast.error('Both name and description are required.');
      return;
    }

    if (state.name.length > 20) {
      toast.error('Deck name must be 20 characters or less');
      return;
    }

    onSubmit({
      id: initialDeck?.id,
      name: state.name,
      description: state.description,
      tags: state.tags,
      isPublic: state.isPublic,
    });
    onClose();
    dispatch({ type: 'RESET_FORM' });
  }, [state, initialDeck, onSubmit, onClose]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Dialog Content */}
      <div 
        className="relative bg-background/90 backdrop-blur-sm rounded-lg shadow-lg w-full max-w-[450px] p-5 m-4 animate-in fade-in-0 zoom-in-95"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="space-y-2 pb-4">
          <h2 className="text-lg font-semibold">
            {initialDeck ? 'Edit Deck' : 'Create New Deck'}
          </h2>
        </div>

        {/* Form Content */}
        <div className="space-y-4">
          {/* Name Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="name" className="text-sm font-medium">
                Deck Name
              </Label>
              <span className="text-xs text-muted-foreground">
                {20 - state.name.length} remaining
              </span>
            </div>
            <Input
              id="name"
              value={state.name}
              onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
              maxLength={20}
              className="h-9"
              placeholder="Enter deck name..."
            />
          </div>

          {/* Description Input */}
          <div className="space-y-2">
            <Label htmlFor="description" className="text-sm font-medium">
              Description
            </Label>
            <Input
              id="description"
              value={state.description}
              onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
              className="h-9"
              placeholder="Enter deck description..."
            />
          </div>

          {/* Tags Section */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Tags</Label>
            <TagInput
              newTagName={state.newTagName}
              onTagNameChange={(value) => dispatch({ type: 'SET_NEW_TAG_NAME', payload: value })}
              onAddTag={() => dispatch({ type: 'ADD_TAG' })}
              tags={state.tags}
              existingTags={existingTags}
            />
            
            {state.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {state.tags.map((tag) => (
                  <Badge
                    key={tag.id}
                    variant="secondary"
                    className="text-xs py-0.5 px-2 flex items-center gap-1"
                  >
                    {tag.name}
                    <button
                      onClick={() => dispatch({ type: 'DELETE_TAG', payload: tag.id })}
                      className="hover:text-destructive ml-1 transition-colors"
                      aria-label={`Remove ${tag.name} tag`}
                    >
                      <Icon icon="pepicons-print:trash" className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Visibility Toggle */}
          <div className="flex items-center space-x-2">
            <input
              aria-label="Make this deck public"
              type="checkbox"
              id="isPublic"
              checked={state.isPublic}
              onChange={(e) => dispatch({ type: 'SET_IS_PUBLIC', payload: e.target.checked })}
              className="rounded border-gray-300"
            />
            <Label htmlFor="isPublic" className="text-sm text-muted-foreground">
              Make this deck public
            </Label>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!state.name.trim() || !state.description.trim() || state.name.length > 20}
          >
            {initialDeck ? 'Save Changes' : 'Create Deck'}
          </Button>
        </div>
      </div>
    </div>
  );
};

DeckFormDialog.displayName = 'DeckFormDialog';

export default DeckFormDialog;