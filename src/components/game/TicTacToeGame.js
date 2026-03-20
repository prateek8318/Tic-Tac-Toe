import React from 'react';
import { motion } from 'framer-motion';
import GameBoard from './GameBoard';
import ScoreBoard from './ScoreBoard';
import GameControls from './GameControls';
import WinnerCelebration from './WinnerCelebration';
import useGameLogic from '../../hooks/useGameLogic';
import useSound from '../../hooks/useSound';
import './TicTacToeGame.css';

const TicTacToeGame = ({ onBack, scores, setScores }) => {
  const {
    board,
    currentPlayer,
    winner,
    isDraw,
    winningLine,
    isPlaying,
    makeMove,
    resetGame,
    startNewGame,
    resetScores
  } = useGameLogic();

  const { playMoveSound, playWinSound, playDrawSound, playClickSound } = useSound();

  const handleMove = (index) => {
    if (makeMove(index)) {
      playMoveSound();
    }
  };

  const handleStartGame = () => {
    playClickSound();
    startNewGame();
  };

  const handleResetGame = () => {
    playClickSound();
    resetGame();
  };

  const handleResetScores = () => {
    playClickSound();
    resetScores();
  };

  React.useEffect(() => {
    if (winner) {
      setTimeout(() => playWinSound(), 500);
      setScores(prev => ({ ...prev, tictactoe: (prev.tictactoe || 0) + 1 }));
    } else if (isDraw) {
      setTimeout(() => playDrawSound(), 500);
    }
  }, [winner, isDraw, playWinSound, playDrawSound, setScores]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { 
        duration: 0.5,
        staggerChildren: 0.1
      } 
    }
  };

  return (
    <motion.div 
      className="tic-tac-toe-game"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="game-container">
        <motion.div 
          className="game-header"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="game-title">
            <span className="title-x">❌</span>
            Tic-Tac-Toe
            <span className="title-o">⭕</span>
          </h1>
        </motion.div>

        <ScoreBoard 
          scores={{ X: 0, O: 0, draws: 0 }}
          currentPlayer={currentPlayer}
          isPlaying={isPlaying}
        />

        <GameBoard 
          board={board}
          onMove={handleMove}
          winningLine={winningLine}
          currentPlayer={currentPlayer}
          isPlaying={isPlaying}
        />

        <GameControls 
          isPlaying={isPlaying}
          onStartGame={handleStartGame}
          onResetGame={handleResetGame}
          onResetScores={handleResetScores}
          winner={winner}
          isDraw={isDraw}
        />

        <motion.button
          className="back-button"
          onClick={onBack}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          ← Back to Games
        </motion.button>
      </div>

      <WinnerCelebration 
        winner={winner}
        onCelebrationEnd={() => {}}
      />
    </motion.div>
  );
};

export default TicTacToeGame;
