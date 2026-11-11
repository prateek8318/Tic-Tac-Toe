export const LINES = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6],
];

// Returns { winner, line } | { winner: 'draw' } | null
export const getResult = (board) => {
  for (const line of LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return { winner: board[a], line };
  }
  return board.every(Boolean) ? { winner: 'draw', line: [] } : null;
};

const empties = (board) => board.map((v, i) => (v ? null : i)).filter((i) => i !== null);
const other = (p) => (p === 'X' ? 'O' : 'X');

// Full minimax: prefers faster wins and slower losses.
const minimax = (board, player, me, depth) => {
  const result = getResult(board);
  if (result) {
    if (result.winner === 'draw') return 0;
    return result.winner === me ? 10 - depth : depth - 10;
  }
  const scores = empties(board).map((i) => {
    board[i] = player;
    const s = minimax(board, other(player), me, depth + 1);
    board[i] = null;
    return s;
  });
  return player === me ? Math.max(...scores) : Math.min(...scores);
};

const bestMove = (board, me) => {
  const copy = [...board];
  let best = -Infinity;
  let moves = [];
  empties(copy).forEach((i) => {
    copy[i] = me;
    const s = minimax(copy, other(me), me, 1);
    copy[i] = null;
    if (s > best) {
      best = s;
      moves = [i];
    } else if (s === best) moves.push(i);
  });
  return moves[Math.floor(Math.random() * moves.length)];
};

const findLineMove = (board, player) => {
  for (const [a, b, c] of LINES) {
    const cells = [board[a], board[b], board[c]];
    if (cells.filter((v) => v === player).length === 2 && cells.includes(null)) return [a, b, c][cells.indexOf(null)];
  }
  return null;
};

export const cpuMove = (board, me, level) => {
  const free = empties(board);
  const random = () => free[Math.floor(Math.random() * free.length)];
  if (level === 'easy') return Math.random() < 0.3 ? bestMove(board, me) : random();
  if (level === 'medium') {
    const win = findLineMove(board, me);
    if (win !== null) return win;
    const block = findLineMove(board, other(me));
    if (block !== null) return block;
    if (!board[4] && Math.random() < 0.6) return 4;
    return Math.random() < 0.5 ? bestMove(board, me) : random();
  }
  return bestMove(board, me);
};
