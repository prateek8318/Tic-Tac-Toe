import React, { useEffect, useRef, useState } from 'react';
import { Flag, Pickaxe } from 'lucide-react';
import GameShell, { ResultSheet, Segmented } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { formatTime } from '../../lib/random';
import { haptic, sfx } from '../../lib/sound';
import { LEVELS, emptyCells, neighbors, openFrom, plantMines } from './logic';
import './minesweeper.css';

const LONG_PRESS = 380;

const Minesweeper = () => {
  const { stats, recordGame, submitBest } = useStats();
  const [level, setLevel] = useState('easy');
  const cfg = LEVELS[level];
  const [cells, setCells] = useState(() => emptyCells(cfg.cols, cfg.rows));
  const [planted, setPlanted] = useState(false);
  const [status, setStatus] = useState('ready'); // ready | playing | won | lost
  const [flagMode, setFlagMode] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [boom, setBoom] = useState(null);
  const [sheet, setSheet] = useState(false);
  const [newBest, setNewBest] = useState(false);
  const press = useRef({ timer: null, fired: false });
  const sheetTimer = useRef(null);
  const bestKey = `mines:${level}`;
  const best = stats.bests[bestKey];

  const reset = (lvl = level) => {
    const c = LEVELS[lvl];
    clearTimeout(sheetTimer.current);
    setCells(emptyCells(c.cols, c.rows));
    setPlanted(false);
    setStatus('ready');
    setSeconds(0);
    setBoom(null);
    setSheet(false);
    setNewBest(false);
  };

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const id = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [status]);

  useEffect(() => () => clearTimeout(sheetTimer.current), []);

  const flags = cells.filter((c) => c.flag).length;

  const finish = (next, lostAt) => {
    if (lostAt !== undefined) {
      setCells(next.map((c) => (c.mine ? { ...c, open: true } : c)));
      setBoom(lostAt);
      setStatus('lost');
      sfx.bad();
      haptic([60, 40, 120]);
      recordGame('minesweeper', { win: false });
    } else {
      setCells(next.map((c) => (c.mine ? { ...c, flag: true } : c)));
      setStatus('won');
      sfx.win();
      celebrate();
      haptic([20, 40, 20]);
      recordGame('minesweeper', { win: true });
      setNewBest(submitBest(bestKey, seconds, { lower: true }));
    }
    sheetTimer.current = setTimeout(() => setSheet(true), 900);
  };

  const checkWin = (next) => next.every((c) => c.mine || c.open);

  const reveal = (i) => {
    if (status === 'won' || status === 'lost' || cells[i].flag) return;
    let board = cells;
    if (!planted) {
      board = plantMines(cells, i, cfg);
      setPlanted(true);
      setStatus('playing');
    }
    const cell = board[i];

    let targets = [i];
    // Chord: tapping an open number with enough flags opens its neighbours.
    if (cell.open) {
      if (!cell.count) return;
      const around = neighbors(i, cfg.cols, cfg.rows);
      const flagged = around.filter((n) => board[n].flag).length;
      if (flagged !== cell.count) return;
      targets = around.filter((n) => !board[n].open && !board[n].flag);
      if (!targets.length) return;
    }

    const next = openFrom(board, targets, cfg.cols, cfg.rows);
    const hit = targets.find((t) => next[t].mine);
    if (hit !== undefined) {
      finish(next, hit);
      return;
    }
    setCells(next);
    sfx.tap();
    if (checkWin(next)) finish(next);
  };

  const toggleFlag = (i) => {
    if (status === 'won' || status === 'lost' || cells[i].open) return;
    const next = cells.map((c, idx) => (idx === i ? { ...c, flag: !c.flag } : c));
    setCells(next);
    sfx.move();
    haptic(15);
  };

  const onPointerDown = (i) => {
    press.current.fired = false;
    clearTimeout(press.current.timer);
    press.current.timer = setTimeout(() => {
      press.current.fired = true;
      toggleFlag(i);
    }, LONG_PRESS);
  };
  const cancelPress = () => clearTimeout(press.current.timer);

  const onClick = (i) => {
    cancelPress();
    if (press.current.fired) {
      press.current.fired = false;
      return;
    }
    if (flagMode && !cells[i].open) toggleFlag(i);
    else reveal(i);
  };

  const changeLevel = (l) => {
    setLevel(l);
    reset(l);
  };

  return (
    <GameShell
      id="minesweeper"
      onRestart={() => reset()}
      toolbar={<Segmented label="Difficulty" value={level} onChange={changeLevel} options={Object.entries(LEVELS).map(([value, l]) => ({ value, label: l.label }))} />}
      stats={[
        { label: 'Mines', value: cfg.mines - flags },
        { label: 'Time', value: formatTime(seconds), highlight: status === 'playing' },
        { label: 'Best', value: best !== undefined ? formatTime(best) : '—' },
      ]}
      help={
        <ul>
          <li>Tap a square to dig. Your <strong>first tap is always safe</strong>.</li>
          <li>A number tells you how many mines touch that square.</li>
          <li><strong>Long-press</strong> (or switch to 🚩 mode / right-click) to place a flag.</li>
          <li>Tap an opened number whose mines are all flagged to open the rest around it.</li>
          <li>Open every safe square to win.</li>
        </ul>
      }
    >
      <div className="ms-mode">
        <button className={!flagMode ? 'active' : ''} onClick={() => setFlagMode(false)} aria-pressed={!flagMode}>
          <Pickaxe size={17} /> Dig
        </button>
        <button className={flagMode ? 'active flag' : ''} onClick={() => setFlagMode(true)} aria-pressed={flagMode}>
          <Flag size={17} /> Flag
        </button>
      </div>

      <div className="ms-scroll">
        <div className={`ms-board ${status}`} style={{ '--cols': cfg.cols, '--rows': cfg.rows }} onContextMenu={(e) => e.preventDefault()}>
          {cells.map((c, i) => (
            <button
              key={`${level}-${i}`}
              className={`ms-cell ${c.open ? 'open' : ''} ${c.open && c.mine ? 'mine' : ''} ${boom === i ? 'boom' : ''} ${c.flag ? 'flagged' : ''} n${c.count}`}
              onClick={() => onClick(i)}
              onPointerDown={() => onPointerDown(i)}
              onPointerUp={cancelPress}
              onPointerLeave={cancelPress}
              onContextMenu={(e) => {
                e.preventDefault();
                cancelPress();
                if (!press.current.fired) toggleFlag(i);
              }}
              aria-label={c.open ? (c.mine ? 'Mine' : `${c.count} mines nearby`) : c.flag ? 'Flagged' : 'Hidden'}
            >
              {c.open ? (c.mine ? '💣' : c.count || '') : c.flag ? (status === 'lost' && !c.mine ? '❌' : '🚩') : ''}
            </button>
          ))}
        </div>
      </div>

      <ResultSheet
        open={sheet}
        onClose={() => setSheet(false)}
        emoji={status === 'won' ? (newBest ? '🏆' : '😎') : '💥'}
        title={status === 'won' ? (newBest ? 'New best time!' : 'Field cleared!') : 'Boom!'}
        subtitle={status === 'won' ? `${cfg.label} cleared in ${formatTime(seconds)}.` : 'You hit a mine. Shake it off.'}
        details={status === 'won' ? [{ label: 'Time', value: formatTime(seconds) }, { label: 'Best', value: formatTime(Math.min(best ?? seconds, seconds)) }] : []}
        primary={{ label: 'Play again', onClick: () => reset() }}
      />
    </GameShell>
  );
};

export default Minesweeper;
