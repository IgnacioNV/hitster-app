// hooks/useMusicPlayer.ts

'use client';

import { useEffect, useRef } from 'react';

let globalAudio: HTMLAudioElement | null = null;

export function useMusicPlayer(previewUrl: string | null) {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    /**
     * MUY IMPORTANTE:
     * Antes de reproducir cualquier nueva canción,
     * detenemos absolutamente cualquier audio anterior.
     */
    if (globalAudio) {
      globalAudio.pause();
      globalAudio.currentTime = 0;
      globalAudio.src = '';
      globalAudio = null;
    }

    if (!previewUrl) {
      console.log('No hay previewUrl disponible');
      return;
    }

    const audio = new Audio(previewUrl);

    audio.volume = 1;
    audio.loop = false;
    audio.preload = 'auto';

    audioRef.current = audio;
    globalAudio = audio;

    audio
      .play()
      .then(() => {
        console.log('La canción está sonando');
      })
      .catch((error) => {
        console.log('La canción NO está sonando', error);
      });

    /**
     * Cleanup automático:
     * cuando cambia de pantalla,
     * cambia de turno,
     * cambia previewUrl,
     * o desmonta el componente
     */
    return () => {
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
        audio.src = '';

        if (globalAudio === audio) {
          globalAudio = null;
        }

        console.log('Canción detenida correctamente');
      }
    };
  }, [previewUrl]);

  /**
   * Stop manual:
   * usar cuando termina reveal / siguiente turno
   */
  const stopMusic = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';

      if (globalAudio === audioRef.current) {
        globalAudio = null;
      }

      console.log('Canción detenida manualmente');
    }
  };

  return {
    stopMusic,
  };
}