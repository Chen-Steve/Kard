import React, { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  size: number;
  position: { x: number; y: number };
  color: string;
}

const generateBubble = (id: number): Bubble => ({
  id,
  size: Math.random() * 150 + 100,
  position: {
    x: Math.random() * 100,
    y: Math.random() * 100,
  },
  color: `hsl(${Math.random() * 360}, 70%, 70%)`,
});

const Bubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setBubbles(Array.from({ length: 10 }, (_, i) => generateBubble(i)));
  }, []);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <>
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble absolute rounded-full pointer-events-none"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `calc(${bubble.position.x}% + ${(mousePosition.x / window.innerWidth - 0.5) * 20}px)`,
            top: `calc(${bubble.position.y}% + ${(mousePosition.y / window.innerHeight - 0.5) * 20}px)`,
            background: `radial-gradient(circle at 30% 30%, ${bubble.color}, transparent)`,
            filter: 'blur(20px)',
            opacity: 0.5,
            transition: 'left 0.3s ease-out, top 0.3s ease-out',
          }}
        />
      ))}
      <style jsx>{`
        .bubble {
          transition: all 0.3s ease-in-out;
        }
      `}</style>
    </>
  );
};

export default Bubbles;