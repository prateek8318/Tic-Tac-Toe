import { useEffect, useRef } from 'react';

const useSound = () => {
  const audioContext = useRef(null);

  useEffect(() => {
    audioContext.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContext.current) {
        audioContext.current.close();
      }
    };
  }, []);

  const playSound = (frequency, duration, type = 'sine') => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    gainNode.gain.setValueAtTime(0.05, audioContext.current.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.current.currentTime + duration);

    oscillator.start(audioContext.current.currentTime);
    oscillator.stop(audioContext.current.currentTime + duration);
  };

  const playMoveSound = () => playSound(600, 0.05);
  const playWinSound = () => {
    playSound(523, 0.05);
    setTimeout(() => playSound(659, 0.05), 100);
    setTimeout(() => playSound(784, 0.1), 200);
  };
  const playDrawSound = () => playSound(300, 0.15, 'sawtooth');
  const playClickSound = () => playSound(800, 0.02);

  return { playMoveSound, playWinSound, playDrawSound, playClickSound };
};

export default useSound;
