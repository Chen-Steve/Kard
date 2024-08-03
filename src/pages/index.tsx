"use client";

import '../app/globals.css';
import { FC } from 'react';
import Link from 'next/link';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import trackEvent from '@vercel/analytics';
import { RiFeedbackFill } from "react-icons/ri";

const HomePage: FC = () => {
  const handleButtonClick = () => {
    trackEvent.track('button_click', { label: 'Get Started' });
  };

  const handleSupportClick = () => {
    window.open('https://forms.gle/bP14r8vtGhmj8s7S7', '_blank');
  };

  const [text] = useTypewriter({
    words: ['Welcome to Kard', 'Elevate your learning', 'Create, manage, master'],
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 to-purple-500 flex flex-col relative">
      <div className="absolute top-0 left-20 h-full border-l-2 border-black"></div>
      <header className="w-full text-white p-6 flex justify-center items-center">
        <nav className="flex space-x-20">
          <Link href="/" className="kard wiggle-effect">Kard</Link>
          <div className="inner-nav hover:lighten-effect">
            <Link href="/" className="nav-item text-white">Learn More</Link>
          </div>
        </nav>
      </header>

      <hr className="border-t-2 border-black w-full" />

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-black mb-4">
            {text}
            <Cursor />
          </h1>
          <p className="text-xl text-black-100 max-w-2xl mx-auto">
            Elevate your learning experience with custom flashcards. Create, manage, and master your knowledge.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Link href="/signup">
            <div
              className="bg-black text-white px-6 py-3 rounded-full font-semibold shadow-lg shine-effect hover:bg-gray-800 transition duration-300 ease-in-out transform hover:-translate-y-1"
              onClick={handleButtonClick}
            >
              Get Started
            </div>
          </Link>
        </div>
      </main>

      <footer className="w-full text-black p-6 text-center">
        <p>&copy; {new Date().getFullYear()} Kard. All rights reserved.</p>
      </footer>

      <button
        className="fixed bottom-4 right-4 bg-white text-black text-md font-bold px-4 py-2 rounded-full shadow-lg hover:bg-gray-200 transition duration-300 flex items-center"
        onClick={handleSupportClick}
      >
        <RiFeedbackFill className="mr-2" />
        Feedback
      </button>
    </div>
  );
};

export default HomePage;