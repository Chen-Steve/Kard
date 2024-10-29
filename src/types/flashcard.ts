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