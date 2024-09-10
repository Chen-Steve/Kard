import React, { useReducer, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/Dialog';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import SketchPickerWrapper from '../SketchPickerWrapper';
import { useToast } from "../ui/use-toast";
import { updateCursor } from 'ipad-cursor';

interface Tag {
  id: number;
  name: string;
  color: string;
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
}

// Define the state shape
interface DeckFormState {
  name: string;
  description: string;
  tags: Tag[];
  newTagName: string;
  newTagColor: string;
  isPublic: boolean;
}

// Define the action types
type DeckFormAction =
  | { type: 'SET_NAME'; payload: string }
  | { type: 'SET_DESCRIPTION'; payload: string }
  | { type: 'SET_TAGS'; payload: Tag[] }
  | { type: 'SET_NEW_TAG_NAME'; payload: string }
  | { type: 'SET_NEW_TAG_COLOR'; payload: string }
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
    case 'SET_NEW_TAG_COLOR':
      return { ...state, newTagColor: action.payload };
    case 'SET_IS_PUBLIC':
      return { ...state, isPublic: action.payload };
    case 'ADD_TAG':
      if (!state.newTagName.trim()) return state;
      return {
        ...state,
        tags: [...state.tags, { id: Date.now(), name: state.newTagName, color: state.newTagColor }],
        newTagName: '',
        newTagColor: '#000000'
      };
    case 'DELETE_TAG':
      return {
        ...state,
        tags: state.tags.filter((_, index) => index !== action.payload)
      };
    case 'RESET_FORM':
      return {
        name: '',
        description: '',
        tags: [],
        newTagName: '',
        newTagColor: '#000000',
        isPublic: false
      };
    case 'INITIALIZE_FORM':
      return {
        name: action.payload.name,
        description: action.payload.description,
        tags: action.payload.tags,
        newTagName: '',
        newTagColor: '#000000',
        isPublic: action.payload.isPublic
      };
    default:
      return state;
  }
}

const DeckFormDialog: React.FC<DeckFormDialogProps> = ({ isOpen, onClose, onSubmit, initialDeck }) => {
  const [state, dispatch] = useReducer(deckFormReducer, {
    name: '',
    description: '',
    tags: [],
    newTagName: '',
    newTagColor: '#000000',
    isPublic: false
  });

  const { toast } = useToast();

  useEffect(() => {
    if (initialDeck) {
      dispatch({ type: 'INITIALIZE_FORM', payload: initialDeck });
    } else {
      dispatch({ type: 'RESET_FORM' });
    }
  }, [initialDeck, isOpen]);

  useEffect(() => {
    // Update cursor when the component re-renders
    updateCursor();
  });

  const handleSubmit = () => {
    if (state.name.length > 20) {
      toast({
        title: "Error",
        description: "Deck name must be 20 characters or less",
        variant: "destructive",
      });
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialDeck ? 'Edit Deck' : 'Create New Deck'}</DialogTitle>
          <DialogDescription>{initialDeck ? '' : 'Add a new deck to your collection.'}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="Deck Name"
            value={state.name}
            onChange={(e) => dispatch({ type: 'SET_NAME', payload: e.target.value })}
            data-cursor="text"
          />
          <Input
            placeholder="Deck Description"
            value={state.description}
            onChange={(e) => dispatch({ type: 'SET_DESCRIPTION', payload: e.target.value })}
            data-cursor="text"
          />
          <div className="flex flex-col space-y-4">
            <div className="flex items-start space-x-4">
              <div className="flex flex-col space-y-2">
                <label htmlFor="tag-name" className="sr-only">Tag Name</label>
                <input
                  type="text"
                  id="tag-name"
                  placeholder="Tag Name"
                  value={state.newTagName}
                  onChange={(e) => dispatch({ type: 'SET_NEW_TAG_NAME', payload: e.target.value })}
                  className="p-2 border-2 border-black dark:border-gray-600 rounded"
                  data-cursor="text"
                />
                <Button onClick={() => dispatch({ type: 'ADD_TAG' })} data-cursor="block">Add Tag</Button>
              </div>
              <SketchPickerWrapper
                color={state.newTagColor}
                onChangeComplete={(color) => dispatch({ type: 'SET_NEW_TAG_COLOR', payload: color.hex })}
                className="ml-4"
                data-cursor="text"
              />
            </div>
          </div>
          <div>
            {state.tags.map((tag, index) => (
              <span key={index} className={`inline-flex items-center text-gray-800 text-xs px-2 py-1 rounded mr-2`} style={{ backgroundColor: tag.color }}>
                {tag.name}
                <button onClick={() => dispatch({ type: 'DELETE_TAG', payload: index })} className="ml-2 text-red-500 flex items-center justify-center" data-cursor="text">
                  x
                </button>
              </span>
            ))}
          </div>
          <div className="flex items-center mt-4" data-cursor="block">
            <input
              type="checkbox"
              id="isPublic"
              checked={state.isPublic}
              onChange={(e) => dispatch({ type: 'SET_IS_PUBLIC', payload: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isPublic" className="text-sm text-gray-700 dark:text-gray-300">
              Make this deck public
            </label>
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit} data-cursor="block">{initialDeck ? 'Update Deck' : 'Create Deck'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DeckFormDialog;