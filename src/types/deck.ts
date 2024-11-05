import { Flashcard } from './flashcard';

export interface Tag {
  id: number;
  name: string;
}

export interface Deck {
  id: string;
  name: string;
  description: string;
  userId: string;
  tags: Tag[];
  isPublic: boolean;
  order?: number;
  flashcards?: Flashcard[];
}