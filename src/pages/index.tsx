"use client";

import '../app/globals.css';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useTypewriter, Cursor } from 'react-simple-typewriter';
import trackEvent from '@vercel/analytics';
import { RiFeedbackFill } from "react-icons/ri";
import CookieConsent from '../components/CookieConsent';
import { Button } from '../components/ui/Button';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import FlipCard from '../components/demo/FlipCard';
import FeaturesSection from '../components/demo/FeaturesSection';
import Head from 'next/head';
import { initCursor, updateCursor, customCursorStyle } from 'ipad-cursor';
import Modal from '../components/EmailModal';
import EmailForm from '../components/EmailForm';
import { useSpring, animated } from '@react-spring/web';
import BubbleBackground from '../components/demo/BubbleBackground';

const DynamicDragAndDropDemo = dynamic(() => import('../components/demo/DragAndDropDemo'), {
  ssr: false,
  loading: () => <p>Loading...</p>
});

const HomePage: React.FC = () => {
  const [isNavSticky, setIsNavSticky] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const demoRef = useRef(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  const bubbleProps = [
    useSpring({
      opacity: scrollY / 300,
      transform: `translate3d(${Math.sin(scrollY / 100) * 50}px, ${Math.min(scrollY / 3, 200)}px, 0) scale(${1 + scrollY / 2000})`,
    }),
    useSpring({
      opacity: scrollY / 400,
      transform: `translate3d(${Math.sin(scrollY / 90) * 30}px, ${Math.min(scrollY / 2.5, 250)}px, 0) scale(${1 + scrollY / 1800})`,
    }),
    useSpring({
      opacity: scrollY / 500,
      transform: `translate3d(${Math.sin(scrollY / 110) * 40}px, ${Math.min(scrollY / 3.5, 180)}px, 0) scale(${1 + scrollY / 2200})`,
    }),
  ];

  useEffect(() => {
    if (typeof window !== 'undefined') {
      initCursor({
        normalStyle: { 
          background: 'rgba(255, 255, 255, 0.3)',
          border: '2px solid black'
        },
        textStyle: { 
          background: 'rgba(255, 255, 255, 0.5)',
          border: '2px solid black'
        },
        blockStyle: { 
          background: 'rgba(255, 255, 255, 0.2)',
          radius: 'auto',
          border: '2px solid black'
        },
      });
      updateCursor();
    }

    const handleScroll = () => {
      if (navRef.current) {
        const navTop = navRef.current.getBoundingClientRect().top;
        setIsNavSticky(navTop <= 0);
      }
      setScrollY(window.scrollY);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const currentDemoRef = demoRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );

    if (currentDemoRef) {
      observer.observe(currentDemoRef);
    }

    return () => {
      if (currentDemoRef) {
        observer.unobserve(currentDemoRef);
      }
    };
  }, []);

  const handleButtonClick = () => {
    trackEvent.track('button_click', { label: 'Get Started' });
  };

  const handleSupportClick = () => {
    window.open('https://forms.gle/bP14r8vtGhmj8s7S7', '_blank');
  };

  const handleLearnMoreClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  };

  const [text] = useTypewriter({
    words: ['Kard is a Quizlet Alternative', 'But better', ''],
    loop: true,
    delaySpeed: 2000,
  });

  return (
    <>
      <Head>
        <title>Kard - A Better Quizlet Alternative</title>
      </Head>
      <div className="min-h-screen flex flex-col relative bg-[#F8F7F6] text-black overflow-hidden">
        <BubbleBackground scrollY={scrollY} />
        
        <header className="w-full p-6 bg-transparent backdrop-blur-sm" data-cursor-ignore>
          <div 
            ref={navRef}
            className={`${isNavSticky ? 'fixed top-0 left-0 right-0 z-10 py-4 px-6 bg-transparent backdrop-blur-sm' : ''}`}
          >
            <nav className={`flex justify-center items-center max-w-7xl mx-auto`}>
              <Link 
                href="/" 
                className="kard wiggle-effect text-black mr-10" 
                data-cursor="text"
              >
                Kard
              </Link>
              <div className="inner-nav hover:lighten-effect">
                <a 
                  href="#" 
                  className="nav-item text-black px-4 py-2 rounded-full" 
                  data-cursor="block"
                  onClick={handleLearnMoreClick}
                >
                  Learn More
                </a>
              </div>
            </nav>
          </div>
        </header>

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center mb-12" data-cursor="text">
            <h1 className="text-title font-bold mb-2 mt-20 text-black">
              {text}
              <Cursor />
            </h1>
            <p className="text-xl max-w-2xl mx-auto text-gray-900">
              A Flashcard App that scales with you.
            </p>
          </div>

          <hr className="w-1/2 mb-10 border-black" />

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/signup">
              <Button
                className="px-4 py-3 rounded-md font-semibold shadow-lg shine-effect w-full sm:w-auto bg-gray-800 hover:bg-gray-700 text-white"
                onClick={handleButtonClick}
                data-cursor="block"
              >
                <span className="text-lg">Get Started</span>
              </Button>
            </Link>
            <Link href="/signin">
              <Button
                className="px-6 py-3 rounded-md font-semibold shadow-lg shine-effect w-full sm:w-auto bg-white hover:bg-gray-100 text-black border-2 border-black"
                data-cursor="block"
              >
                <span className="text-lg">Login</span>
              </Button>
            </Link>
          </div>
        </main>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <h2 className="text-4xl font-bold text-center mb-12 text-black">Experience Kard in Action</h2>
            <div className="relative">
              <div ref={demoRef}>
                {isVisible && (
                  <div className="backdrop-blur-sm p-6 rounded-lg shadow-lg mb-8 bg-gray/30">
                    <h3 className="text-2xl font-semibold mb-4 text-black">Drag & Drop</h3>
                    <DynamicDragAndDropDemo />
                  </div>
                )}
              </div>

              <div className="backdrop-blur-sm p-6 rounded-lg shadow-lg md:w-3/4 md:ml-auto md:-mt-16 bg-white/30">
                <h3 className="text-2xl font-semibold mb-4 text-black">Flashcard</h3>
                <FlipCard
                  question="What is the capital of France?"
                  answer="Paris"
                />
              </div>
            </div>

            <FeaturesSection />
          </div>
        </section>

        <footer className="w-full p-6 flex flex-col items-center text-black" data-cursor="text">
          <div className="flex flex-col items-center">
            <div className="flex flex-row items-center mt-2">
              <div className="relative w-12 h-12 sm:w-40 sm:h-40 md:w-60 md:h-60 lg:w-80 lg:h-80 mr-2 sm:mr-4">
                <Image
                  src="/blob.svg"
                  alt="Blob"
                  fill
                  style={{ objectFit: 'contain' }}
                />
              </div>
              <p className="text-3xl sm:text-4xl md:text-5xl lg:text-kard font-bold mr-4 sm:mr-20">KARD</p>
            </div>
            
            <div className="w-full flex justify-end mr-44">
              <p className="text-sm backdrop-blur-sm p-2 rounded-lg bg-white/30">
                <Link href="/privacy">Privacy Policy</Link>
              </p>
              <p className="text-sm backdrop-blur-sm p-2 rounded-lg bg-white/30">
                &copy; Kard {new Date().getFullYear()}
              </p>
            </div>
          </div>
        </footer>

        <button
          className="fixed bottom-4 right-4 text-md font-bold px-4 py-2 rounded-full shadow-lg transition duration-300 flex items-center bg-background text-foreground hover:bg-gray-200"
          onClick={handleSupportClick}
          data-cursor="block"
        >
          <RiFeedbackFill className="mr-2" />
          Feedback
        </button>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <EmailForm />
        </Modal>

        <CookieConsent />
      </div>
    </>
  );
};

export default HomePage;