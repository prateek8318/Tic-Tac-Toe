import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { X } from 'lucide-react';
import './WinnerCelebration.css';

const WinnerCelebration = ({ winner, onCelebrationEnd }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!winner) {
      setIsVisible(false);
      return;
    }

    setIsVisible(true);

    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    function randomInRange(min, max) {
      return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);
      
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
      });
    }, 250);

    const timeout = setTimeout(() => {
      setIsVisible(false);
      onCelebrationEnd?.();
    }, duration);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [winner]);

  const handleClose = () => {
    setIsVisible(false);
    onCelebrationEnd?.();
  };

  if (!winner || !isVisible) return null;

  return (
    <div className="celebration-overlay" onClick={handleClose}>
      <div className="celebration-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={handleClose}>
          <X size={24} />
        </button>
        <div className="celebration-animation">
          <div className="winner-crown">👑</div>
          <div className="winner-text">
            <h1>Victory!</h1>
            <p>Player {winner} Wins!</p>
          </div>
          <div className="winner-emoji">
            {winner === 'X' ? '❌' : '⭕'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WinnerCelebration;
