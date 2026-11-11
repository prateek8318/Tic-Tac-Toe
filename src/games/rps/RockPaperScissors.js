import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { haptic, sfx } from '../../lib/sound';
import './rps.css';

const CHOICES = {
  rock: { emoji: '✊', name: 'Rock', beats: 'scissors' },
  paper: { emoji: '✋', name: 'Paper', beats: 'rock' },
  scissors: { emoji: '✌️', name: 'Scissors', beats: 'paper' },
};
const IDS = Object.keys(CHOICES);
const counter = (id) => IDS.find((k) => CHOICES[k].beats === id);
const randomId = () => IDS[Math.floor(Math.random() * 3)];

// Predicts your next move from what you usually play after your last move
// (falls back to your overall favourite), then plays the counter.
// A bit of randomness keeps it from being fully predictable.
const cpuPick = (history) => {
  if (history.length < 2 || Math.random() < 0.3) return randomId();
  const last = history[history.length - 1];
  const after = {};
  for (let i = 0; i < history.length - 1; i += 1) {
    if (history[i] === last) after[history[i + 1]] = (after[history[i + 1]] || 0) + 1;
  }
  const counts = Object.keys(after).length ? after : history.reduce((m, id) => ({ ...m, [id]: (m[id] || 0) + 1 }), {});
  const top = Math.max(...Object.values(counts));
  const likely = Object.keys(counts).filter((k) => counts[k] === top);
  return counter(likely[Math.floor(Math.random() * likely.length)]);
};

const RockPaperScissors = () => {
  const { recordGame } = useStats();
  const [target, setTarget] = useState(3);
  const [score, setScore] = useState({ you: 0, cpu: 0, draw: 0 });
  const [history, setHistory] = useState([]);
  const [round, setRound] = useState(null); // { you, cpu, outcome }
  const [shaking, setShaking] = useState(false);
  const [champion, setChampion] = useState(null);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  const play = (id) => {
    if (shaking || champion) return;
    sfx.tap();
    haptic(8);
    setShaking(true);
    setRound(null);
    timer.current = setTimeout(() => {
      const cpu = cpuPick(history);
      const outcome = id === cpu ? 'draw' : CHOICES[id].beats === cpu ? 'you' : 'cpu';
      const next = { ...score, [outcome]: score[outcome] + 1 };
      setHistory((h) => [...h, id]);
      setScore(next);
      setRound({ you: id, cpu, outcome });
      setShaking(false);
      if (outcome === 'you') sfx.good();
      else if (outcome === 'cpu') sfx.bad();
      else sfx.draw();
      if (next.you === target || next.cpu === target) {
        const winner = next.you === target ? 'you' : 'cpu';
        recordGame('rps', { win: winner === 'you' });
        timer.current = setTimeout(() => {
          setChampion(winner);
          if (winner === 'you') {
            sfx.win();
            celebrate();
          } else sfx.lose();
        }, 700);
      }
    }, 700);
  };

  const reset = (t = target) => {
    clearTimeout(timer.current);
    setTarget(t);
    setScore({ you: 0, cpu: 0, draw: 0 });
    setHistory([]);
    setRound(null);
    setShaking(false);
    setChampion(null);
  };

  const outcomeText = round ? { you: 'You win the round!', cpu: 'CPU wins the round', draw: 'Draw — go again' }[round.outcome] : shaking ? 'Rock… paper… scissors…' : 'Pick your move';

  return (
    <GameShell
      id="rps"
      onRestart={() => reset()}
      toolbar={<Segmented label="Match length" value={target} onChange={(t) => reset(t)} options={[{ value: 1, label: 'Quick · 1' }, { value: 3, label: 'First to 3' }, { value: 5, label: 'First to 5' }]} />}
      stats={[
        { label: 'You', value: score.you, highlight: round?.outcome === 'you' },
        { label: 'Draws', value: score.draw },
        { label: 'CPU', value: score.cpu, highlight: round?.outcome === 'cpu' },
      ]}
      help={
        <ul>
          <li>✊ Rock beats ✌️ Scissors, ✌️ Scissors beat ✋ Paper, ✋ Paper beats ✊ Rock.</li>
          <li>First to the target number of round wins takes the match.</li>
          <li>The CPU <strong>learns your habits</strong> — mix it up!</li>
        </ul>
      }
    >
      <div className="rps-arena">
        <div className={`rps-hand you ${round?.outcome === 'you' ? 'won' : ''} ${round?.outcome === 'cpu' ? 'lost' : ''}`}>
          <small>YOU</small>
          <motion.span
            key={shaking ? 'shake' : round?.you || 'idle'}
            className="rps-emoji"
            animate={shaking ? { y: [0, -18, 0, -18, 0, -18, 0] } : { scale: [0.6, 1.1, 1] }}
            transition={{ duration: shaking ? 0.7 : 0.3 }}
          >
            {shaking ? '✊' : round ? CHOICES[round.you].emoji : '🤔'}
          </motion.span>
        </div>
        <div className="rps-vs">VS</div>
        <div className={`rps-hand cpu ${round?.outcome === 'cpu' ? 'won' : ''} ${round?.outcome === 'you' ? 'lost' : ''}`}>
          <small>CPU</small>
          <span className="rps-flip">
          <motion.span
            key={shaking ? 'shake' : round?.cpu || 'idle'}
            className="rps-emoji"
            animate={shaking ? { y: [0, -18, 0, -18, 0, -18, 0] } : { scale: [0.6, 1.1, 1] }}
            transition={{ duration: shaking ? 0.7 : 0.3 }}
          >
            {shaking ? '✊' : round ? CHOICES[round.cpu].emoji : '🤖'}
          </motion.span>
          </span>
        </div>
      </div>

      <div className={`status-pill rps-status ${round?.outcome || ''}`}>
        <span className="dot" /> {outcomeText}
      </div>

      <div className="rps-race" aria-label={`First to ${target}`}>
        <div>
          {Array.from({ length: target }, (_, i) => (
            <span key={i} className={i < score.you ? 'on you' : ''} />
          ))}
        </div>
        <small>FIRST TO {target}</small>
        <div>
          {Array.from({ length: target }, (_, i) => (
            <span key={i} className={i < score.cpu ? 'on cpu' : ''} />
          ))}
        </div>
      </div>

      <div className="rps-picks">
        {IDS.map((id) => (
          <button key={id} className="rps-pick" onClick={() => play(id)} disabled={shaking || Boolean(champion)}>
            <span>{CHOICES[id].emoji}</span>
            <strong>{CHOICES[id].name}</strong>
          </button>
        ))}
      </div>

      <ResultSheet
        open={Boolean(champion)}
        emoji={champion === 'you' ? '🏆' : '🤖'}
        title={champion === 'you' ? 'You win the match!' : 'CPU wins the match'}
        subtitle={champion === 'you' ? 'Unpredictable. Love it.' : 'It read your pattern. Switch it up!'}
        details={[{ label: 'You', value: score.you }, { label: 'Draws', value: score.draw }, { label: 'CPU', value: score.cpu }]}
        primary={{ label: 'Rematch', onClick: () => reset() }}
      />
    </GameShell>
  );
};

export default RockPaperScissors;
