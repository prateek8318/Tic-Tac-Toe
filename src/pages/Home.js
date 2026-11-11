import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowUpRight, Flame, Play as PlayIcon, Search, Sparkles, Trophy, X } from 'lucide-react';
import { CATEGORIES, GAMES } from '../games/registry';
import { useStats } from '../context/StatsContext';
import './pages.css';

const Showcase = ({ startIndex }) => {
  const [index, setIndex] = useState(startIndex);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return undefined;
    const id = setInterval(() => setIndex((i) => (i + 1) % GAMES.length), 4200);
    return () => clearInterval(id);
  }, [paused]);

  const game = GAMES[index];
  return (
    <div className="showcase" style={{ '--game': game.color }} onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      <div className="showcase-glow" />
      <span className="showcase-badge">
        <Sparkles size={13} /> Featured
      </span>
      <AnimatePresence mode="wait">
        <motion.div
          key={game.id}
          className="showcase-body"
          initial={{ opacity: 0, y: 16, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -12, scale: 0.98 }}
          transition={{ duration: 0.35, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <div className="showcase-art">
            <span className="ring r1" />
            <span className="ring r2" />
            <span className="showcase-emoji">{game.emoji}</span>
          </div>
          <div className="showcase-copy">
            <span className="game-card-tag">{game.category}</span>
            <h2>{game.name}</h2>
            <p>{game.tagline}</p>
            <Link to={`/play/${game.id}`} className="btn btn-primary">
              <PlayIcon size={16} /> Play now
            </Link>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="showcase-dots" role="tablist" aria-label="Featured games">
        {GAMES.map((g, i) => (
          <button key={g.id} role="tab" aria-selected={i === index} aria-label={g.name} className={i === index ? 'on' : ''} onClick={() => setIndex(i)} />
        ))}
      </div>
    </div>
  );
};

const Home = () => {
  const { stats } = useStats();
  const [category, setCategory] = useState('All');
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter(
      (g) => (category === 'All' || g.category === category) && (!q || `${g.name} ${g.tagline} ${g.category}`.toLowerCase().includes(q))
    );
  }, [category, query]);

  const totals = useMemo(() => {
    const list = Object.values(stats.games);
    const played = list.reduce((n, g) => n + g.played, 0);
    const wins = list.reduce((n, g) => n + g.wins, 0);
    return { played, wins, rate: played ? Math.round((wins / played) * 100) : 0 };
  }, [stats.games]);

  const lastPlayed = useMemo(() => {
    const entries = Object.entries(stats.games).filter(([, g]) => g.last);
    if (!entries.length) return null;
    entries.sort((a, b) => b[1].last - a[1].last);
    return GAMES.find((g) => g.id === entries[0][0]) || null;
  }, [stats.games]);

  const featured = lastPlayed || GAMES[0];

  return (
    <div className="page home">
      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">
            <span className="live-dot" /> {GAMES.length} GAMES · NO ADS · WORKS OFFLINE
          </span>
          <h1>
            Small games.
            <br />
            <em>Big energy.</em>
          </h1>
          <p>Quick rounds you can play anywhere — strategy, puzzles, brain training and pure arcade reflexes. Your wins and best scores stay on this device.</p>
          <div className="hero-actions">
            <Link to={`/play/${featured.id}`} className="btn btn-primary hero-cta" style={{ '--game': featured.color }}>
              <PlayIcon size={17} /> {lastPlayed ? `Continue ${featured.name}` : `Play ${featured.name}`}
            </Link>
            <a href="#games" className="btn btn-ghost hero-browse">
              Browse all games
            </a>
          </div>
          <div className="hero-stats">
            <Link to="/stats">
              <Trophy size={16} />
              <strong>{totals.wins}</strong>
              <span>wins</span>
            </Link>
            <Link to="/stats">
              <Flame size={16} />
              <strong>{totals.played}</strong>
              <span>played</span>
            </Link>
            <Link to="/stats">
              <Sparkles size={16} />
              <strong>{totals.rate}%</strong>
              <span>win rate</span>
            </Link>
          </div>
        </div>
        <Showcase startIndex={Math.max(0, GAMES.indexOf(featured))} />
      </section>

      <div className="section-head" id="games">
        <div>
          <h2>Choose a game</h2>
          <p>{visible.length} of {GAMES.length} games</p>
        </div>
        <div className="filters">
          <label className="search">
            <Search size={16} />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search games" aria-label="Search games" />
            {query && (
              <button onClick={() => setQuery('')} aria-label="Clear search">
                <X size={14} />
              </button>
            )}
          </label>
          <div className="chips" role="tablist" aria-label="Filter games">
            {CATEGORIES.map((c) => (
              <button key={c} role="tab" aria-selected={category === c} className={`chip ${category === c ? 'active' : ''}`} onClick={() => setCategory(c)}>
                {c}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div className="game-grid" layout>
        <AnimatePresence mode="popLayout">
          {visible.map((game, i) => {
            const s = stats.games[game.id];
            const best = game.bestKey ? stats.bests[game.bestKey] : undefined;
            return (
              <motion.div
                key={game.id}
                layout
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.035, duration: 0.3 }}
              >
                <Link to={`/play/${game.id}`} className="game-card" style={{ '--game': game.color }}>
                  <span className="game-card-art">
                    <span className="art-ring" />
                    <span className="game-card-emoji">{game.emoji}</span>
                    {!s && <span className="new-badge">New</span>}
                  </span>
                  <span className="game-card-body">
                    <span className="game-card-tag">{game.category}</span>
                    <strong className="game-card-name">{game.name}</strong>
                    <span className="game-card-line">{game.tagline}</span>
                    <span className="game-card-foot">
                      <span className="game-card-meta">
                        {best !== undefined ? (
                          <>
                            <Trophy size={13} /> {game.bestLabel} <b>{best}</b>
                          </>
                        ) : s ? (
                          <>
                            <Trophy size={13} /> <b>{s.wins}</b> wins · {s.played} played
                          </>
                        ) : (
                          'Not played yet'
                        )}
                      </span>
                      <span className="play-pill">
                        Play <ArrowUpRight size={14} />
                      </span>
                    </span>
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {!visible.length && (
        <div className="empty">
          <span>🔍</span>
          <p>No games match “{query}”.</p>
          <button className="btn btn-ghost" onClick={() => { setQuery(''); setCategory('All'); }}>
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
