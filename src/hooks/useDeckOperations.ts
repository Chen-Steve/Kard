import { useRouter } from 'next/router';
import { Deck } from '@/types/deck';
import supabase from '@/lib/supabaseClient';
import { DropResult } from '@hello-pangea/dnd';
import toast from 'react-hot-toast';

interface UseDeckOperationsProps {
  decks: Deck[];
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
  fetchDecks: () => Promise<void>;
}

export const useDeckOperations = ({ decks, setDecks, fetchDecks }: UseDeckOperationsProps) => {
  const router = useRouter();
  
  const handleCreateDeck = async (newDeck: Partial<Deck>) => {
    if (!newDeck.name || !newDeck.description) {
      console.error('Deck name and description are required');
      return;
    }

    if (newDeck.name.length > 20) {
      toast.error("Deck name must be 20 characters or less");
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch('/api/decks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newDeck.name,
          description: newDeck.description,
          userId: session.user.id,
          tags: newDeck.tags,
          isPublic: newDeck.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create deck');
      }

      const newDeckData = await response.json();
      setDecks((prevDecks) => [...prevDecks, newDeckData]);
      return newDeckData;
    } catch (error) {
      console.error('Error creating deck:', error);
      throw error;
    }
  };

  const handleUpdateDeck = async (updatedDeck: Partial<Deck>) => {
    if (!updatedDeck.id || !updatedDeck.name) {
      console.error('No deck to update or missing name');
      return;
    }

    if (updatedDeck.name.length > 20) {
      toast.error("Deck name must be 20 characters or less");
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`/api/decks`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deckId: updatedDeck.id,
          name: updatedDeck.name,
          description: updatedDeck.description,
          userId: session.user.id,
          tags: updatedDeck.tags,
          isPublic: updatedDeck.isPublic,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update deck');
      }

      const updatedDeckData = await response.json();
      setDecks((prevDecks) => 
        prevDecks.map((deck) => 
          deck.id === updatedDeckData.id ? updatedDeckData : deck
        )
      );
      toast.success("Deck updated successfully");
      return updatedDeckData;
    } catch (error) {
      console.error('Error updating deck:', error);
      toast.error("Failed to update deck. Please try again.");
      throw error;
    }
  };

  const handleDeleteDeck = async (deckId: string) => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`/api/decks`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deckId, userId: session.user.id }),
      });

      if (!response.ok) {
        throw new Error('Failed to delete deck');
      }

      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
      throw error;
    }
  };

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) return;

    // Handle deck reordering
    if (type === 'DECK') {
      if (source.index === destination.index) return;

      const newDecks = Array.from(decks);
      const [removed] = newDecks.splice(source.index, 1);
      newDecks.splice(destination.index, 0, removed);

      setDecks(newDecks);

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const response = await fetch('/api/decks/reorder', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: session.user.id,
            decks: newDecks.map((deck, index) => ({
              id: deck.id,
              order: index,
            })),
          }),
        });

        if (!response.ok) throw new Error('Failed to update deck order');

      } catch (error) {
        console.error('Error updating deck order:', error);
        toast.error("Failed to update deck order");
        fetchDecks();
      }
      return;
    }

    // Handle flashcard moving between decks
    if (type === 'FLASHCARD') {
      if (source.droppableId === destination.droppableId) return;

      const sourceDeckId = source.droppableId;
      const destinationDeckId = destination.droppableId;
      const flashcardId = draggableId;

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) throw new Error('No active session');

        const response = await fetch('/api/flashcards/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flashcardId,
            sourceDeckId,
            destinationDeckId,
            userId: session.user.id,
          }),
        });

        if (!response.ok) throw new Error('Failed to move flashcard');

        setDecks(prevDecks => {
          return prevDecks.map(deck => {
            if (deck.id === sourceDeckId) {
              return {
                ...deck,
                flashcards: deck.flashcards?.filter(fc => fc.id !== flashcardId) || [],
              };
            }
            if (deck.id === destinationDeckId) {
              const movedFlashcard = prevDecks
                .find(d => d.id === sourceDeckId)
                ?.flashcards?.find(fc => fc.id === flashcardId);
              
              if (movedFlashcard) {
                return {
                  ...deck,
                  flashcards: [...(deck.flashcards || []), movedFlashcard],
                };
              }
            }
            return deck;
          });
        });

        toast.success("Flashcard moved successfully");
      } catch (error) {
        console.error('Error moving flashcard:', error);
        toast.error("Failed to move flashcard");
      }
    }
  };

  return {
    handleCreateDeck,
    handleUpdateDeck,
    handleDeleteDeck,
    handleDragEnd,
  };
}; 