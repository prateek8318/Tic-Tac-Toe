import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Hand, RotateCcw, Trophy } from 'lucide-react';
import useSound from '../../hooks/useSound';
import './RockPaperScissors.css';

const RockPaperScissors = ({ onBack, scores, setScores }) => {
  const { playMoveSound, playWinSound, playDrawSound, playClickSound } = useSound();
  
  const choices = [
    { id: 'rock', emoji: '✊', name: 'Rock', beats: 'scissors' },
    { id: 'paper', emoji: '✋', name: 'Paper', beats: 'rock' },
    { id: 'scissors', emoji: '✌️', name: 'Scissors', beats: 'paper' }
  ];

  const [playerChoice, setPlayerChoice] = useState(null);
  const [computerChoice, setComputerChoice] = useState(null);
  const [result, setResult] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState({ player: 0, computer: 0, draws: 0 });

  const makeComputerChoice = () => {
    const randomIndex = Math.floor(Math.random() * choices.length);
    return choices[randomIndex];
  };

  const determineWinner = (player, computer) => {
    if (player.id === computer.id) return 'draw';
    if (player.beats === computer.id) return 'player';
    return 'computer';
  };

  const handleChoice = (choice) => {
    if (isPlaying) return;
    
    playClickSound();
    setIsPlaying(true);
    setPlayerChoice(choice);
    
    setTimeout(() => {
      const compChoice = makeComputerChoice();
      setComputerChoice(compChoice);
      
      const gameResult = determineWinner(choice, compChoice);
      setResult(gameResult);
      
      if (gameResult === 'player') {
        playWinSound();
        setScore(prev => ({ ...prev, player: prev.player + 1 }));
        setScores(prev => ({ ...prev, rps: (prev.rps || 0) + 1 }));
      } else if (gameResult === 'draw') {
        playDrawSound();
        setScore(prev => ({ ...prev, draws: prev.draws + 1 }));
      } else {
        setScore(prev => ({ ...prev, computer: prev.computer + 1 }));
      }
      
      playMoveSound();
      setIsPlaying(false);
    }, 1000);
  };

  const resetGame = () => {
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setIsPlaying(false);
  };

  const resetScores = () => {
    setScore({ player: 0, computer: 0, draws: 0 });
    resetGame();
  };

  const choiceVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.1, y: -10, transition: { duration: 0.2 } },
    tap: { scale: 0.9 }
  };

  return (
    <div className="rps-game">
      <div className="game-header">
        <h2 className="game-title">Rock Paper Scissors</h2>
        <div className="score-board">
          <div className="score-item">
            <span>You: {score.player}</span>
          </div>
          <div className="score-item">
            <span>Draws: {score.draws}</span>
          </div>
          <div className="score-item">
            <span>Computer: {score.computer}</span>
          </div>
        </div>
      </div>

      <div className="battle-area">
        <div className="player-section">
          <h3>Your Choice</h3>
          <div className="choice-display">
            {playerChoice ? (
              <motion.div
                className="chosen-choice"
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="choice-emoji">{playerChoice.emoji}</span>
                <span className="choice-name">{playerChoice.name}</span>
              </motion.div>
            ) : (
              <div className="choice-placeholder">?</div>
            )}
          </div>
        </div>

        <div className="vs-section">
          <motion.div 
            className="vs-text"
            animate={{ scale: result ? [1, 1.2, 1] : 1 }}
            transition={{ duration: 0.5 }}
          >
            VS
          </motion.div>
          {result && (
            <motion.div 
              className={`result ${result}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              style={{ 
                color: 'white',
                fontWeight: 'bold',
                textAlign: 'center',
                padding: '0.5rem 1rem',
                borderRadius: '10px',
                background: result === 'player' ? 'linear-gradient(135deg, #10b981 0%, #059669 100%)' : 
                           result === 'computer' ? 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' : 
                           'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)'
              }}
            >
              {result === 'player' && '🎉 You Win!'}
              {result === 'computer' && '😔 You Lose!'}
              {result === 'draw' && '🤝 It\'s a Draw!'}
            </motion.div>
          )}
        </div>

        <div className="computer-section">
          <h3>Computer's Choice</h3>
          <div className="choice-display">
            {computerChoice ? (
              <motion.div
                className="chosen-choice"
                initial={{ scale: 0, rotate: 180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
              >
                <span className="choice-emoji">{computerChoice.emoji}</span>
                <span className="choice-name">{computerChoice.name}</span>
              </motion.div>
            ) : (
              <div className="choice-placeholder">?</div>
            )}
          </div>
        </div>
      </div>

      <div className="choices-section">
        <h3>Make Your Choice</h3>
        <div className="choices-grid">
          {choices.map((choice) => (
            <motion.button
              key={choice.id}
              className="choice-btn"
              variants={choiceVariants}
              initial="hidden"
              animate="visible"
              whileHover="hover"
              whileTap="tap"
              onClick={() => handleChoice(choice)}
              disabled={isPlaying}
            >
              <span className="choice-emoji">{choice.emoji}</span>
              <span className="choice-name">{choice.name}</span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="game-controls">
        <motion.button
          className="control-btn"
          onClick={resetGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <RotateCcw size={20} />
          New Round
        </motion.button>
        
        <motion.button
          className="control-btn danger"
          onClick={resetScores}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Reset Scores
        </motion.button>
        
        <motion.button
          className="control-btn back-btn"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Back to Games
        </motion.button>
      </div>
    </div>
  );
};

export default RockPaperScissors;
