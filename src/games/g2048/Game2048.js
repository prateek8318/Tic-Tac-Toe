import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Undo2 } from 'lucide-react';
import GameShell, { ResultSheet } from '../../components/app/GameShell';
import { useStats } from '../../context/StatsContext';
import { celebrate } from '../../lib/celebrate';
import { load, save } from '../../lib/storage';
import { haptic, sfx } from '../../lib/sound';
import useSwipe from '../useSwipe';
import { SIZE, addRandomTile, canMove, move, newGame, syncIds } from './logic';
import './g2048.css';

const SAVE_KEY = 'arcade-2048-save';

const freshState = () => ({ tiles: newGame(), score: 0, won: false, over: false, keepGoing: false, recorded: false });

const Game2048 = () => {
  const { stats, recordGame, submitBest } = useStats();
  // Resume the last unfinished board.
  const [state, setState] = useState(() => {
    const saved = load(SAVE_KEY, null);
    if (saved && Array.isArray(saved.tiles) && saved.tiles.length && !saved.over) {
      syncIds(saved.tiles);
      return saved;
    }
    return freshState();
  });
  const [history, setHistory] = useState(null);
  const [sheet, setSheet] = useState(null); // 'won' | 'over'
  const boardRef = useRef(null);
  const best = Math.max(stats.bests['2048'] || 0, state.score);

  useEffect(() => save(SAVE_KEY, state), [state]);

  const restart = useCallback(() => {
    setState(freshState());
    setHistory(null);
    setSheet(null);
  }, []);

  const doMove = useCallback(
    (dir) => {
      if (state.over || (state.won && !state.keepGoing)) return;
      const { tiles, moved, gained } = move(state.tiles, dir);
      if (!moved) return;
      const withNew = addRandomTile(tiles);
      const score = state.score + gained;
      const reached = withNew.some((t) => t.value === 2048);
      const won = state.won || reached;
      const over = !canMove(withNew);
      setHistory({ ...state });
      setState({ ...state, tiles: withNew, score, won, over });

      if (gained) {
        sfx.pop();
        haptic(6);
      } else sfx.move();

      if (reached && !state.won) {
        sfx.win();
        celebrate(true);
        if (!state.recorded) recordGame('g2048', { win: true });
        setState((s) => ({ ...s, recorded: true }));
        submitBest('2048', score);
        setSheet('won');
      } else if (over) {
        sfx.lose();
        haptic([30, 50, 30]);
        if (!state.recorded) recordGame('g2048', { win: false });
        setState((s) => ({ ...s, recorded: true }));
        submitBest('2048', score);
        setTimeout(() => setSheet('over'), 500);
      }
    },
    [state, recordGame, submitBest]
  );

  const undo = () => {
    if (!history) return;
    sfx.tap();
    // Keep win / recorded flags so undoing never counts the same game twice.
    setState({ ...history, won: history.won || state.won, keepGoing: history.keepGoing || state.won, recorded: history.recorded || state.recorded });
    setHistory(null);
    setSheet(null);
  };

  useEffect(() => {
    const keys = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down', a: 'left', d: 'right', w: 'up', s: 'down' };
    const onKey = (e) => {
      const dir = keys[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doMove]);

  useSwipe(boardRef, doMove);

  return (
    <GameShell
      id="g2048"
      onRestart={restart}
      stats={[
        { label: 'Score', value: state.score, highlight: true },
        { label: 'Best', value: best },
      ]}
      help={
        <ul>
          <li><strong>Swipe</strong> (or use arrow keys) to slide all tiles.</li>
          <li>Two tiles with the same number <strong>merge</strong> into one.</li>
          <li>Reach the <strong>2048</strong> tile to win — then keep going for a high score.</li>
          <li>You can <strong>undo</strong> your last move once.</li>
        </ul>
      }
    >
      <div className="g2048-board" ref={boardRef} style={{ '--size': SIZE }}>
        {Array.from({ length: SIZE * SIZE }, (_, i) => (
          <span key={i} className="g2048-cell" style={{ '--r': Math.floor(i / SIZE), '--c': i % SIZE }} />
        ))}
        {state.tiles.map((t) => (
          <div key={t.id} className={`g2048-tile v${t.value > 2048 ? 'big' : t.value}`} style={{ '--r': t.r, '--c': t.c }}>
            <span key={`${t.value}-${t.merged ? 'm' : ''}`} className={`g2048-inner ${t.isNew ? 'new' : ''} ${t.merged ? 'merged' : ''}`}>
              {t.value}
            </span>
          </div>
        ))}
      </div>

      <div className="g2048-actions">
        <button className="btn btn-ghost" onClick={undo} disabled={!history}>
          <Undo2 size={17} /> Undo
        </button>
        <button className="btn btn-primary" onClick={() => { sfx.tap(); restart(); }}>
          New game
        </button>
      </div>

      <ResultSheet
        open={sheet === 'won'}
        emoji="🏆"
        title="You made 2048!"
        subtitle="Keep going to chase a higher score."
        details={[{ label: 'Score', value: state.score }, { label: 'Best', value: best }]}
        primary={{ label: 'Keep going', onClick: () => { setState((s) => ({ ...s, keepGoing: true })); setSheet(null); } }}
        secondary={{ label: 'New game', onClick: restart }}
      />
      <ResultSheet
        open={sheet === 'over'}
        onClose={() => setSheet(null)}
        emoji="🧱"
        title="No moves left"
        subtitle={state.score >= best && state.score > 0 ? 'New best score!' : 'So close. One more?'}
        details={[{ label: 'Score', value: state.score }, { label: 'Best', value: best }]}
        primary={{ label: 'Play again', onClick: restart }}
        secondary={history ? { label: 'Undo last move', onClick: undo } : undefined}
      />
    </GameShell>
  );
};

export default Game2048;
