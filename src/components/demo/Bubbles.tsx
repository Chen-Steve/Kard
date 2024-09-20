import React, { useState, useEffect } from 'react';

interface Bubble {
  id: number;
  size: number;
  position: { x: number; y: number };
  color: string;
}

const generateBubble = (id: number, maxWidth: number, maxHeight: number): Bubble => {
  const screenSize = Math.min(maxWidth, maxHeight);
  const minSize = screenSize * 0.05; // 5% of screen size
  const maxSize = screenSize * 0.15; // 15% of screen size
  return {
    id,
    size: Math.random() * (maxSize - minSize) + minSize,
    position: {
      x: Math.random() * maxWidth,
      y: Math.random() * maxHeight,
    },
    color: `hsl(${Math.random() * 360}, 70%, 70%)`,
  };
};

const Bubbles: React.FC = () => {
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => {
      window.removeEventListener('resize', updateDimensions);
    };
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      setBubbles(Array.from({ length: 8 }, (_, i) => 
        generateBubble(i, dimensions.width, dimensions.height)
      ));
    }
  }, [dimensions]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {bubbles.map((bubble) => (
        <div
          key={bubble.id}
          className="bubble absolute rounded-full"
          style={{
            width: `${bubble.size}px`,
            height: `${bubble.size}px`,
            left: `${bubble.position.x}px`,
            top: `${bubble.position.y}px`,
            background: `radial-gradient(circle at 30% 30%, ${bubble.color}, transparent)`,
            filter: 'blur(10px)',
            opacity: 0.3,
          }}
        />
      ))}
    </div>
  );
};

export default Bubbles;