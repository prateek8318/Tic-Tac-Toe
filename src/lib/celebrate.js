import confetti from 'canvas-confetti';

const reduceMotion = () => {
  try {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch {
    return false;
  }
};

export const celebrate = (big = false) => {
  if (reduceMotion()) return;
  const colors = ['#a78bfa', '#6ee7d8', '#ffd479', '#ff8fa3', '#7dd3fc'];
  confetti({ particleCount: big ? 140 : 80, spread: 80, origin: { y: 0.65 }, colors, zIndex: 9999 });
  if (big) {
    setTimeout(() => confetti({ particleCount: 60, angle: 60, spread: 60, origin: { x: 0, y: 0.7 }, colors, zIndex: 9999 }), 200);
    setTimeout(() => confetti({ particleCount: 60, angle: 120, spread: 60, origin: { x: 1, y: 0.7 }, colors, zIndex: 9999 }), 350);
  }
};
