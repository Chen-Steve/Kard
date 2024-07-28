"use client";

import '../app/globals.css';
import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

const initialCards: Record<string, { id: string; question: string; answer: string }[]> = {
  list1: [
    { id: '1', question: 'What is React?', answer: 'A JavaScript library for building user interfaces.' },
    { id: '2', question: 'What is Next.js?', answer: 'A React framework for production.' },
  ],
  list2: [
    { id: '3', question: 'What is JSX?', answer: 'A syntax extension for JavaScript used in React.' },
  ],
  list3: [],
};

const HomePage: FC = () => {
  const [cards, setCards] = useState<Record<string, { id: string; question: string; answer: string }[]>>(initialCards);
  const [flipped, setFlipped] = useState<{ [key: string]: boolean }>({});

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;

    const sourceList = Array.from(cards[source.droppableId]);
    const [movedItem] = sourceList.splice(source.index, 1);

    const destinationList = Array.from(cards[destination.droppableId]);
    destinationList.splice(destination.index, 0, movedItem);

    setCards({
      ...cards,
      [source.droppableId]: sourceList,
      [destination.droppableId]: destinationList,
    });
  };

  const handleFlip = (id: string) => {
    setFlipped((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col">
      <header className="w-full text-white p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Kard Logo" width={50} height={50} className="rounded-full" />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">Welcome to Kard</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Elevate your learning experience with custom flashcards. Create, manage, and master your knowledge.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/card" className="bg-white text-blue-600 px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-blue-100 transition duration-300 ease-in-out transform hover:-translate-y-1">
            Create Flashcards
          </Link>
          <Link href="/signup" className="bg-purple-600 text-white px-6 py-3 rounded-full font-semibold shadow-lg hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1">
            Get Started
          </Link>
        </div>

        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="flex space-x-4">
            {Object.keys(cards).map((listId) => (
              <Droppable droppableId={listId} key={listId}>
                {(provided) => (
                  <div
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                    className="bg-white rounded-lg shadow-lg p-4 w-1/3 min-h-[300px]"
                  >
                    {cards[listId].map(({ id, question, answer }, index) => (
                      <Draggable key={id} draggableId={id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="bg-gray-600 text-white rounded-md p-2 mb-2 cursor-pointer"
                            onClick={() => handleFlip(id)}
                          >
                            {flipped[id] ? answer : question}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            ))}
          </div>
        </DragDropContext>
      </main>

      <footer className="w-full text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;