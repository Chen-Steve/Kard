export interface Flashcard {
  id: string;
  question: string;
  answer: string;
  order: number;
  userId?: string;
  deckId?: string;
}

export interface FlashcardInput {
  question: string;
  answer: string;
}

export interface Deck {
  id: string;
  name: string;
}

export interface FlashcardProps {
  userId: string;
  deckId: string;
  decks: Deck[];
  onDeckChange?: (newDeckId: string) => void;
  readOnly?: boolean;
  isTableView?: boolean;
  showFlashcardList: boolean;
  isPublicDeck?: boolean;
  showDefinitions?: boolean;
  isStudyMode?: boolean;
  selectedDeckId?: string;
  onDeckSelect?: (deckId: string) => void;
}