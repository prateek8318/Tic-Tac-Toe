import React, { useEffect, useRef, useState } from 'react';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { haptic, sfx } from '../../lib/sound';
import './simon.css';

const PADS = [
  { id: 0, name: 'green', freq: 392 },
  { id: 1, name: 'red', freq: 330 },
  { id: 2, name: 'yellow', freq: 262 },
  { id: 3, name: 'blue', freq: 196 },
];

const Simon = () => {
  const { stats, recordGame, submitBest } = useStats();
  const [mode, setMode] = useState('classic'); // classic | reverse
  const [sequence, setSequence] = useState([]);
  const [phase, setPhase] = useState('ready'); // ready | showing | input | over
  const [active, setActive] = useState(null);
  const [inputIndex, setInputIndex] = useState(0);
  const [newBest, setNewBest] = useState(false);
  const timers = useRef([]);
  const bestKey = mode === 'classic' ? 'simon' : 'simon:reverse';
  const best = stats.bests[bestKey] || 0;
  const round = sequence.length;
  const score = Math.max(0, round - 1); // rounds fully repeated

  const clearTimers = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  };
  const later = (fn, ms) => timers.current.push(setTimeout(fn, ms));
  useEffect(() => clearTimers, []);

  const flash = (id, ms) => {
    setActive(id);
    sfx.note(PADS[id].freq);
    later(() => setActive(null), ms);
  };

  // Plays the sequence back; gets faster as it grows.
  const playSequence = (seq) => {
    setPhase('showing');
    setInputIndex(0);
    const on = Math.max(220, 520 - seq.length * 22);
    const gap = Math.max(90, 200 - seq.length * 8);
    seq.forEach((id, i) => later(() => flash(id, on), 600 + i * (on + gap)));
    later(() => setPhase('input'), 600 + seq.length * (on + gap));
  };

  const nextRound = (seq) => {
    const next = [...seq, Math.floor(Math.random() * 4)];
    setSequence(next);
    playSequence(next);
  };

  const start = () => {
    clearTimers();
    setNewBest(false);
    setActive(null);
    nextRound([]);
  };

  const press = (id) => {
    if (phase !== 'input') return;
    const expectedIndex = mode === 'classic' ? inputIndex : sequence.length - 1 - inputIndex;
    if (sequence[expectedIndex] !== id) {
      setActive(id);
      later(() => setActive(null), 300);
      sfx.bad();
      haptic([60, 40, 60]);
      setPhase('over');
      const finalScore = sequence.length - 1;
      recordGame('simon', { win: false });
      const isBest = finalScore > 0 && submitBest(bestKey, finalScore);
      setNewBest(isBest);
      if (isBest) celebrate();
      return;
    }
    flash(id, 220);
    haptic(8);
    const nextIndex = inputIndex + 1;
    if (nextIndex === sequence.length) {
      setPhase('showing');
      later(() => sfx.good(), 260);
      later(() => nextRound(sequence), 700);
    } else setInputIndex(nextIndex);
  };

  const restart = () => {
    clearTimers();
    setSequence([]);
    setActive(null);
    setPhase('ready');
  };

  let label = 'Tap start';
  if (phase === 'showing') label = 'Watch…';
  if (phase === 'input') label = mode === 'classic' ? 'Your turn' : 'Your turn — in reverse!';
  if (phase === 'over') label = 'Wrong pad!';

  return (
    <GameShell
      id="simon"
      onRestart={restart}
      toolbar={
        <Segmented
          label="Mode"
          value={mode}
          onChange={(m) => {
            setMode(m);
            restart();
          }}
          options={[{ value: 'classic', label: 'Classic' }, { value: 'reverse', label: '🔁 Reverse' }]}
        />
      }
      stats={[
        { label: 'Round', value: round || '—', highlight: phase === 'input' },
        { label: 'Score', value: score },
        { label: 'Best', value: best },
      ]}
      help={
        <ul>
          <li>Watch the pads light up, then tap them in the <strong>same order</strong>.</li>
          <li>Each round adds one more step and plays a little faster.</li>
          <li><strong>Reverse</strong> mode: repeat the pattern backwards.</li>
        </ul>
      }
    >
      <div className={`simon ${phase}`}>
        {PADS.map((p) => (
          <button
            key={p.id}
            className={`simon-pad ${p.name} ${active === p.id ? 'lit' : ''}`}
            onPointerDown={(e) => {
              e.preventDefault();
              press(p.id);
            }}
            disabled={phase !== 'input'}
            aria-label={`${p.name} pad`}
          />
        ))}
        <div className="simon-hub">
          {phase === 'ready' || phase === 'over' ? (
            <button className="simon-start" onClick={start}>
              {phase === 'over' ? 'Again' : 'Start'}
            </button>
          ) : (
            <div className="simon-label">
              <strong>{round}</strong>
              <small>{phase === 'input' ? `${inputIndex}/${round}` : 'watch'}</small>
            </div>
          )}
        </div>
      </div>
      <div className="status-pill">
        <span className="dot" /> {label}
      </div>

      <ResultSheet
        open={phase === 'over'}
        onClose={restart}
        emoji={newBest ? '🏆' : '🎵'}
        title={newBest ? 'New best!' : 'Game over'}
        subtitle={`You remembered ${Math.max(0, round - 1)} step${round - 1 === 1 ? '' : 's'}.`}
        details={[{ label: 'Score', value: Math.max(0, round - 1) }, { label: 'Best', value: best }]}
        primary={{ label: 'Play again', onClick: start }}
      />
    </GameShell>
  );
};

export default Simon;
