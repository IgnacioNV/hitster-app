'use client';
import { useEffect, useRef, useState } from 'react';

export function useMusicPlayer(previewUrl: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!previewUrl) return;

    const audio = new Audio(previewUrl);
    audio.loop = true;
    audioRef.current = audio;

    audio.addEventListener('canplay', () => {
      audio.play().then(() => setIsPlaying(true)).catch(() => setError(true));
    });
    audio.addEventListener('error', () => setError(true));

    return () => {
      audio.pause();
      audio.src = '';
      audioRef.current = null;
      setIsPlaying(false);
    };
  }, [previewUrl]);

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  return { isPlaying, error, toggle };
}
