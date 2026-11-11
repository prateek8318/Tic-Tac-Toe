import React, { useCallback, useEffect, useRef, useState } from 'react';
import GameShell, { ResultSheet } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { haptic, sfx } from '../../lib/sound';
import './whack.css';

const HOLES = 9;
const DURATION = 30000;
const POINTS = { mole: 1, gold: 3, bomb: -3 };
const lerp = (a, b, t) => a + (b - a) * t;

const WhackAMole = () => {
  const { stats, recordGame, submitBest } = useStats();
  const [phase, setPhase] = useState('ready'); // ready | playing | over
  const [holes, setHoles] = useState(() => Array(HOLES).fill(null));
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DURATION);
  const [hits, setHits] = useState({ hit: 0, miss: 0, bombs: 0 });
  const [floaters, setFloaters] = useState([]);
  const [newBest, setNewBest] = useState(false);
  const loop = useRef({ end: 0, nextSpawn: 0, id: 0 });
  const scoreRef = useRef(0);
  const holesRef = useRef(Array(HOLES).fill(null));
  const best = Math.max(stats.bests.whack || 0, score);

  const updateHoles = (next) => {
    holesRef.current = next;
    setHoles(next);
  };

  const finish = useCallback(() => {
    setPhase('over');
    holesRef.current = Array(HOLES).fill(null);
    setHoles(holesRef.current);
    sfx.win();
    const final = scoreRef.current;
    recordGame('whack', { win: false });
    const isBest = final > 0 && submitBest('whack', final);
    setNewBest(isBest);
    if (isBest) celebrate();
  }, [recordGame, submitBest]);

  useEffect(() => {
    if (phase !== 'playing') return undefined;
    const tick = setInterval(() => {
      const now = Date.now();
      const L = loop.current;
      const left = Math.max(0, L.end - now);
      setTimeLeft(left);
      if (left <= 0) {
        clearInterval(tick);
        finish();
        return;
      }
      const progress = 1 - left / DURATION;
      let missed = 0;
      let changed = false;
      const next = holesRef.current.map((h) => {
        if (h && now >= h.until) {
          if (h.type !== 'bomb' && !h.hit) missed += 1;
          changed = true;
          return null;
        }
        return h;
      });
      if (missed) setHits((s) => ({ ...s, miss: s.miss + missed }));
      if (now >= L.nextSpawn) {
        const free = next.map((h, i) => (h ? null : i)).filter((i) => i !== null);
        if (free.length) {
          const idx = free[Math.floor(Math.random() * free.length)];
          const r = Math.random();
          const type = r < 0.14 ? 'bomb' : r < 0.24 ? 'gold' : 'mole';
          const life = type === 'gold' ? lerp(800, 500, progress) : lerp(1250, 650, progress);
          L.id += 1;
          next[idx] = { id: L.id, type, until: now + life, hit: false };
          changed = true;
        }
        // Sometimes two pop at once later in the round.
        L.nextSpawn = now + lerp(700, 330, progress) * (Math.random() < 0.2 * progress ? 0.2 : 1);
      }
      if (changed) {
        holesRef.current = next;
        setHoles(next);
      }
    }, 50);
    return () => clearInterval(tick);
  }, [phase, finish]);

  const start = () => {
    const now = Date.now();
    loop.current = { end: now + DURATION, nextSpawn: now + 400, id: 0 };
    scoreRef.current = 0;
    setScore(0);
    setHits({ hit: 0, miss: 0, bombs: 0 });
    updateHoles(Array(HOLES).fill(null));
    setTimeLeft(DURATION);
    setNewBest(false);
    setFloaters([]);
    setPhase('playing');
    sfx.tap();
  };

  const whack = (i) => {
    if (phase !== 'playing') return;
    const h = holesRef.current[i];
    if (!h || h.hit) return;
    const pts = POINTS[h.type];
    scoreRef.current = Math.max(0, scoreRef.current + pts);
    setScore(scoreRef.current);
    updateHoles(holesRef.current.map((x, idx) => (idx === i && x ? { ...x, hit: true, until: Date.now() + 220 } : x)));
    setHits((s) => (h.type === 'bomb' ? { ...s, bombs: s.bombs + 1 } : { ...s, hit: s.hit + 1 }));
    const fid = `${h.id}-${Date.now()}`;
    setFloaters((f) => [...f, { id: fid, hole: i, text: pts > 0 ? `+${pts}` : `${pts}`, bad: pts < 0 }]);
    setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 650);
    if (h.type === 'bomb') {
      sfx.bad();
      haptic([50, 30, 50]);
    } else {
      if (h.type === 'gold') sfx.good();
      else sfx.pop();
      haptic(10);
    }
  };

  const restart = () => {
    setPhase('ready');
    updateHoles(Array(HOLES).fill(null));
    setScore(0);
    setTimeLeft(DURATION);
  };

  const accuracy = hits.hit + hits.miss ? Math.round((hits.hit / (hits.hit + hits.miss)) * 100) : 0;
  const secs = Math.ceil(timeLeft / 1000);

  return (
    <GameShell
      id="whack"
      onRestart={restart}
      stats={[
        { label: 'Score', value: score, highlight: true },
        { label: 'Time', value: `${secs}s`, highlight: phase === 'playing' && secs <= 5 },
        { label: 'Best', value: best },
      ]}
      help={
        <ul>
          <li>Tap the moles as they pop up — you have <strong>30 seconds</strong>.</li>
          <li>🐹 = +1, ✨ golden mole = <strong>+3</strong>.</li>
          <li>💣 bombs cost you <strong>3 points</strong>. Don’t tap them!</li>
          <li>Moles get faster as the clock runs down.</li>
        </ul>
      }
    >
      <div className="whack-timer">
        <span style={{ width: `${(timeLeft / DURATION) * 100}%` }} />
      </div>
      <div className="whack-field">
        {holes.map((h, i) => (
          <button
            key={i}
            className={`whack-hole ${h ? 'up' : ''} ${h?.hit ? 'hit' : ''} ${h ? h.type : ''}`}
            onPointerDown={(e) => {
              e.preventDefault();
              whack(i);
            }}
            aria-label={h ? (h.type === 'bomb' ? 'Bomb' : 'Mole') : 'Empty hole'}
          >
            <span className="whack-pit" />
            <span className="whack-mole">{h ? (h.type === 'bomb' ? '💣' : h.hit ? '😵' : h.type === 'gold' ? '🤩' : '🐹') : ''}</span>
            {floaters
              .filter((f) => f.hole === i)
              .map((f) => (
                <span key={f.id} className={`whack-float ${f.bad ? 'bad' : ''}`}>
                  {f.text}
                </span>
              ))}
          </button>
        ))}
        {phase === 'ready' && (
          <button className="stage-overlay whack-start" onClick={start}>
            <strong>🔨 Tap to start</strong>
            <span>30 seconds on the clock</span>
          </button>
        )}
      </div>

      <ResultSheet
        open={phase === 'over'}
        emoji={newBest ? '🏆' : '🔨'}
        title={newBest ? 'New best!' : 'Time’s up!'}
        subtitle={`${hits.hit} hits · ${hits.bombs} bomb${hits.bombs === 1 ? '' : 's'} · ${accuracy}% accuracy`}
        details={[{ label: 'Score', value: score }, { label: 'Best', value: Math.max(stats.bests.whack || 0, score) }]}
        primary={{ label: 'Play again', onClick: start }}
      />
    </GameShell>
  );
};

export default WhackAMole;
