"use client";

import '../app/globals.css';
import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import trackEvent from '@vercel/analytics';
import { RiFeedbackFill } from "react-icons/ri";
import CookieConsent from '../components/CookieConsent';
import { Button } from '../components/ui/Button';
import Image from 'next/image';
import { FaSun } from "react-icons/fa";
import { MdDarkMode } from "react-icons/md"; 
import DragAndDropDemo from '../components/demo/DragAndDropDemo';
import FeaturesSection from '../components/demo/FeaturesSection';
import FlipCard from '../components/demo/FlipCard';

const HomePage: FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check user's preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDarkMode);
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

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
    <div className={`min-h-screen flex flex-col relative ${isDarkMode ? 'bg-[#212121] text-white' : 'bg-white text-black'}`}>
      <header className={`w-full p-6 flex justify-between items-center ${isDarkMode ? 'bg-[#212121]' : 'bg-white'}`}>
        <div className="w-14">
        </div>
        <nav className="flex space-x-20">
          <Link href="/" className={`kard wiggle-effect ${isDarkMode ? 'text-white' : 'text-black'}`}>Kard</Link>
          <div className="inner-nav hover:lighten-effect">
            <Link href="/" className={`nav-item ${isDarkMode ? 'text-white' : 'text-black'}`}>Learn More</Link>
          </div>
        </nav>
        <button 
          onClick={toggleDarkMode} 
          className={`p-3 rounded-full transition-colors duration-200 ${
            isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600 border-2 border-white' : 'bg-gray-200 text-black hover:bg-gray-300 border-2 border-black'
          }`}
          aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <FaSun className="w-6 h-6" /> : <MdDarkMode className="w-6 h-6" />}
        </button>
      </header>

      <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
        <div className="text-center mb-12">
          <h1 className={`text-title font-bold mb-2 mt-16 ${isDarkMode ? 'text-white' : 'text-black'}`}>
            {text}
            <Cursor />
          </h1>
          <p className={`text-xl max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
            A Flashcard App that scales with you.
          </p>
        </div>

        <hr className={`w-1/2 mb-10 ${isDarkMode ? 'border-white' : 'border-black'}`} />

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link href="/signup">
            <Button
              className={`px-6 py-3 rounded-md font-semibold shadow-lg shine-effect transition duration-300 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
              onClick={handleButtonClick}
            >
              Get Started
            </Button>
          </Link>
          <Link href="/signin">
            <Button
              className={`px-6 py-3 rounded-md font-semibold shadow-lg shine-effect transition duration-300 ease-in-out transform hover:-translate-y-1 w-full sm:w-auto ${
                isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-800 hover:bg-gray-700 text-white'
              }`}
            >
              Login
            </Button>
          </Link>
        </div>
      </main>

      {/* New Demo Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className={`text-4xl font-bold text-center mb-12 ${isDarkMode ? 'text-white' : 'text-black'}`}>Experience Kard in Action</h2>
          <div className="relative">
            {/* Drag and Drop Demo */}
            <div className={`backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8 ${isDarkMode ? 'bg-gray-800/30' : 'bg-gray/30'}`}>
              <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Drag & Drop</h3>
              <DragAndDropDemo />
            </div>

            {/* Flashcard Flip Demo */}
            <div className={`backdrop-blur-sm p-6 rounded-lg shadow-lg md:w-3/4 md:ml-auto md:-mt-16 ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'}`}>
              <h3 className={`text-2xl font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-black'}`}>Flashcard</h3>
              <FlipCard
                question="What is the capital of France?"
                answer="Paris"
                isDarkMode={isDarkMode}
              />
            </div>
          </div>

          <FeaturesSection isDarkMode={isDarkMode} />
        </div>
      </section>

      <footer className={`w-full p-6 flex flex-col items-center ${isDarkMode ? 'text-white' : 'text-black'}`}>
        <div className="flex flex-col items-center">
          <div className="flex flex-row items-center mt-2">
            <div className="relative w-12 h-12 sm:w-40 sm:h-40 md:w-60 md:h-60 lg:w-80 lg:h-80 mr-2 sm:mr-4">
              <Image
                src={isDarkMode ? "/wblob.svg" : "/blob.svg"}
                alt="Blob"
                layout="fill"
                objectFit="contain"
              />
            </div>
            <p className="text-3xl sm:text-4xl md:text-5xl lg:text-kard font-bold mr-4 sm:mr-20">KARD</p>
          </div>
          
          <div className="w-full flex justify-end mr-44">
            <p className={`text-sm backdrop-blur-sm p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'}`}>
              <Link href="/privacy">Privacy Policy</Link>
            </p>
            <p className={`text-sm backdrop-blur-sm p-2 rounded-lg ${isDarkMode ? 'bg-gray-800/30' : 'bg-white/30'}`}>
              &copy; Kard {new Date().getFullYear()}
            </p>
          </div>
        </div>
      </footer>

      <button
        className={`fixed bottom-4 right-4 text-md font-bold px-4 py-2 rounded-full shadow-lg transition duration-300 flex items-center ${
          isDarkMode ? 'bg-gray-700 text-white hover:bg-gray-600' : 'bg-background text-foreground hover:bg-gray-200'
        }`}
        onClick={handleSupportClick}
      >
        <RiFeedbackFill className="mr-2" />
        Feedback
      </button>

      <CookieConsent />
    </div>
  );
};

export default HomePage;