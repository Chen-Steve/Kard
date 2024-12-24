'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Icon } from '@iconify/react';

interface StatsContainerProps {
  joinedAt: string;
  streak: number;
}

const StatsContainer: React.FC<StatsContainerProps> = ({ joinedAt, streak }) => {
  const [isHovered, setIsHovered] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getMemberDuration = (dateString?: string) => {
    if (!dateString) return null;
    const days = Math.floor((Date.now() - new Date(dateString).getTime()) / (1000 * 60 * 60 * 24));
    return days > 0 ? `${days} days` : 'Less than a day';
  };

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!isHovered) return;

      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = (y - centerY) / 10;
      const rotateY = (centerX - x) / 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.05, 1.05, 1.05)`;
    };

    const handleMouseLeave = () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    };

    card.addEventListener('mousemove', handleMouseMove);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mousemove', handleMouseMove);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [isHovered]);

  return (
    <div
      ref={cardRef}
      className="w-full md:w-1/3 bg-card dark:bg-gray-800 rounded-[2rem] flex flex-col items-center justify-center text-card-foreground dark:text-gray-200 transition-all duration-300 ease-out relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="absolute inset-0 border-4 border-black dark:border-gray-700 rounded-[2rem] pointer-events-none" />
      <div className="absolute top-0 left-0 w-24 h-24 transition-all duration-300 ease-out">
        <Image
          src="/blob.svg"
          alt="Background"
          layout="fill"
          objectFit="cover"
          priority
        />
      </div>
      <div className="flex flex-col items-center justify-center gap-4 transition-all duration-300 ease-out z-20 p-4 rounded-lg text-black dark:text-gray-200">
        <h3 className="text-xl font-bold">Your Stats</h3>
        <div className="space-y-2 text-sm">
          {joinedAt ? (
            <>
              <div className="flex items-center">
                <Icon icon="pepicons-print:calendar" className="mr-2 text-green-300 dark:text-green-400 text-2xl" />
                <span>Joined: {formatDate(joinedAt)}</span>
              </div>
              <div className="flex items-center">
                <Icon icon="pepicons-print:person" className="mr-2 text-blue-300 dark:text-blue-400 text-2xl" />
                <span>Member for: {getMemberDuration(joinedAt)}</span>
              </div>
            </>
          ) : (
            <div className="flex items-center">
              <Icon icon="pepicons-print:question" className="mr-2 text-yellow-300 dark:text-yellow-400 text-2xl" />
              <span>Join date unknown</span>
            </div>
          )}
          <div className="flex items-center">
            <Icon icon="pepicons-print:fire" className="mr-2 text-orange-300 dark:text-orange-400 text-2xl" />
            <span>Current streak: {streak || 0} days</span>
          </div>
        </div>
      </div>
      <div className="absolute bottom-4 right-4 text-xl font-bold text-black dark:text-gray-200">
        KARD
      </div>
    </div>
  );
};

export default StatsContainer;