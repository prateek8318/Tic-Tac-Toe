import React, { Suspense, useEffect, useMemo } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChartColumn, Gamepad2, Info, Mail, Moon, Sun, Volume2, VolumeX } from 'lucide-react';
import Footer from '../Footer';
import { GAMES } from '../../games/registry';
import { useStats } from '../../context/StatsContext';
import { setMuted, useMuted } from '../../lib/sound';
import './app-shell.css';

const NAV = [
  { to: '/', label: 'Games', icon: Gamepad2, end: true },
  { to: '/stats', label: 'Stats', icon: ChartColumn },
  { to: '/about', label: 'About', icon: Info },
  { to: '/contact', label: 'Contact', icon: Mail },
];

export const Loader = () => (
  <div className="loader" role="status" aria-label="Loading">
    <span />
    <span />
    <span />
  </div>
);

const Sidebar = ({ theme, onToggleTheme, rail }) => {
  const muted = useMuted();
  const { stats } = useStats();
  const totals = useMemo(() => {
    const list = Object.values(stats.games);
    return { played: list.reduce((n, g) => n + g.played, 0), wins: list.reduce((n, g) => n + g.wins, 0) };
  }, [stats.games]);

  return (
    <aside className={`sidebar ${rail ? 'rail' : ''}`} aria-label="Sidebar">
      <Link to="/" className="side-brand" aria-label="Game Hub home">
        <span className="brand-mark">🎮</span>
        <span className="side-text brand-name">Game Hub</span>
      </Link>

      <nav className="side-nav" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="side-link" title={label}>
            <Icon size={19} />
            <span className="side-text">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-label side-text">Quick play</div>
      <nav className="side-games" aria-label="Games">
        {GAMES.map((g) => (
          <NavLink key={g.id} to={`/play/${g.id}`} className="side-game" style={{ '--game': g.color }} title={g.name}>
            <span className="side-game-icon">{g.emoji}</span>
            <span className="side-text">{g.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="side-foot">
        {!rail && (
          <div className="side-card">
            <small>Your record</small>
            <strong>
              {totals.wins} <span>wins</span> · {totals.played} <span>played</span>
            </strong>
          </div>
        )}
        <div className="side-toggles">
          <button className="icon-btn" onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn sound on' : 'Turn sound off'} title="Sound">
            {muted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
          <button className="icon-btn" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`} title="Theme">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </div>
    </aside>
  );
};

const AppShell = ({ theme, onToggleTheme }) => {
  const { pathname } = useLocation();
  const inGame = pathname.startsWith('/play/');

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className={`app ${inGame ? 'is-game' : ''}`}>
      <div className="app-bg" aria-hidden="true">
        <span className="blob b1" />
        <span className="blob b2" />
        <span className="blob b3" />
        <span className="grid-dots" />
      </div>

      <Sidebar theme={theme} onToggleTheme={onToggleTheme} rail={inGame} />

      <header className="topbar">
        <div className="topbar-inner">
          <Link to="/" className="brand" aria-label="Game Hub home">
            <span className="brand-mark">🎮</span>
            <span className="brand-name">Game Hub</span>
          </Link>
          <nav className="topnav" aria-label="Main">
            {NAV.map(({ to, label, icon: Icon, end }) => (
              <NavLink key={to} to={to} end={end} className="topnav-link">
                <Icon size={17} />
                {label}
              </NavLink>
            ))}
          </nav>
          <button className="icon-btn theme-btn" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}>
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>
      </header>

      <main className="app-main">
        <Suspense fallback={<Loader />}>
          <motion.div
            key={pathname}
            className="route"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <Outlet />
          </motion.div>
        </Suspense>
        {!inGame && (
          <div className="desktop-footer">
            <Footer />
          </div>
        )}
      </main>

      <nav className="tabbar" aria-label="Main">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} className="tab">
            <span className="tab-icon">
              <Icon size={21} />
            </span>
            <span>{label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default AppShell;
