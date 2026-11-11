import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import { GAMES } from '../games/registry';
import { useStats } from '../context/StatsContext';
import { Sheet } from '../components/app/GameShell';
import { formatTime } from '../lib/random';
import './pages.css';

// Extra "best" records that are stored per difficulty level.
const LEVEL_BESTS = {
  memory: [
    ['memory:easy', 'Easy'],
    ['memory:medium', 'Medium'],
    ['memory:hard', 'Hard'],
  ],
  minesweeper: [
    ['mines:easy', 'Easy'],
    ['mines:medium', 'Medium'],
    ['mines:hard', 'Hard'],
  ],
};

const Stats = () => {
  const { stats, resetStats } = useStats();
  const [confirm, setConfirm] = useState(false);

  const totals = useMemo(() => {
    const list = Object.values(stats.games);
    const played = list.reduce((n, g) => n + g.played, 0);
    const wins = list.reduce((n, g) => n + g.wins, 0);
    return { played, wins, rate: played ? Math.round((wins / played) * 100) : 0 };
  }, [stats.games]);

  return (
    <div className="page stats-page">
      <h1 className="page-title">Your stats</h1>
      <p className="page-sub">Saved on this device only.</p>

      <div className="totals">
        <div>
          <small>Played</small>
          <strong>{totals.played}</strong>
        </div>
        <div>
          <small>Wins</small>
          <strong>{totals.wins}</strong>
        </div>
        <div>
          <small>Win rate</small>
          <strong>{totals.rate}%</strong>
        </div>
      </div>

      <div className="stat-list">
        {GAMES.map((game) => {
          const s = stats.games[game.id] || { played: 0, wins: 0 };
          const rate = s.played ? Math.round((s.wins / s.played) * 100) : 0;
          const extras = [];
          if (game.bestKey && stats.bests[game.bestKey] !== undefined) extras.push(`Best ${stats.bests[game.bestKey]}`);
          (LEVEL_BESTS[game.id] || []).forEach(([key, label]) => {
            const v = stats.bests[key];
            if (v !== undefined) extras.push(`${label} ${game.id === 'minesweeper' ? formatTime(v) : v}`);
          });
          return (
            <Link key={game.id} to={`/play/${game.id}`} className="stat-row" style={{ '--game': game.color }}>
              <span className="game-card-icon small">{game.emoji}</span>
              <span className="stat-row-main">
                <strong>{game.name}</strong>
                <small>
                  {s.played} played · {s.wins} wins{extras.length ? ` · ${extras.join(' · ')}` : ''}
                </small>
                <span className="bar">
                  <span style={{ width: `${rate}%` }} />
                </span>
              </span>
              <span className="stat-rate">{rate}%</span>
            </Link>
          );
        })}
      </div>

      <button className="btn btn-ghost reset-btn" onClick={() => setConfirm(true)}>
        <Trash2 size={16} /> Reset all stats
      </button>

      <Sheet open={confirm} onClose={() => setConfirm(false)} label="Reset stats">
        <div className="result">
          <div className="result-emoji">🗑️</div>
          <h2>Reset everything?</h2>
          <p>All wins, games played and best scores will be deleted.</p>
          <div className="result-actions">
            <button
              className="btn btn-primary danger"
              onClick={() => {
                resetStats();
                setConfirm(false);
              }}
            >
              Yes, reset
            </button>
            <button className="btn btn-ghost" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      </Sheet>
    </div>
  );
};

export default Stats;
