import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { haptic, sfx } from '../../lib/sound';
import { COLS, ROWS, cpuColumn, emptyBoard, isFull, landingRow, winLineAt } from './logic';
import './connect4.css';

const NAMES = { cpu: { 1: 'You', 2: 'CPU' }, pvp: { 1: 'Red', 2: 'Yellow' } };

const ConnectFour = () => {
  const { recordGame } = useStats();
  const [mode, setMode] = useState('cpu');
  const [level, setLevel] = useState('medium');
  const [board, setBoard] = useState(emptyBoard);
  const [turn, setTurn] = useState(1);
  const [starter, setStarter] = useState(1);
  const [result, setResult] = useState(null); // { winner: 1|2|0, line }
  const [last, setLast] = useState(null);
  const [hover, setHover] = useState(null);
  const [score, setScore] = useState({ 1: 0, 2: 0, 0: 0 });
  const [showResult, setShowResult] = useState(false);
  const timer = useRef(null);

  const names = NAMES[mode];
  const cpuTurn = mode === 'cpu' && turn === 2 && !result;

  const newRound = (nextStarter) => {
    clearTimeout(timer.current);
    setBoard(emptyBoard());
    setTurn(nextStarter);
    setStarter(nextStarter);
    setResult(null);
    setLast(null);
    setShowResult(false);
  };

  const resetAll = () => {
    setScore({ 1: 0, 2: 0, 0: 0 });
    newRound(1);
  };

  const drop = (col, player) => {
    if (result) return;
    const r = landingRow(board, col);
    if (r < 0) return;
    const next = board.map((row) => [...row]);
    next[r][col] = player;
    setBoard(next);
    setLast([r, col]);
    sfx.pop();
    haptic(8);
    const line = winLineAt(next, r, col);
    if (line || isFull(next)) {
      const winner = line ? player : 0;
      setResult({ winner, line: line || [] });
      setScore((s) => ({ ...s, [winner]: s[winner] + 1 }));
      recordGame('connect4', { win: mode === 'cpu' && winner === 1 });
      if (winner === 0) sfx.draw();
      else if (mode === 'cpu' && winner === 2) sfx.lose();
      else {
        sfx.win();
        celebrate();
      }
      timer.current = setTimeout(() => setShowResult(true), 1100);
    } else {
      setTurn(player === 1 ? 2 : 1);
    }
  };

  useEffect(() => {
    if (!cpuTurn) return undefined;
    const t = setTimeout(() => drop(cpuColumn(board, 2, level), 2), 450);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpuTurn, board, level]);

  useEffect(() => () => clearTimeout(timer.current), []);

  const onColumn = (c) => {
    if (cpuTurn || result) return;
    drop(c, turn);
  };

  const isWinCell = (r, c) => result?.line.some(([rr, cc]) => rr === r && cc === c);

  let status;
  if (result) status = result.winner === 0 ? 'Board full — draw' : `${names[result.winner]} ${mode === 'cpu' && result.winner === 1 ? 'win' : 'wins'}!`;
  else if (cpuTurn) status = 'CPU is thinking…';
  else status = mode === 'cpu' ? 'Your move' : `${names[turn]}’s move`;

  let sheet = { emoji: '🤝', title: 'Draw', subtitle: 'The board is full.' };
  if (result && result.winner) {
    sheet = mode === 'cpu'
      ? result.winner === 1
        ? { emoji: '🏆', title: 'You win!', subtitle: 'Four in a row. Clean.' }
        : { emoji: '🤖', title: 'CPU wins', subtitle: 'Watch the diagonals.' }
      : { emoji: result.winner === 1 ? '🔴' : '🟡', title: `${names[result.winner]} wins!`, subtitle: 'Next round, the other side starts.' };
  }

  const settings = (fn) => (v) => {
    fn(v);
    setScore({ 1: 0, 2: 0, 0: 0 });
    newRound(1);
  };

  return (
    <GameShell
      id="connect4"
      onRestart={resetAll}
      toolbar={
        <>
          <Segmented label="Mode" value={mode} onChange={settings(setMode)} options={[{ value: 'cpu', label: '🤖 vs CPU' }, { value: 'pvp', label: '👥 2 Players' }]} />
          {mode === 'cpu' && (
            <Segmented label="Difficulty" value={level} onChange={settings(setLevel)} options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Hard' }]} />
          )}
        </>
      }
      stats={[
        { label: names[1], value: score[1], highlight: !result && turn === 1 },
        { label: 'Draws', value: score[0] },
        { label: names[2], value: score[2], highlight: !result && turn === 2 },
      ]}
      help={
        <ul>
          <li>Tap a column to drop your disc. It falls to the lowest free spot.</li>
          <li>Connect <strong>four in a row</strong> — horizontally, vertically or diagonally.</li>
          <li>Tip: the <strong>middle column</strong> is part of the most lines.</li>
        </ul>
      }
    >
      <div className="status-pill">
        <span className={`c4-chip-dot p${result ? result.winner || turn : turn}`} /> {status}
      </div>

      <div className="c4-wrap">
        <div className="c4-board" onMouseLeave={() => setHover(null)} style={{ '--cols': COLS, '--rows': ROWS }}>
          {Array.from({ length: COLS }, (_, c) => (
            <button
              key={c}
              className={`c4-col ${hover === c && !cpuTurn && !result ? 'hover' : ''}`}
              onClick={() => onColumn(c)}
              onMouseEnter={() => setHover(c)}
              disabled={Boolean(result) || cpuTurn || landingRow(board, c) < 0}
              aria-label={`Drop in column ${c + 1}`}
            >
              {Array.from({ length: ROWS }, (_, r) => {
                const v = board[r][c];
                const isLast = last && last[0] === r && last[1] === c;
                return (
                  <span key={r} className="c4-slot">
                    {v ? (
                      <motion.span
                        className={`c4-disc p${v} ${isWinCell(r, c) ? 'win' : ''} ${isLast ? 'last' : ''}`}
                        initial={isLast ? { y: `${-(r + 1) * 110}%` } : false}
                        animate={{ y: 0 }}
                        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                      />
                    ) : null}
                  </span>
                );
              })}
            </button>
          ))}
        </div>
      </div>

      {result && (
        <button className="btn btn-primary" onClick={() => newRound(starter === 1 ? 2 : 1)}>
          Next round
        </button>
      )}

      <ResultSheet
        open={showResult}
        onClose={() => setShowResult(false)}
        {...sheet}
        details={[
          { label: names[1], value: score[1] },
          { label: 'Draws', value: score[0] },
          { label: names[2], value: score[2] },
        ]}
        primary={{ label: 'Next round', onClick: () => newRound(starter === 1 ? 2 : 1) }}
      />
    </GameShell>
  );
};

export default ConnectFour;
