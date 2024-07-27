"use client";

import '../app/globals.css';
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import FlashcardContainer from '../demo/demoCardContainer';

const HomePage: FC = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col">
      <header className="w-full text-white p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Kard Logo" width={40} height={40} className="rounded-full" />
        </div>
        <nav>
          <Link href="/signin" className="text-white hover:text-blue-200 transition">
            Sign In
          </Link>
        </nav>
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

        <div className="bg-white rounded-lg p-8 max-w-4xl w-full">
          <h2 className="text-3xl font-semibold text-white mb-6 text-center">Try Our Demo</h2>
          <FlashcardContainer />
        </div>
      </main>

      <footer className="w-full text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;
