"use client";

import '../app/globals.css';
import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import trackEvent from '@vercel/analytics';

const HomePage: FC = () => {
  const handleButtonClick = () => {
    trackEvent.track('button_click', { label: 'Get Started' });
  };

  const [text] = useTypewriter({
    words: ['Welcome to Kard', 'Elevate your learning', 'Create, manage, master'],
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col">
      <header className="w-full text-white p-6 flex justify-between items-center">
        <div className="flex items-center space-x-2">
          <Image src="/logo.png" alt="Kard Logo" width={50} height={50} className="rounded-full wiggle-effect" />
        </div>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            {text}
            <Cursor />
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            Elevate your learning experience with custom flashcards. Create, manage, and master your knowledge.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/signup">
            <div
              className="bg-purple-600 text-white px-6 py-3 rounded-md font-semibold shadow-lg shine-effect hover:bg-purple-700 transition duration-300 ease-in-out transform hover:-translate-y-1"
              onClick={handleButtonClick}
            >
              Get Started
            </div>
          </Link>
        </div>
      </main>

      <footer className="w-full text-white p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default HomePage;