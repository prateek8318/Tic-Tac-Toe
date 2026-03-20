import React from 'react';
import { motion } from 'framer-motion';
import { Play, RotateCcw, Trash2 } from 'lucide-react';
import './GameControls.css';

const GameControls = ({ 
  isPlaying, 
  onStartGame, 
  onResetGame, 
  onResetScores, 
  winner, 
  isDraw 
}) => {
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  return (
    <motion.div 
      className="game-controls"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {!isPlaying && !winner && !isDraw && (
        <motion.button
          className="control-button primary"
          onClick={onStartGame}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <Play size={20} />
          Start Game
        </motion.button>
      )}

      {(winner || isDraw) && (
        <motion.div
          className="game-result"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="result-message">
            {winner ? (
              <>
                <span className="winner-icon">
                  {winner === 'X' ? '❌' : '⭕'}
                </span>
                <span className="winner-text">Player {winner} Wins!</span>
              </>
            ) : (
              <span className="draw-text">It's a Draw! 🤝</span>
            )}
          </div>
          
          <div className="result-actions">
            <motion.button
              className="control-button secondary"
              onClick={onStartGame}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <Play size={16} />
              Play Again
            </motion.button>
            
            <motion.button
              className="control-button tertiary"
              onClick={onResetGame}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <RotateCcw size={16} />
              New Board
            </motion.button>
          </div>
        </motion.div>
      )}

      {isPlaying && (
        <motion.button
          className="control-button tertiary"
          onClick={onResetGame}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <RotateCcw size={20} />
          Reset Board
        </motion.button>
      )}

      <motion.button
        className="control-button danger"
        onClick={onResetScores}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        <Trash2 size={20} />
        Reset Scores
      </motion.button>
    </motion.div>
  );
};

export default GameControls;
