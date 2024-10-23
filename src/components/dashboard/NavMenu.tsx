import { useState, useEffect, useRef, useCallback } from "react";
import { FaCircleNotch, FaFolder, FaPenNib, FaArrowsAltH } from "react-icons/fa";
import { PiCardsThreeBold } from "react-icons/pi";
import Link from 'next/link';
import supabase from '../../lib/supabaseClient';
import { useToast } from "../../components/ui/use-toast";

interface NavMenuProps {
  onDeckSelect?: (deckId: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDecks, setShowDecks] = useState(false);
  const [isVertical, setIsVertical] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [left, setLeft] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isVertical) {
      setIsDragging(true);
      setStartX(e.clientX - left);
    }
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isVertical) {
      setIsDragging(true);
      setStartX(e.touches[0].clientX - left);
    }
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || isVertical) return;
    const newLeft = e.clientX - startX;
    const navWidth = navRef.current?.offsetWidth || 0;
    setLeft(Math.max(navWidth / 2, Math.min(newLeft, window.innerWidth - navWidth / 2)));
  }, [isDragging, isVertical, startX]);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    if (!isDragging || isVertical) return;
    const newLeft = e.touches[0].clientX - startX;
    const navWidth = navRef.current?.offsetWidth || 0;
    setLeft(Math.max(navWidth / 2, Math.min(newLeft, window.innerWidth - navWidth / 2)));
  }, [isDragging, isVertical, startX]);

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (!isVertical) {
        const navWidth = navRef.current?.offsetWidth || 0;
        setLeft((prevLeft) => Math.max(navWidth / 2, Math.min(prevLeft, window.innerWidth - navWidth / 2)));
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVertical]);

  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('touchmove', handleTouchMove);
    document.addEventListener('touchend', handleTouchEnd);
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleMouseMove, handleTouchMove]);

  useEffect(() => {
    setLeft(window.innerWidth / 2);
  }, []);

  return (
    <div 
      ref={navRef}
      className={`fixed ${isVertical ? 'left-2 sm:left-4 top-1/2 transform -translate-y-1/2' : 'bottom-2 sm:bottom-4'} z-50`}
      style={{ 
        left: isVertical ? undefined : `${left}px`, 
        transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)',
        cursor: isVertical ? 'default' : 'move' 
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
    >
      <div className={`bg-white bg-opacity-10 backdrop-blur-sm rounded-full p-3 sm:p-4 shadow-lg flex border-2 border-black ${isVertical ? 'flex-col items-center space-y-4 sm:space-y-6' : 'items-center space-x-4 sm:space-x-6'}`}>
        <NavIcon
          onClick={() => setIsVertical(!isVertical)}
          icon={FaArrowsAltH}
          label={isVertical ? "Switch to Horizontal" : "Switch to Vertical"}
          index={-1}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          isVertical={isVertical}
        />
        <NavIcon href="/dashboard" icon={FaCircleNotch} label="Home" index={0} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        <NavIcon href="/decks" icon={FaFolder} label="Your Library" index={1} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        <NavIcon href="/public-decks" icon={PiCardsThreeBold} label="Public Decks" index={2} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        <NavIcon href="/DrawingBoardPage" icon={FaPenNib} label="Drawing Board" index={3} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
      </div>
    </div>
  );
};

interface NavIconProps {
  href?: string;
  onClick?: () => void;
  icon: React.ElementType;
  label: string;
  index: number;
  hoveredIndex: number | null;
  setHoveredIndex: (index: number | null) => void;
  isVertical: boolean;
}

const NavIcon: React.FC<NavIconProps> = ({ href, onClick, icon: Icon, label, index, hoveredIndex, setHoveredIndex, isVertical }) => {
  const isHovered = hoveredIndex === index;

  const content = (
    <div 
      className="flex flex-col items-center group relative"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <Icon 
        className={`text-2xl sm:text-3xl transition-all duration-200 
          ${isHovered ? 'text-gray-600 scale-125' : 'text-black'}`} 
      />
      <span className={`text-xs mt-1 absolute ${isVertical ? 'left-full ml-2 top-1/2 -translate-y-1/2' : '-bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2'} whitespace-nowrap bg-gray-800 text-white px-1 sm:px-2 py-0.5 sm:py-1 rounded transition-all duration-200 ${isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
        {label}
      </span>
    </div>
  );

  const commonProps = {
    className: "focus:outline-none",
    onPointerEnter: () => setHoveredIndex(index),
    onPointerLeave: () => setHoveredIndex(null),
  };

  return href ? (
    <Link href={href} {...commonProps}>
      {content}
    </Link>
  ) : (
    <button onClick={onClick} {...commonProps}>
      {content}
    </button>
  );
};

export default NavMenu;
