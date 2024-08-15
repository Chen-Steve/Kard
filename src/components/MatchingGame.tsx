import '../app/globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { Card, CardContent } from '../components/ui/Card';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

interface MatchingGameProps {
  cards: Flashcard[];
}

interface CardItem {
  id: string;
  type: 'term' | 'definition';
  content: string;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ cards }) => {
  const [shuffledCards, setShuffledCards] = useState<CardItem[]>([]);
  const [selectedCards, setSelectedCards] = useState<CardItem[]>([]);
  const [matchedCards, setMatchedCards] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [shakeCards, setShakeCards] = useState<boolean>(false);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [gameEnded, setGameEnded] = useState<boolean>(false);
  const [records, setRecords] = useState<number[]>([]);

  useEffect(() => {
    const combinedCards: CardItem[] = cards.flatMap(card => [
      { id: card.id, type: 'term', content: card.term },
      { id: card.id, type: 'definition', content: card.definition },
    ]);
    const shuffled = combinedCards.sort(() => Math.random() - 0.5);
    setShuffledCards(shuffled);
  }, [cards]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (gameStarted && !gameEnded) {
      timer = setInterval(() => {
        setTime(prevTime => prevTime + 10);
      }, 10);
    }
    return () => clearInterval(timer);
  }, [gameStarted, gameEnded]);

  const handleCardClick = (card: CardItem) => {
    if (matchedCards.has(card.id)) return;

    if (selectedCards.length === 2) {
      setSelectedCards([card]);
      setShakeCards(false);
    } else {
      setSelectedCards([...selectedCards, card]);
    }

    if (selectedCards.length === 1) {
      setAttempts(attempts + 1);
      const [firstCard] = selectedCards;
      if (firstCard.id === card.id && firstCard.type !== card.type) {
        setMatchedCards(new Set([...matchedCards, card.id]));
        setSelectedCards([]);
        if (matchedCards.size + 1 === cards.length) {
          setGameEnded(true);
          setRecords([...records, time]);
        }
      } else {
        setTimeout(() => {
          setShakeCards(true);
          setTimeout(() => {
            setSelectedCards([]);
            setShakeCards(false);
          }, 1000);
        }, 500);
      }
    }
  };

  const startGame = () => {
    setGameStarted(true);
    setGameEnded(false);
    setMatchedCards(new Set());
    setAttempts(0);
    setTime(0);
  };

  return (
    <div className="container mx-auto p-8 max-w-3xl bg-white dark:bg-black text-black dark:text-gray-200">
      {!gameStarted && !gameEnded && (
        <div className="cover-screen fixed inset-0 bg-gray-100 dark:bg-gray-700 z-50 flex flex-col items-center justify-center">
          <div className="absolute top-40 left-100 bg-gray-100 dark:bg-gray-700">
            <Link href="/dashboard" passHref>
              <span className="text-black dark:text-white hover:text-gray-700 dark:hover:text-gray-400 cursor-pointer flex items-center">
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-4">Ready to play?</h1>
          <p className="text-lg mb-6 text-center px-4">
            Match all the terms with their definitions as fast as you can. Avoid wrong matches, they add extra time!
          </p>
          <button
            onClick={startGame}
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Start game
          </button>
        </div>
      )}
      {gameEnded && (
        <div className="cover-screen fixed inset-0 bg-gray-100 dark:bg-gray-700 z-50 flex flex-col items-center justify-center">
          <div className="absolute top-40 left-100 bg-gray-100 dark:bg-gray-700">
            <Link href="/dashboard" passHref>
              <span className="text-black dark:text-black hover:text-gray-800 dark:hover:text-gray-400 cursor-pointer flex items-center">
                <FaArrowLeft className="mr-2" /> Back to Dashboard
              </span>
            </Link>
          </div>
          <h1 className="text-2xl font-bold mb-4">Game Over</h1>
          <p className="text-lg mb-6">
            Congratulations! You have matched all the terms with their definitions.
          </p>
          <h2 className="text-xl font-bold mb-4">Your time</h2>
          <ul className="mb-6">
            {records.map((record, index) => (
              <li key={index} className="text-lg">
                {formatTime(record)}
              </li>
            ))}
          </ul>
          <button
            onClick={startGame}
            className="bg-blue-500 dark:bg-blue-700 text-white px-4 py-2 rounded"
          >
            Play Again
          </button>
        </div>
      )}
      <div className={`game-content ${gameStarted && !gameEnded ? 'transition-curtain' : ''}`}>
        <div className="mb-4 bg-white dark:bg-gray-700">
          <Link href="/dashboard" passHref>
            <span className="text-black bg-white dark:text-gray-200 dark:bg-black hover:text-gray-600 dark:hover:text-gray-400 cursor-pointer flex items-center">
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </span>
          </Link>
        </div>
        <div className="text-center mb-4">
          <p className="text-lg">Time: {formatTime(time)}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {shuffledCards.map((card, index) => {
            const isSelected = selectedCards.includes(card);
            const isMatched = matchedCards.has(card.id);
            return (
              <div key={index} className="aspect-w-1 aspect-h-1">
                <Card
                  onClick={() => handleCardClick(card)}
                  className={`cursor-pointer transition-colors flex items-center justify-center text-center h-full
                    ${isMatched ? 'bg-green-300 dark:bg-green-500' : 
                    isSelected ? 'bg-blue-100 dark:bg-blue-300' : 
                    'hover:bg-gray-200 dark:hover:bg-gray-400'}
                    ${shakeCards && isSelected ? 'animate-rotate-shake bg-orange-100 dark:bg-orange-300' : ''}`}
                >
                  <CardContent className="p-2 overflow-auto h-full w-full flex items-center justify-center">
                      <div className="text-sm" dangerouslySetInnerHTML={{ __html: card.content }}></div>
                  </CardContent>
                </Card>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60000);
  const seconds = Math.floor((time % 60000) / 1000);
  const milliseconds = time % 1000;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;
};

export default MatchingGame;