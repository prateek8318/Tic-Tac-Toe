import { render, screen } from '@testing-library/react';
import App from './App';
import { getResult, cpuMove } from './games/tictactoe/logic';
import { move } from './games/g2048/logic';
import { emptyBoard, winLineAt } from './games/connect4/logic';

test('home screen lists the games', () => {
  render(<App />);
  expect(screen.getAllByText(/Game Hub/i).length).toBeGreaterThan(0);
  expect(screen.getAllByText('Minesweeper').length).toBeGreaterThan(0);
});

test('tic-tac-toe detects wins and draws', () => {
  expect(getResult(['X', 'X', 'X', null, 'O', 'O', null, null, null]).winner).toBe('X');
  expect(getResult(['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X']).winner).toBe('draw');
  expect(getResult(Array(9).fill(null))).toBeNull();
});

test('unbeatable CPU blocks and wins', () => {
  // O to move, can win at 2
  expect(cpuMove(['O', 'O', null, 'X', 'X', null, 'X', null, null], 'O', 'hard')).toBe(2);
  // O must block X at 2
  expect(cpuMove(['X', 'X', null, null, 'O', null, null, null, null], 'O', 'hard')).toBe(2);
});

test('2048 merges each tile only once per move', () => {
  const tiles = [2, 2, 2, 2].map((value, c) => ({ id: c + 1, value, r: 0, c }));
  const { tiles: out, gained } = move(tiles, 'left');
  expect(out.map((t) => [t.c, t.value])).toEqual([[0, 4], [1, 4]]);
  expect(gained).toBe(8);
});

test('connect four finds a diagonal', () => {
  const b = emptyBoard();
  [[5, 0], [4, 1], [3, 2], [2, 3]].forEach(([r, c]) => {
    b[r][c] = 1;
  });
  expect(winLineAt(b, 2, 3)).toHaveLength(4);
});
