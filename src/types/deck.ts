export interface Tag {
    id: number;
    name: string;
    color: string;
  }
  
  export interface Deck {
    id: string;
    name: string;
    description: string;
    tags: Tag[];
    isPublic: boolean;
    order: number; 
    userId?: string;
  }