import { useEffect, useRef, useCallback } from 'react';
import { createAudioElements } from '../assets/sounds/sounds';

const useSound = () => {
  const audioElements = useRef(null);

  useEffect(() => {
    // Initialize audio elements
    audioElements.current = createAudioElements();
    
    return () => {
      // Cleanup audio elements
      if (audioElements.current) {
        Object.values(audioElements.current).forEach(audio => {
          audio.pause();
          audio.currentTime = 0;
        });
      }
    };
  }, []);

  const playSound = useCallback((soundName) => {
    if (!audioElements.current || !audioElements.current[soundName]) return;
    
    try {
      const audio = audioElements.current[soundName];
      audio.currentTime = 0;
      audio.play().catch(error => {
        console.log('Sound play failed:', error);
      });
    } catch (error) {
      console.log('Sound error:', error);
    }
  }, []);

  const playMoveSound = useCallback(() => playSound('move'), [playSound]);
  const playWinSound = useCallback(() => playSound('win'), [playSound]);
  const playDrawSound = useCallback(() => playSound('draw'), [playSound]);
  const playClickSound = useCallback(() => playSound('click'), [playSound]);

  return { playMoveSound, playWinSound, playDrawSound, playClickSound };
};

export default useSound;
