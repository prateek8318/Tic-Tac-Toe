import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Brain, FileText, Hand, RotateCcw, Scissors, Sparkles, Trophy } from 'lucide-react';
import useSound from '../../hooks/useSound';
import './RockPaperScissors.css';

const CHOICES = [
  { id: 'rock', name: 'Rock', Icon: Hand, beats: 'scissors' },
  { id: 'paper', name: 'Paper', Icon: FileText, beats: 'rock' },
  { id: 'scissors', name: 'Scissors', Icon: Scissors, beats: 'paper' }
];
const pickCounter = (id) => CHOICES.find(choice => choice.beats === id);

const RockPaperScissors = ({ onBack, setScores }) => {
  const { playMoveSound, playWinSound, playDrawSound, playClickSound } = useSound();
  const [matchScore, setMatchScore] = useState({ player: 0, cpu: 0, draws: 0 });
  const [history, setHistory] = useState([]);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [cpuChoice, setCpuChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const [champion, setChampion] = useState(null);
  const [round, setRound] = useState(0);
  const [thinking, setThinking] = useState(false);
  const roundTimer = useRef(null);
  useEffect(() => () => window.clearTimeout(roundTimer.current), []);

  const aiRead = useMemo(() => {
    if (!history.length) return 'No pattern yet — the first move is yours.';
    const counts = history.reduce((all, id) => ({ ...all, [id]: (all[id] || 0) + 1 }), {});
    const favorite = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
    return `You lean ${favorite}. The counter is watching.`;
  }, [history]);

  const chooseCpu = () => {
    if (!history.length) return CHOICES[Math.floor(Math.random() * CHOICES.length)];
    const recent = history.slice(-5);
    const counts = recent.reduce((all, id) => ({ ...all, [id]: (all[id] || 0) + 1 }), {});
    const max = Math.max(...Object.values(counts));
    const likely = Object.keys(counts).filter(id => counts[id] === max);
    const predicted = likely[Math.floor(Math.random() * likely.length)];
    return pickCounter(predicted);
  };

  const playRound = (choice) => {
    if (busy || champion) return;
    playClickSound();
    setBusy(true);
    setThinking(true);
    setPlayerChoice(choice);
    setCpuChoice(null);
    setResult(null);
    roundTimer.current = window.setTimeout(() => {
      const cpu = chooseCpu();
      const outcome = choice.id === cpu.id ? 'draw' : choice.beats === cpu.id ? 'player' : 'cpu';
      setCpuChoice(cpu);
      setHistory(current => [...current, choice.id]);
      setRound(current => current + 1);
      setThinking(false);
      setResult(outcome);
      if (outcome === 'player') {
        playWinSound();
        const next = { ...matchScore, player: matchScore.player + 1 };
        setMatchScore(next);
        if (next.player === 3) {
          setChampion('player');
          setScores(previous => ({ ...previous, rps: (previous.rps || 0) + 1 }));
        }
      } else if (outcome === 'cpu') {
        playMoveSound();
        const next = { ...matchScore, cpu: matchScore.cpu + 1 };
        setMatchScore(next);
        if (next.cpu === 3) setChampion('cpu');
      } else {
        playDrawSound();
        setMatchScore(current => ({ ...current, draws: current.draws + 1 }));
      }
      setBusy(false);
      roundTimer.current = null;
    }, 650);
  };

  const resetMatch = () => {
    window.clearTimeout(roundTimer.current);
    roundTimer.current = null;
    setMatchScore({ player: 0, cpu: 0, draws: 0 });
    setHistory([]); setPlayerChoice(null); setCpuChoice(null); setResult(null);
    setBusy(false); setChampion(null); setRound(0); setThinking(false);
  };

  return <section className="rps-game">
    <button className="mini-back" onClick={onBack}><ArrowLeft size={16}/> Arcade</button>
    <header className="rps-heading"><span className="section-kicker"><Sparkles size={14}/> PATTERN BREAKER</span><h2>Outthink the <em>opponent.</em></h2><p>First to 3 wins. The AI learns your habits — switch it up to stay ahead.</p></header>
    <div className="rps-matchbar"><div><small>ROUND</small><strong>{String(round + 1).padStart(2, '0')}</strong></div><div className="match-score"><span>You</span><strong>{matchScore.player}<i>:</i>{matchScore.cpu}</strong><span>CPU</span></div><div><small>DRAWS</small><strong>{matchScore.draws}</strong></div></div>
    <div className="rps-race" aria-label="First to three wins"><span className={matchScore.player > 0 ? 'filled' : ''}/><span className={matchScore.player > 1 ? 'filled' : ''}/><span className={matchScore.player > 2 ? 'filled' : ''}/><i>FIRST TO 3</i><span className={matchScore.cpu > 0 ? 'cpu-filled' : ''}/><span className={matchScore.cpu > 1 ? 'cpu-filled' : ''}/><span className={matchScore.cpu > 2 ? 'cpu-filled' : ''}/></div>
    <div className="rps-battle">
      <div className={`rps-side ${result === 'player' ? 'winner-side' : ''}`}><span className="rps-side-label">YOUR PICK</span><div className="rps-token">{playerChoice ? <playerChoice.Icon size={38}/> : <span>?</span>}</div><strong>{playerChoice?.name || 'Your move'}</strong></div>
      <div className="rps-versus"><span>VS</span>{thinking && <i>Reading your pattern…</i>}{result && <b className={`rps-outcome ${result}`}>{result === 'player' ? 'ROUND WON' : result === 'cpu' ? 'ROUND LOST' : 'DRAW — AGAIN'}</b>}</div>
      <div className={`rps-side ${result === 'cpu' ? 'winner-side' : ''}`}><span className="rps-side-label">ADAPTIVE CPU</span><div className="rps-token cpu-token">{cpuChoice ? <cpuChoice.Icon size={38}/> : <Brain size={30}/>}</div><strong>{cpuChoice?.name || 'Studying you'}</strong></div>
    </div>
    <div className="rps-ai-note"><Brain size={17}/><span><strong>AI read:</strong> {aiRead}</span><div className="pattern-dots">{history.slice(-5).map((id, index) => <i key={`${id}-${index}`} title={id}/>)}</div></div>
    {champion ? <motion.div className="rps-champion" initial={{ scale: .9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}><Trophy size={21}/><strong>{champion === 'player' ? 'You took the match!' : 'CPU takes this one.'}</strong><button onClick={resetMatch}><RotateCcw size={15}/> Rematch</button></motion.div> : <div className="rps-picks"><div className="rps-picks-title"><span>MAKE YOUR MOVE</span><small>Change your pattern to fool the AI</small></div><div className="rps-pick-row">{CHOICES.map(({ id, name, Icon }) => <motion.button key={id} className={`rps-pick rps-pick-${id}`} disabled={busy} onClick={() => playRound({ id, name, Icon, beats: CHOICES.find(item => item.id === id).beats })} whileHover={{ y: -4 }} whileTap={{ scale: .96 }}><Icon size={24}/><strong>{name}</strong><small>{id === 'rock' ? 'crushes scissors' : id === 'paper' ? 'covers rock' : 'cuts paper'}</small></motion.button>)}</div></div>}
    <div className="rps-footer-actions"><button onClick={resetMatch}><RotateCcw size={15}/> Reset match</button></div>
  </section>;
};

export default RockPaperScissors;
