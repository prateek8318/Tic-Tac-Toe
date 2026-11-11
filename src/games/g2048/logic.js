export const SIZE = 4;
let nextId = 1;

const emptyCells = (tiles) => {
  const taken = new Set(tiles.map((t) => t.r * SIZE + t.c));
  const out = [];
  for (let i = 0; i < SIZE * SIZE; i += 1) if (!taken.has(i)) out.push(i);
  return out;
};

export const addRandomTile = (tiles) => {
  const free = emptyCells(tiles);
  if (!free.length) return tiles;
  const cell = free[Math.floor(Math.random() * free.length)];
  return [...tiles, { id: nextId++, value: Math.random() < 0.9 ? 2 : 4, r: Math.floor(cell / SIZE), c: cell % SIZE, isNew: true }];
};

export const newGame = () => addRandomTile(addRandomTile([]));

// After restoring a saved board, make sure new tile ids never collide with old ones.
export const syncIds = (tiles) => {
  tiles.forEach((t) => {
    if (t.id >= nextId) nextId = t.id + 1;
  });
};

// j = 0 is the edge the tiles slide toward.
const coord = (dir, line, j) => {
  switch (dir) {
    case 'left': return [line, j];
    case 'right': return [line, SIZE - 1 - j];
    case 'up': return [j, line];
    default: return [SIZE - 1 - j, line]; // down
  }
};

// Slides every tile in `dir`. Each tile merges at most once per move.
export const move = (tiles, dir) => {
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  tiles.forEach((t) => {
    grid[t.r][t.c] = t;
  });
  const out = [];
  let moved = false;
  let gained = 0;

  for (let line = 0; line < SIZE; line += 1) {
    const cells = [];
    for (let j = 0; j < SIZE; j += 1) {
      const [r, c] = coord(dir, line, j);
      if (grid[r][c]) cells.push(grid[r][c]);
    }
    let slot = 0;
    for (let k = 0; k < cells.length; k += 1) {
      const tile = cells[k];
      const nextTile = cells[k + 1];
      const [r, c] = coord(dir, line, slot);
      if (nextTile && nextTile.value === tile.value) {
        const value = tile.value * 2;
        out.push({ id: tile.id, value, r, c, merged: true, isNew: false });
        gained += value;
        moved = true;
        k += 1;
      } else {
        if (tile.r !== r || tile.c !== c) moved = true;
        out.push({ ...tile, r, c, merged: false, isNew: false });
      }
      slot += 1;
    }
  }
  return { tiles: out, moved, gained };
};

export const canMove = (tiles) => {
  if (tiles.length < SIZE * SIZE) return true;
  const grid = Array.from({ length: SIZE }, () => Array(SIZE).fill(0));
  tiles.forEach((t) => {
    grid[t.r][t.c] = t.value;
  });
  for (let r = 0; r < SIZE; r += 1) {
    for (let c = 0; c < SIZE; c += 1) {
      if (c + 1 < SIZE && grid[r][c] === grid[r][c + 1]) return true;
      if (r + 1 < SIZE && grid[r][c] === grid[r + 1][c]) return true;
    }
  }
  return false;
};
