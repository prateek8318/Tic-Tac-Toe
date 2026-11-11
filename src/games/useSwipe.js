import { useEffect, useRef } from 'react';

// Calls onSwipe('left' | 'right' | 'up' | 'down') for touch/pen/mouse drags on `ref`.
const useSwipe = (ref, onSwipe, threshold = 24) => {
  const handler = useRef(onSwipe);
  handler.current = onSwipe;

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    let start = null;

    const down = (e) => {
      start = { x: e.clientX, y: e.clientY };
    };
    const up = (e) => {
      if (!start) return;
      const dx = e.clientX - start.x;
      const dy = e.clientY - start.y;
      start = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      if (Math.abs(dx) > Math.abs(dy)) handler.current(dx > 0 ? 'right' : 'left');
      else handler.current(dy > 0 ? 'down' : 'up');
    };
    const cancel = () => {
      start = null;
    };
    // Stop the page from scrolling / pull-to-refresh while swiping the board.
    const block = (e) => e.preventDefault();

    el.addEventListener('pointerdown', down);
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', cancel);
    el.addEventListener('touchmove', block, { passive: false });
    return () => {
      el.removeEventListener('pointerdown', down);
      el.removeEventListener('pointerup', up);
      el.removeEventListener('pointercancel', cancel);
      el.removeEventListener('touchmove', block);
    };
  }, [ref, threshold]);
};

export default useSwipe;
