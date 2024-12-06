"use client";

import '../app/globals.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import CookieConsent from '../components/CookieConsent';
import { Button } from '../components/ui/Button';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import FeaturesSection from '../components/demo/FeaturesSection';
import Modal from '../components/EmailModal';
import EmailForm from '../components/EmailForm';
import Bubbles from '../components/demo/Bubbles';
import { Icon } from '@iconify/react';

const DynamicDragAndDropDemo = dynamic(() => import('../components/demo/DragAndDropDemo'), {
  ssr: false,
  loading: () => <p>Loading drag and drop demo...</p>
});

const HomePage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [navHeight, setNavHeight] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      router.replace('/dashboard');
    }
  }, [status, router]);

  useEffect(() => {
    setIsMounted(true);
    setIsMobile(window.innerWidth <= 767);
    const handleResize = () => setIsMobile(window.innerWidth <= 767);
    window.addEventListener('resize', handleResize);

    const updateNavHeight = () => {
      if (navRef.current) {
        setNavHeight(navRef.current.offsetHeight);
      }
    };

    updateNavHeight();
    window.addEventListener('resize', updateNavHeight);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', updateNavHeight);
    };
  }, []);

  const handleSupportClick = () => {
    window.open('https://forms.gle/bP14r8vtGhmj8s7S7', '_blank');
  };

  const handleLearnMoreClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsModalOpen(true);
  }, []);

  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <>
      <div className={`min-h-screen flex flex-col relative bg-[#F8F7F6] text-black overflow-hidden ${isMounted && !isMobile ? 'cursor-none' : ''}`}>
        {isMounted && <Bubbles />}
        
        <header className="w-full fixed top-0 left-0 right-0 z-50 px-4 py-2">
          <nav ref={navRef} className="flex justify-center items-center py-2 px-6 max-w-7xl mx-auto">
            <Link 
              href="/" 
              className="kard wiggle-effect text-black mr-10" 
            >
              Kard
            </Link>
            <div className="inner-nav hover:lighten-effect">
              <a 
                href="#" 
                className="nav-item text-black px-4 py-2 rounded-full" 
                onClick={handleLearnMoreClick}
              >
                Learn More
              </a>
            </div>
          </nav>
        </header>

        <div style={{ height: `${navHeight}px` }} />

        <main className="flex-grow flex flex-col items-center justify-center px-4 py-12">
          <div className="text-center mb-12 fixed-title">
            <h1 className="font-bold mb-2 mt-20 text-black text-6xl md:text-5xl lg:text-6xl">
              Study how you want
            </h1>
            <p className="max-w-2xl mx-auto text-gray-900 text-base md:text-xl mt-4">
              A Flashcard App that scales with you.
            </p>
          </div>

          <hr className="w-1/2 mb-10 border-black" />

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/signin">
              <Button
                className="px-6 py-3 rounded-md font-semibold w-full sm:w-auto bg-white text-black relative overflow-hidden transition-all duration-200 ease-out hover:-translate-y-0.5 hover:translate-x-0.5 active:translate-y-0 active:translate-x-0 shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:bg-gray-100"
              >
                <span className="text-lg relative z-10">Get Started</span>
              </Button>
            </Link>
          </div>
        </main>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-[90vw]">
            <h2 className="text-2xl sm:text-4xl font-bold text-center mb-12 text-black">Experience Kard in Action</h2>
            <h3 className="text-xl sm:text-4xl font-semibold mb-4 text-black text-center underline">Drag & Drop</h3>
            <DynamicDragAndDropDemo />
            <FeaturesSection />
          </div>
        </section>

        <footer className="w-full py-20 px-6 bg-[#F8F7F6] text-black overflow-hidden">
          <div className="container mx-auto max-w-[100vw]">
            <div className="flex flex-col">
              <div className="w-full flex items-center justify-center">
                <h2 className="text-[32vw] sm:text-[32vw] font-bold leading-none">
                  KARD
                </h2>
              </div>
              
              <div className="flex flex-row items-center justify-center gap-4 sm:gap-6 mt-8 sm:mt-12">
                <div className="relative w-8 h-8 sm:w-10 sm:h-10">
                  <Image
                    src="/blob.svg"
                    alt="Kard Logo"
                    fill
                    priority
                    className="object-contain"
                  />
                </div>
                <Link 
                  href="/privacy" 
                  className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm rounded-lg bg-white/30 hover:bg-white/40 transition-colors"
                >
                  Privacy Policy
                </Link>
                <span className="text-xs sm:text-sm px-3 py-1.5 sm:px-4 sm:py-2 backdrop-blur-sm rounded-lg bg-white/30">
                  &copy; Kard {new Date().getFullYear()}
                </span>
              </div>
            </div>
          </div>
        </footer>

        <div className="fixed bottom-0 left-0 right-0 p-4 flex justify-between items-center bg-transparent">
          <div className="flex-grow"></div>
          <button
            className="text-md font-bold px-3 py-3 sm:px-4 sm:py-2 rounded-full shadow-lg transition duration-300 flex items-center bg-background text-foreground hover:bg-gray-200"
            onClick={handleSupportClick}
          >
            <Icon icon="ri:feedback-fill" className="text-xl sm:text-base sm:mr-2" />
            <span className="hidden sm:inline">Feedback</span>
          </button>
        </div>

        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
          <EmailForm />
        </Modal>

        <CookieConsent />
      </div>
    </>
  );
};

export default HomePage;