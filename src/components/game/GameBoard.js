import React from 'react';
import { motion } from 'framer-motion';
import './GameBoard.css';

const GameBoard = ({ board, onMove, winningLine, currentPlayer, isPlaying }) => {
  const cellVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { duration: 0.3 } },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const getXVariants = () => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }
  });

  const getOVariants = () => ({
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 0.5, ease: "easeInOut" } }
  });

  const isWinningCell = (index) => winningLine.includes(index);

  return (
    <div className="game-board">
      <div className="board-grid">
        {board.map((cell, index) => (
          <motion.div
            key={index}
            className={`cell ${isWinningCell(index) ? 'winning-cell' : ''}`}
            variants={cellVariants}
            initial="hidden"
            animate="visible"
            whileHover={cell ? {} : "hover"}
            whileTap={cell ? {} : "tap"}
            onClick={() => isPlaying && !cell && onMove(index)}
            custom={index}
          >
            {cell === 'X' && (
              <motion.svg
                width="60"
                height="60"
                viewBox="0 0 60 60"
                className="x-mark"
                variants={getXVariants()}
                initial="hidden"
                animate="visible"
              >
                <motion.line
                  x1="10" y1="10" x2="50" y2="50"
                  stroke="url(#xGradient)" strokeWidth="5" strokeLinecap="round"
                  variants={getXVariants()}
                />
                <motion.line
                  x1="50" y1="10" x2="10" y2="50"
                  stroke="url(#xGradient)" strokeWidth="5" strokeLinecap="round"
                  variants={getXVariants()}
                />
                <defs>
                  <linearGradient id="xGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
              </motion.svg>
            )}
            {cell === 'O' && (
              <motion.svg
                width="60" height="60" viewBox="0 0 60 60"
                className="o-mark"
                variants={getOVariants()}
                initial="hidden"
                animate="visible"
              >
                <motion.circle
                  cx="30" cy="30" r="20"
                  fill="none" stroke="url(#oGradient)" strokeWidth="5"
                  variants={getOVariants()}
                />
                <defs>
                  <linearGradient id="oGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ef4444" />
                    <stop offset="100%" stopColor="#f97316" />
                  </linearGradient>
                </defs>
              </motion.svg>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default GameBoard;
