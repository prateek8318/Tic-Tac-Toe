import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { load, save, remove } from '../lib/storage';

const KEY = 'arcade-stats-v2';
const empty = { games: {}, bests: {} };

// Carry over wins saved by the old version of the app.
const migrate = () => {
  const old = load('arcade-scores', null);
  if (!old) return empty;
  const map = { tictactoe: 'tictactoe', memory: 'memory', rps: 'rps' };
  const games = {};
  Object.entries(map).forEach(([oldKey, id]) => {
    const wins = Number(old[oldKey]) || 0;
    if (wins) games[id] = { played: wins, wins };
  });
  remove('arcade-scores');
  return { ...empty, games };
};

const StatsContext = createContext(null);

export const StatsProvider = ({ children }) => {
  const [stats, setStats] = useState(() => {
    const stored = load(KEY, null);
    return stored && stored.games ? stored : migrate();
  });

  useEffect(() => save(KEY, stats), [stats]);

  // Count one finished game. `win` is true when the player beat the game / CPU.
  const recordGame = useCallback((gameId, { win = false } = {}) => {
    setStats((prev) => {
      const current = prev.games[gameId] || { played: 0, wins: 0 };
      return {
        ...prev,
        games: {
          ...prev.games,
          [gameId]: { played: current.played + 1, wins: current.wins + (win ? 1 : 0), last: Date.now() },
        },
      };
    });
  }, []);

  // Returns true when `value` beats the saved best for `key`.
  const submitBest = useCallback(
    (key, value, { lower = false } = {}) => {
      const previous = stats.bests[key];
      const better = previous === undefined || (lower ? value < previous : value > previous);
      if (better) setStats((prev) => ({ ...prev, bests: { ...prev.bests, [key]: value } }));
      return better;
    },
    [stats.bests]
  );

  const resetStats = useCallback(() => setStats(empty), []);

  const value = useMemo(() => ({ stats, recordGame, submitBest, resetStats }), [stats, recordGame, submitBest, resetStats]);
  return <StatsContext.Provider value={value}>{children}</StatsContext.Provider>;
};

export const useStats = () => {
  const ctx = useContext(StatsContext);
  if (!ctx) throw new Error('useStats must be used inside StatsProvider');
  return ctx;
};
