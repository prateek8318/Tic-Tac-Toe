import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { haptic, sfx } from '../../lib/sound';
import { cpuMove, getResult } from './logic';
import './tictactoe.css';

const EMPTY = Array(9).fill(null);
const HUMAN = 'X';
const CPU = 'O';

const Mark = ({ value }) =>
  value === 'X' ? (
    <svg viewBox="0 0 60 60" className="ttt-x">
      <motion.line x1="14" y1="14" x2="46" y2="46" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18 }} />
      <motion.line x1="46" y1="14" x2="14" y2="46" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.18, delay: 0.12 }} />
    </svg>
  ) : (
    <svg viewBox="0 0 60 60" className="ttt-o">
      <motion.circle cx="30" cy="30" r="17" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 0.3 }} />
    </svg>
  );

const TicTacToe = () => {
  const { recordGame } = useStats();
  const [mode, setMode] = useState('cpu');
  const [level, setLevel] = useState('hard');
  const [board, setBoard] = useState(EMPTY);
  const [starter, setStarter] = useState('X');
  const [turn, setTurn] = useState('X');
  const [score, setScore] = useState({ X: 0, O: 0, draw: 0 });
  const [showResult, setShowResult] = useState(false);
  const resultTimer = useRef(null);

  const result = getResult(board);

  const newRound = (nextStarter) => {
    clearTimeout(resultTimer.current);
    setBoard(EMPTY);
    setTurn(nextStarter);
    setStarter(nextStarter);
    setShowResult(false);
  };

  const resetAll = () => {
    setScore({ X: 0, O: 0, draw: 0 });
    newRound('X');
  };

  const finish = (outcome) => {
    setScore((s) => ({ ...s, [outcome.winner]: s[outcome.winner] + 1 }));
    if (mode === 'cpu') {
      recordGame('tictactoe', { win: outcome.winner === HUMAN });
      if (outcome.winner === HUMAN) {
        sfx.win();
        celebrate();
      } else if (outcome.winner === CPU) sfx.lose();
      else sfx.draw();
    } else {
      recordGame('tictactoe', { win: false });
      if (outcome.winner === 'draw') sfx.draw();
      else {
        sfx.win();
        celebrate();
      }
    }
    haptic(outcome.winner === 'draw' ? 20 : [20, 40, 20]);
    resultTimer.current = setTimeout(() => setShowResult(true), 900);
  };

  const place = (index, player) => {
    if (board[index] || result) return;
    const next = [...board];
    next[index] = player;
    setBoard(next);
    sfx.move();
    haptic(8);
    const outcome = getResult(next);
    if (outcome) finish(outcome);
    else setTurn(player === 'X' ? 'O' : 'X');
  };

  // CPU plays after a short "thinking" pause.
  const cpuTurn = mode === 'cpu' && turn === CPU && !result;
  useEffect(() => {
    if (!cpuTurn) return undefined;
    const t = setTimeout(() => place(cpuMove(board, CPU, level), CPU), 420);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cpuTurn, board, level]);

  useEffect(() => () => clearTimeout(resultTimer.current), []);

  const onCell = (i) => {
    if (cpuTurn) return;
    place(i, turn);
  };

  const changeMode = (m) => {
    setMode(m);
    setScore({ X: 0, O: 0, draw: 0 });
    newRound('X');
  };

  const changeLevel = (l) => {
    setLevel(l);
    setScore({ X: 0, O: 0, draw: 0 });
    newRound('X');
  };

  const names = mode === 'cpu' ? { X: 'You', O: 'CPU' } : { X: 'Player X', O: 'Player O' };

  let status;
  if (result) status = result.winner === 'draw' ? 'Draw!' : `${names[result.winner]} ${mode === 'cpu' && result.winner === HUMAN ? 'win' : 'wins'}!`;
  else if (cpuTurn) status = 'CPU is thinking…';
  else status = mode === 'cpu' ? 'Your turn' : `${names[turn]}’s turn`;

  let sheet = { emoji: '🤝', title: 'It’s a draw', subtitle: 'Nobody blinked.' };
  if (result && result.winner !== 'draw') {
    if (mode === 'cpu') {
      sheet = result.winner === HUMAN
        ? { emoji: '🏆', title: 'You win!', subtitle: level === 'hard' ? 'You beat the unbeatable?!' : 'Nicely played.' }
        : { emoji: '🤖', title: 'CPU wins', subtitle: 'Try a different opening.' };
    } else {
      sheet = { emoji: result.winner === 'X' ? '❌' : '⭕', title: `${names[result.winner]} wins!`, subtitle: 'Next round, the other player starts.' };
    }
  }

  return (
    <GameShell
      id="tictactoe"
      onRestart={resetAll}
      toolbar={
        <>
          <Segmented label="Mode" value={mode} onChange={changeMode} options={[{ value: 'cpu', label: '🤖 vs CPU' }, { value: 'pvp', label: '👥 2 Players' }]} />
          {mode === 'cpu' && (
            <Segmented
              label="Difficulty"
              value={level}
              onChange={changeLevel}
              options={[{ value: 'easy', label: 'Easy' }, { value: 'medium', label: 'Medium' }, { value: 'hard', label: 'Unbeatable' }]}
            />
          )}
        </>
      }
      stats={[
        { label: names.X, value: score.X, highlight: !result && turn === 'X' },
        { label: 'Draws', value: score.draw },
        { label: names.O, value: score.O, highlight: !result && turn === 'O' },
      ]}
      help={
        <ul>
          <li>Take turns placing <strong>X</strong> and <strong>O</strong>.</li>
          <li>Get <strong>three in a row</strong> — across, down or diagonal — to win.</li>
          <li>The starting player switches every round.</li>
          <li>On <strong>Unbeatable</strong>, the best you can do is a draw… probably.</li>
        </ul>
      }
    >
      <div className="status-pill">
        <span className="dot" /> {status}
      </div>

      <div className={`ttt-board ${result ? 'over' : ''}`}>
        {board.map((cell, i) => {
          const winning = result?.line.includes(i);
          return (
            <button
              key={i}
              className={`ttt-cell ${winning ? 'win' : ''} ${cell ? 'filled' : ''}`}
              onClick={() => onCell(i)}
              disabled={Boolean(cell) || Boolean(result) || cpuTurn}
              aria-label={`Cell ${i + 1}${cell ? `, ${cell}` : ''}`}
            >
              {cell && <Mark value={cell} />}
            </button>
          );
        })}
      </div>

      {result && (
        <button className="btn btn-primary" onClick={() => newRound(starter === 'X' ? 'O' : 'X')}>
          Next round
        </button>
      )}

      <ResultSheet
        open={showResult}
        onClose={() => setShowResult(false)}
        {...sheet}
        details={[
          { label: names.X, value: score.X },
          { label: 'Draws', value: score.draw },
          { label: names.O, value: score.O },
        ]}
        primary={{ label: 'Next round', onClick: () => newRound(starter === 'X' ? 'O' : 'X') }}
      />
    </GameShell>
  );
};

export default TicTacToe;
