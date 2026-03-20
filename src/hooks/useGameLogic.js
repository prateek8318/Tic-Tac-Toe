import { useState, useCallback, useEffect } from 'react';

const WINNING_COMBINATIONS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
  [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
  [0, 4, 8], [2, 4, 6] // Diagonals
];

const useGameLogic = () => {
  const [board, setBoard] = useState(Array(9).fill(null));
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [winner, setWinner] = useState(null);
  const [isDraw, setIsDraw] = useState(false);
  const [winningLine, setWinningLine] = useState([]);
  const [scores, setScores] = useState({ X: 0, O: 0, draws: 0 });
  const [isPlaying, setIsPlaying] = useState(false);

  const checkWinner = useCallback((currentBoard) => {
    for (const combination of WINNING_COMBINATIONS) {
      const [a, b, c] = combination;
      if (currentBoard[a] && currentBoard[a] === currentBoard[b] && currentBoard[a] === currentBoard[c]) {
        return { winner: currentBoard[a], line: combination };
      }
    }
    return null;
  }, []);

  const checkDraw = useCallback((currentBoard) => {
    return currentBoard.every(cell => cell !== null);
  }, []);

  const makeMove = useCallback((index) => {
    if (board[index] || winner || isDraw) return false;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    const result = checkWinner(newBoard);
    if (result) {
      setWinner(result.winner);
      setWinningLine(result.line);
      setScores(prev => ({
        ...prev,
        [result.winner]: prev[result.winner] + 1
      }));
      setIsPlaying(false);
      return true;
    }

    if (checkDraw(newBoard)) {
      setIsDraw(true);
      setScores(prev => ({ ...prev, draws: prev.draws + 1 }));
      setIsPlaying(false);
      return true;
    }

    setCurrentPlayer(currentPlayer === 'X' ? 'O' : 'X');
    return true;
  }, [board, currentPlayer, winner, isDraw, checkWinner, checkDraw]);

  const resetGame = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
    setIsDraw(false);
    setWinningLine([]);
    setIsPlaying(false);
  }, []);

  const startNewGame = useCallback(() => {
    resetGame();
    setIsPlaying(true);
  }, [resetGame]);

  const resetScores = useCallback(() => {
    setScores({ X: 0, O: 0, draws: 0 });
  }, []);

  return {
    board,
    currentPlayer,
    winner,
    isDraw,
    winningLine,
    scores,
    isPlaying,
    makeMove,
    resetGame,
    startNewGame,
    resetScores
  };
};

export default useGameLogic;
