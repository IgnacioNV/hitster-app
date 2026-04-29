// hooks/useMusicPlayer.ts
// Global singleton audio — survives React component unmounts/remounts.
// This is intentional: the song must keep playing while screens transition.

'use client';

import { useEffect, useRef } from 'react';

// Module-level singleton: one audio instance for the whole app lifetime.
let _audio: HTMLAudioElement | null = null;
let _currentUrl: string | null = null;

function getOrCreateAudio(url: string): HTMLAudioElement {
  // Same URL → reuse existing instance, don't restart
  if (_audio && _currentUrl === url) {
    return _audio;
  }

  // Different URL → tear down old, build new
  if (_audio) {
    _audio.pause();
    _audio.src = '';
    _audio.load();
    _audio = null;
  }

  const audio = new Audio();
  audio.crossOrigin = 'anonymous';
  audio.preload = 'auto';
  audio.loop = true;
  audio.volume = 0.9;
  audio.src = url;
  audio.load();

  _audio = audio;
  _currentUrl = url;
  return audio;
}

export function stopGlobalAudio() {
  if (_audio) {
    _audio.pause();
    _audio.src = '';
    _audio.load();
    _audio = null;
    _currentUrl = null;
  }
}

interface UseMusicPlayerOptions {
  // If true, audio persists even when this hook's component unmounts.
  // Used for screens that hand off to the next screen mid-song.
  persistOnUnmount?: boolean;
}

export function useMusicPlayer(
  previewUrl: string | null,
  options: UseMusicPlayerOptions = {}
) {
  const { persistOnUnmount = false } = options;
  const playAttemptedRef = useRef(false);

  useEffect(() => {
    if (!previewUrl) return;

    const audio = getOrCreateAudio(previewUrl);

    // Only attempt play if it's not already playing
    if (audio.paused && !playAttemptedRef.current) {
      playAttemptedRef.current = true;
      audio.play().catch((err) => {
        // NotAllowedError is expected if no prior user gesture.
        // We surface this silently — the player UI handles the retry.
        console.warn('[MusicPlayer] play() blocked:', err.name);
        playAttemptedRef.current = false;
      });
    }

    return () => {
      // Only stop audio if we're NOT handing off to the next screen
      if (!persistOnUnmount) {
        stopGlobalAudio();
      }
      // If persistOnUnmount=true, audio keeps playing for the next screen.
    };
  }, [previewUrl, persistOnUnmount]);

  const stopMusic = () => stopGlobalAudio();

  return { stopMusic };
}
