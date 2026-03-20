import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GameSelector from './GameSelector';
import TicTacToeGame from './TicTacToeGame';
import MemoryGame from './MemoryGame';
import RockPaperScissors from './RockPaperScissors';
import './GameHub.css';

const GameHub = () => {
  const [selectedGame, setSelectedGame] = useState(null);
  const [scores, setScores] = useState({
    tictactoe: 0,
    memory: 0,
    rps: 0
  });

  const handleGameSelect = (gameId) => {
    setSelectedGame(gameId);
  };

  const handleBackToSelector = () => {
    setSelectedGame(null);
    window.scrollTo(0, 0);
  };

  const renderGame = () => {
    switch (selectedGame) {
      case 'tictactoe':
        return (
          <TicTacToeGame 
            onBack={handleBackToSelector}
            scores={scores}
            setScores={setScores}
          />
        );
      case 'memory':
        return (
          <MemoryGame 
            onBack={handleBackToSelector}
            scores={scores}
            setScores={setScores}
          />
        );
      case 'rockpaperscissors':
        return (
          <RockPaperScissors 
            onBack={handleBackToSelector}
            scores={scores}
            setScores={setScores}
          />
        );
      default:
        return (
          <GameSelector 
            onGameSelect={handleGameSelect}
            selectedGame={selectedGame}
          />
        );
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1, 
      transition: { duration: 0.5 }
    }
  };

  return (
    <motion.div 
      className="game-hub"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      key={selectedGame}
    >
      {renderGame()}
      
      {selectedGame && (
        <motion.div 
          className="score-tracker"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3>Your Wins</h3>
          <div className="score-display">
            <div className="score-item">
              <span className="game-name">Tic-Tac-Toe</span>
              <span className="score-value">{scores.tictactoe}</span>
            </div>
            <div className="score-item">
              <span className="game-name">Memory</span>
              <span className="score-value">{scores.memory}</span>
            </div>
            <div className="score-item">
              <span className="game-name">Rock Paper Scissors</span>
              <span className="score-value">{scores.rps}</span>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GameHub;
