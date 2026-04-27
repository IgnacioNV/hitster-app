'use client';

import { useEffect, useRef, useState } from 'react';

export function useMusicPlayer(previewUrl?: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentUrlRef = useRef<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!previewUrl) {
      console.log('No hay previewUrl disponible');
      console.log('La canción NO está sonando');
      return;
    }

    // Evita recrear el mismo audio si la URL no cambió
    if (currentUrlRef.current === previewUrl) {
      return;
    }

    currentUrlRef.current = previewUrl;

    // Limpiar audio anterior SOLO si existe
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }

    const audio = new Audio(previewUrl);
    audio.preload = 'auto';
    audio.volume = 1;

    audioRef.current = audio;
    setIsLoading(true);

    const handlePlay = () => {
      console.log('La canción está sonando');
      setIsPlaying(true);
      setIsLoading(false);
    };

    const handlePause = () => {
      console.log('La canción NO está sonando');
      setIsPlaying(false);
    };

    const handleError = () => {
      console.log('Error cargando audio');
      console.log('La canción NO está sonando');
      setIsLoading(false);
      setIsPlaying(false);
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    const startPlayback = async () => {
      try {
        await audio.play();
      } catch (error) {
        console.log('Autoplay bloqueado por navegador');
        console.error(error);
        setIsLoading(false);
      }
    };

    startPlayback();

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
    };
  }, [previewUrl]);

  const play = async () => {
    if (!audioRef.current) return;

    try {
      await audioRef.current.play();
    } catch (error) {
      console.error(error);
    }
  };

  const pause = () => {
    if (!audioRef.current) return;
    audioRef.current.pause();
  };

  return {
    play,
    pause,
    isPlaying,
    isLoading,
  };
}