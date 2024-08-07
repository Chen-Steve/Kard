import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/router';
import supabase from '../lib/supabaseClient';
import Link from 'next/link';
import { ArrowLeft, Trash2, Plus, RefreshCw, Search } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../components/ui/Card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../components/ui/Dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';

interface Deck {
  id: string;
  name: string;
  description: string;
  tags: string[];
}

const DecksPage = () => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [loading, setLoading] = useState(true);
  const [newDeckName, setNewDeckName] = useState('');
  const [newDeckDescription, setNewDeckDescription] = useState('');
  const [newDeckTags, setNewDeckTags] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState<string>('all'); // State for selected tag
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const router = useRouter();

  const fetchDecks = useCallback(async () => {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('decks')
        .select('*')
        .eq('userId', session.user.id);

      if (error) throw error;

      const validDecks = Array.isArray(data) ? data.filter((deck): deck is Deck => deck && deck.id) : [];
      setDecks(validDecks.map(deck => ({ ...deck, tags: deck.tags || [] }))); // Ensure tags is always an array
    } catch (error) {
      console.error('Error fetching decks:', error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleCreateDeck = async () => {
    if (!newDeckName || !newDeckDescription) {
      console.error('Deck name and description are required');
      return;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      console.error('Session error:', sessionError || 'No session found');
      router.push('/signin');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('decks')
        .insert([{ name: newDeckName, description: newDeckDescription, userId: session.user.id, tags: newDeckTags }])
        .select()
        .single();

      if (error) throw error;

      setDecks((prevDecks) => [...prevDecks, { ...data, tags: data.tags || [] }]); // Ensure tags is always an array
      setNewDeckName('');
      setNewDeckDescription('');
      setNewDeckTags([]);
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
      const { error } = await supabase
        .from('decks')
        .delete()
        .eq('id', deckId)
        .eq('userId', session.user.id);

      if (error) throw error;

      setDecks((prevDecks) => prevDecks.filter((deck) => deck.id !== deckId));
    } catch (error) {
      console.error('Error deleting deck:', error);
    }
  };

  const filteredDecks = decks.filter(
    (deck) => 
      deck && 
      deck.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (selectedTag === 'all' || deck.tags.includes(selectedTag)) // Filter by selected tag
  );

  const uniqueTags = Array.from(new Set(decks.flatMap(deck => deck.tags))); // Get unique tags

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-800">
      <header className="bg-gray dark:bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100">
            <ArrowLeft className="h-6 w-6" />
          </Link>
          <h1 className="text-2xl font-light text-[#39594D] dark:text-[#F7F7F7]">My Decks</h1>
          <div className="flex space-x-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline"><Plus className="h-4 w-4 mr-2" /> Create Deck</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Deck</DialogTitle>
                  <DialogDescription>Add a new deck to your collection.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <Input
                    placeholder="Deck Name"
                    value={newDeckName}
                    onChange={(e) => setNewDeckName(e.target.value)}
                  />
                  <Input
                    placeholder="Deck Description"
                    value={newDeckDescription}
                    onChange={(e) => setNewDeckDescription(e.target.value)}
                  />
                  <Input
                    placeholder="Tags (comma separated)"
                    value={newDeckTags.join(',')}
                    onChange={(e) => setNewDeckTags(e.target.value.split(',').map(tag => tag.trim()))}
                  />
                </div>
                <DialogFooter>
                  <Button onClick={handleCreateDeck}>Create Deck</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            <Button variant="outline" onClick={fetchDecks}>
              <RefreshCw className="h-4 w-4 mr-2" /> Refresh
            </Button>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-white" />
            <Input
              type="text"
              placeholder="Search Decks"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="mt-4">
            <Select onValueChange={setSelectedTag}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Filter by Tag" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Tags</SelectItem> {/* Use "all" instead of empty string */}
                {uniqueTags.map(tag => (
                  <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {filteredDecks.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">No decks found. Create a new deck to get started.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDecks.map((deck) => (
              deck && deck.id ? (
                <Card key={deck.id} className="hover:shadow-lg transition-shadow duration-300 bg-white dark:bg-gray-700">
                  <CardHeader>
                    <CardTitle className="text-black dark:text-gray-100">{deck.name}</CardTitle>
                    <CardDescription className="text-gray-600 dark:text-gray-400">
                      {deck.description}
                    </CardDescription>
                    <div className="mt-2">
                      {deck.tags.map((tag) => (
                        <span key={tag} className="inline-block bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-xs px-2 py-1 rounded mr-2">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </CardHeader>
                  <CardContent className="flex justify-between items-center">
                    <Link href={`/decks/${deck.id}`}>
                      <Button variant="outline" className="text-black dark:text-gray-200">View Deck</Button>
                    </Link>
                    <Button
                      variant="ghost"
                      onClick={() => handleDeleteDeck(deck.id)}
                      className="text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              ) : null
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default DecksPage;