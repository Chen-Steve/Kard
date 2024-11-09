import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import Link from 'next/link';
import { IoMdStar, IoMdStarOutline } from "react-icons/io";
import { FaCopy } from 'react-icons/fa';

interface PublicDeck {
  id: string;
  name: string;
  description: string;
  userId: string;
  user: {
    name: string;
  };
  _count: {
    stars: number;
  };
  isStarred: boolean;
}
interface DeckCardProps {
  deck: PublicDeck;
  onStarClick: (deckId: string) => void;
  onCopyClick: () => void;
}

const DeckCard: React.FC<DeckCardProps> = ({ deck, onStarClick, onCopyClick }) => {
  return (
    <Card className="bg-white dark:bg-gray-700 relative">
      <div 
        className="absolute top-2 right-2 cursor-pointer text-2xl"
        onClick={() => onStarClick(deck.id)}
      >
        {deck.isStarred ? (
          <IoMdStar className="text-yellow-500" />
        ) : (
          <IoMdStarOutline className="text-gray-400 hover:text-yellow-500" />
        )}
      </div>
      <CardHeader>
        <CardTitle className="text-lg md:text-xl text-black dark:text-gray-100">{deck.name}</CardTitle>
        <CardDescription className="text-sm text-gray-600 dark:text-gray-400">
          {deck.description}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400 mb-2">Created by: {deck.user.name}</p>
        <div className="flex justify-between items-center mb-2">
          <Button variant="outline" className="text-yellow-500">
            <IoMdStar className="mr-2" />
            {deck._count?.stars || 0} {(deck._count?.stars || 0) === 1 ? 'Star' : 'Stars'}
          </Button>
          <Button variant="outline" className="text-black dark:text-gray-200" onClick={onCopyClick}>
            <FaCopy className="mr-2" />
            Copy Deck
          </Button>
        </div>
        <Link href={`/public-decks/${deck.id}`}>
          <Button variant="outline" className="w-full text-black dark:text-gray-200">View Public Deck</Button>
        </Link>
      </CardContent>
    </Card>
  );
};

export default DeckCard; 