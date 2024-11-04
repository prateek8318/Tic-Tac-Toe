import React from 'react';

function About() {
  return (
    <div className="bg-gray-100 min-h-screen flex items-center justify-center">
      <div className="max-w-4xl p-8 bg-white rounded-lg shadow-md">
        <h1 className="text-4xl font-bold text-center text-blue-500 mb-6">About Tic-Tac-Toe</h1>
        <p className="text-lg text-gray-700 mb-4">
          Tic-Tac-Toe is a simple, classic game played between two players, X and O. The game is played on a 3x3 grid, and each player takes turns marking their symbol (X or O) in an empty cell. The player who succeeds in placing three of their symbols in a horizontal, vertical, or diagonal row wins the game. If all nine cells are filled without any player achieving this, the game ends in a draw.
        </p>
        <p className="text-lg text-gray-700 mb-4">
          This online version of Tic-Tac-Toe lets you play the game in your browser. Whether you're playing against a friend or challenging yourself, this game is a great way to pass the time and test your strategic thinking!
        </p>
        <p className="text-lg text-gray-700">
          The Tic-Tac-Toe game is built using React, providing a smooth and interactive experience. Have fun playing!
        </p>
      </div>
    </div>
  );
}

export default About;
