import { useState, useEffect, useRef } from "react";
import Link from 'next/link';
import { Icon } from "@iconify/react";

interface NavMenuProps {
  onDeckSelect?: (deckId: string) => void;
}

interface IconProps {
  className?: string;
}

const NavMenu: React.FC<NavMenuProps> = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 640;
    }
    return false;
  });
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
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
      className={`fixed ${
        isMobile 
          ? 'bottom-4 left-1/2 -translate-x-1/2'
          : 'left-4 top-1/2 -translate-y-1/2'
      } z-50`}
    >
      <div className={`bg-white dark:bg-gray-800 bg-opacity-10 dark:bg-opacity-30 backdrop-blur-sm rounded-full p-2 sm:p-4 shadow-lg flex border-2 border-black dark:border-gray-600 ${
        isMobile 
          ? 'items-center space-x-3 xs:space-x-4 sm:space-x-6'
          : 'flex-col items-center space-y-4 sm:space-y-6'
      }`}>
        {menuItems.map((item, index) => (
          <NavIcon 
            key={index} 
            href={item.href} 
            icon={item.icon} 
            label={item.label} 
            index={index} 
            hoveredIndex={hoveredIndex} 
            setHoveredIndex={setHoveredIndex} 
            isVertical={!isMobile}
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
  className?: string;
}

const NavIcon: React.FC<NavIconProps> = ({ href, onClick, icon: Icon, label, index, hoveredIndex, setHoveredIndex, isVertical, className }) => {
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