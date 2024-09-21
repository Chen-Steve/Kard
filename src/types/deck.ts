import { Flashcard } from './flashcard'; // Make sure to create this type if it doesn't exist

export interface Tag {
    id: number;
    name: string;
    color: string;
  }
  
  export interface Deck {
    id: string;
    name: string;
    description: string;
    userId: string;
    tags: Array<{ id: number; name: string; color: string }>;
    isPublic: boolean;
    order?: number;
    flashcards?: Flashcard[]; // Add this line
  }