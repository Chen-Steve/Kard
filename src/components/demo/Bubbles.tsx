import React, { useState, useEffect, useMemo } from 'react';
import { Delaunay } from 'd3-delaunay';

interface VoronoiCell {
  id: number;
  position: { x: number; y: number };
  color: string;
}

const generatePoint = (maxWidth: number, maxHeight: number): [number, number] => [
  Math.random() * maxWidth,
  Math.random() * maxHeight,
];

const generateColor = () => `hsl(${Math.random() * 360}, 70%, 70%)`;

const Bubbles: React.FC = () => {
  const [cells, setCells] = useState<VoronoiCell[]>([]);
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

  const voronoiCells = useMemo(() => {
    if (dimensions.width === 0 || dimensions.height === 0) return null;

    const points = Array.from({ length: 20 }, () => generatePoint(dimensions.width, dimensions.height));
    const delaunay = Delaunay.from(points);
    const voronoi = delaunay.voronoi([0, 0, dimensions.width, dimensions.height]);

    return Array.from(voronoi.cellPolygons()).map((cell, index) => ({
      id: index,
      path: `M${cell.join('L')}Z`,
      color: generateColor(),
    }));
  }, [dimensions]);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <svg width={dimensions.width} height={dimensions.height}>
        {voronoiCells && voronoiCells.map((cell) => (
          <path
            key={cell.id}
            d={cell.path}
            fill={cell.color}
            stroke="white"
            strokeWidth="1"
            opacity="0.3"
          />
        ))}
      </svg>
    </div>
  );
};

export default Bubbles;