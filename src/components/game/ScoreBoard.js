import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, Users, Hand } from 'lucide-react';
import './ScoreBoard.css';

const ScoreBoard = ({ scores, currentPlayer, isPlaying }) => {
  const containerVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.3 } }
  };

  return (
    <motion.div
      className="score-board"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="score-header">
        <h2 className="score-title">Score Board</h2>
        {isPlaying && (
          <motion.div 
            className="current-player"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            key={currentPlayer}
          >
            <span className="player-indicator">
              {currentPlayer === 'X' ? '❌' : '⭕'}
            </span>
            Player {currentPlayer}'s Turn
          </motion.div>
        )}
      </div>
      
      <div className="score-grid">
        <motion.div 
          className={`score-item player-x ${currentPlayer === 'X' && isPlaying ? 'active' : ''}`}
          variants={itemVariants}
        >
          <div className="score-icon">
            <Users size={24} />
          </div>
          <div className="score-info">
            <span className="player-name">Player X</span>
            <span className="score-value">{scores.X}</span>
          </div>
          {scores.X > 0 && <Trophy className="trophy" size={20} />}
        </motion.div>

        <motion.div 
          className="score-item draws"
          variants={itemVariants}
        >
          <div className="score-icon">
            <Hand size={24} />
          </div>
          <div className="score-info">
            <span className="player-name">Draws</span>
            <span className="score-value">{scores.draws}</span>
          </div>
        </motion.div>

        <motion.div 
          className={`score-item player-o ${currentPlayer === 'O' && isPlaying ? 'active' : ''}`}
          variants={itemVariants}
        >
          <div className="score-icon">
            <Users size={24} />
          </div>
          <div className="score-info">
            <span className="player-name">Player O</span>
            <span className="score-value">{scores.O}</span>
          </div>
          {scores.O > 0 && <Trophy className="trophy" size={20} />}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ScoreBoard;
