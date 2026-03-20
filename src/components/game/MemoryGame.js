import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shuffle, RotateCcw, Trophy } from 'lucide-react';
import useSound from '../../hooks/useSound';
import './MemoryGame.css';

const MemoryGame = ({ onBack, scores, setScores }) => {
  const { playMoveSound, playWinSound, playClickSound } = useSound();
  
  const emojis = ['🎮', '🎯', '🎪', '🎨', '🎭', '🎲'];
  const [cards, setCards] = useState([]);
  const [flippedCards, setFlippedCards] = useState([]);
  const [matchedCards, setMatchedCards] = useState([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const initializeGame = () => {
    const gameEmojis = [...emojis, ...emojis];
    const shuffled = gameEmojis.sort(() => Math.random() - 0.5);
    setCards(shuffled.map((emoji, index) => ({ id: index, emoji })));
    setFlippedCards([]);
    setMatchedCards([]);
    setMoves(0);
    setIsWon(false);
    setIsPlaying(true);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (flippedCards.length === 2) {
      const [first, second] = flippedCards;
      
      if (cards[first]?.emoji === cards[second]?.emoji) {
        setTimeout(() => {
          setMatchedCards(prev => [...prev, first, second]);
          setFlippedCards([]);
          playMoveSound();
        }, 500);
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }
      setMoves(prev => prev + 1);
    }
  }, [flippedCards, cards, playMoveSound]);

  useEffect(() => {
    if (matchedCards.length === cards.length && cards.length > 0) {
      setIsWon(true);
      setIsPlaying(false);
      setTimeout(() => playWinSound(), 500);
      setScores(prev => ({ ...prev, memory: (prev.memory || 0) + 1 }));
    }
  }, [matchedCards, cards.length, playWinSound, setScores]);

  const handleCardClick = (index) => {
    if (flippedCards.length >= 2 || flippedCards.includes(index) || matchedCards.includes(index)) {
      return;
    }
    
    playClickSound();
    setFlippedCards(prev => [...prev, index]);
  };

  const cardVariants = {
    hidden: { rotateY: 180, opacity: 0 },
    visible: { rotateY: 0, opacity: 1, transition: { duration: 0.6 } },
    flipped: { rotateY: 180, transition: { duration: 0.6 } }
  };

  return (
    <div className="memory-game">
      <div className="game-header">
        <h2 className="game-title">Memory Game</h2>
        <div className="game-stats">
          <span className="moves">Moves: {moves}</span>
          <span className="matched">Matched: {matchedCards.length / 2}/{emojis.length}</span>
        </div>
      </div>

      <div className="cards-grid">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            className={`card ${flippedCards.includes(index) || matchedCards.includes(index) ? 'flipped' : ''} ${matchedCards.includes(index) ? 'matched' : ''}`}
            variants={cardVariants}
            initial="hidden"
            animate={flippedCards.includes(index) || matchedCards.includes(index) ? "flipped" : "visible"}
            whileHover={{ scale: matchedCards.includes(index) ? 1 : 1.05 }}
            whileTap={{ scale: matchedCards.includes(index) ? 1 : 0.95 }}
            onClick={() => isPlaying && handleCardClick(index)}
          >
            <div className="card-inner">
              <div className="card-front">?</div>
              <div className="card-back">{card.emoji}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {isWon && (
        <motion.div 
          className="win-message"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Trophy size={40} />
          <h3>Congratulations!</h3>
          <p>You won in {moves} moves!</p>
          <motion.button
            className="play-again-btn"
            onClick={initializeGame}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <RotateCcw size={16} />
            Play Again
          </motion.button>
        </motion.div>
      )}

      <div className="game-controls">
        <motion.button
          className="control-btn"
          onClick={initializeGame}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Shuffle size={20} />
          New Game
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

export default MemoryGame;
