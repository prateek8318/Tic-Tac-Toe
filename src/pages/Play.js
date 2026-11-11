import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { getGame } from '../games/registry';

const Play = () => {
  const { gameId } = useParams();
  const game = getGame(gameId);
  if (!game) return <Navigate to="/" replace />;
  const Game = game.component;
  // `key` remounts the game when switching between games directly.
  return <Game key={game.id} />;
};

export default Play;
