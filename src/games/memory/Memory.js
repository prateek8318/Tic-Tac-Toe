import React, { useEffect, useRef, useState } from 'react';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { formatTime, shuffle } from '../../lib/random';
import { haptic, sfx } from '../../lib/sound';
import './memory.css';

const SYMBOLS = ['🍕', '🚀', '🎸', '🦄', '🌈', '🐙', '🍩', '⚡', '🎯', '🦊', '🌵', '🍉'];
const LEVELS = {
  easy: { label: 'Easy', pairs: 6, cols: 4 },
  medium: { label: 'Medium', pairs: 8, cols: 4 },
  hard: { label: 'Hard', pairs: 12, cols: 6 },
};

const deal = (level) =>
  shuffle(shuffle(SYMBOLS).slice(0, LEVELS[level].pairs).flatMap((emoji) => [emoji, emoji])).map((emoji, id) => ({ id, emoji }));

// Fewer moves and less time = higher score. A perfect game gives roughly pairs * 100.
const calcScore = (pairs, moves, seconds) => Math.max(10, Math.round(pairs * 120 - Math.max(0, moves - pairs) * 20 - seconds * 2));

const Memory = () => {
  const { stats, recordGame, submitBest } = useStats();
  const [level, setLevel] = useState('easy');
  const [cards, setCards] = useState(() => deal('easy'));
  const [flipped, setFlipped] = useState([]);
  const [matched, setMatched] = useState(() => new Set());
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const [wrong, setWrong] = useState([]);
  const timers = useRef([]);
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const cfg = LEVELS[level];
  const bestKey = `memory:${level}`;
  const best = stats.bests[bestKey];

  useEffect(() => {
    if (!running) return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const reset = (lvl = level) => {
    clearTimers();
    setCards(deal(lvl));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setSeconds(0);
    setRunning(false);
    setDone(false);
    setWrong([]);
    setNewBest(false);
  };

  const flip = (index) => {
    if (done || flipped.length === 2 || flipped.includes(index) || matched.has(index)) return;
    if (!running) setRunning(true);
    sfx.tap();
    const next = [...flipped, index];
    setFlipped(next);
    if (next.length < 2) return;

    const [a, b] = next;
    const moveCount = moves + 1;
    setMoves(moveCount);
    if (cards[a].emoji === cards[b].emoji) {
      const nextMatched = new Set(matched);
      nextMatched.add(a);
      nextMatched.add(b);
      later(() => {
        setMatched(nextMatched);
        setFlipped([]);
        sfx.good();
        haptic(12);
        if (nextMatched.size === cards.length) {
          setRunning(false);
          setDone(true);
          sfx.win();
          celebrate();
          recordGame('memory', { win: true });
          setNewBest(submitBest(bestKey, calcScore(cfg.pairs, moveCount, seconds)));
        }
      }, 320);
    } else {
      later(() => {
        setWrong(next);
        sfx.bad();
      }, 380);
      later(() => {
        setFlipped([]);
        setWrong([]);
      }, 900);
    }
  };

  const score = calcScore(cfg.pairs, moves, seconds);

  return (
    <GameShell
      id="memory"
      onRestart={() => reset()}
      toolbar={
        <Segmented
          label="Difficulty"
          value={level}
          onChange={(l) => {
            setLevel(l);
            reset(l);
          }}
          options={Object.entries(LEVELS).map(([value, l]) => ({ value, label: `${l.label} · ${l.pairs * 2}` }))}
        />
      }
      stats={[
        { label: 'Time', value: formatTime(seconds), highlight: running },
        { label: 'Moves', value: moves },
        { label: 'Pairs', value: `${matched.size / 2}/${cfg.pairs}` },
        { label: 'Best', value: best ?? '—' },
      ]}
      help={
        <ul>
          <li>Tap two cards to flip them.</li>
          <li>If they match, they stay open. If not, they flip back — remember where they were!</li>
          <li>Clear the board in <strong>fewer moves and less time</strong> for a higher score.</li>
        </ul>
      }
    >
      <div className={`mem-grid cols-${cfg.cols}`} style={{ '--cols': cfg.cols, '--rows': (cfg.pairs * 2) / cfg.cols }}>
        {cards.map((card, i) => {
          const up = flipped.includes(i) || matched.has(i);
          return (
            <button
              key={`${level}-${card.id}-${card.emoji}`}
              className={`mem-card ${up ? 'up' : ''} ${matched.has(i) ? 'matched' : ''} ${wrong.includes(i) ? 'wrong' : ''}`}
              onClick={() => flip(i)}
              aria-label={up ? card.emoji : `Card ${i + 1}`}
            >
              <span className="mem-inner">
                <span className="mem-back" />
                <span className="mem-front">{card.emoji}</span>
              </span>
            </button>
          );
        })}
      </div>

      <ResultSheet
        open={done}
        emoji={newBest ? '🏆' : '🧠'}
        title={newBest ? 'New best score!' : 'Board cleared!'}
        subtitle={`${cfg.label} · ${moves} moves · ${formatTime(seconds)}`}
        details={[{ label: 'Score', value: score }, { label: 'Best', value: Math.max(best ?? 0, score) }]}
        primary={{ label: 'Play again', onClick: () => reset() }}
        secondary={level !== 'hard' ? { label: 'Try a harder level', onClick: () => { const l = level === 'easy' ? 'medium' : 'hard'; setLevel(l); reset(l); } } : undefined}
      />
    </GameShell>
  );
};

export default Memory;
