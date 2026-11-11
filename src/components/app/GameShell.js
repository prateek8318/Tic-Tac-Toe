import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, CircleHelp, RotateCcw, Volume2, VolumeX, X } from 'lucide-react';
import { getGame } from '../../games/registry';
import { setMuted, sfx, useMuted } from '../../lib/sound';
import './game-shell.css';

export const Sheet = ({ open, onClose, children, label }) => (
  <AnimatePresence>
    {open && (
      <motion.div
        className="sheet-backdrop"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="sheet"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          initial={{ y: 40, opacity: 0, scale: 0.98 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 380, damping: 32 }}
          onClick={(e) => e.stopPropagation()}
        >
          <span className="sheet-grip" aria-hidden="true" />
          {onClose && (
            <button className="icon-btn sheet-close" onClick={onClose} aria-label="Close">
              <X size={18} />
            </button>
          )}
          {children}
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

export const ResultSheet = ({ open, emoji, title, subtitle, details = [], primary, secondary, onClose }) => {
  const navigate = useNavigate();
  return (
    <Sheet open={open} onClose={onClose} label={title}>
      <div className="result">
        <motion.div
          className="result-emoji"
          initial={{ scale: 0.4, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 14 }}
        >
          {emoji}
        </motion.div>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
        {details.length > 0 && (
          <div className="result-details">
            {details.map((d) => (
              <div key={d.label}>
                <small>{d.label}</small>
                <strong>{d.value}</strong>
              </div>
            ))}
          </div>
        )}
        <div className="result-actions">
          {primary && (
            <button className="btn btn-primary" onClick={primary.onClick}>
              {primary.label}
            </button>
          )}
          <button className="btn btn-ghost" onClick={secondary ? secondary.onClick : () => navigate('/')}>
            {secondary ? secondary.label : 'All games'}
          </button>
        </div>
      </div>
    </Sheet>
  );
};

export const Segmented = ({ options, value, onChange, label }) => (
  <div className="segmented" role="radiogroup" aria-label={label}>
    {options.map((o) => (
      <button
        key={o.value}
        role="radio"
        aria-checked={value === o.value}
        className={value === o.value ? 'active' : ''}
        onClick={() => {
          if (o.value !== value) {
            sfx.tap();
            onChange(o.value);
          }
        }}
      >
        {o.label}
      </button>
    ))}
  </div>
);

const GameShell = ({ id, stats = [], onRestart, help, toolbar, children, className = '' }) => {
  const game = getGame(id);
  const navigate = useNavigate();
  const muted = useMuted();
  const [helpOpen, setHelpOpen] = useState(false);

  return (
    <div className={`game-shell ${className}`} style={{ '--game': game.color }}>
      <aside className="game-side">
        <header className="game-bar">
          <button className="icon-btn" onClick={() => navigate('/')} aria-label="Back to all games">
            <ArrowLeft size={20} />
          </button>
          <div className="game-bar-title">
            <span className="game-bar-emoji" aria-hidden="true">{game.emoji}</span>
            <div>
              <h1>{game.name}</h1>
              <span className="game-bar-cat">{game.category}</span>
            </div>
          </div>
          <div className="game-bar-actions">
            <button className="icon-btn" onClick={() => setMuted(!muted)} aria-label={muted ? 'Turn sound on' : 'Turn sound off'}>
              {muted ? <VolumeX size={19} /> : <Volume2 size={19} />}
            </button>
            {help && (
              <button className="icon-btn help-btn" onClick={() => setHelpOpen(true)} aria-label="How to play">
                <CircleHelp size={19} />
              </button>
            )}
            {onRestart && (
              <button
                className="icon-btn"
                onClick={() => {
                  sfx.tap();
                  onRestart();
                }}
                aria-label="Restart"
              >
                <RotateCcw size={19} />
              </button>
            )}
          </div>
        </header>

        <p className="game-tagline">{game.tagline}</p>

        {toolbar && <div className="game-toolbar">{toolbar}</div>}

        {stats.length > 0 && (
          <div className="game-stats" style={{ '--cols': stats.length }}>
            {stats.map((s) => (
              <div key={s.label} className={s.highlight ? 'highlight' : ''}>
                <small>{s.label}</small>
                <strong>{s.value}</strong>
              </div>
            ))}
          </div>
        )}

        {help && (
          <div className="side-help">
            <h2>How to play</h2>
            {help}
          </div>
        )}
      </aside>

      <section className="game-stage">{children}</section>

      <Sheet open={helpOpen} onClose={() => setHelpOpen(false)} label="How to play">
        <div className="help">
          <h2>How to play</h2>
          {help}
          <button className="btn btn-primary" onClick={() => setHelpOpen(false)}>
            Got it
          </button>
        </div>
      </Sheet>
    </div>
  );
};

export default GameShell;
