export const ROWS = 6;
export const COLS = 7;
export const emptyBoard = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

// Row where a disc dropped in `col` lands, or -1 if the column is full.
export const landingRow = (board, col) => {
  for (let r = ROWS - 1; r >= 0; r -= 1) if (!board[r][col]) return r;
  return -1;
};

const DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];

// Cells of a 4+ line through (r, c), or null.
export const winLineAt = (board, r, c) => {
  const p = board[r][c];
  if (!p) return null;
  for (const [dr, dc] of DIRS) {
    const cells = [[r, c]];
    for (const s of [1, -1]) {
      let rr = r + dr * s;
      let cc = c + dc * s;
      while (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && board[rr][cc] === p) {
        cells.push([rr, cc]);
        rr += dr * s;
        cc += dc * s;
      }
    }
    if (cells.length >= 4) return cells;
  }
  return null;
};

export const isFull = (board) => board[0].every(Boolean);

const ORDER = [3, 2, 4, 1, 5, 0, 6];

const scoreWindow = (cells, me) => {
  const opp = me === 1 ? 2 : 1;
  const mine = cells.filter((v) => v === me).length;
  const theirs = cells.filter((v) => v === opp).length;
  const empty = cells.filter((v) => v === 0).length;
  if (mine === 4) return 1000;
  if (mine === 3 && empty === 1) return 6;
  if (mine === 2 && empty === 2) return 2;
  if (theirs === 3 && empty === 1) return -8;
  if (theirs === 2 && empty === 2) return -1;
  return 0;
};

const evaluate = (board, me) => {
  let score = 0;
  for (let r = 0; r < ROWS; r += 1) if (board[r][3] === me) score += 3;
  for (let r = 0; r < ROWS; r += 1) {
    for (let c = 0; c < COLS; c += 1) {
      for (const [dr, dc] of DIRS) {
        const er = r + dr * 3;
        const ec = c + dc * 3;
        if (er < 0 || er >= ROWS || ec < 0 || ec >= COLS) continue;
        score += scoreWindow([0, 1, 2, 3].map((k) => board[r + dr * k][c + dc * k]), me);
      }
    }
  }
  return score;
};

const search = (board, depth, alpha, beta, maximizing, me) => {
  const player = maximizing ? me : me === 1 ? 2 : 1;
  if (depth === 0 || isFull(board)) return evaluate(board, me);
  if (maximizing) {
    let value = -Infinity;
    for (const c of ORDER) {
      const r = landingRow(board, c);
      if (r < 0) continue;
      board[r][c] = player;
      const v = winLineAt(board, r, c) ? 100000 + depth : search(board, depth - 1, alpha, beta, false, me);
      board[r][c] = 0;
      value = Math.max(value, v);
      alpha = Math.max(alpha, value);
      if (alpha >= beta) break;
    }
    return value;
  }
  let value = Infinity;
  for (const c of ORDER) {
    const r = landingRow(board, c);
    if (r < 0) continue;
    board[r][c] = player;
    const v = winLineAt(board, r, c) ? -100000 - depth : search(board, depth - 1, alpha, beta, true, me);
    board[r][c] = 0;
    value = Math.min(value, v);
    beta = Math.min(beta, value);
    if (alpha >= beta) break;
  }
  return value;
};

const DEPTH = { easy: 1, medium: 3, hard: 6 };

export const cpuColumn = (board, me, level) => {
  const valid = ORDER.filter((c) => landingRow(board, c) >= 0);
  if (level === 'easy' && Math.random() < 0.35) return valid[Math.floor(Math.random() * valid.length)];
  const copy = board.map((row) => [...row]);
  let best = -Infinity;
  let choices = [];
  for (const c of valid) {
    const r = landingRow(copy, c);
    copy[r][c] = me;
    const v = winLineAt(copy, r, c) ? 1e6 : search(copy, DEPTH[level] - 1, -Infinity, Infinity, false, me);
    copy[r][c] = 0;
    if (v > best) {
      best = v;
      choices = [c];
    } else if (v === best) choices.push(c);
  }
  return choices[Math.floor(Math.random() * choices.length)];
};
