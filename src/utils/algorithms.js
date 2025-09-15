import MinHeap from "./priorityQueue";

// terrain costs (same as assignment)
const TERRAIN_COSTS = { F: 2, H: 4, D: null, G: 2 };

function inBounds(r, c, rows, cols) {
  return r >= 0 && c >= 0 && r < rows && c < cols;
}

function neighbors(r, c) {
  return [
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1]
  ];
}

function isGoal(grid, r, c) {
    return grid[r][c] === "G";
  }  

function key(r, c, b) {
  return `${r},${c},${b}`;
}
function posKey(r, c) {
  return `${r},${c}`;
}

function manhattan(a, b) {
  return Math.abs(a[0] - b[0]) + Math.abs(a[1] - b[1]);
}

// Reconstruct path from parent map (key -> parentKey)
function reconstructPath(parent, finalKey) {
  const path = [];
  let cur = finalKey;
  while (cur != null) {
    const [r, c] = cur.split(",").map((x, idx) => Number(x)); // finalKey is "r,c,b" but split and ignore battery below
    // Actually cur looks like "r,c,b" -> we need only first two
    const parts = cur.split(",").map(Number);
    path.push([parts[0], parts[1]]);
    cur = parent.get(cur);
  }
  path.reverse();
  return path;
}

// Run DFS (iterative)
export function runDFS({ grid, start, goal, battery }) {
  const rows = grid.length, cols = grid[0].length;
  const stack = [];
  const visited = new Set();
  const parent = new Map();
  const visitedOrder = [];

  const startKey = key(start[0], start[1], battery);
  stack.push({ r: start[0], c: start[1], b: battery });
  parent.set(startKey, null);

  while (stack.length) {
    const node = stack.pop();
    const k = key(node.r, node.c, node.b);
    if (visited.has(k)) continue;
    visited.add(k);
    visitedOrder.push({ r: node.r, c: node.c, battery: node.b });

    if (isGoal(grid, node.r, node.c)) {
        const path = reconstructPath(parent, k);
        return { visitedOrder, path, nodesExpanded: visitedOrder.length, finalBattery: node.b };
    }

    // push neighbors (order: up, right, down, left -> reversed if you want different behavior)
    const neighs = neighbors(node.r, node.c);
    for (let i = neighs.length - 1; i >= 0; i--) {
      const [nr, nc] = neighs[i];
      if (!inBounds(nr, nc, rows, cols)) continue;
      const terr = grid[nr][nc];
      const cost = TERRAIN_COSTS[terr];
      if (cost == null) continue;
      const nb = node.b - cost;
      if (nb < 0) continue;
      const nk = key(nr, nc, nb);
      if (!visited.has(nk)) {
        stack.push({ r: nr, c: nc, b: nb });
        parent.set(nk, k);
      }
    }
  }
  return { visitedOrder, path: [], nodesExpanded: visitedOrder.length, finalBattery: null };
}

// Run BFS
export function runBFS({ grid, start, goal, battery }) {
  const rows = grid.length, cols = grid[0].length;
  const queue = [];
  const visited = new Set();
  const parent = new Map();
  const visitedOrder = [];

  const startKey = key(start[0], start[1], battery);
  queue.push({ r: start[0], c: start[1], b: battery });
  parent.set(startKey, null);

  while (queue.length) {
    const node = queue.shift();
    const k = key(node.r, node.c, node.b);
    if (visited.has(k)) continue;
    visited.add(k);
    visitedOrder.push({ r: node.r, c: node.c, battery: node.b });

    if (isGoal(grid, node.r, node.c)) {
        const path = reconstructPath(parent, k);
        return { visitedOrder, path, nodesExpanded: visitedOrder.length, finalBattery: node.b };
    }

    for (const [nr, nc] of neighbors(node.r, node.c)) {
      if (!inBounds(nr, nc, rows, cols)) continue;
      const terr = grid[nr][nc];
      const cost = TERRAIN_COSTS[terr];
      if (cost == null) continue;
      const nb = node.b - cost;
      if (nb < 0) continue;
      const nk = key(nr, nc, nb);
      if (!visited.has(nk) && !parent.has(nk)) {
        queue.push({ r: nr, c: nc, b: nb });
        parent.set(nk, k);
      }
    }
  }
  return { visitedOrder, path: [], nodesExpanded: visitedOrder.length, finalBattery: null };
}

// Best-First Search (greedy using Manhattan heuristic)
export function runBestFS({ grid, start, goal, battery }) {
  const rows = grid.length, cols = grid[0].length;
  const heap = new MinHeap();
  const visited = new Set();
  const parent = new Map();
  const visitedOrder = [];

  const startKey = key(start[0], start[1], battery);
  heap.push({ r: start[0], c: start[1], b: battery }, manhattan(start, goal));
  parent.set(startKey, null);

  while (heap.size() > 0) {
    const node = heap.pop();
    const k = key(node.r, node.c, node.b);
    if (visited.has(k)) continue;
    visited.add(k);
    visitedOrder.push({ r: node.r, c: node.c, battery: node.b });

    if (isGoal(grid, node.r, node.c)) {
        const path = reconstructPath(parent, k);
        return { visitedOrder, path, nodesExpanded: visitedOrder.length, finalBattery: node.b };
    }

    for (const [nr, nc] of neighbors(node.r, node.c)) {
      if (!inBounds(nr, nc, rows, cols)) continue;
      const terr = grid[nr][nc];
      const cost = TERRAIN_COSTS[terr];
      if (cost == null) continue;
      const nb = node.b - cost;
      if (nb < 0) continue;
      const nk = key(nr, nc, nb);
      if (!visited.has(nk) && !parent.has(nk)) {
        parent.set(nk, k);
        heap.push({ r: nr, c: nc, b: nb }, manhattan([nr, nc], goal));
      }
    }
  }

  return { visitedOrder, path: [], nodesExpanded: visitedOrder.length, finalBattery: null };
}
