'use client'

import React, { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import supabase from '../lib/supabaseClient';

interface StickerWithUrl {
  id: string;
  path: string;
  signedUrl: string;
  publicUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
}

interface StickerSelectorProps {
  stickers: StickerWithUrl[];
  setStickers: React.Dispatch<React.SetStateAction<StickerWithUrl[]>>;
}

interface DragInfo {
  stickerId: string;
  offsetX: number;
  offsetY: number;
}

const StickerSelector: React.FC<StickerSelectorProps> = ({ stickers, setStickers }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dragInfo, setDragInfo] = useState<DragInfo | null>(null);

  useEffect(() => {
    if (stickers.length === 0) {
      fetchStickers();
    } else {
      setIsLoading(false);
    }
  }, [stickers]);

  const fetchStickers = async () => {
    try {
      const { data, error } = await supabase.storage.from('stickers').list();
      if (error) throw error;

      const stickerPromises = data.map(async (file) => {
        const { data: urlData } = supabase.storage.from('stickers').getPublicUrl(file.name);
        const { data: signedUrlData } = await supabase.storage.from('stickers').createSignedUrl(file.name, 3600);
        return {
          id: file.id,
          path: file.name,
          publicUrl: urlData.publicUrl,
          signedUrl: signedUrlData?.signedUrl || '',
          x: Math.random() * (window.innerWidth - 100),
          y: Math.random() * (window.innerHeight - 100),
          width: 175,
          height: 175,
        };
      });

      const newStickers = await Promise.all(stickerPromises);
      setStickers(newStickers);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching stickers:', error);
      setError('Failed to load stickers');
      setIsLoading(false);
    }
  };

  const handleDragStart = (e: React.MouseEvent | React.TouchEvent, stickerId: string) => {
    e.preventDefault(); // Prevent default drag behavior
    const sticker = stickers.find(s => s.id === stickerId);
    if (sticker) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      const offsetX = clientX - sticker.x;
      const offsetY = clientY - sticker.y;
      setDragInfo({ stickerId, offsetX, offsetY });
    }
  };

  const handleDragMove = useCallback((e: MouseEvent | TouchEvent) => {
    if (dragInfo) {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setStickers(prevStickers => 
        prevStickers.map(sticker => 
          sticker.id === dragInfo.stickerId 
            ? { ...sticker, x: clientX - dragInfo.offsetX, y: clientY - dragInfo.offsetY } 
            : sticker
        )
      );
    }
  }, [dragInfo, setStickers]);

  const handleDragEnd = () => {
    setDragInfo(null);
  };

  useEffect(() => {
    if (dragInfo) {
      window.addEventListener('mousemove', handleDragMove);
      window.addEventListener('mouseup', handleDragEnd);
      window.addEventListener('touchmove', handleDragMove);
      window.addEventListener('touchend', handleDragEnd);
    } else {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    }

    return () => {
      window.removeEventListener('mousemove', handleDragMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleDragMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragInfo, handleDragMove]);

  if (isLoading) return <div>Loading stickers...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="absolute inset-0 pointer-events-none">
      {stickers.map((sticker) => (
        <div
          key={sticker.id}
          className="absolute cursor-move select-none pointer-events-auto"
          style={{
            left: sticker.x,
            top: sticker.y,
            width: sticker.width,
            height: sticker.height,
            zIndex: dragInfo?.stickerId === sticker.id ? 1000 : 1,
          }}
          onMouseDown={(e) => handleDragStart(e, sticker.id)}
          onTouchStart={(e) => handleDragStart(e, sticker.id)}
        >
          <Image 
            src={sticker.signedUrl} 
            alt={`Sticker ${sticker.path}`} 
            width={sticker.width}
            height={sticker.height}
            onError={() => console.error(`Failed to load image: ${sticker.signedUrl}`)}
            style={{ pointerEvents: 'none' }} // Prevent image from interfering with drag
            draggable={false} // Prevent default image drag behavior
          />
        </div>
      ))}
    </div>
  );
};

export default StickerSelector;