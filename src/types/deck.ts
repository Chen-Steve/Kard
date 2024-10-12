import { Flashcard } from './flashcard';

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
    flashcards?: Flashcard[];
  }