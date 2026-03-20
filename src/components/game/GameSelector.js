import React from 'react';
import { motion } from 'framer-motion';
import { Gamepad2, Zap, Target, Grid3X3 } from 'lucide-react';
import './GameSelector.css';

const GameSelector = ({ onGameSelect, selectedGame }) => {
  const games = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      description: 'Classic 3x3 grid game',
      icon: Grid3X3,
      color: '#3b82f6'
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Match the pairs',
      icon: Zap,
      color: '#10b981'
    },
    {
      id: 'rockpaperscissors',
      name: 'Rock Paper Scissors',
      description: 'Beat the computer',
      icon: Target,
      color: '#ef4444'
    }
  ];

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

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
  };

  return (
    <motion.div 
      className="game-selector"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="selector-header">
        <h2 className="selector-title">
          <Gamepad2 size={32} />
          Choose Your Game
        </h2>
        <p className="selector-subtitle">Select a game to start playing</p>
      </div>

      <div className="games-grid">
        {games.map((game) => {
          const Icon = game.icon;
          const isSelected = selectedGame === game.id;
          
          return (
            <motion.div
              key={game.id}
              className={`game-card ${isSelected ? 'selected' : ''}`}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGameSelect(game.id)}
            >
              <div 
                className="game-icon"
                style={{ background: `linear-gradient(135deg, ${game.color} 0%, ${game.color}dd 100%)` }}
              >
                <Icon size={40} />
              </div>
              <h3 className="game-name">{game.name}</h3>
              <p className="game-description">{game.description}</p>
              {isSelected && (
                <motion.div 
                  className="selected-badge"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                  ✓ Selected
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
};

export default GameSelector;
