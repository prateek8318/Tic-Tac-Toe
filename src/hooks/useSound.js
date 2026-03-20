import { useEffect, useRef, useCallback } from 'react';

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

  const playSound = (frequency, duration, type = 'sine', volume = 0.1) => {
    if (!audioContext.current) return;

    const oscillator = audioContext.current.createOscillator();
    const gainNode = audioContext.current.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.current.destination);

    oscillator.frequency.value = frequency;
    oscillator.type = type;

    // Better envelope with smooth attack and release
    const now = audioContext.current.currentTime;
    gainNode.gain.setValueAtTime(0, now);
    gainNode.gain.linearRampToValueAtTime(volume, now + 0.01); // Quick attack
    gainNode.gain.exponentialRampToValueAtTime(volume * 0.7, now + duration * 0.3); // Slight decay
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration); // Release

    oscillator.start(now);
    oscillator.stop(now + duration);
  };

  const playMoveSound = useCallback(() => {
    // Pleasant click sound with harmonics
    playSound(800, 0.08, 'sine', 0.08);
    setTimeout(() => playSound(1200, 0.04, 'sine', 0.04), 20);
  }, []);

  const playWinSound = useCallback(() => {
    // Epic victory fanfare
    playSound(523, 0.2, 'sine', 0.15); // C5
    setTimeout(() => playSound(659, 0.2, 'sine', 0.15), 200); // E5
    setTimeout(() => playSound(784, 0.2, 'sine', 0.15), 400); // G5
    setTimeout(() => playSound(1047, 0.3, 'sine', 0.18), 600); // C6 higher
    setTimeout(() => playSound(1319, 0.25, 'sine', 0.16), 900); // E6
    setTimeout(() => playSound(1568, 0.4, 'sine', 0.20), 1200); // G6 - final victory note
  }, []);

  const playDrawSound = useCallback(() => {
    // Gentle descending sound for draw
    playSound(440, 0.1, 'triangle', 0.06); // A4
    setTimeout(() => playSound(370, 0.15, 'triangle', 0.08), 80); // F#4
    setTimeout(() => playSound(330, 0.2, 'triangle', 0.06), 200); // E4
  }, []);

  const playClickSound = useCallback(() => {
    // Soft UI click sound
    playSound(1000, 0.03, 'sine', 0.05);
    setTimeout(() => playSound(1500, 0.02, 'sine', 0.03), 10);
  }, []);

  return { playMoveSound, playWinSound, playDrawSound, playClickSound };
};

export default useSound;
