import { useState, useEffect, useRef, useCallback } from "react";
import { FaArrowsAltH } from "react-icons/fa";
import Link from 'next/link';
import { useToast } from "../../components/ui/use-toast";
import { Icon } from "@iconify/react";

interface NavMenuProps {
  onDeckSelect?: (deckId: string) => void;
}

interface IconProps {
  className?: string;
}

const NavMenu: React.FC<NavMenuProps> = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDecks, setShowDecks] = useState(false);
  const [isVertical, setIsVertical] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth >= 640;
    }
    return true;
  });
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [left, setLeft] = useState(0);
  const navRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const dragThreshold = 5;
  const dragStartPos = useRef({ x: 0, moved: false });

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isVertical) {
      setIsDragging(true);
      setStartX(e.clientX - left);
      dragStartPos.current = { x: e.clientX, moved: false };
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
    
    // Check if we've moved past the threshold
    if (Math.abs(e.clientX - dragStartPos.current.x) > dragThreshold) {
      dragStartPos.current.moved = true;
      const newLeft = e.clientX - startX;
      const navWidth = navRef.current?.offsetWidth || 0;
      setLeft(Math.max(navWidth / 2, Math.min(newLeft, window.innerWidth - navWidth / 2)));
    }
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
    const handleOrientationChange = () => {
      setIsVertical(window.innerWidth >= 640);
    };

    window.addEventListener('resize', handleOrientationChange);
    return () => window.removeEventListener('resize', handleOrientationChange);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setLeft(window.innerWidth / 2);
    }
  }, []);

  const menuItems = [
    {
      href: '/dashboard',
      icon: (props: IconProps) => <Icon icon="grommet-icons:home-option" {...props} />,
      label: 'Home',
    },
    {
      href: '/decks',
      icon: (props: IconProps) => <Icon icon="ph:cards-three-bold"  {...props} />,
      label: 'Library',
    },
    {
      href: '/node-map',
      icon: (props: IconProps) => <Icon icon="mingcute:mind-map-line" {...props} />,
      label: 'Mind Map',
    },
    {
      href: '/public-decks',
      icon: (props: IconProps) => <Icon icon="pepicons-pop:people" {...props} />,
      label: 'Public Decks',
    },
  ];

  return (
    <div 
      ref={navRef}
      className={`fixed ${isVertical ? 'left-2 sm:left-4 top-1/2 transform -translate-y-1/2' : 'bottom-1 sm:bottom-4'} z-50`}
      style={{ 
        left: isVertical ? undefined : `${left}px`, 
        transform: isVertical ? 'translateY(-50%)' : 'translateX(-50%)'
      }}
    >
      <div className={`bg-white dark:bg-gray-800 bg-opacity-10 dark:bg-opacity-30 backdrop-blur-sm rounded-full p-2 sm:p-4 shadow-lg flex border-2 border-black dark:border-gray-600 ${
        isVertical 
          ? 'flex-col items-center space-y-4 sm:space-y-6' 
          : 'items-center space-x-3 xs:space-x-4 sm:space-x-6'
      }`}>
        {!isVertical && (
          <div 
            className="absolute inset-x-0 top-0 h-6 cursor-move"
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
          />
        )}
        <NavIcon
          onClick={() => setIsVertical(!isVertical)}
          icon={FaArrowsAltH}
          label={isVertical ? "Switch to Horizontal" : "Switch to Vertical"}
          index={-1}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          isVertical={isVertical}
          className={isVertical ? "" : "-ml-1 sm:-ml-2"}
        />
        {menuItems.map((item, index) => (
          <NavIcon 
            key={index} 
            href={item.href} 
            icon={item.icon} 
            label={item.label} 
            index={index} 
            hoveredIndex={hoveredIndex} 
            setHoveredIndex={setHoveredIndex} 
            isVertical={isVertical}
          />
        ))}
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
  isDragging?: boolean;
  className?: string;
}

const NavIcon: React.FC<NavIconProps> = ({ href, onClick, icon: Icon, label, index, hoveredIndex, setHoveredIndex, isVertical, isDragging, className }) => {
  const isHovered = hoveredIndex === index;

  const content = (
    <div 
      className={`flex flex-col items-center group relative ${className || ''}`}
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <Icon 
        className={`text-4xl xs:text-2xl sm:text-4xl transition-all duration-200 
          ${isHovered ? 'text-gray-600 dark:text-gray-300 scale-125' : 'text-black dark:text-white'}`} 
      />
      <span className={`text-xs xs:text-xs absolute ${
        isVertical 
          ? 'left-full top-1/2 -translate-y-1/2' 
          : '-bottom-5 xs:-bottom-5 sm:-bottom-6 left-1/2 -translate-x-1/2'
      } whitespace-nowrap bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-800 px-1 sm:px-2 py-0.5 sm:py-1 rounded transition-all duration-200 ${
        isHovered ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
      }`}>
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