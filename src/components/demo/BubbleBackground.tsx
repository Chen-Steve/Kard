import React, { useMemo, useState, useEffect } from 'react';
import { useSpring, animated, to } from '@react-spring/web';

interface BubbleBackgroundProps {
  scrollY: number;
}

const bubbleConfigs = [
  { top: '5%', left: '10%', size: 'w-56 h-56', colors: 'from-blue-300 to-purple-300', speed: 100, amplitude: 50 },
  { top: '20%', left: '80%', size: 'w-64 h-64', colors: 'from-pink-300 to-yellow-300', speed: 90, amplitude: 30 },
  { top: '50%', left: '5%', size: 'w-56 h-56', colors: 'from-green-300 to-teal-300', speed: 110, amplitude: 40 },
  { top: '70%', left: '70%', size: 'w-72 h-72', colors: 'from-indigo-300 to-blue-300', speed: 95, amplitude: 35 },
  { top: '85%', left: '40%', size: 'w-40 h-40', colors: 'from-red-300 to-orange-300', speed: 105, amplitude: 45 },
];

const Bubble: React.FC<{ config: typeof bubbleConfigs[0], scrollY: number, mouseX: number, mouseY: number }> = React.memo(({ config, scrollY, mouseX, mouseY }) => {
  const { x, y } = useSpring({
    x: Math.sin(scrollY / config.speed) * config.amplitude + (mouseX - window.innerWidth / 2) * 0.05,
    y: Math.cos(scrollY / (config.speed * 1.5)) * (config.amplitude * 0.7) + (mouseY - window.innerHeight / 2) * 0.05,
    config: { mass: 1, tension: 120, friction: 14 },
  });

  return (
    <animated.div
      style={{
        transform: to([x, y], (x, y) => `translate3d(${x}px, ${y}px, 0)`), // Update transform to include y
        top: config.top,
        left: config.left,
      }}
      className={`absolute rounded-full blur-xl ${config.size} bg-gradient-to-br ${config.colors}`}
    />
  );
});

Bubble.displayName = 'Bubble';

const BubbleBackground: React.FC<BubbleBackgroundProps> = ({ scrollY }) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({ x: event.clientX, y: event.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  const memoizedBubbles = useMemo(() => 
    bubbleConfigs.map((config, index) => (
      <Bubble 
        key={index} 
        config={config} 
        scrollY={scrollY} 
        mouseX={mousePosition.x} 
        mouseY={mousePosition.y} 
      />
    )),
  [scrollY, mousePosition]
  );

  return <>{memoizedBubbles}</>;
};

BubbleBackground.displayName = 'BubbleBackground';

export default React.memo(BubbleBackground);