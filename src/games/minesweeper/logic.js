export const LEVELS = {
  easy: { label: 'Easy', cols: 9, rows: 9, mines: 10 },
  medium: { label: 'Medium', cols: 10, rows: 14, mines: 24 },
  hard: { label: 'Hard', cols: 12, rows: 18, mines: 42 },
};

export const neighbors = (i, cols, rows) => {
  const x = i % cols;
  const y = Math.floor(i / cols);
  const out = [];
  for (let dy = -1; dy <= 1; dy += 1) {
    for (let dx = -1; dx <= 1; dx += 1) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx >= 0 && ny >= 0 && nx < cols && ny < rows) out.push(ny * cols + nx);
    }
  }
  return out;
};

export const emptyCells = (cols, rows) =>
  Array.from({ length: cols * rows }, () => ({ mine: false, count: 0, open: false, flag: false }));

// Mines are placed after the first tap, never on or next to it.
export const plantMines = (cells, safe, { cols, rows, mines }) => {
  const banned = new Set([safe, ...neighbors(safe, cols, rows)]);
  const pool = cells.map((_, i) => i).filter((i) => !banned.has(i));
  for (let i = pool.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const mineSet = new Set(pool.slice(0, mines));
  return cells.map((c, i) => ({
    ...c,
    mine: mineSet.has(i),
    count: neighbors(i, cols, rows).filter((n) => mineSet.has(n)).length,
  }));
};

// Opens cells starting at `start`, flood-filling through zeros. Returns new cells.
export const openFrom = (cells, starts, cols, rows) => {
  const next = cells.map((c) => ({ ...c }));
  const stack = [...starts];
  while (stack.length) {
    const i = stack.pop();
    const cell = next[i];
    if (cell.open || cell.flag) continue;
    cell.open = true;
    if (!cell.mine && cell.count === 0) {
      neighbors(i, cols, rows).forEach((n) => {
        if (!next[n].open && !next[n].flag) stack.push(n);
      });
    }
  }
  return next;
};
