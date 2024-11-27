import React, { useState, useRef, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { generateAIResponse, Message } from '../../lib/openai';
import Link from 'next/link';
import { Icon } from '@iconify/react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import { marked } from 'marked';

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

// Add a constant for maximum history length
const MAX_HISTORY_LENGTH = 20;

// Add this helper function near the top of the component
const parseMarkdown = (content: string) => {
  return marked.parse(content, { async: false }) as string;
};

const AIChatComponent: React.FC<AIChatComponentProps> = ({ 
  flashcards, 
  decks, 
  selectedDeckId, 
  onDeckChange
}) => {
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
        // Only set initial message if messages array is empty
        if (messages.length === 0) {
          const initialMessage: Message = {
            role: 'assistant',
            content: `How can I help you learn about ${selectedDeck.name}?`
          };
          setMessages([initialMessage]);
        }
      }
    }
  }, [selectedDeckId, decks, messages.length]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = { role: 'user', content: input };
    
    // Keep track of conversation context
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      // Pass the entire conversation history to the AI
      const aiResponse = await generateAIResponse(
        input, 
        flashcards,
        // Only send the last MAX_HISTORY_LENGTH messages to stay within token limits
        updatedMessages.slice(-MAX_HISTORY_LENGTH)
      );
      const aiMessage: Message = { role: 'assistant', content: aiResponse };
      setMessages(prev => [...prev, aiMessage]);
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

  const handleDeckChange = (deckId: string) => {
    setMessages([]); // Reset messages when deck changes
    onDeckChange(deckId);
  };

  return (
    <div className="flex flex-col items-center max-w-full h-[85vh] bg-white dark:bg-gray-800 dark:text-white">
      <div className="w-full max-w-2xl flex flex-col h-full">
        <div className="mb-4 w-full flex justify-between items-center">
          <Link href="/dashboard">
            <Button className="px-2 py-2 dark:bg-gray-700 dark:text-white">
              <Icon icon="pepicons-print:arrow-left" className="text-3xl" />
            </Button>
          </Link>
          <Select value={selectedDeckId || ''} onValueChange={handleDeckChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select a deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((deck) => (
                <SelectItem key={deck.id} value={deck.id}>
                  {deck.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex-grow overflow-auto mb-4 p-4 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700">
          {messages.map((message, index) => (
            <div key={index} className={`mb-4 ${message.role === 'user' ? 'text-right' : 'text-left'}`}>
              <span className={`inline-block p-2 rounded-lg max-w-[80%] ${
                message.role === 'user' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-200 dark:bg-gray-600 text-black dark:text-white'
              }`}>
                {message.role === 'user' ? (
                  message.content
                ) : (
                  <div dangerouslySetInnerHTML={{ __html: parseMarkdown(message.content) }} />
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
            className="px-4 py-6 text-lg dark:bg-gray-700 dark:text-white"
          >
            {isLoading ? 'Thinking...' : 'Send'}
          </Button>
        </form>
      </div>
    </div>
  );
};

export default AIChatComponent;