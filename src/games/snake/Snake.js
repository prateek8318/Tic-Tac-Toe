import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Pause, Play } from 'lucide-react';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { haptic, sfx } from '../../lib/sound';
import useSwipe from '../useSwipe';
import './snake.css';

const N = 17;
const VEC = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
const OPPOSITE = { up: 'down', down: 'up', left: 'right', right: 'left' };
const SPEEDS = { slow: 170, normal: 125, fast: 90 };

const placeFood = (snake) => {
  const taken = new Set(snake.map(([x, y]) => y * N + x));
  const free = [];
  for (let i = 0; i < N * N; i += 1) if (!taken.has(i)) free.push(i);
  if (!free.length) return null;
  const cell = free[Math.floor(Math.random() * free.length)];
  return [cell % N, Math.floor(cell / N)];
};

const initial = () => {
  const mid = Math.floor(N / 2);
  const snake = [[mid, mid], [mid - 1, mid], [mid - 2, mid]];
  return { snake, dir: 'right', queue: [], food: placeFood(snake), score: 0, dead: false };
};

const Snake = () => {
  const { stats, recordGame, submitBest } = useStats();
  const [speed, setSpeed] = useState('normal');
  const [status, setStatus] = useState('ready'); // ready | playing | paused | over
  const [score, setScore] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const canvasRef = useRef(null);
  const wrapRef = useRef(null);
  const game = useRef(initial());
  const best = Math.max(stats.bests.snake || 0, score);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const size = canvas.clientWidth;
    const dpr = window.devicePixelRatio || 1;
    if (canvas.width !== Math.round(size * dpr)) {
      canvas.width = Math.round(size * dpr);
      canvas.height = Math.round(size * dpr);
    }
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const css = getComputedStyle(canvas);
    const cell = size / N;
    ctx.clearRect(0, 0, size, size);

    // Checkerboard
    ctx.fillStyle = css.getPropertyValue('--snake-tile').trim() || 'rgba(255,255,255,.03)';
    for (let y = 0; y < N; y += 1) for (let x = (y % 2); x < N; x += 2) ctx.fillRect(x * cell, y * cell, cell, cell);

    const { snake, food, dir, dead } = game.current;
    if (food) {
      ctx.font = `${cell * 0.85}px serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🍎', food[0] * cell + cell / 2, food[1] * cell + cell / 2 + cell * 0.05);
    }

    snake.forEach(([x, y], i) => {
      const t = i / Math.max(snake.length - 1, 1);
      ctx.fillStyle = dead ? `hsl(350 80% ${60 - t * 20}%)` : `hsl(${142 - t * 30} 70% ${55 - t * 18}%)`;
      const pad = i === 0 ? cell * 0.04 : cell * 0.1;
      const r = cell * 0.3;
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x * cell + pad, y * cell + pad, cell - pad * 2, cell - pad * 2, r);
      else ctx.rect(x * cell + pad, y * cell + pad, cell - pad * 2, cell - pad * 2);
      ctx.fill();
    });

    // Eyes
    const [hx, hy] = snake[0];
    const [dx, dy] = VEC[dir];
    ctx.fillStyle = '#0b0d14';
    const cx = hx * cell + cell / 2;
    const cy = hy * cell + cell / 2;
    const side = cell * 0.2;
    const fwd = cell * 0.15;
    [[-1], [1]].forEach(([s]) => {
      ctx.beginPath();
      ctx.arc(cx + dx * fwd + dy * side * s, cy + dy * fwd + dx * side * s, cell * 0.08, 0, Math.PI * 2);
      ctx.fill();
    });
  }, []);

  const end = useCallback(() => {
    const g = game.current;
    g.dead = true;
    setStatus('over');
    sfx.lose();
    haptic([40, 60, 40]);
    recordGame('snake', { win: false });
    const isBest = g.score > 0 && submitBest('snake', g.score);
    setNewBest(isBest);
    if (isBest) celebrate();
  }, [recordGame, submitBest]);

  const step = useCallback(() => {
    const g = game.current;
    if (g.queue.length) g.dir = g.queue.shift();
    const [dx, dy] = VEC[g.dir];
    const [hx, hy] = g.snake[0];
    const head = [hx + dx, hy + dy];
    const eating = g.food && head[0] === g.food[0] && head[1] === g.food[1];
    // The tail moves away this tick unless we eat, so it's safe to move into it.
    const body = eating ? g.snake : g.snake.slice(0, -1);
    const hitWall = head[0] < 0 || head[1] < 0 || head[0] >= N || head[1] >= N;
    const hitSelf = body.some(([x, y]) => x === head[0] && y === head[1]);
    if (hitWall || hitSelf) {
      end();
      draw();
      return;
    }
    g.snake = [head, ...body];
    if (eating) {
      g.score += 1;
      setScore(g.score);
      g.food = placeFood(g.snake);
      sfx.good();
      haptic(10);
      if (!g.food) {
        end();
        return;
      }
    }
    draw();
  }, [draw, end]);

  // Game loop: speeds up slightly as the snake grows.
  useEffect(() => {
    if (status !== 'playing') return undefined;
    const delay = Math.max(55, SPEEDS[speed] - Math.floor(score / 5) * 6);
    const id = setInterval(step, delay);
    return () => clearInterval(id);
  }, [status, speed, step, score]);

  useEffect(() => {
    draw();
    const ro = new ResizeObserver(draw);
    if (canvasRef.current) ro.observe(canvasRef.current);
    const theme = new MutationObserver(draw);
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    return () => {
      ro.disconnect();
      theme.disconnect();
    };
  }, [draw]);

  // Auto-pause when the app goes to the background.
  useEffect(() => {
    const onHide = () => {
      if (document.hidden) setStatus((s) => (s === 'playing' ? 'paused' : s));
    };
    document.addEventListener('visibilitychange', onHide);
    return () => document.removeEventListener('visibilitychange', onHide);
  }, []);

  const start = useCallback(() => {
    game.current = initial();
    setScore(0);
    setNewBest(false);
    setStatus('playing');
    sfx.tap();
    draw();
  }, [draw]);

  const turn = useCallback(
    (dir) => {
      if (status === 'ready' || status === 'over') {
        if (status === 'ready') start();
        else return;
      }
      if (status === 'paused') setStatus('playing');
      const g = game.current;
      const last = g.queue.length ? g.queue[g.queue.length - 1] : g.dir;
      if (dir === last || dir === OPPOSITE[last]) return;
      if (g.queue.length < 3) g.queue.push(dir);
    },
    [status, start]
  );

  const togglePause = () => {
    if (status === 'playing') setStatus('paused');
    else if (status === 'paused') setStatus('playing');
    else if (status === 'ready') start();
  };

  useEffect(() => {
    const keys = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
    const onKey = (e) => {
      if (keys[e.key]) {
        e.preventDefault();
        turn(keys[e.key]);
      } else if (e.key === ' ' || e.key === 'p') {
        e.preventDefault();
        if (status === 'over') start();
        else togglePause();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  useSwipe(wrapRef, turn, 18);

  const restart = () => {
    game.current = initial();
    setScore(0);
    setStatus('ready');
    draw();
  };

  return (
    <GameShell
      id="snake"
      onRestart={restart}
      toolbar={
        <Segmented
          label="Speed"
          value={speed}
          onChange={(v) => {
            setSpeed(v);
            restart();
          }}
          options={[{ value: 'slow', label: '🐢 Slow' }, { value: 'normal', label: 'Normal' }, { value: 'fast', label: '⚡ Fast' }]}
        />
      }
      stats={[
        { label: 'Score', value: score, highlight: true },
        { label: 'Best', value: best },
      ]}
      help={
        <ul>
          <li><strong>Swipe</strong> on the board, use the arrow pad, or the arrow keys to turn.</li>
          <li>Eat 🍎 to grow. The snake speeds up as it gets longer.</li>
          <li>Don’t hit the walls or your own tail.</li>
          <li>Press <strong>Space</strong> to pause on a keyboard.</li>
        </ul>
      }
    >
      <div className="snake-wrap" ref={wrapRef}>
        <canvas ref={canvasRef} className="snake-canvas" aria-label="Snake board" />
        {status === 'ready' && (
          <button className="stage-overlay" onClick={start}>
            <strong>Tap to start</strong>
            <span>Swipe or use the arrows to steer</span>
          </button>
        )}
        {status === 'paused' && (
          <button className="stage-overlay" onClick={() => setStatus('playing')}>
            <strong>Paused</strong>
            <span>Tap to continue</span>
          </button>
        )}
      </div>

      <div className="snake-controls">
        <div className="dpad">
          <button className="dpad-up" onClick={() => turn('up')} aria-label="Up"><ChevronUp /></button>
          <button className="dpad-left" onClick={() => turn('left')} aria-label="Left"><ChevronLeft /></button>
          <button className="dpad-mid" onClick={togglePause} aria-label={status === 'playing' ? 'Pause' : 'Play'} disabled={status === 'over'}>
            {status === 'playing' ? <Pause size={18} /> : <Play size={18} />}
          </button>
          <button className="dpad-right" onClick={() => turn('right')} aria-label="Right"><ChevronRight /></button>
          <button className="dpad-down" onClick={() => turn('down')} aria-label="Down"><ChevronDown /></button>
        </div>
      </div>

      <ResultSheet
        open={status === 'over'}
        emoji={newBest ? '🏆' : '🐍'}
        title={newBest ? 'New best!' : 'Game over'}
        subtitle={newBest ? 'That’s your longest snake yet.' : 'Watch that tail.'}
        details={[{ label: 'Score', value: score }, { label: 'Best', value: best }]}
        primary={{ label: 'Play again', onClick: start }}
      />
    </GameShell>
  );
};

export default Snake;
