import React, { useState } from "react";
import Square from "./Square";

const Board = () => {
  const [state, setState] = useState(Array(9).fill(null));
  const [isXTurn, setIsXTurn] = useState(true);

  const checkWinner = () => {
    const winnerLogic = [
      [0, 1, 2],
      [3, 4, 5],
      [6, 7, 8],
      [0, 3, 6],
      [1, 4, 7],
      [2, 5, 8],
      [0, 4, 8],
      [2, 4, 6],
    ];
    for (let logic of winnerLogic) {
      const [a, b, c] = logic;
      if (state[a] !== null && state[a] === state[b] && state[a] === state[c]) {
        return state[a];
      }
    }
    return null;
  };

  const isWinner = checkWinner();

  const handleClick = (index) => {
    if (state[index] !== null || isWinner) {
      return;
    }
    const copyState = [...state];
    copyState[index] = isXTurn ? "X" : "O";
    setState(copyState);
    setIsXTurn(!isXTurn);
  };

  const handleReset = () => {
    setState(Array(9).fill(null));
  };

  return (
    <div className="min-h-screen flex flex-col justify-between items-center bg-gray-100 p-4">
      {isWinner ? (
        <div className="text-center">
          <h4 className="text-2xl font-bold mb-4">{isWinner} won the game!</h4>
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            onClick={handleReset}
          >
            Play again
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center">
          <h4 className="text-xl font-semibold mb-4">
            Player {isXTurn ? "X" : "O"}, your turn
          </h4>
          <div className="grid grid-cols-3">
            <Square onClick={() => handleClick(0)} value={state[0]} />
            <Square onClick={() => handleClick(1)} value={state[1]} />
            <Square onClick={() => handleClick(2)} value={state[2]} />
            <Square onClick={() => handleClick(3)} value={state[3]} />
            <Square onClick={() => handleClick(4)} value={state[4]} />
            <Square onClick={() => handleClick(5)} value={state[5]} />
            <Square onClick={() => handleClick(6)} value={state[6]} />
            <Square onClick={() => handleClick(7)} value={state[7]} />
            <Square onClick={() => handleClick(8)} value={state[8]} />
          </div>
          <div className="flex justify-center mt-4">
          <button
        className="bg-red-500 text-white px-4 py-2  rounded hover:bg-red-600"
        onClick={handleReset}> Reset Game </button>
        </div>
        </div>
      )}
      
      
    </div>
  );
};

export default Board;
