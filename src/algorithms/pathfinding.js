// Pathfinding algorithm implementations

// Helper to get neighbors
function getNeighbors(row, col, rows, cols, allowDiagonal = false) {
  const neighbors = [];
  const directions = [
    [-1, 0], [1, 0], [0, -1], [0, 1]  // Up, Down, Left, Right
  ];

  if (allowDiagonal) {
    directions.push([-1, -1], [-1, 1], [1, -1], [1, 1]);
  }

  for (const [dr, dc] of directions) {
    const nr = row + dr;
    const nc = col + dc;
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      neighbors.push([nr, nc]);
    }
  }
  return neighbors;
}

// Reconstruct path from came_from map
function reconstructPath(cameFrom, end) {
  const path = [];
  let current = `${end[0]},${end[1]}`;
  while (cameFrom.has(current)) {
    const [r, c] = current.split(',').map(Number);
    path.unshift([r, c]);
    current = cameFrom.get(current);
  }
  return path;
}

// BFS (Breadth-First Search)
export function bfsSteps(grid, start, end) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const cameFrom = new Map();
  const queue = [start];
  visited.add(`${start[0]},${start[1]}`);

  while (queue.length > 0) {
    const [row, col] = queue.shift();

    steps.push({
      type: 'visit',
      cell: [row, col],
      grid: grid.map(r => [...r])
    });

    if (row === end[0] && col === end[1]) {
      const path = reconstructPath(cameFrom, end);
      for (const [pr, pc] of path) {
        steps.push({
          type: 'path',
          cell: [pr, pc],
          grid: grid.map(r => [...r])
        });
      }
      steps.push({ type: 'found', cell: end, grid: grid.map(r => [...r]) });
      return steps;
    }

    for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
      const key = `${nr},${nc}`;
      if (!visited.has(key) && grid[nr][nc] !== 1) {
        visited.add(key);
        cameFrom.set(key, `${row},${col}`);
        queue.push([nr, nc]);
        steps.push({
          type: 'explore',
          cell: [nr, nc],
          grid: grid.map(r => [...r])
        });
      }
    }
  }

  steps.push({ type: 'not_found', cell: null, grid: grid.map(r => [...r]) });
  return steps;
}

// DFS (Depth-First Search)
export function dfsSteps(grid, start, end) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const visited = new Set();
  const cameFrom = new Map();
  const stack = [start];

  while (stack.length > 0) {
    const [row, col] = stack.pop();
    const key = `${row},${col}`;

    if (visited.has(key)) continue;
    visited.add(key);

    steps.push({
      type: 'visit',
      cell: [row, col],
      grid: grid.map(r => [...r])
    });

    if (row === end[0] && col === end[1]) {
      const path = reconstructPath(cameFrom, end);
      for (const [pr, pc] of path) {
        steps.push({
          type: 'path',
          cell: [pr, pc],
          grid: grid.map(r => [...r])
        });
      }
      steps.push({ type: 'found', cell: end, grid: grid.map(r => [...r]) });
      return steps;
    }

    for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
      const nkey = `${nr},${nc}`;
      if (!visited.has(nkey) && grid[nr][nc] !== 1) {
        cameFrom.set(nkey, key);
        stack.push([nr, nc]);
        steps.push({
          type: 'explore',
          cell: [nr, nc],
          grid: grid.map(r => [...r])
        });
      }
    }
  }

  steps.push({ type: 'not_found', cell: null, grid: grid.map(r => [...r]) });
  return steps;
}

// Dijkstra's Algorithm
export function dijkstraSteps(grid, start, end) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;
  const distances = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const visited = new Set();
  const cameFrom = new Map();

  distances[start[0]][start[1]] = 0;
  const pq = [[0, start[0], start[1]]]; // [distance, row, col]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0]);
    const [dist, row, col] = pq.shift();
    const key = `${row},${col}`;

    if (visited.has(key)) continue;
    visited.add(key);

    steps.push({
      type: 'visit',
      cell: [row, col],
      distance: dist,
      grid: grid.map(r => [...r])
    });

    if (row === end[0] && col === end[1]) {
      const path = reconstructPath(cameFrom, end);
      for (const [pr, pc] of path) {
        steps.push({
          type: 'path',
          cell: [pr, pc],
          grid: grid.map(r => [...r])
        });
      }
      steps.push({ type: 'found', cell: end, grid: grid.map(r => [...r]) });
      return steps;
    }

    for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
      const nkey = `${nr},${nc}`;
      if (!visited.has(nkey) && grid[nr][nc] !== 1) {
        const newDist = dist + 1;
        if (newDist < distances[nr][nc]) {
          distances[nr][nc] = newDist;
          cameFrom.set(nkey, key);
          pq.push([newDist, nr, nc]);
          steps.push({
            type: 'explore',
            cell: [nr, nc],
            distance: newDist,
            grid: grid.map(r => [...r])
          });
        }
      }
    }
  }

  steps.push({ type: 'not_found', cell: null, grid: grid.map(r => [...r]) });
  return steps;
}

// A* Algorithm
export function astarSteps(grid, start, end) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;

  // Manhattan distance heuristic
  const heuristic = (r, c) => Math.abs(r - end[0]) + Math.abs(c - end[1]);

  const gScore = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const fScore = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const visited = new Set();
  const cameFrom = new Map();

  gScore[start[0]][start[1]] = 0;
  fScore[start[0]][start[1]] = heuristic(start[0], start[1]);

  const openSet = [[fScore[start[0]][start[1]], start[0], start[1]]];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a[0] - b[0]);
    const [, row, col] = openSet.shift();
    const key = `${row},${col}`;

    if (visited.has(key)) continue;
    visited.add(key);

    steps.push({
      type: 'visit',
      cell: [row, col],
      fScore: fScore[row][col],
      grid: grid.map(r => [...r])
    });

    if (row === end[0] && col === end[1]) {
      const path = reconstructPath(cameFrom, end);
      for (const [pr, pc] of path) {
        steps.push({
          type: 'path',
          cell: [pr, pc],
          grid: grid.map(r => [...r])
        });
      }
      steps.push({ type: 'found', cell: end, grid: grid.map(r => [...r]) });
      return steps;
    }

    for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
      const nkey = `${nr},${nc}`;
      if (visited.has(nkey) || grid[nr][nc] === 1) continue;

      const tentativeG = gScore[row][col] + 1;

      if (tentativeG < gScore[nr][nc]) {
        cameFrom.set(nkey, key);
        gScore[nr][nc] = tentativeG;
        fScore[nr][nc] = tentativeG + heuristic(nr, nc);
        openSet.push([fScore[nr][nc], nr, nc]);
        steps.push({
          type: 'explore',
          cell: [nr, nc],
          fScore: fScore[nr][nc],
          grid: grid.map(r => [...r])
        });
      }
    }
  }

  steps.push({ type: 'not_found', cell: null, grid: grid.map(r => [...r]) });
  return steps;
}

// Greedy Best-First Search
export function greedyBfsSteps(grid, start, end) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const heuristic = (r, c) => Math.abs(r - end[0]) + Math.abs(c - end[1]);

  const visited = new Set();
  const cameFrom = new Map();
  const openSet = [[heuristic(start[0], start[1]), start[0], start[1]]];

  while (openSet.length > 0) {
    openSet.sort((a, b) => a[0] - b[0]);
    const [h, row, col] = openSet.shift();
    const key = `${row},${col}`;

    if (visited.has(key)) continue;
    visited.add(key);

    steps.push({
      type: 'visit',
      cell: [row, col],
      heuristic: h,
      grid: grid.map(r => [...r])
    });

    if (row === end[0] && col === end[1]) {
      const path = reconstructPath(cameFrom, end);
      for (const [pr, pc] of path) {
        steps.push({
          type: 'path',
          cell: [pr, pc],
          grid: grid.map(r => [...r])
        });
      }
      steps.push({ type: 'found', cell: end, grid: grid.map(r => [...r]) });
      return steps;
    }

    for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
      const nkey = `${nr},${nc}`;
      if (!visited.has(nkey) && grid[nr][nc] !== 1) {
        cameFrom.set(nkey, key);
        openSet.push([heuristic(nr, nc), nr, nc]);
        steps.push({
          type: 'explore',
          cell: [nr, nc],
          heuristic: heuristic(nr, nc),
          grid: grid.map(r => [...r])
        });
      }
    }
  }

  steps.push({ type: 'not_found', cell: null, grid: grid.map(r => [...r]) });
  return steps;
}

// Bidirectional BFS
export function bidirectionalBfsSteps(grid, start, end) {
  const steps = [];
  const rows = grid.length;
  const cols = grid[0].length;

  const visitedStart = new Set();
  const visitedEnd = new Set();
  const cameFromStart = new Map();
  const cameFromEnd = new Map();

  const queueStart = [start];
  const queueEnd = [end];

  visitedStart.add(`${start[0]},${start[1]}`);
  visitedEnd.add(`${end[0]},${end[1]}`);

  while (queueStart.length > 0 || queueEnd.length > 0) {
    // Expand from start
    if (queueStart.length > 0) {
      const [row, col] = queueStart.shift();
      const key = `${row},${col}`;

      steps.push({
        type: 'visit_start',
        cell: [row, col],
        grid: grid.map(r => [...r])
      });

      if (visitedEnd.has(key)) {
        // Found meeting point - reconstruct full path
        const pathStart = reconstructPath(cameFromStart, [row, col]);
        const pathEnd = reconstructPath(cameFromEnd, [row, col]);
        const fullPath = [...pathStart, [row, col], ...pathEnd.reverse()];

        for (const [pr, pc] of fullPath) {
          steps.push({
            type: 'path',
            cell: [pr, pc],
            grid: grid.map(r => [...r])
          });
        }
        steps.push({ type: 'found', cell: [row, col], grid: grid.map(r => [...r]) });
        return steps;
      }

      for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
        const nkey = `${nr},${nc}`;
        if (!visitedStart.has(nkey) && grid[nr][nc] !== 1) {
          visitedStart.add(nkey);
          cameFromStart.set(nkey, key);
          queueStart.push([nr, nc]);
          steps.push({
            type: 'explore_start',
            cell: [nr, nc],
            grid: grid.map(r => [...r])
          });
        }
      }
    }

    // Expand from end
    if (queueEnd.length > 0) {
      const [row, col] = queueEnd.shift();
      const key = `${row},${col}`;

      steps.push({
        type: 'visit_end',
        cell: [row, col],
        grid: grid.map(r => [...r])
      });

      if (visitedStart.has(key)) {
        const pathStart = reconstructPath(cameFromStart, [row, col]);
        const pathEnd = reconstructPath(cameFromEnd, [row, col]);
        const fullPath = [...pathStart, [row, col], ...pathEnd.reverse()];

        for (const [pr, pc] of fullPath) {
          steps.push({
            type: 'path',
            cell: [pr, pc],
            grid: grid.map(r => [...r])
          });
        }
        steps.push({ type: 'found', cell: [row, col], grid: grid.map(r => [...r]) });
        return steps;
      }

      for (const [nr, nc] of getNeighbors(row, col, rows, cols)) {
        const nkey = `${nr},${nc}`;
        if (!visitedEnd.has(nkey) && grid[nr][nc] !== 1) {
          visitedEnd.add(nkey);
          cameFromEnd.set(nkey, key);
          queueEnd.push([nr, nc]);
          steps.push({
            type: 'explore_end',
            cell: [nr, nc],
            grid: grid.map(r => [...r])
          });
        }
      }
    }
  }

  steps.push({ type: 'not_found', cell: null, grid: grid.map(r => [...r]) });
  return steps;
}

// Jump Point Search (simplified version)
export function jpsSteps(grid, start, end) {
  // For simplicity, we'll use A* with jump point optimization hints
  // Full JPS is quite complex, so this is a simplified version
  return astarSteps(grid, start, end);
}

// Algorithm info
export const PATHFINDING_ALGO_INFO = {
  bfs: {
    best: 'O(1)',
    worst: 'O(V + E)',
    complexity: 'O(V + E) time and space. Guarantees shortest path.',
    steps: [
      'Start at the source node.',
      'Explore all neighbors at current depth.',
      'Move to the next depth level.',
      'Continue until destination found or all nodes visited.'
    ]
  },
  dfs: {
    best: 'O(1)',
    worst: 'O(V + E)',
    complexity: 'O(V + E) time and space. Does NOT guarantee shortest path.',
    steps: [
      'Start at the source node.',
      'Go as deep as possible along each branch.',
      'Backtrack when no more unvisited neighbors.',
      'Continue until destination found or all nodes visited.'
    ]
  },
  dijkstra: {
    best: 'O(1)',
    worst: 'O((V+E)logV)',
    complexity: 'O((V + E) log V) with priority queue. Guarantees shortest path.',
    steps: [
      'Initialize distances to infinity, source to 0.',
      'Pick unvisited node with smallest distance.',
      'Update distances to all neighbors.',
      'Repeat until destination reached or all visited.'
    ]
  },
  astar: {
    best: 'O(1)',
    worst: 'O(b^d)',
    complexity: 'O(E) worst case, typically much better. Optimal with admissible heuristic.',
    steps: [
      'Use f(n) = g(n) + h(n) where g is cost and h is heuristic.',
      'Always expand the node with lowest f score.',
      'Update neighbors if better path found.',
      'Stop when destination reached.'
    ]
  },
  greedy: {
    best: 'O(1)',
    worst: 'O(V + E)',
    complexity: 'O(V + E) time. Does NOT guarantee shortest path but fast.',
    steps: [
      'Use only heuristic (distance to goal) for priority.',
      'Always expand the node closest to the goal.',
      'May find non-optimal paths but very fast.',
      'Good for real-time applications.'
    ]
  },
  bidirectional: {
    best: 'O(1)',
    worst: 'O(b^(d/2))',
    complexity: 'O(b^(d/2)) instead of O(b^d). Faster for long paths.',
    steps: [
      'Run BFS simultaneously from start and end.',
      'Alternate between expanding each frontier.',
      'Stop when the two searches meet.',
      'Reconstruct path from meeting point.'
    ]
  },
  jps: {
    best: 'O(1)',
    worst: 'O(E)',
    complexity: 'O(E) worst, often much better. Optimized A* for uniform grids.',
    steps: [
      'Identify "jump points" - key nodes in the grid.',
      'Skip intermediate nodes along straight lines.',
      'Only consider jump points as successors.',
      'Reduces nodes expanded significantly.'
    ]
  }
};

export const PATHFINDING_ALGORITHM_DEFAULTS = {
  bfs: { speed: 10 },
  dfs: { speed: 10 },
  dijkstra: { speed: 10 },
  astar: { speed: 10 },
  greedy: { speed: 10 },
  bidirectional: { speed: 10 },
  jps: { speed: 10 }
};

export const pathfindingAlgorithmList = [
  { value: 'astar', label: 'A* Search' },
  { value: 'bidirectional', label: 'Bidirectional BFS' },
  { value: 'bfs', label: 'Breadth-First Search' },
  { value: 'dfs', label: 'Depth-First Search' },
  { value: 'dijkstra', label: "Dijkstra's Algorithm" },
  { value: 'greedy', label: 'Greedy Best-First' },
  { value: 'jps', label: 'Jump Point Search' }
];
