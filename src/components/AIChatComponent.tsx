import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { generateAIResponse, Message } from '../lib/openai';
import Markdown from 'markdown-to-jsx';

interface Flashcard {
  id: string;
  question: string;
  answer: string;
}

interface Deck {
  id: string;
  name: string;
}

interface AIChatComponentProps {
  flashcards: Flashcard[];
  decks: Deck[];
  selectedDeckId: string | null;
  onDeckChange: (deckId: string) => void;
}

const AIChatComponent: React.FC<AIChatComponentProps> = ({ flashcards, decks, selectedDeckId, onDeckChange }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    if (selectedDeckId) {
      const selectedDeck = decks.find(deck => deck.id === selectedDeckId);
      if (selectedDeck) {
        const initialMessage: Message = {
          role: 'assistant',
          content: `How can I help you learn about ${selectedDeck.name}?`
        };
        setMessages([initialMessage]);
      }
    }
  }, [selectedDeckId, decks]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const aiResponse = await generateAIResponse(input, flashcards, messages);
      const aiMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prevMessages => [...prevMessages, aiMessage]);
    } catch (error) {
      console.error('Error in AI chat:', error);
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      
      if (error instanceof Error && error.message === 'INAPPROPRIATE_CONTENT') {
        errorMessage = "I'm sorry, but I can't respond to that kind of language or content. Please try rephrasing your message in a more appropriate way.";
      }
      
      setMessages(prevMessages => [...prevMessages, { role: 'assistant', content: errorMessage }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col max-w-full h-[85vh] bg-white dark:bg-gray-800 dark:text-white">
      <div className="mb-4">
        <select
          title="Select a deck"
          value={selectedDeckId || ''}
          onChange={(e) => onDeckChange(e.target.value)}
          className="w-full max-w-xs p-2 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:border-white dark:border dark:text-white"
        >
          <option value="">Select a deck</option>
          {decks.map((deck) => (
            <option key={deck.id} value={deck.id}>
              {deck.name}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-grow overflow-auto mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:border-white dark:border">
        {messages.map((message, index) => (
          <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
            <span className={`inline-block p-2 rounded-lg ${message.role === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white'}`}>
              {message.role === 'user' ? (
                message.content
              ) : (
                <Markdown>{message.content}</Markdown>
              )}
            </span>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="flex space-x-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-grow p-3 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
          placeholder="Ask about your flashcards..."
        />
        <Button 
          type="submit" 
          disabled={isLoading || !selectedDeckId} 
          className="px-6 py-6 text-base font-medium dark:bg-gray-700 dark:text-white"
        >
          {isLoading ? 'Thinking...' : 'Send'}
        </Button>
      </form>
    </div>
  );
};

export default AIChatComponent;