// Search algorithm implementations

// Linear Search
export function linearSearchSteps(array, target) {
  const steps = [];
  const arr = array.slice();

  for (let i = 0; i < arr.length; i++) {
    steps.push({ type: 'check', indices: [i], arr: arr.slice() });
    if (arr[i].value === target) {
      steps.push({ type: 'found', indices: [i], arr: arr.slice() });
      return steps;
    }
  }
  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Binary Search (requires sorted array)
export function binarySearchSteps(array, target) {
  const steps = [];
  // Sort the array first for binary search
  const arr = array.slice().sort((a, b) => a.value - b.value);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, i) => i), arr: arr.slice() });

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({ type: 'check', indices: [mid], range: [left, right], arr: arr.slice() });

    if (arr[mid].value === target) {
      steps.push({ type: 'found', indices: [mid], arr: arr.slice() });
      return steps;
    } else if (arr[mid].value < target) {
      const currentLeft = left;
      steps.push({ type: 'eliminate', indices: Array.from({ length: mid - currentLeft + 1 }, (_, i) => currentLeft + i), arr: arr.slice() });
      left = mid + 1;
    } else {
      const currentMid = mid;
      steps.push({ type: 'eliminate', indices: Array.from({ length: right - currentMid + 1 }, (_, i) => currentMid + i), arr: arr.slice() });
      right = mid - 1;
    }
  }
  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Jump Search
export function jumpSearchSteps(array, target) {
  const steps = [];
  const arr = array.slice().sort((a, b) => a.value - b.value);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, i) => i), arr: arr.slice() });

  const n = arr.length;
  const jump = Math.floor(Math.sqrt(n));
  let prev = 0;
  let curr = 0;

  // Jump through blocks
  while (curr < n && arr[Math.min(curr, n - 1)].value < target) {
    steps.push({ type: 'jump', indices: [Math.min(curr, n - 1)], arr: arr.slice() });
    prev = curr;
    curr += jump;
  }

  // Linear search in the block
  for (let i = prev; i < Math.min(curr, n); i++) {
    steps.push({ type: 'check', indices: [i], arr: arr.slice() });
    if (arr[i].value === target) {
      steps.push({ type: 'found', indices: [i], arr: arr.slice() });
      return steps;
    }
  }

  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Interpolation Search
export function interpolationSearchSteps(array, target) {
  const steps = [];
  const arr = array.slice().sort((a, b) => a.value - b.value);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, i) => i), arr: arr.slice() });

  let low = 0;
  let high = arr.length - 1;

  while (low <= high && target >= arr[low].value && target <= arr[high].value) {
    if (low === high) {
      steps.push({ type: 'check', indices: [low], arr: arr.slice() });
      if (arr[low].value === target) {
        steps.push({ type: 'found', indices: [low], arr: arr.slice() });
        return steps;
      }
      break;
    }

    // Interpolation formula
    const pos = low + Math.floor(
      ((target - arr[low].value) * (high - low)) /
      (arr[high].value - arr[low].value)
    );

    const clampedPos = Math.min(Math.max(pos, low), high);
    steps.push({ type: 'interpolate', indices: [clampedPos], range: [low, high], arr: arr.slice() });

    if (arr[clampedPos].value === target) {
      steps.push({ type: 'found', indices: [clampedPos], arr: arr.slice() });
      return steps;
    }

    if (arr[clampedPos].value < target) {
      low = clampedPos + 1;
    } else {
      high = clampedPos - 1;
    }
  }

  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Exponential Search
export function exponentialSearchSteps(array, target) {
  const steps = [];
  const arr = array.slice().sort((a, b) => a.value - b.value);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, i) => i), arr: arr.slice() });

  const n = arr.length;

  // Check first element
  steps.push({ type: 'check', indices: [0], arr: arr.slice() });
  if (arr[0].value === target) {
    steps.push({ type: 'found', indices: [0], arr: arr.slice() });
    return steps;
  }

  // Find range with exponential jumps
  let bound = 1;
  while (bound < n && arr[bound].value < target) {
    steps.push({ type: 'exponential', indices: [bound], arr: arr.slice() });
    bound *= 2;
  }

  // Binary search within the found range
  let left = Math.floor(bound / 2);
  let right = Math.min(bound, n - 1);

  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    steps.push({ type: 'check', indices: [mid], range: [left, right], arr: arr.slice() });

    if (arr[mid].value === target) {
      steps.push({ type: 'found', indices: [mid], arr: arr.slice() });
      return steps;
    } else if (arr[mid].value < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }

  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Ternary Search
export function ternarySearchSteps(array, target) {
  const steps = [];
  const arr = array.slice().sort((a, b) => a.value - b.value);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, i) => i), arr: arr.slice() });

  let left = 0;
  let right = arr.length - 1;

  while (left <= right) {
    const mid1 = left + Math.floor((right - left) / 3);
    const mid2 = right - Math.floor((right - left) / 3);

    steps.push({ type: 'ternary', indices: [mid1, mid2], range: [left, right], arr: arr.slice() });

    if (arr[mid1].value === target) {
      steps.push({ type: 'found', indices: [mid1], arr: arr.slice() });
      return steps;
    }
    if (arr[mid2].value === target) {
      steps.push({ type: 'found', indices: [mid2], arr: arr.slice() });
      return steps;
    }

    if (target < arr[mid1].value) {
      right = mid1 - 1;
    } else if (target > arr[mid2].value) {
      left = mid2 + 1;
    } else {
      left = mid1 + 1;
      right = mid2 - 1;
    }
  }

  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Fibonacci Search
export function fibonacciSearchSteps(array, target) {
  const steps = [];
  const arr = array.slice().sort((a, b) => a.value - b.value);
  steps.push({ type: 'sorted', indices: Array.from({ length: arr.length }, (_, i) => i), arr: arr.slice() });

  const n = arr.length;

  // Generate Fibonacci numbers
  let fib2 = 0;
  let fib1 = 1;
  let fib = fib1 + fib2;

  while (fib < n) {
    fib2 = fib1;
    fib1 = fib;
    fib = fib1 + fib2;
  }

  let offset = -1;

  while (fib > 1) {
    const i = Math.min(offset + fib2, n - 1);

    steps.push({ type: 'fibonacci', indices: [i], arr: arr.slice() });

    if (arr[i].value < target) {
      fib = fib1;
      fib1 = fib2;
      fib2 = fib - fib1;
      offset = i;
    } else if (arr[i].value > target) {
      fib = fib2;
      fib1 = fib1 - fib2;
      fib2 = fib - fib1;
    } else {
      steps.push({ type: 'found', indices: [i], arr: arr.slice() });
      return steps;
    }
  }

  if (fib1 && offset + 1 < n && arr[offset + 1].value === target) {
    steps.push({ type: 'found', indices: [offset + 1], arr: arr.slice() });
    return steps;
  }

  steps.push({ type: 'not_found', indices: [], arr: arr.slice() });
  return steps;
}

// Algorithm info for search algorithms
export const SEARCH_ALGO_INFO = {
  linear: {
    best: 'O(1)',
    worst: 'O(n)',
    complexity: 'O(n) worst/average, O(1) best. Works on unsorted arrays.',
    steps: [
      'Start from the first element.',
      'Compare each element with the target.',
      'If found, return the index.',
      'If not found after checking all, return not found.'
    ]
  },
  binary: {
    best: 'O(1)',
    worst: 'O(log n)',
    complexity: 'O(log n) worst/average. Requires sorted array.',
    steps: [
      'Sort the array first (if not already sorted).',
      'Compare target with middle element.',
      'If equal, found. If less, search left half.',
      'If greater, search right half. Repeat until found or empty.'
    ]
  },
  jump: {
    best: 'O(1)',
    worst: 'O(√n)',
    complexity: 'O(sqrt(n)) worst. Requires sorted array.',
    steps: [
      'Sort the array first.',
      'Jump ahead by sqrt(n) steps until value exceeds target.',
      'Linear search backwards from current position.',
      'Return index if found, not found otherwise.'
    ]
  },
  interpolation: {
    best: 'O(1)',
    worst: 'O(n)',
    complexity: 'O(log log n) average for uniform data, O(n) worst.',
    steps: [
      'Sort the array first.',
      'Estimate position using interpolation formula.',
      'Compare and adjust search range.',
      'Repeat until found or range exhausted.'
    ]
  },
  exponential: {
    best: 'O(1)',
    worst: 'O(log n)',
    complexity: 'O(log n) worst. Good for unbounded arrays.',
    steps: [
      'Sort the array first.',
      'Exponentially increase bound (1, 2, 4, 8...) until exceeds target.',
      'Binary search within the found range.',
      'Return index if found.'
    ]
  },
  ternary: {
    best: 'O(1)',
    worst: 'O(log₃n)',
    complexity: 'O(log3 n) worst. Divides into 3 parts.',
    steps: [
      'Sort the array first.',
      'Divide search space into three parts.',
      'Compare target with two mid points.',
      'Eliminate two-thirds of the range each iteration.'
    ]
  },
  fibonacci: {
    best: 'O(1)',
    worst: 'O(log n)',
    complexity: 'O(log n) worst. Uses Fibonacci numbers.',
    steps: [
      'Sort the array first.',
      'Find smallest Fibonacci number >= array size.',
      'Use Fibonacci numbers to divide array.',
      'Search in smaller arrays using golden ratio split.'
    ]
  }
};

export const SEARCH_ALGORITHM_DEFAULTS = {
  linear: { size: 150, speed: 100 },
  binary: { size: 200, speed: 200 },
  jump: { size: 150, speed: 150 },
  interpolation: { size: 200, speed: 200 },
  exponential: { size: 200, speed: 150 },
  ternary: { size: 200, speed: 200 },
  fibonacci: { size: 200, speed: 200 }
};

export const searchAlgorithmList = [
  { value: 'binary', label: 'Binary Search' },
  { value: 'exponential', label: 'Exponential Search' },
  { value: 'fibonacci', label: 'Fibonacci Search' },
  { value: 'interpolation', label: 'Interpolation Search' },
  { value: 'jump', label: 'Jump Search' },
  { value: 'linear', label: 'Linear Search' },
  { value: 'ternary', label: 'Ternary Search' }
];
