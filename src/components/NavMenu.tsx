import { useState, useEffect } from "react";
import { FaCircleNotch, FaFolder, FaRegFolder, FaPenNib, FaEllipsisH, FaArrowsAltH } from "react-icons/fa";
import Link from 'next/link';
import supabase from '../lib/supabaseClient';

interface Deck {
  id: string;
  name: string;
  description?: string;
}

interface NavMenuProps {
  onDeckSelect: (deckId: string) => void;
}

const NavMenu: React.FC<NavMenuProps> = ({ onDeckSelect }) => {
  const [decks, setDecks] = useState<Deck[]>([]);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [showDecks, setShowDecks] = useState(false);
  const [isVertical, setIsVertical] = useState(false);

  useEffect(() => {
    const fetchDecks = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data, error } = await supabase.from('decks').select('*').eq('userId', session.user.id);
        if (error) {
          console.error('Error fetching decks:', error);
        } else {
          setDecks(data);
        }
      }
    };

    fetchDecks();
  }, []);

  return (
    <div className={`fixed ${isVertical ? 'left-2 sm:left-4 top-1/2 transform -translate-y-1/2' : 'bottom-2 sm:bottom-4 left-1/2 transform -translate-x-1/2'} z-50`}>
      <div className={`bg-white bg-opacity-20 backdrop-blur-lg rounded-full p-1 sm:p-2 shadow-lg flex ${isVertical ? 'flex-col items-center space-y-1 sm:space-y-2' : 'items-center space-x-1 sm:space-x-2'}`}>
        {isVertical && (
          <NavIcon
            onClick={() => setIsVertical(!isVertical)}
            icon={FaArrowsAltH}
            label="Toggle View"
            index={-1}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            isVertical={isVertical}
          />
        )}
        {!isVertical && (
          <NavIcon
            onClick={() => setIsVertical(!isVertical)}
            icon={FaArrowsAltH}
            label="Toggle View"
            index={-1}
            hoveredIndex={hoveredIndex}
            setHoveredIndex={setHoveredIndex}
            isVertical={isVertical}
          />
        )}
        <NavIcon href="/dashboard" icon={FaCircleNotch} label="Home" index={0} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        <NavIcon href="/decks" icon={FaFolder} label="Your Library" index={1} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        <NavIcon href="/public-decks" icon={FaRegFolder} label="Public Decks" index={2} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        <NavIcon href="/DrawingBoardPage" icon={FaPenNib} label="Drawing Board" index={3} hoveredIndex={hoveredIndex} setHoveredIndex={setHoveredIndex} isVertical={isVertical} />
        
        {isVertical ? <div className="w-6 sm:w-8 h-px bg-gray-300 my-1 sm:my-2"></div> : <div className="h-6 sm:h-8 w-px bg-gray-300 mx-1 sm:mx-2"></div>}
        
        <NavIcon
          onClick={() => setShowDecks(!showDecks)}
          icon={FaEllipsisH}
          label={showDecks ? "Hide Decks" : "Load Decks"}
          index={4}
          hoveredIndex={hoveredIndex}
          setHoveredIndex={setHoveredIndex}
          isVertical={isVertical}
        />
        
        {showDecks && decks.map((deck, index) => (
          <NavIcon
            key={deck.id}
            onClick={() => onDeckSelect(deck.id)}
            icon={FaFolder}
            label={deck.name}
            index={index + 5}
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
}

const NavIcon: React.FC<NavIconProps> = ({ href, onClick, icon: Icon, label, index, hoveredIndex, setHoveredIndex, isVertical }) => {
  const isHovered = hoveredIndex === index;

  const content = (
    <div 
      className="flex flex-col items-center group relative"
      onMouseEnter={() => setHoveredIndex(index)}
      onMouseLeave={() => setHoveredIndex(null)}
    >
      <div className={`p-2 sm:p-3 rounded-full bg-white bg-opacity-50 transition-all duration-200 transform ${isHovered ? 'scale-110 sm:scale-125 bg-opacity-100' : ''}`}>
        <Icon className={`text-lg sm:text-2xl ${isHovered ? 'text-blue-600' : 'text-gray-800'}`} />
      </div>
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