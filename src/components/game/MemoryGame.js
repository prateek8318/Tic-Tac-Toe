import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Clock3, Flame, RotateCcw, Sparkles, Trophy } from 'lucide-react';
import useSound from '../../hooks/useSound';
import './MemoryGame.css';

const LEVELS = {
  chill: { label: 'Chill', pairs: 6, columns: 4, hint: '12 cards · warm up' },
  focused: { label: 'Focused', pairs: 8, columns: 4, hint: '16 cards · find your flow' },
  expert: { label: 'Expert', pairs: 10, columns: 5, hint: '20 cards · full focus' }
};

const MemoryGame = ({ onBack, setScores }) => {
  const { playMoveSound, playWinSound, playClickSound } = useSound();
  const symbols = useMemo(() => ['🎮', '🎯', '🎨', '🎭', '🎲', '🪄', '🚀', '🧩', '💎', '🛸'], []);
  const [level, setLevel] = useState('focused');
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [locked, setLocked] = useState(false);
  const config = LEVELS[level];
  const bestKey = `memory-best-${level}`;
  const [best, setBest] = useState(() => Number(localStorage.getItem(bestKey)) || 0);

  const initializeGame = useCallback((nextLevel = level) => {
    const count = LEVELS[nextLevel].pairs;
    const deck = [...symbols.slice(0, count), ...symbols.slice(0, count)]
      .sort(() => Math.random() - 0.5)
      .map((emoji, id) => ({ id, emoji }));
    setCards(deck);
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setSeconds(0);
    setStreak(0);
    setBestStreak(0);
    setIsWon(false);
    setLocked(false);
    setIsPlaying(true);
  }, [level, symbols]);

  useEffect(() => { initializeGame(); }, [initializeGame]);
  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => setSeconds(value => value + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  useEffect(() => {
    if (flippedCards.length !== 2) return undefined;
    const [first, second] = flippedCards;
    setMoves(value => value + 1);
    setLocked(true);
    const isMatch = cards[first]?.emoji === cards[second]?.emoji;
    const timeout = window.setTimeout(() => {
      if (isMatch) {
        setMatchedCards(current => [...current, first, second]);
        setStreak(current => {
          const next = current + 1;
          setBestStreak(bestValue => Math.max(bestValue, next));
          return next;
        });
        playMoveSound();
      } else {
        setStreak(0);
      }
      setFlippedCards([]);
      setLocked(false);
    }, isMatch ? 450 : 950);
    return () => window.clearTimeout(timeout);
  }, [flippedCards, cards, playMoveSound]);

  useEffect(() => {
    if (!cards.length || matchedCards.length !== cards.length || isWon) return;
    setIsWon(true);
    setIsPlaying(false);
    playWinSound();
    setScores(previous => ({ ...previous, memory: (previous.memory || 0) + 1 }));
    const score = Math.max(0, 1000 - moves * 35 - seconds * 4);
    const nextBest = Math.max(Number(localStorage.getItem(bestKey)) || 0, score);
    localStorage.setItem(bestKey, String(nextBest));
    setBest(nextBest);
  }, [matchedCards, cards.length, isWon, moves, seconds, bestKey, playWinSound, setScores]);

  const changeLevel = (nextLevel) => {
    if (nextLevel === level) return;
    setLevel(nextLevel);
    const nextBest = Number(localStorage.getItem(`memory-best-${nextLevel}`)) || 0;
    setBest(nextBest);
    initializeGame(nextLevel);
  };

  const formatTime = (value) => `${String(Math.floor(value / 60)).padStart(2, '0')}:${String(value % 60).padStart(2, '0')}`;
  const handleCardClick = (index) => {
    if (!isPlaying || locked || flippedCards.includes(index) || matchedCards.includes(index)) return;
    playClickSound();
    setFlippedCards(current => [...current, index]);
  };

  return (
    <section className="memory-game">
      <button className="mini-back" onClick={onBack}><ArrowLeft size={16}/> Arcade</button>
      <header className="memory-heading">
        <span className="section-kicker"><Sparkles size={14}/> MEMORY LAB</span>
        <h2>Make it <em>stick.</em></h2>
        <p>Find every pair. Build a streak. Beat your personal best.</p>
      </header>
      <div className="memory-levels" aria-label="Choose difficulty">
        {Object.entries(LEVELS).map(([id, item]) => <button key={id} className={`level-chip ${level === id ? 'active' : ''}`} onClick={() => changeLevel(id)}>
          <strong>{item.label}</strong><small>{item.hint}</small>
        </button>)}
      </div>
      <div className="memory-dashboard">
        <div><small>TIME</small><strong><Clock3 size={15}/>{formatTime(seconds)}</strong></div>
        <div><small>MOVES</small><strong>{moves}</strong></div>
        <div><small>PAIRS</small><strong>{matchedCards.length / 2}<i> / {config.pairs}</i></strong></div>
        <div><small>STREAK</small><strong><Flame size={15}/>{streak} <i>best {bestStreak}</i></strong></div>
        <div><small>BEST SCORE</small><strong><Trophy size={15}/>{best}</strong></div>
      </div>
      <div className="memory-progress"><span style={{ width: `${(matchedCards.length / cards.length) * 100 || 0}%` }}/></div>
      <div className={`cards-grid memory-grid-${config.columns}`}>
        {cards.map((card, index) => {
          const revealed = flippedCards.includes(index) || matchedCards.includes(index);
          return <motion.button key={card.id} type="button" aria-label={revealed ? `Card ${card.emoji}` : `Reveal card ${index + 1}`} className={`memory-card ${revealed ? 'revealed' : ''} ${matchedCards.includes(index) ? 'matched' : ''}`} onClick={() => handleCardClick(index)} disabled={!isPlaying || locked || matchedCards.includes(index)} whileTap={{ scale: .94 }}>
            <span className="memory-card-inner"><span className="memory-card-back">✳</span><span className="memory-card-front">{card.emoji}</span></span>
          </motion.button>;
        })}
      </div>
      {isWon && <motion.div className="memory-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <Trophy size={20}/><strong>Board cleared!</strong><span>{moves} moves · {formatTime(seconds)} · score {Math.max(0, 1000 - moves * 35 - seconds * 4)}</span>
        <button onClick={() => initializeGame()}><RotateCcw size={15}/> Run it back</button>
      </motion.div>}
      <div className="memory-actions"><button className="memory-reset" onClick={() => { playClickSound(); initializeGame(); }}><RotateCcw size={16}/> New shuffle</button></div>
    </section>
  );
};

export default MemoryGame;
