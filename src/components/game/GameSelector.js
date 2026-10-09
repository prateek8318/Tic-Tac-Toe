import React from 'react';
import { motion } from 'framer-motion';
import { Zap, Target, Grid3X3, ArrowUpRight, Sparkles } from 'lucide-react';
import './GameSelector.css';

const GameSelector = ({ onGameSelect, selectedGame }) => {
  const games = [
    {
      id: 'tictactoe',
      name: 'Tic-Tac-Toe',
      description: 'Think ahead. Own the grid.',
      tag: 'STRATEGY',
      icon: Grid3X3,
      color: '#3b82f6'
    },
    {
      id: 'memory',
      name: 'Memory Game',
      description: 'Train your brain, one flip at a time.',
      tag: 'BRAIN TRAINING',
      icon: Zap,
      color: '#10b981'
    },
    {
      id: 'rockpaperscissors',
      name: 'Rock Paper Scissors',
      description: 'Read the room. Outsmart the odds.',
      tag: 'QUICK PLAY',
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
        <div className="section-kicker"><Sparkles size={14}/> THE ARCADE</div>
        <h2 className="selector-title">Choose your <em>challenge.</em></h2>
        <p className="selector-subtitle">Three ways to play. Which one are you feeling?</p>
      </div>

      <div className="games-grid">
        {games.map((game) => {
          const Icon = game.icon;
          const isSelected = selectedGame === game.id;
          
          return (
            <motion.div
              key={game.id}
              className={`game-card ${isSelected ? 'selected' : ''} game-card-${game.id}`}
              variants={cardVariants}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => onGameSelect(game.id)} role="button" tabIndex={0}
              onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') onGameSelect(game.id); }}
            >
              <div 
                className="game-icon"
                style={{ '--game-color': game.color }}
              >
                <Icon size={40} />
              </div>
              <span className="game-tag">{game.tag}</span>
              <h3 className="card-title">{game.name}</h3>
              <p className="game-description">{game.description}</p>
              <span className="card-play">PLAY NOW <ArrowUpRight size={16}/></span>
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
