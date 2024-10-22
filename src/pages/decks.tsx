import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import useDOMNodeInserted from '../hooks/useDOMNodeInserted';
import NavMenu from '../components/dashboard/NavMenu';
import { useToast } from "@/components/ui/use-toast";
import DeckFormDialog from '../components/deck/DeckFormDialog';
import DeckSearchAndFilter from '../components/deck/DeckSearchAndFilter';
import DeckCard from '../components/deck/DeckCard';
import { Deck } from '../types/deck';
import { Switch } from '@/components/ui/switch';
import { TbArrowsSort } from "react-icons/tb"; // Import the sort icon

const DecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all'); 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null);
  const router = useRouter();
  const { toast } = useToast();
  
  const [isReorderingEnabled, setIsReorderingEnabled] = useState(false);
  
  const fetchDecks = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const response = await fetch(`/api/decks?userId=${session.user.id}&includeFlashcards=true`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch decks');
      }

      const data = await response.json();
      setDecks(data);
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleCreateDeck = async (newDeck: Partial<Deck>) => {
    if (!newDeck.name || !newDeck.description) {
      console.error('Deck name and description are required');
      return;
    }

    if (newDeck.name.length > 20) {
      toast({
        title: "Error",
        description: "Deck name must be 20 characters or less",
        variant: "destructive",
      });
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
      setIsCreateDialogOpen(false);
    } catch (error) {
      console.error('Error creating deck:', error);
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
    }
  };

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
  };

  const handleUpdateDeck = async (updatedDeck: Partial<Deck>) => {
    if (!updatedDeck.id || !updatedDeck.name) {
      console.error('No deck to update or missing name');
      return;
    }
  
    if (updatedDeck.name.length > 20) {
      toast({
        title: "Error",
        description: "Deck name must be 20 characters or less",
        variant: "destructive",
      });
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
      setDecks((prevDecks) => prevDecks.map((deck) => (deck.id === updatedDeckData.id ? updatedDeckData : deck)));
      setEditingDeck(null);
      toast({
        title: "Success",
        description: "Deck updated successfully",
      });
    } catch (error) {
      console.error('Error updating deck:', error);
      toast({
        title: "Error",
        description: "Failed to update deck. Please try again.",
        variant: "destructive",
      });
    }
  };

  const filteredDecks = decks.filter(
    (deck) =>
      deck &&
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTag === 'all' || deck.tags.some(tag => tag.name === selectedTag))
  );

  const uniqueTags = Array.from(new Set(decks.flatMap(deck => deck.tags.map(tag => tag.name))));

  const handleDragEnd = async (result: DropResult) => {
    const { source, destination, draggableId, type } = result;

    if (!destination) {
      return;
    }

    if (source.index === destination.index) {
      return;
    }

    if (type === 'FLASHCARD') {
      const sourceDeckId = source.droppableId;
      const destinationDeckId = destination.droppableId;
      const flashcardId = draggableId;

      try {
        const response = await fetch('/api/flashcards/move', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            flashcardId,
            sourceDeckId,
            destinationDeckId,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to move flashcard');
        }

        // Update the local state to reflect the change
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

        toast({
          title: "Flashcard moved",
          description: "The flashcard has been moved to the new deck successfully.",
        });

      } catch (error) {
        console.error('Error moving flashcard:', error);
        toast({
          title: "Error",
          description: "Failed to move the flashcard. Please try again.",
          variant: "destructive",
        });
      }
    } else if (type === 'DECK' && isReorderingEnabled) {
      const reorderedDecks = Array.from(decks);
      const [movedDeck] = reorderedDecks.splice(source.index, 1);
      reorderedDecks.splice(destination.index, 0, movedDeck);

      // Update the order of the decks
      const updatedDecks = reorderedDecks.map((deck, index) => ({
        ...deck,
        order: index + 1,
      }));

      // Update the local state immediately
      setDecks(updatedDecks);

      try {
        const response = await fetch('/api/decks', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ decks: updatedDecks }),
        });

        if (!response.ok) {
          throw new Error('Failed to update deck order');
        }

        // Optionally, you can update the state again with the response from the server
        // const updatedDecksFromServer = await response.json();
        // setDecks(updatedDecksFromServer);
      } catch (error) {
        console.error('Error updating deck order:', error);
        // Revert the local state if the API call fails
        fetchDecks();
        toast({
          title: "Error",
          description: "Failed to update deck order. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  useDOMNodeInserted((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        console.log('A child node has been added or removed.');
      }
    }
  });

  const handleDeckSelect = (deckId: string) => {
    setSelectedDeckId(deckId);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex">
      <NavMenu/>
      <div className="flex-1 pl-0 sm:pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16">
          <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
            <DeckSearchAndFilter
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              selectedTag={selectedTag}
              setSelectedTag={setSelectedTag}
              uniqueTags={uniqueTags}
              isCreateDialogOpen={isCreateDialogOpen}
              setIsCreateDialogOpen={setIsCreateDialogOpen}
              handleCreateDeck={handleCreateDeck}
            />
            <div className="w-full sm:w-auto flex justify-center sm:justify-start">
              <div className="flex items-center space-x-2 bg-white dark:bg-gray-700 border-2 border-black dark:border-gray-600 shadow-md rounded-lg p-2 h-10 sm:h-12">
                <TbArrowsSort className="text-[#637FBF]" style={{ fontSize: '1.2rem' }} />
                <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Reorder
                </span>
                <Switch
                  checked={isReorderingEnabled}
                  onCheckedChange={setIsReorderingEnabled}
                  className="data-[state=checked]:bg-[#637FBF]"
                />
              </div>
            </div>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="decks" type="DECK">
              {(provided) => (
                <div 
                  {...provided.droppableProps} 
                  ref={provided.innerRef} 
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                >
                  {filteredDecks.map((deck, index) => (
                    deck && deck.id ? (
                      <Draggable key={deck.id} draggableId={deck.id} index={index} isDragDisabled={!isReorderingEnabled}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...(isReorderingEnabled ? provided.dragHandleProps : {})}
                          >
                            <DeckCard
                              deck={deck}
                              isSelected={deck.id === selectedDeckId}
                              onEdit={handleEditDeck}
                              onDelete={handleDeleteDeck}
                            />
                          </div>
                        )}
                      </Draggable>
                    ) : null
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </main>
        <DeckFormDialog
          isOpen={!!editingDeck}
          onClose={() => setEditingDeck(null)}
          onSubmit={handleUpdateDeck}
          initialDeck={editingDeck || undefined}
        />
      </div>
    </div>
  );
};

export default DecksPage;
