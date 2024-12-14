import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import useDOMNodeInserted from '../hooks/useDOMNodeInserted';
import NavMenu from '../components/dashboard/NavMenu';
import DeckFormDialog from '../components/deck/DeckFormDialog';
import DeckSearchAndFilter from '../components/deck/DeckSearchAndFilter';
import DeckList from '../components/deck/DeckList';
import { Deck } from '../types/deck';
import { useDeckOperations } from '../hooks/useDeckOperations';
import { toast } from 'react-hot-toast';

const DecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all'); 
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingDeck, setEditingDeck] = useState<Deck | null>(null);
  const [selectedDeckId] = useState<string | null>(null);
  const router = useRouter();
  
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  
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
      toast.error('Failed to load decks');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const {
    handleCreateDeck,
    handleUpdateDeck,
    handleDeleteDeck,
    handleDragEnd,
  } = useDeckOperations({ 
    decks, 
    setDecks,
    fetchDecks 
  });

  // console.log('Loading:', loading);
  // console.log('Decks:', decks);

  const handleEditDeck = (deck: Deck) => {
    setEditingDeck(deck);
    setIsEditDialogOpen(true);
  };

  const filteredDecks = decks.filter(
    (deck) =>
      deck &&
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTag === 'all' || deck.tags.some(tag => tag.name === selectedTag))
  );

  const uniqueTags = Array.from(new Set(decks.flatMap(deck => deck.tags.map(tag => tag.name))));

  useDOMNodeInserted((mutationsList) => {
    for (const mutation of mutationsList) {
      if (mutation.type === 'childList') {
        // console.log('A child node has been added or removed.');
      }
    }
  });

  const allTags = decks.flatMap(deck => deck.tags)
    .filter((tag, index, self) => 
      index === self.findIndex((t) => t.name === tag.name)
    );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8F7F6] dark:bg-gray-800 flex">
      <NavMenu/>
      <div className="flex-1 pl-0 sm:pl-64">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 mt-16">
          <div className="flex flex-col gap-4">
            {/* Top Controls Row */}
            <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
              {/* Search and Filter */}
              <div className="w-full">
                <DeckSearchAndFilter
                  searchTerm={searchTerm}
                  setSearchTerm={setSearchTerm}
                  selectedTag={selectedTag}
                  setSelectedTag={setSelectedTag}
                  uniqueTags={uniqueTags}
                  isCreateDialogOpen={isCreateDialogOpen}
                  setIsCreateDialogOpen={setIsCreateDialogOpen}
                  handleCreateDeck={handleCreateDeck}
                  existingTags={allTags}
                />
              </div>
            </div>

            {/* Decks Grid */}
            <DeckList
              decks={filteredDecks}
              selectedDeckId={selectedDeckId}
              onDragEnd={handleDragEnd}
              onEdit={handleEditDeck}
              onDelete={handleDeleteDeck}
            />
          </div>
        </main>
        <DeckFormDialog
          isOpen={isCreateDialogOpen}
          onClose={() => setIsCreateDialogOpen(false)}
          onSubmit={handleCreateDeck}
          existingTags={allTags}
        />
        <DeckFormDialog
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingDeck(null);
          }}
          onSubmit={handleUpdateDeck}
          initialDeck={editingDeck || undefined}
          existingTags={allTags}
        />
      </div>
    </div>
  );
};

export default DecksPage;