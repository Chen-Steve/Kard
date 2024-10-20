'use client'

import React, { useEffect, useState, useCallback, useRef } from 'react';
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
  const initialFetchRef = useRef(false);

  const saveStickersToLocalStorage = useCallback(() => {
    localStorage.setItem('stickers', JSON.stringify(stickers));
  }, [stickers]);

  const fetchStickers = useCallback(async () => {
    try {
      const { data, error } = await supabase.storage.from('stickers').list();
      if (error) throw error;

      const newStickers = data.map((file) => {
        const { data: urlData } = supabase.storage.from('stickers').getPublicUrl(file.name);
        return {
          id: file.id,
          path: file.name,
          publicUrl: urlData.publicUrl,
          signedUrl: urlData.publicUrl,
          x: Math.random() * (window.innerWidth - 175),
          y: Math.random() * (window.innerHeight - 175),
          width: 175,
          height: 175,
        };
      });

      setStickers(newStickers);
      setIsLoading(false);
      saveStickersToLocalStorage();
    } catch (error) {
      console.error('Error fetching stickers:', error);
      setError('Failed to load stickers');
      setIsLoading(false);
    }
  }, [setStickers, saveStickersToLocalStorage]);

  const loadStickersFromLocalStorage = useCallback(() => {
    const savedStickers = localStorage.getItem('stickers');
    if (savedStickers) {
      setStickers(JSON.parse(savedStickers));
      setIsLoading(false);
    } else {
      fetchStickers();
    }
  }, [setStickers, fetchStickers]);

  useEffect(() => {
    if (!initialFetchRef.current) {
      initialFetchRef.current = true;
      loadStickersFromLocalStorage();
    }
  }, [loadStickersFromLocalStorage]);

  useEffect(() => {
    if (stickers.length > 0) {
      saveStickersToLocalStorage();
    }
  }, [stickers, saveStickersToLocalStorage]);

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

  const handleDragEnd = useCallback(() => {
    setDragInfo(null);
    saveStickersToLocalStorage();
  }, [saveStickersToLocalStorage]);

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
            style={{ pointerEvents: 'none' }}
            draggable={false} 
          />
        </div>
      ))}
    </div>
  );
};

export default StickerSelector;
