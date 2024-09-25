import React, { useState, useEffect, useRef } from 'react';
import { Delaunay } from 'd3-delaunay';

interface Point {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  angle: number;
  speed: number;
  amplitude: number;
}

const generatePoint = (maxWidth: number, maxHeight: number): Point => ({
  x: Math.random() * maxWidth,
  y: Math.random() * maxHeight,
  baseX: Math.random() * maxWidth,
  baseY: Math.random() * maxHeight,
  angle: Math.random() * Math.PI * 2,
  speed: 0.0001 + Math.random() * 0.0002,
  amplitude: 20 + Math.random() * 40,
});

const generateColor = () => `hsl(${Math.random() * 360}, 70%, 70%)`;

const Bubbles: React.FC = () => {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [, forceUpdate] = useState({});
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pointsRef = useRef<Point[]>([]);
  const colorsRef = useRef<string[]>([]);
  const animationRef = useRef<number>();
  const lastTimeRef = useRef<number>(0);

  useEffect(() => {
    const updateDimensions = () => {
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);

    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (dimensions.width > 0 && dimensions.height > 0) {
      pointsRef.current = Array.from({ length: 20 }, () => generatePoint(dimensions.width, dimensions.height));
      colorsRef.current = Array.from({ length: 20 }, generateColor);
    }
  }, [dimensions]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const animate = (time: number) => {
      const deltaTime = time - lastTimeRef.current;
      lastTimeRef.current = time;

      ctx.clearRect(0, 0, dimensions.width, dimensions.height);

      pointsRef.current.forEach(point => {
        point.angle += point.speed * deltaTime;
        point.x = point.baseX + Math.cos(point.angle) * point.amplitude;
        point.y = point.baseY + Math.sin(point.angle) * point.amplitude;

        point.x = (point.x + dimensions.width) % dimensions.width;
        point.y = (point.y + dimensions.height) % dimensions.height;
      });

      const points = pointsRef.current.map(p => [p.x, p.y] as [number, number]);
      const delaunay = Delaunay.from(points);
      const voronoi = delaunay.voronoi([0, 0, dimensions.width, dimensions.height]);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'white';

      for (let i = 0; i < points.length; i++) {
        const cell = voronoi.cellPolygon(i);
        if (cell) {
          ctx.beginPath();
          ctx.moveTo(cell[0][0], cell[0][1]);
          for (let j = 1; j < cell.length; j++) {
            ctx.lineTo(cell[j][0], cell[j][1]);
          }
          ctx.closePath();
          ctx.fillStyle = colorsRef.current[i];
          ctx.globalAlpha = 0.3;
          ctx.fill();
          ctx.globalAlpha = 1;
          ctx.stroke();
        }
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [dimensions]);

  return (
    <canvas
      ref={canvasRef}
      width={dimensions.width}
      height={dimensions.height}
      className="fixed inset-0"
    />
  );
};

export default Bubbles;