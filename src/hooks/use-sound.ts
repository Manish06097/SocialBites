
'use client';

import { useState, useEffect, useCallback } from 'react';

export const useSound = (src: string, { volume = 1, playbackRate = 1 } = {}) => {
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audioInstance = new Audio(src);
    setAudio(audioInstance);
  }, [src]);

  useEffect(() => {
    if (audio) {
      audio.volume = volume;
      audio.playbackRate = playbackRate;
    }
  }, [audio, volume, playbackRate]);

  const play = useCallback(() => {
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(e => {
        console.error("Failed to play audio:", e);
      });
    }
  }, [audio]);

  return [play];
};
