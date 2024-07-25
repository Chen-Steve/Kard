"use client";

import '../app/globals.css';
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FlashcardContainer from '../demo/demoCardContainer';

const HomePage: FC = () => {
  return (
    <div className="min-h-screen bg-gray-300 flex flex-col items-center justify-center">
      <header className="w-full bg-gray-300 text-black p-4 flex flex-col items-center">
        <Image src="/logo.png" alt="Flashcard App Logo" width={50} height={50} />
      </header>
      <main className="flex-grow flex flex-col items-center justify-center">
        <h2 className="text-2xl font-semibold mt-4">Welcome to Kard!</h2>
        <p className="text-lg text-center mb-8">
          Create and manage your flashcards.
        </p>
        <div className="flex gap-4 mb-8">
          <Link href="/card" legacyBehavior>
            <a className="bg-gray-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-green-700 transition shine-effect">
              Create Flashcards
            </a>
          </Link>
          <Link href="/signup" legacyBehavior>
            <a className="bg-purple-500 text-white px-4 py-2 rounded-md shadow-md hover:bg-purple-700 transition shine-effect">
              Create Account!
            </a>
          </Link>
        </div>
        <h3 className="text-xl font-semibold mb-4">Demo</h3>
        <FlashcardContainer />
      </main>
      <footer className="w-full bg-white-800 text-black p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;