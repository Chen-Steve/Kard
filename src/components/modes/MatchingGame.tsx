import '../../app/globals.css';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaArrowLeft, FaPlay, FaInfoCircle } from 'react-icons/fa';
import { Card, CardContent } from '../../components/ui/Card';
import Markdown from 'markdown-to-jsx';

interface Flashcard {
  id: string;
  term: string;
  definition: string;
}

interface MatchingGameProps {
  cards: Flashcard[];
  deckTitle: string;
}

interface CardItem {
  id: string;
  type: 'term' | 'definition';
  content: string;
}

const MatchingGame: React.FC<MatchingGameProps> = ({ cards, deckTitle }) => {
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
    <div className="container mx-auto p-8 max-w-6xl bg-white dark:bg-black text-black dark:text-gray-200">
      {!gameStarted && !gameEnded && (
        <div className="cover-screen fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
          <div className="absolute top-6 left-6">
            <Link href="/dashboard" passHref>
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer flex items-center">
                <FaArrowLeft className="mr-2" /> Back
              </span>
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full">
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">{deckTitle}</h1>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-600 dark:text-gray-400">Matching Game</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <FaInfoCircle className="mr-2 text-gray-500 dark:text-gray-400" />
                <p className="text-sm">Match terms with their definitions as quickly as possible.</p>
              </div>
              <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Click cards to select
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Pair terms with definitions
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-gray-400 rounded-full mr-2"></span>
                  Avoid mistakes to save time
                </li>
              </ul>
            </div>
            <div className="text-center">
              <button
                onClick={startGame}
                className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-8 py-3 rounded-sm text-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center w-full"
              >
                <FaPlay className="mr-2" /> Start Game
              </button>
            </div>
          </div>
        </div>
      )}
      {gameEnded && (
        <div className="cover-screen fixed inset-0 bg-gray-100 dark:bg-gray-900 z-50 flex flex-col items-center justify-center p-4">
          <div className="absolute top-6 left-6">
            <Link href="/dashboard" passHref>
              <span className="text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 cursor-pointer flex items-center">
                <FaArrowLeft className="mr-2" /> Back
              </span>
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg max-w-md w-full">
            <h1 className="text-3xl font-bold mb-2 text-center text-gray-800 dark:text-gray-200">{deckTitle}</h1>
            <h2 className="text-xl font-semibold mb-6 text-center text-gray-600 dark:text-gray-400">Game Over</h2>
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-center text-gray-700 dark:text-gray-300">
                <p className="text-lg">Congratulations! You&apos;ve matched all the terms.</p>
              </div>
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Your Time</h3>
                <p className="text-2xl font-bold text-gray-800 dark:text-gray-200">{formatTime(time)}</p>
              </div>
              {records.length > 1 && (
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Previous Times</h3>
                  <ul className="space-y-1">
                    {records.slice(0, -1).map((record, index) => (
                      <li key={index} className="text-gray-600 dark:text-gray-400">
                        {formatTime(record)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className="text-center">
              <button
                onClick={startGame}
                className="bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white px-8 py-3 rounded-full text-lg font-semibold transition duration-300 ease-in-out flex items-center justify-center w-full"
              >
                <FaPlay className="mr-2" /> Play Again
              </button>
            </div>
          </div>
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
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                    <div className="text-sm">
                      <Markdown
                        options={{
                          overrides: {
                            strong: { component: 'strong', props: { className: 'font-bold' } },
                            em: { component: 'em', props: { className: 'italic' } },
                            u: { component: 'u', props: { className: 'underline' } },
                          },
                        }}
                      >
                        {card.content}
                      </Markdown>
                    </div>
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