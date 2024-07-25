import React, { useState } from 'react';
import styled from 'styled-components';
import { DndContext, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

interface Flashcard {
  id: number;
  question: string;
  answer: string;
  order: number;
}

interface Deck {
  id: number;
  name: string;
  flashcards: Flashcard[];
}

interface DeckManagerProps {
  decks: Deck[];
  onDeckSelect: (deckId: number | null) => void;
  setDecks: React.Dispatch<React.SetStateAction<Deck[]>>;
}

const DeckManager: React.FC<DeckManagerProps> = ({ decks, onDeckSelect, setDecks }) => {
  const [newDeckName, setNewDeckName] = useState('');

  const handleAddDeck = async () => {
    if (newDeckName.trim() !== '') {
      const newDeck = { id: Date.now(), name: newDeckName, flashcards: [] };
      await fetch('/decks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDeck)
      });
      setNewDeckName('');
      setDecks((prevDecks) => [...prevDecks, newDeck]);
      onDeckSelect(newDeck.id);
    }
  };

  const handleDeleteDeck = async (id: number) => {
    await fetch(`/decks/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' }
    });
    setDecks((prevDecks) => prevDecks.filter(deck => deck.id !== id));
    onDeckSelect(null);
  };

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      const oldIndex = decks.findIndex(deck => deck.id === active.id);
      const newIndex = decks.findIndex(deck => deck.id === over.id);
      setDecks(arrayMove(decks, oldIndex, newIndex));
    }
  };

  return (
    <Container>
      <Title>Deck Manager</Title>
      <AddDeckContainer>
        <DeckInput
          value={newDeckName}
          onChange={(e) => setNewDeckName(e.target.value)}
          placeholder="New deck name"
        />
        <AddDeckButton onClick={handleAddDeck}>Add Deck</AddDeckButton>
      </AddDeckContainer>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={decks.map(deck => deck.id)} strategy={verticalListSortingStrategy}>
          <DeckList>
            {decks.map((deck) => (
              <SortableItem key={deck.id} id={deck.id}>
                <DeckCard onClick={() => onDeckSelect(deck.id)}>
                  <DeckName>{deck.name}</DeckName>
                  <DeleteButton onClick={() => handleDeleteDeck(deck.id)}>🗑️</DeleteButton>
                </DeckCard>
              </SortableItem>
            ))}
          </DeckList>
        </SortableContext>
      </DndContext>
    </Container>
  );
};

export default DeckManager;

const Container = styled.div`
  margin: 2rem;
  padding: 2rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: #f9f9f9;
`;

const Title = styled.h1`
  font-size: 2rem;
  font-weight: bold;
  margin-bottom: 1rem;
`;

const AddDeckContainer = styled.div`
  display: flex;
  margin-bottom: 1rem;
`;

const DeckInput = styled.input`
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
  margin-right: 0.5rem;
  border: 1px solid #ccc;
  border-radius: 4px;
`;

const AddDeckButton = styled.button`
  padding: 0.5rem 1rem;
  font-size: 1rem;
  border: none;
  background-color: #007bff;
  color: white;
  border-radius: 4px;
  cursor: pointer;
`;

const DeckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const DeckCard = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 4px;
  background-color: white;
  cursor: pointer;
`;

const DeckName = styled.span`
  font-size: 1.25rem;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: red;
  cursor: pointer;
  font-size: 1.25rem;
`;