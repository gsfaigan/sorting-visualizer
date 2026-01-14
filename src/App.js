import React, { useState, useEffect, useRef } from "react";

// --- Bubble Sort Algorithm (returns animation steps) ---
function bubbleSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - i - 1; j++) {
      steps.push({ type: "compare", indices: [j, j + 1], arr: arr.slice() });
      if (arr[j].value > arr[j + 1].value) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        steps.push({ type: "swap", indices: [j, j + 1], arr: arr.slice() });
        swapped = true;
      }
    }
    // mark the last element of this pass as sorted
    steps.push({ type: 'sorted', indices: [arr.length - i - 1], arr: arr.slice() });
    // Early termination if no swaps occurred (O(n) best case)
    if (!swapped) {
      // Mark all remaining elements as sorted
      for (let k = 0; k < arr.length - i - 1; k++) {
        steps.push({ type: 'sorted', indices: [k], arr: arr.slice() });
      }
      break;
    }
  }
  return steps;
}

// --- Selection Sort ---
function selectionSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  for (let i = 0; i < n - 1; i++) {
    let minIdx = i;
    for (let j = i + 1; j < n; j++) {
      // include the start index `i`, current min `minIdx`, and the item being compared `j`
      steps.push({ type: 'compare', indices: [i, minIdx, j], arr: arr.slice() });
      if (arr[j].value < arr[minIdx].value) {
        minIdx = j;
      }
    }
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ type: 'swap', indices: [i, minIdx], arr: arr.slice() });
    }
    // mark position i as sorted (finalized)
    steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  }
  return steps;
}

// --- Merge Sort ---
function mergeSortSteps(array) {
  const steps = [];
  const arr = array.slice();

  function mergeSort(l, r) {
    if (l >= r) return;
    const m = Math.floor((l + r) / 2);
    mergeSort(l, m);
    mergeSort(m + 1, r);

    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0,
      j = 0,
      k = l;
    while (i < left.length && j < right.length) {
      // indicate which elements are being compared
      steps.push({ type: 'compare', indices: [l + i, m + 1 + j], arr: arr.slice() });
      if (left[i].value <= right[j].value) {
        arr[k] = left[i++];
        steps.push({ type: 'overwrite', indices: [k], arr: arr.slice() });
      } else {
        arr[k] = right[j++];
        steps.push({ type: 'overwrite', indices: [k], arr: arr.slice() });
      }
      k++;
    }
    while (i < left.length) {
      arr[k] = left[i++];
      steps.push({ type: 'overwrite', indices: [k], arr: arr.slice() });
      k++;
    }
    while (j < right.length) {
      arr[k] = right[j++];
      steps.push({ type: 'overwrite', indices: [k], arr: arr.slice() });
      k++;
    }
  }

  mergeSort(0, arr.length - 1);
  return steps;
}

// --- Quick Sort ---
function quickSortSteps(array) {
  const steps = [];
  const arr = array.slice();

  function partition(low, high) {
    const pivot = arr[high].value;
    let i = low;
    for (let j = low; j < high; j++) {
      // compare j with pivot at high
      steps.push({ type: 'compare', indices: [j, high], arr: arr.slice() });
      if (arr[j].value < pivot) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        if (i !== j) steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
        i++;
      }
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
    steps.push({ type: 'swap', indices: [i, high], arr: arr.slice() });
    // pivot is now at i
    steps.push({ type: 'pivot', indices: [i], arr: arr.slice() });
    return i;
  }

  function qs(low, high) {
    if (low < high) {
      const p = partition(low, high);
      qs(low, p - 1);
      qs(p + 1, high);
    }
  }

  qs(0, arr.length - 1);
  return steps;
}

// --- Insertion Sort ---
function insertionSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0) {
      steps.push({ type: 'compare', indices: [j, i], arr: arr.slice() });
      if (arr[j].value > key.value) {
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
        j--;
      } else break;
    }
    arr[j + 1] = key;
    steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    steps.push({ type: 'sorted', indices: [j + 1], arr: arr.slice() });
  }
  return steps;
}

// --- Heap Sort ---
function heapSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;

  function heapify(size, root) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size) {
      steps.push({ type: 'compare', indices: [left, largest], arr: arr.slice() });
      if (arr[left].value > arr[largest].value) largest = left;
    }
    if (right < size) {
      steps.push({ type: 'compare', indices: [right, largest], arr: arr.slice() });
      if (arr[right].value > arr[largest].value) largest = right;
    }
    if (largest !== root) {
      [arr[root], arr[largest]] = [arr[largest], arr[root]];
      steps.push({ type: 'swap', indices: [root, largest], arr: arr.slice() });
      heapify(size, largest);
    }
  }

  // build heap
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i);
  // extract
  for (let end = n - 1; end > 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]];
    steps.push({ type: 'swap', indices: [0, end], arr: arr.slice() });
    steps.push({ type: 'sorted', indices: [end], arr: arr.slice() });
    heapify(end, 0);
  }
  if (n > 0) steps.push({ type: 'sorted', indices: [0], arr: arr.slice() });
  return steps;
}

// --- Shell Sort ---
function shellSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  let gap = Math.floor(n / 2);
  while (gap > 0) {
    for (let i = gap; i < n; i++) {
      const temp = arr[i];
      let j = i;
      while (j >= gap) {
        steps.push({ type: 'compare', indices: [j - gap, j], arr: arr.slice() });
        if (arr[j - gap].value > temp.value) {
          arr[j] = arr[j - gap];
          steps.push({ type: 'overwrite', indices: [j], arr: arr.slice() });
          j -= gap;
        } else break;
      }
      arr[j] = temp;
      steps.push({ type: 'overwrite', indices: [j], arr: arr.slice() });
    }
    gap = Math.floor(gap / 2);
  }
  // mark all sorted
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Counting Sort ---
function countingSortSteps(array) {
  const steps = [];
  const n = array.length;
  if (n === 0) return steps;
  const arrValues = array.map(a => a.value);
  const minV = Math.min(...arrValues);
  const maxV = Math.max(...arrValues);
  const range = maxV - minV + 1;
  const count = new Array(range).fill(0);
  // count
  for (let i = 0; i < n; i++) {
    count[array[i].value - minV]++;
    steps.push({ type: 'compare', indices: [i], arr: array.slice() });
  }
  // rebuild
  const out = new Array(n);
  let idx = 0;
  for (let v = 0; v < range; v++) {
    while (count[v]-- > 0) {
      out[idx] = { id: idx, value: v + minV };
      const snapshot = out.slice();
      // pad snapshot to full length for consistent rendering
      while (snapshot.length < n) snapshot.push({ id: snapshot.length, value: 0 });
      steps.push({ type: 'overwrite', indices: [idx], arr: snapshot });
      idx++;
    }
  }
  return steps;
}

// --- Radix Sort (LSD base 10) ---
function radixSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  if (n === 0) return steps;
  let max = Math.max(...arr.map(a => Math.abs(a.value)));
  let exp = 1;
  while (Math.floor(max / exp) > 0) {
    const buckets = Array.from({ length: 10 }, () => []);
    for (let i = 0; i < n; i++) {
      const digit = Math.floor(Math.abs(arr[i].value) / exp) % 10;
      buckets[digit].push(arr[i]);
      steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
    }
    let k = 0;
    const allIndices = [];
    for (let b = 0; b < 10; b++) {
      for (let item of buckets[b]) {
        arr[k] = item;
        allIndices.push(k);
        k++;
      }
    }
    // Show complete redistribution for this digit
    if (allIndices.length > 0) {
      steps.push({ type: 'overwrite', indices: allIndices, arr: arr.slice() });
    }
    exp *= 10;
  }
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Bucket Sort ---
function bucketSortSteps(array) {
  const steps = [];
  const n = array.length;
  if (n === 0) return steps;
  const arr = array.slice();
  const values = arr.map(a => a.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const bucketCount = Math.min(10, n);
  const buckets = Array.from({ length: bucketCount }, () => []);
  const range = maxV - minV + 1;
  for (let i = 0; i < n; i++) {
    const idx = Math.floor(((arr[i].value - minV) / range) * (bucketCount - 1));
    buckets[idx].push(arr[i]);
    steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
  }
  // sort each bucket with insertion and flatten
  let pos = 0;
  for (let b = 0; b < bucketCount; b++) {
    const bucket = buckets[b];
    // insertion sort on bucket
    for (let i = 1; i < bucket.length; i++) {
      const key = bucket[i];
      let j = i - 1;
      while (j >= 0 && bucket[j].value > key.value) {
        bucket[j + 1] = bucket[j];
        j--;
      }
      bucket[j + 1] = key;
    }
    // Write bucket back to array
    const bucketIndices = [];
    for (let item of bucket) {
      arr[pos] = item;
      bucketIndices.push(pos);
      pos++;
    }
    // Show complete bucket placement
    if (bucketIndices.length > 0) {
      steps.push({ type: 'overwrite', indices: bucketIndices, arr: arr.slice() });
    }
  }
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Cocktail Shaker Sort ---
function cocktailShakerSteps(array) {
  const steps = [];
  const arr = array.slice();
  let start = 0;
  let end = arr.length - 1;
  let swapped = true;
  while (swapped) {
    swapped = false;
    for (let i = start; i < end; i++) {
      steps.push({ type: 'compare', indices: [i, i + 1], arr: arr.slice() });
      if (arr[i].value > arr[i + 1].value) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + 1], arr: arr.slice() });
        swapped = true;
      }
    }
    if (!swapped) break;
    swapped = false;
    end--;
    for (let i = end - 1; i >= start; i--) {
      steps.push({ type: 'compare', indices: [i, i + 1], arr: arr.slice() });
      if (arr[i].value > arr[i + 1].value) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + 1], arr: arr.slice() });
        swapped = true;
      }
    }
    start++;
  }
  for (let i = 0; i < arr.length; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Comb Sort ---
function combSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  let gap = n;
  const shrink = 1.3;
  let sorted = false;
  while (!sorted) {
    gap = Math.floor(gap / shrink) || 1;
    sorted = gap === 1;
    for (let i = 0; i + gap < n; i++) {
      steps.push({ type: 'compare', indices: [i, i + gap], arr: arr.slice() });
      if (arr[i].value > arr[i + gap].value) {
        [arr[i], arr[i + gap]] = [arr[i + gap], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + gap], arr: arr.slice() });
        sorted = false;
      }
    }
  }
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Gnome Sort ---
function gnomeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  let index = 1;
  const n = arr.length;
  while (index < n) {
    steps.push({ type: 'compare', indices: [index - 1, index], arr: arr.slice() });
    if (arr[index].value >= arr[index - 1].value) index++;
    else {
      [arr[index], arr[index - 1]] = [arr[index - 1], arr[index]];
      steps.push({ type: 'swap', indices: [index - 1, index], arr: arr.slice() });
      if (index > 1) index--;
      else index++;
    }
  }
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Cycle Sort ---
function cycleSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  for (let cycleStart = 0; cycleStart < n - 1; cycleStart++) {
    let item = arr[cycleStart];
    let pos = cycleStart;
    for (let i = cycleStart + 1; i < n; i++) {
      steps.push({ type: 'compare', indices: [i, cycleStart], arr: arr.slice() });
      if (arr[i].value < item.value) pos++;
    }
    if (pos === cycleStart) continue;
    while (item.value === arr[pos].value) {
      pos++;
    }
    if (pos !== cycleStart) {
      [arr[pos], item] = [item, arr[pos]];
      steps.push({ type: 'swap', indices: [pos, cycleStart], arr: arr.slice() });
    }
    while (pos !== cycleStart) {
      pos = cycleStart;
      for (let i = cycleStart + 1; i < n; i++) {
        if (arr[i].value < item.value) pos++;
      }
      while (item.value === arr[pos].value) pos++;
      if (item.value !== arr[pos].value) {
        [arr[pos], item] = [item, arr[pos]];
        steps.push({ type: 'swap', indices: [pos, cycleStart], arr: arr.slice() });
      }
    }
  }
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Pancake Sort ---
function pancakeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  function flip(k) {
    for (let i = 0, j = k; i < j; i++, j--) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
    }
  }
  for (let currSize = n; currSize > 1; currSize--) {
    let mi = 0;
    for (let i = 1; i < currSize; i++) if (arr[i].value > arr[mi].value) mi = i;
    if (mi !== currSize - 1) {
      if (mi > 0) flip(mi);
      flip(currSize - 1);
    }
  }
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Bitonic Sort (only works for power-of-two lengths)
function bitonicSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  // Bitonic sort only works on power of 2 sized arrays
  const isPowerOf2 = n > 0 && (n & (n - 1)) === 0;
  if (!isPowerOf2) {
    alert('Bitonic Sort requires array size to be a power of 2 (e.g., 16, 32, 64, 128)');
    return steps;
  }
  
  function compareAndSwap(i, j, dir) {
    if (i >= n || j >= n) return;
    steps.push({ type: 'compare', indices: [i, j], arr: arr.slice() });
    // dir: true = ascending, false = descending
    const shouldSwap = dir ? (arr[i].value > arr[j].value) : (arr[i].value < arr[j].value);
    if (shouldSwap) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
    }
  }
  
  function bitonicMerge(lo, cnt, dir) {
    if (cnt > 1) {
      const k = Math.floor(cnt / 2);
      for (let i = lo; i < Math.min(lo + k, n - k); i++) {
        if (i + k < n) compareAndSwap(i, i + k, dir);
      }
      if (lo + k <= n) {
        bitonicMerge(lo, k, dir);
        if (lo + k < n) bitonicMerge(lo + k, k, dir);
      }
    }
  }
  
  function bitonicSort(lo, cnt, dir) {
    if (cnt > 1 && lo < n) {
      const k = Math.floor(cnt / 2);
      if (lo + k <= n) {
        bitonicSort(lo, k, true);   // ascending
        if (lo + k < n) bitonicSort(lo + k, Math.min(k, n - lo - k), false); // descending
        bitonicMerge(lo, Math.min(cnt, n - lo), dir);
      }
    }
  }
  
  // Find next power of 2
  let powerOf2 = 1;
  while (powerOf2 < n) powerOf2 *= 2;
  
  bitonicSort(0, n, true);
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Timsort (simplified) ---
function timsortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  if (n === 0) return steps;
  const minRun = 32;

  function insertionRange(l, r) {
    for (let i = l + 1; i <= r; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= l) {
        steps.push({ type: 'compare', indices: [j, i], arr: arr.slice() });
        if (arr[j].value > key.value) {
          arr[j + 1] = arr[j];
          steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
          j--;
        } else break;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  }

  // build runs
  let i = 0;
  const runs = [];
  while (i < n) {
    let runStart = i;
    i++;
    if (i === n) { runs.push([runStart, i - 1]); break; }
    if (arr[i - 1].value <= arr[i].value) {
      while (i < n && arr[i - 1].value <= arr[i].value) i++;
    } else {
      while (i < n && arr[i - 1].value > arr[i].value) i++;
      // reverse descending run
      arr.splice(runStart, i - runStart, ...arr.slice(runStart, i).reverse());
      steps.push({ type: 'overwrite', indices: [runStart], arr: arr.slice() });
    }
    runs.push([runStart, i - 1]);
  }

  // extend short runs with insertion
  for (let [l, r] of runs) {
    if (r - l + 1 < minRun) {
      const extendTo = Math.min(n - 1, l + minRun - 1);
      insertionRange(l, extendTo);
    } else insertionRange(l, r);
  }

  // simple merging of runs
  function mergeRuns() {
    const newRuns = [];
    for (let k = 0; k < runs.length; k += 2) {
      if (k + 1 >= runs.length) { newRuns.push(runs[k]); continue; }
      const [l1, r1] = runs[k];
      const [l2, r2] = runs[k + 1];
      const left = arr.slice(l1, r1 + 1);
      const right = arr.slice(l2, r2 + 1);
      let p = 0, q = 0, t = l1;
      while (p < left.length && q < right.length) {
        steps.push({ type: 'compare', indices: [l1 + p, l2 + q], arr: arr.slice() });
        if (left[p].value <= right[q].value) arr[t++] = left[p++];
        else arr[t++] = right[q++];
        steps.push({ type: 'overwrite', indices: [t - 1], arr: arr.slice() });
      }
      while (p < left.length) { arr[t++] = left[p++]; steps.push({ type: 'overwrite', indices: [t - 1], arr: arr.slice() }); }
      while (q < right.length) { arr[t++] = right[q++]; steps.push({ type: 'overwrite', indices: [t - 1], arr: arr.slice() }); }
      newRuns.push([l1, r2]);
    }
    runs.length = 0; runs.push(...newRuns);
  }

  while (runs.length > 1) mergeRuns();
  for (let k = 0; k < n; k++) steps.push({ type: 'sorted', indices: [k], arr: arr.slice() });
  return steps;
}

// --- Bogo Sort (random shuffle until sorted) ---
function bogoSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  function isSorted() {
    for (let i = 0; i < n - 1; i++) {
      if (arr[i].value > arr[i + 1].value) return false;
    }
    return true;
  }
  
  let attempts = 0;
  const maxAttempts = 1000; // limit to prevent infinite loops
  
  while (!isSorted() && attempts < maxAttempts) {
    // Shuffle
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i !== j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
      }
    }
    attempts++;
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Stooge Sort ---
function stoogeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  
  function stooge(l, r) {
    if (l >= r) return;
    steps.push({ type: 'compare', indices: [l, r], arr: arr.slice() });
    if (arr[l].value > arr[r].value) {
      [arr[l], arr[r]] = [arr[r], arr[l]];
      steps.push({ type: 'swap', indices: [l, r], arr: arr.slice() });
    }
    if (r - l + 1 > 2) {
      const t = Math.floor((r - l + 1) / 3);
      stooge(l, r - t);
      stooge(l + t, r);
      stooge(l, r - t);
    }
  }
  
  stooge(0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Odd-Even Sort (Brick Sort) ---
function oddEvenSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  let sorted = false;
  
  while (!sorted) {
    sorted = true;
    // Odd phase
    for (let i = 1; i < n - 1; i += 2) {
      steps.push({ type: 'compare', indices: [i, i + 1], arr: arr.slice() });
      if (arr[i].value > arr[i + 1].value) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + 1], arr: arr.slice() });
        sorted = false;
      }
    }
    // Even phase
    for (let i = 0; i < n - 1; i += 2) {
      steps.push({ type: 'compare', indices: [i, i + 1], arr: arr.slice() });
      if (arr[i].value > arr[i + 1].value) {
        [arr[i], arr[i + 1]] = [arr[i + 1], arr[i]];
        steps.push({ type: 'swap', indices: [i, i + 1], arr: arr.slice() });
        sorted = false;
      }
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Stalin Sort (remove elements out of order) ---
function stalinSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  // Stalin Sort: progressively remove elements that decrease
  // Start with full array and remove elements as we go
  let current = arr.slice();
  
  let i = 1;
  while (i < current.length) {
    // Compare with previous element
    steps.push({ type: 'compare', indices: [i - 1, i], arr: current.slice() });
    
    if (current[i].value < current[i - 1].value) {
      // Element must be eliminated! Show it being highlighted before removal
      steps.push({ type: 'swap', indices: [i], arr: current.slice() });
      
      // Remove the element (Stalin's purge)
      current.splice(i, 1);
      
      // Show the new shorter array
      steps.push({ type: 'overwrite', indices: Array.from({length: current.length}, (_, idx) => idx), arr: current.slice() });
      
      // Don't increment i since we removed an element
    } else {
      // Element is acceptable, move to next
      i++;
    }
  }
  
  // Mark all remaining elements as sorted (they survived Stalin's regime)
  for (let j = 0; j < current.length; j++) {
    steps.push({ type: 'sorted', indices: [j], arr: current.slice() });
  }
  
  return steps;
}

// --- Intro Sort (hybrid: quicksort + heapsort + insertion) ---
function introSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  const maxDepth = Math.floor(Math.log2(n)) * 2;
  
  function insertionSort(l, r) {
    for (let i = l + 1; i <= r; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= l) {
        steps.push({ type: 'compare', indices: [j, i], arr: arr.slice() });
        if (arr[j].value > key.value) {
          arr[j + 1] = arr[j];
          steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
          j--;
        } else break;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  }
  
  function heapify(size, root, offset) {
    let largest = root;
    const left = 2 * root + 1;
    const right = 2 * root + 2;
    if (left < size && arr[offset + left].value > arr[offset + largest].value) largest = left;
    if (right < size && arr[offset + right].value > arr[offset + largest].value) largest = right;
    if (largest !== root) {
      [arr[offset + root], arr[offset + largest]] = [arr[offset + largest], arr[offset + root]];
      steps.push({ type: 'swap', indices: [offset + root, offset + largest], arr: arr.slice() });
      heapify(size, largest, offset);
    }
  }
  
  function heapsort(l, r) {
    const size = r - l + 1;
    for (let i = Math.floor(size / 2) - 1; i >= 0; i--) heapify(size, i, l);
    for (let i = size - 1; i > 0; i--) {
      [arr[l], arr[l + i]] = [arr[l + i], arr[l]];
      steps.push({ type: 'swap', indices: [l, l + i], arr: arr.slice() });
      heapify(i, 0, l);
    }
  }
  
  function partition(low, high) {
    const pivot = arr[high].value;
    let i = low;
    for (let j = low; j < high; j++) {
      steps.push({ type: 'compare', indices: [j, high], arr: arr.slice() });
      if (arr[j].value < pivot) {
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
        }
        i++;
      }
    }
    [arr[i], arr[high]] = [arr[high], arr[i]];
    steps.push({ type: 'swap', indices: [i, high], arr: arr.slice() });
    return i;
  }
  
  function intro(low, high, depth) {
    const size = high - low + 1;
    if (size < 16) {
      insertionSort(low, high);
      return;
    }
    if (depth === 0) {
      heapsort(low, high);
      return;
    }
    if (low < high) {
      const p = partition(low, high);
      intro(low, p - 1, depth - 1);
      intro(p + 1, high, depth - 1);
    }
  }
  
  intro(0, n - 1, maxDepth);
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Block Sort (simplified merge with buffer) ---
function blockSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  function insertionSort(l, r) {
    for (let i = l + 1; i <= r; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= l && arr[j].value > key.value) {
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  }
  
  function merge(l, m, r) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    while (i < left.length && j < right.length) {
      steps.push({ type: 'compare', indices: [l + i, m + 1 + j], arr: arr.slice() });
      if (left[i].value <= right[j].value) {
        arr[k++] = left[i++];
      } else {
        arr[k++] = right[j++];
      }
      steps.push({ type: 'overwrite', indices: [k - 1], arr: arr.slice() });
    }
    while (i < left.length) {
      arr[k++] = left[i++];
      steps.push({ type: 'overwrite', indices: [k - 1], arr: arr.slice() });
    }
    while (j < right.length) {
      arr[k++] = right[j++];
      steps.push({ type: 'overwrite', indices: [k - 1], arr: arr.slice() });
    }
  }
  
  const blockSize = 16;
  for (let i = 0; i < n; i += blockSize) {
    insertionSort(i, Math.min(i + blockSize - 1, n - 1));
  }
  
  for (let size = blockSize; size < n; size *= 2) {
    for (let l = 0; l < n; l += size * 2) {
      const m = l + size - 1;
      const r = Math.min(l + size * 2 - 1, n - 1);
      if (m < r) merge(l, m, r);
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Smoothsort (Leonardo heap variant) ---
function smoothsortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;

  if (n <= 1) {
    if (n === 1) steps.push({ type: 'sorted', indices: [0], arr: arr.slice() });
    return steps;
  }

  // Leonardo numbers: 1, 1, 3, 5, 9, 15, 25, 41, 67, 109, 177, ...
  const leo = [1, 1];
  while (leo[leo.length - 1] < n + 1) {
    leo.push(leo[leo.length - 1] + leo[leo.length - 2] + 1);
  }

  // State: sizes[] holds the orders of current Leonardo trees (right to left)
  // Each tree's root is at the rightmost position of that tree
  let sizes = [];

  // Get root position of tree at index t in sizes array
  function getRoot(upTo) {
    let pos = -1;
    for (let i = 0; i <= upTo; i++) {
      pos += leo[sizes[i]];
    }
    return pos;
  }

  // Sift down within a Leonardo tree rooted at 'root' with order 'order'
  function sift(root, order) {
    while (order >= 2) {
      const right = root - 1;
      const left = root - 1 - leo[order - 2];

      steps.push({ type: 'compare', indices: [left, right], arr: arr.slice() });
      let child, childOrder;
      if (arr[left].value > arr[right].value) {
        child = left;
        childOrder = order - 1;
      } else {
        child = right;
        childOrder = order - 2;
      }

      steps.push({ type: 'compare', indices: [root, child], arr: arr.slice() });
      if (arr[root].value >= arr[child].value) return;

      [arr[root], arr[child]] = [arr[child], arr[root]];
      steps.push({ type: 'swap', indices: [root, child], arr: arr.slice() });

      root = child;
      order = childOrder;
    }
  }

  // Restore heap property: make sure roots are in descending order
  function restoreHeap(idx) {
    // idx is index in sizes array of the tree we're fixing
    while (idx > 0) {
      const currRoot = getRoot(idx);
      const prevRoot = getRoot(idx - 1);

      steps.push({ type: 'compare', indices: [prevRoot, currRoot], arr: arr.slice() });
      if (arr[prevRoot].value <= arr[currRoot].value) {
        sift(currRoot, sizes[idx]);
        return;
      }

      // Check if prevRoot is larger than currRoot's children
      if (sizes[idx] >= 2) {
        const right = currRoot - 1;
        const left = currRoot - 1 - leo[sizes[idx] - 2];

        steps.push({ type: 'compare', indices: [prevRoot, right], arr: arr.slice() });
        if (arr[prevRoot].value <= arr[right].value) {
          sift(currRoot, sizes[idx]);
          return;
        }

        steps.push({ type: 'compare', indices: [prevRoot, left], arr: arr.slice() });
        if (arr[prevRoot].value <= arr[left].value) {
          sift(currRoot, sizes[idx]);
          return;
        }
      }

      [arr[currRoot], arr[prevRoot]] = [arr[prevRoot], arr[currRoot]];
      steps.push({ type: 'swap', indices: [currRoot, prevRoot], arr: arr.slice() });
      idx--;
    }

    if (sizes.length > 0) {
      sift(getRoot(0), sizes[0]);
    }
  }

  // BUILD PHASE: Add elements one at a time
  for (let i = 0; i < n; i++) {
    // Can we merge the two rightmost trees?
    if (sizes.length >= 2 && sizes[sizes.length - 1] + 1 === sizes[sizes.length - 2]) {
      // Merge: remove two trees, add one larger tree
      sizes.pop();
      sizes[sizes.length - 1]++;
    } else if (sizes.length >= 1 && sizes[sizes.length - 1] === 1) {
      // Add L(0) = 1 tree
      sizes.push(0);
    } else {
      // Add L(1) = 1 tree
      sizes.push(1);
    }

    restoreHeap(sizes.length - 1);
  }

  // EXTRACT PHASE: Remove max element from end, one at a time
  for (let i = n - 1; i >= 0; i--) {
    if (sizes.length === 0) break;

    const order = sizes.pop();

    if (order >= 2) {
      // Split this tree into its two children
      // Left child has order-1, right child has order-2
      const leftOrder = order - 1;
      const rightOrder = order - 2;

      sizes.push(leftOrder);
      const leftRoot = getRoot(sizes.length - 1);
      restoreHeap(sizes.length - 1);

      sizes.push(rightOrder);
      const rightRoot = getRoot(sizes.length - 1);
      restoreHeap(sizes.length - 1);
    }

    steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  }

  return steps;
}

// --- Strand Sort ---
function strandSortSteps(array) {
  const steps = [];
  const n = array.length;
  const arr = array.slice();
  const visualArr = array.slice();
  let result = [];
  let remaining = arr.slice();
  
  while (remaining.length > 0) {
    // Extract a sorted sublist (strand)
    const sublist = [remaining[0]];
    const newRemaining = [];
    
    for (let i = 1; i < remaining.length; i++) {
      const compareIdx = sublist.length - 1;
      steps.push({ type: 'compare', indices: [compareIdx, i], arr: visualArr.slice() });
      
      if (remaining[i].value >= sublist[sublist.length - 1].value) {
        sublist.push(remaining[i]);
        steps.push({ type: 'overwrite', indices: [sublist.length - 1], arr: visualArr.slice() });
      } else {
        newRemaining.push(remaining[i]);
      }
    }
    
    // Merge sublist into result with visualization
    const merged = [];
    let i = 0, j = 0;
    
    while (i < result.length && j < sublist.length) {
      steps.push({ type: 'compare', indices: [i, result.length + j], arr: visualArr.slice() });
      if (result[i].value <= sublist[j].value) {
        merged.push(result[i++]);
      } else {
        merged.push(sublist[j++]);
      }
    }
    while (i < result.length) merged.push(result[i++]);
    while (j < sublist.length) merged.push(sublist[j++]);
    
    result = merged;
    remaining = newRemaining;
    
    // Update visualization array progressively
    for (let k = 0; k < result.length && k < n; k++) {
      visualArr[k] = result[k];
    }
    for (let k = 0; k < remaining.length && result.length + k < n; k++) {
      visualArr[result.length + k] = remaining[k];
    }
    
    const affectedIndices = Array.from({length: Math.min(result.length + remaining.length, n)}, (_, i) => i);
    if (affectedIndices.length > 0) {
      steps.push({ type: 'overwrite', indices: affectedIndices, arr: visualArr.slice() });
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: visualArr.slice() });
  return steps;
}

// --- Library Sort (Gapped Insertion Sort) ---
function librarySortSteps(array) {
  const steps = [];
  const n = array.length;
  if (n === 0) return steps;

  // Library sort uses gaps between elements for faster insertion
  // Gap factor of 2 means array has n gaps for n elements
  const epsilon = 1; // Gap ratio: 1 means equal gaps to elements
  const gappedSize = n * (1 + epsilon);
  const GAP = null; // Represents empty slot

  // Create gapped array with null gaps
  const gapped = new Array(gappedSize).fill(GAP);

  // Helper to get display array (compress gaps for visualization)
  function getDisplayArr() {
    const result = [];
    for (let i = 0; i < gappedSize; i++) {
      if (gapped[i] !== GAP) {
        result.push(gapped[i]);
      }
    }
    // Pad to original size for consistent display
    while (result.length < n) {
      result.push({ id: result.length, value: 0 });
    }
    return result;
  }

  // Binary search to find insertion position (searching among non-gap elements)
  function binarySearch(target, rightBound) {
    let left = 0, right = rightBound;
    while (left < right) {
      let mid = Math.floor((left + right) / 2);
      // Skip gaps going left
      while (mid > left && gapped[mid] === GAP) mid--;
      if (gapped[mid] === GAP || gapped[mid].value < target) {
        left = mid + 1;
        // Skip gaps
        while (left < right && gapped[left] === GAP) left++;
      } else {
        right = mid;
      }
    }
    return left;
  }

  // Insert first element in the middle
  const midPos = Math.floor(gappedSize / 2);
  gapped[midPos] = array[0];
  steps.push({ type: 'overwrite', indices: [0], arr: getDisplayArr() });

  let insertedCount = 1;

  // Insert remaining elements
  for (let i = 1; i < n; i++) {
    const item = array[i];
    steps.push({ type: 'compare', indices: [i], arr: getDisplayArr() });

    // Find position using binary search
    let pos = binarySearch(item.value, gappedSize);

    // Find actual insertion slot (gap or shift needed)
    // Look for nearest gap
    let insertPos = pos;
    while (insertPos < gappedSize && gapped[insertPos] !== GAP) insertPos++;

    if (insertPos >= gappedSize) {
      // No gap to the right, look left
      insertPos = pos - 1;
      while (insertPos >= 0 && gapped[insertPos] !== GAP) insertPos--;

      if (insertPos < 0) {
        // No gaps available, shift right
        insertPos = pos;
        for (let j = gappedSize - 1; j > insertPos; j--) {
          if (gapped[j - 1] !== GAP) {
            gapped[j] = gapped[j - 1];
          }
        }
      } else {
        // Shift elements left to fill the gap
        for (let j = insertPos; j < pos - 1; j++) {
          gapped[j] = gapped[j + 1];
        }
        insertPos = pos - 1;
      }
    } else if (insertPos > pos) {
      // Shift elements right to the gap
      for (let j = insertPos; j > pos; j--) {
        gapped[j] = gapped[j - 1];
      }
      insertPos = pos;
    }

    gapped[insertPos] = item;
    insertedCount++;
    steps.push({ type: 'overwrite', indices: [insertedCount - 1], arr: getDisplayArr() });
  }

  // Compact: remove gaps and copy back
  const result = getDisplayArr();
  for (let i = 0; i < n; i++) {
    steps.push({ type: 'sorted', indices: [i], arr: result });
  }

  return steps;
}

// --- Tree Sort (BST) ---
function treeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  
  class Node {
    constructor(val) {
      this.value = val;
      this.left = null;
      this.right = null;
    }
  }
  
  let root = null;
  
  function insert(node, val, idx) {
    if (!node) return new Node(val);
    steps.push({ type: 'compare', indices: [idx], arr: arr.slice() });
    if (val.value < node.value.value) {
      node.left = insert(node.left, val, idx);
    } else {
      node.right = insert(node.right, val, idx);
    }
    return node;
  }
  
  function inorder(node, result) {
    if (!node) return;
    inorder(node.left, result);
    result.push(node.value);
    inorder(node.right, result);
  }
  
  for (let i = 0; i < arr.length; i++) {
    root = insert(root, arr[i], i);
  }
  
  const sorted = [];
  inorder(root, sorted);
  
  for (let i = 0; i < sorted.length; i++) {
    arr[i] = sorted[i];
    steps.push({ type: 'overwrite', indices: [i], arr: arr.slice() });
  }
  
  for (let i = 0; i < arr.length; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Gravity Sort (Bead Sort) - only works well for positive integers ---
function gravitySortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  if (n === 0) return steps;
  
  const max = Math.max(...arr.map(a => a.value));
  const beads = Array.from({ length: n }, () => new Array(max).fill(0));
  
  // Set beads
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < arr[i].value; j++) {
      beads[i][j] = 1;
    }
    steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
  }
  
  // Gravity drop
  for (let j = 0; j < max; j++) {
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += beads[i][j];
      beads[i][j] = 0;
    }
    for (let i = n - sum; i < n; i++) {
      beads[i][j] = 1;
    }
  }
  
  // Read back
  for (let i = 0; i < n; i++) {
    let count = 0;
    for (let j = 0; j < max; j++) {
      count += beads[i][j];
    }
    arr[i] = { ...arr[i], value: count };
    steps.push({ type: 'overwrite', indices: [i], arr: arr.slice() });
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Pigeonhole Sort ---
function pigeonholeSortSteps(array) {
  const steps = [];
  const n = array.length;
  if (n === 0) return steps;
  
  const arr = array.slice();
  const values = arr.map(a => a.value);
  const minV = Math.min(...values);
  const maxV = Math.max(...values);
  const range = maxV - minV + 1;
  const holes = Array.from({ length: range }, () => []);
  
  // Place in holes
  for (let i = 0; i < n; i++) {
    holes[arr[i].value - minV].push(arr[i]);
    steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
  }
  
  // Collect from holes
  let idx = 0;
  for (let i = 0; i < range; i++) {
    const holeIndices = [];
    for (let item of holes[i]) {
      arr[idx] = item;
      holeIndices.push(idx);
      idx++;
    }
    // Show complete hole collection
    if (holeIndices.length > 0) {
      steps.push({ type: 'overwrite', indices: holeIndices, arr: arr.slice() });
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Min-Max Selection Sort ---
function minMaxSelectionSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  for (let i = 0; i < Math.floor(n / 2); i++) {
    let minIdx = i;
    let maxIdx = i;
    
    for (let j = i; j < n - i; j++) {
      steps.push({ type: 'compare', indices: [j, minIdx, maxIdx], arr: arr.slice() });
      if (arr[j].value < arr[minIdx].value) minIdx = j;
      if (arr[j].value > arr[maxIdx].value) maxIdx = j;
    }
    
    // Swap min to front
    if (minIdx !== i) {
      [arr[i], arr[minIdx]] = [arr[minIdx], arr[i]];
      steps.push({ type: 'swap', indices: [i, minIdx], arr: arr.slice() });
      if (maxIdx === i) maxIdx = minIdx;
    }
    
    // Swap max to back
    if (maxIdx !== n - i - 1) {
      [arr[n - i - 1], arr[maxIdx]] = [arr[maxIdx], arr[n - i - 1]];
      steps.push({ type: 'swap', indices: [n - i - 1, maxIdx], arr: arr.slice() });
    }
    
    steps.push({ type: 'sorted', indices: [i, n - i - 1], arr: arr.slice() });
  }
  
  return steps;
}

// --- Odd-Even Merge Sort ---
function oddEvenMergeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  // Odd-Even Merge Sort only works on power of 2 sized arrays
  const isPowerOf2 = n > 0 && (n & (n - 1)) === 0;
  if (!isPowerOf2) {
    alert('Odd-Even Merge Sort requires array size to be a power of 2 (e.g., 16, 32, 64, 128, 256)');
    return steps;
  }
  
  function compare(i, j) {
    if (i < n && j < n) {
      steps.push({ type: 'compare', indices: [i, j], arr: arr.slice() });
      if (arr[i].value > arr[j].value) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
      }
    }
  }
  
  function oddEvenMerge(start, length, gap) {
    const step = 2 * gap;
    if (step < length) {
      // Recursively merge odd and even parts
      oddEvenMerge(start, length, step);
      oddEvenMerge(start + gap, length, step);
      // Compare and swap pairs
      for (let i = start + gap; i + gap < start + length; i += step) {
        compare(i, i + gap);
      }
    } else {
      // Base case: just compare the two elements
      if (start + gap < n) {
        compare(start, start + gap);
      }
    }
  }
  
  function oddEvenMergeSort(start, length) {
    if (length > 1) {
      const mid = Math.floor(length / 2);
      // Sort first half
      oddEvenMergeSort(start, mid);
      // Sort second half
      oddEvenMergeSort(start + mid, length - mid);
      // Merge both halves
      oddEvenMerge(start, length, 1);
    }
  }
  
  oddEvenMergeSort(0, n);
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- American Flag Sort (simplified for integers) ---
function americanFlagSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  if (n === 0) return steps;
  
  const max = Math.max(...arr.map(a => a.value));
  const numDigits = max.toString().length;
  
  function sort(offset, length, digit) {
    if (length <= 1 || digit < 0) return;
    
    const count = new Array(10).fill(0);
    const start = offset;
    
    // Count occurrences
    for (let i = start; i < start + length; i++) {
      const d = Math.floor(arr[i].value / Math.pow(10, digit)) % 10;
      count[d]++;
      steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
    }
    
    // Calculate positions
    const pos = new Array(10);
    pos[0] = start;
    for (let i = 1; i < 10; i++) {
      pos[i] = pos[i - 1] + count[i - 1];
    }
    
    // In-place distribution (simplified - not fully in-place)
    const temp = arr.slice(start, start + length);
    const used = new Array(10).fill(0);
    
    for (let item of temp) {
      const d = Math.floor(item.value / Math.pow(10, digit)) % 10;
      arr[pos[d] + used[d]] = item;
      used[d]++;
    }
    
    // Show the complete redistribution result
    const affectedIndices = [];
    for (let i = start; i < start + length; i++) {
      affectedIndices.push(i);
    }
    if (affectedIndices.length > 0) {
      steps.push({ type: 'overwrite', indices: affectedIndices, arr: arr.slice() });
    }
    
    // Recurse on each bucket
    for (let i = 0; i < 10; i++) {
      if (count[i] > 1) {
        sort(pos[i], count[i], digit - 1);
      }
    }
  }
  
  sort(0, n, numDigits - 1);
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Flash Sort ---
function flashSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  if (n <= 1) return steps;
  
  const m = Math.max(10, Math.floor(n * 0.43));
  const values = arr.map(a => a.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  
  if (minVal === maxVal) {
    for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
    return steps;
  }
  
  const l = new Array(m).fill(0);
  
  // Classification
  const c1 = (m - 1) / (maxVal - minVal);
  for (let i = 0; i < n; i++) {
    const k = Math.floor(c1 * (arr[i].value - minVal));
    l[k]++;
    steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
  }
  
  for (let i = 1; i < m; i++) {
    l[i] += l[i - 1];
  }
  
  // Permutation
  let move = 0;
  let j = 0;
  let k = m - 1;
  
  while (move < n - 1) {
    while (j > l[k] - 1) {
      j++;
      k = Math.floor(c1 * (arr[j].value - minVal));
    }
    let flash = arr[j];
    while (j !== l[k]) {
      k = Math.floor(c1 * (flash.value - minVal));
      const hold = arr[l[k] - 1];
      arr[l[k] - 1] = flash;
      steps.push({ type: 'swap', indices: [j, l[k] - 1], arr: arr.slice() });
      flash = hold;
      l[k]--;
      move++;
    }
  }
  
  // Insertion sort
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j].value > key.value) {
      arr[j + 1] = arr[j];
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
      j--;
    }
    arr[j + 1] = key;
    steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Patience Sort ---
function patienceSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const piles = [];
  
  // Build piles
  for (let i = 0; i < arr.length; i++) {
    const card = arr[i];
    let placed = false;
    
    for (let j = 0; j < piles.length; j++) {
      steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
      if (card.value <= piles[j][piles[j].length - 1].value) {
        piles[j].push(card);
        placed = true;
        break;
      }
    }
    
    if (!placed) {
      piles.push([card]);
    }
  }
  
  // Merge piles (k-way merge using min heap concept)
  let writePos = 0;
  while (piles.some(p => p.length > 0)) {
    let minIdx = -1;
    let minVal = Infinity;
    
    for (let i = 0; i < piles.length; i++) {
      if (piles[i].length > 0 && piles[i][piles[i].length - 1].value < minVal) {
        minVal = piles[i][piles[i].length - 1].value;
        minIdx = i;
      }
    }
    
    if (minIdx !== -1) {
      arr[writePos] = piles[minIdx].pop();
      steps.push({ type: 'overwrite', indices: [writePos], arr: arr.slice() });
      writePos++;
    }
  }
  
  for (let i = 0; i < arr.length; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Adaptive Merge Sort ---
function adaptiveMergeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  // Find natural runs
  const runs = [];
  let i = 0;
  while (i < n) {
    let runStart = i;
    i++;
    if (i < n) {
      if (arr[i - 1].value <= arr[i].value) {
        while (i < n && arr[i - 1].value <= arr[i].value) {
          steps.push({ type: 'compare', indices: [i - 1, i], arr: arr.slice() });
          i++;
        }
      } else {
        while (i < n && arr[i - 1].value > arr[i].value) {
          steps.push({ type: 'compare', indices: [i - 1, i], arr: arr.slice() });
          i++;
        }
        // Reverse descending run
        arr.splice(runStart, i - runStart, ...arr.slice(runStart, i).reverse());
        steps.push({ type: 'overwrite', indices: [runStart], arr: arr.slice() });
      }
    }
    runs.push([runStart, i - 1]);
  }
  
  // Merge runs
  function merge(l, m, r) {
    const left = arr.slice(l, m + 1);
    const right = arr.slice(m + 1, r + 1);
    let i = 0, j = 0, k = l;
    
    while (i < left.length && j < right.length) {
      steps.push({ type: 'compare', indices: [l + i, m + 1 + j], arr: arr.slice() });
      if (left[i].value <= right[j].value) {
        arr[k++] = left[i++];
      } else {
        arr[k++] = right[j++];
      }
      steps.push({ type: 'overwrite', indices: [k - 1], arr: arr.slice() });
    }
    
    while (i < left.length) {
      arr[k++] = left[i++];
      steps.push({ type: 'overwrite', indices: [k - 1], arr: arr.slice() });
    }
    while (j < right.length) {
      arr[k++] = right[j++];
      steps.push({ type: 'overwrite', indices: [k - 1], arr: arr.slice() });
    }
  }
  
  while (runs.length > 1) {
    const newRuns = [];
    for (let i = 0; i < runs.length; i += 2) {
      if (i + 1 < runs.length) {
        merge(runs[i][0], runs[i][1], runs[i + 1][1]);
        newRuns.push([runs[i][0], runs[i + 1][1]]);
      } else {
        newRuns.push(runs[i]);
      }
    }
    runs.length = 0;
    runs.push(...newRuns);
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Pairwise Sorting Network ---
function pairwiseSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  // Pairwise Sorting Network works best on power of 2 sized arrays
  const isPowerOf2 = n > 0 && (n & (n - 1)) === 0;
  if (!isPowerOf2) {
    alert('Pairwise Sorting Network requires array size to be a power of 2 (e.g., 16, 32, 64, 128, 256)');
    return steps;
  }
  
  function compareSwap(i, j) {
    if (i >= 0 && j >= 0 && i < n && j < n && i !== j) {
      steps.push({ type: 'compare', indices: [i, j], arr: arr.slice() });
      if (arr[i].value > arr[j].value) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
        steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
      }
    }
  }
  
  // Batcher's bitonic sort (used for pairwise network)
  function bitonicMerge(low, cnt, dir) {
    if (cnt > 1) {
      const k = Math.floor(cnt / 2);
      for (let i = low; i < low + k && i + k < n; i++) {
        if ((dir && arr[i].value > arr[i + k].value) || (!dir && arr[i].value < arr[i + k].value)) {
          [arr[i], arr[i + k]] = [arr[i + k], arr[i]];
          steps.push({ type: 'swap', indices: [i, i + k], arr: arr.slice() });
        } else {
          steps.push({ type: 'compare', indices: [i, i + k], arr: arr.slice() });
        }
      }
      bitonicMerge(low, k, dir);
      if (low + k < n) {
        bitonicMerge(low + k, Math.min(k, n - low - k), dir);
      }
    }
  }
  
  function bitonicSort(low, cnt, dir) {
    if (cnt > 1) {
      const k = Math.floor(cnt / 2);
      bitonicSort(low, k, true);
      if (low + k < n) {
        bitonicSort(low + k, Math.min(k, n - low - k), false);
      }
      bitonicMerge(low, cnt, dir);
    }
  }
  
  bitonicSort(0, n, true);
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Stupid Sort ---
function stupidSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  function isSorted() {
    for (let i = 0; i < n - 1; i++) {
      if (arr[i].value > arr[i + 1].value) return false;
    }
    return true;
  }
  
  // Stupid sort: try random permutations until we find the sorted one
  const maxAttempts = n <= 8 ? 40320 : (n <= 10 ? 3628800 : 1000); // Factorial limits
  
  let attempts = 0;
  while (!isSorted() && attempts < maxAttempts) {
    // Fisher-Yates shuffle to generate a random permutation
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      if (i !== j) {
        [arr[i], arr[j]] = [arr[j], arr[i]];
      }
    }
    
    // Show this permutation
    const allIndices = Array.from({length: n}, (_, i) => i);
    steps.push({ type: 'overwrite', indices: allIndices, arr: arr.slice() });
    
    attempts++;
  }
  
  // If we didn't find it randomly, do one final sort to guarantee completion
  if (!isSorted()) {
    // Simple bubble pass to finish
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        if (arr[j].value > arr[j + 1].value) {
          [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
          steps.push({ type: 'swap', indices: [j, j + 1], arr: arr.slice() });
        }
      }
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Spreadsort (simplified hybrid) ---
function spreadsortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  if (n < 16) {
    // Use insertion for small arrays
    for (let i = 1; i < n; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= 0 && arr[j].value > key.value) {
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  } else {
    // Radix-based bucketing
    const max = Math.max(...arr.map(a => a.value));
    const numBuckets = Math.min(256, n);
    const buckets = Array.from({length: numBuckets}, () => []);
    
    for (let i = 0; i < n; i++) {
      const bucket = Math.floor((arr[i].value / (max + 1)) * numBuckets);
      buckets[bucket].push(arr[i]);
      steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
    }
    
    let pos = 0;
    for (let bucket of buckets) {
      // Sort each bucket with insertion
      for (let i = 1; i < bucket.length; i++) {
        const key = bucket[i];
        let j = i - 1;
        while (j >= 0 && bucket[j].value > key.value) {
          bucket[j + 1] = bucket[j];
          j--;
        }
        bucket[j + 1] = key;
      }
      
      // Write bucket back to array
      const bucketIndices = [];
      for (let item of bucket) {
        arr[pos] = item;
        bucketIndices.push(pos);
        pos++;
      }
      
      // Show complete bucket placement
      if (bucketIndices.length > 0) {
        steps.push({ type: 'overwrite', indices: bucketIndices, arr: arr.slice() });
      }
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Franceschini's In-Place Merge (simplified) ---
function franceschiniSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  function insertionSort(l, r) {
    for (let i = l + 1; i <= r; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= l && arr[j].value > key.value) {
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  }
  
  function inPlaceMerge(l, m, r) {
    let start2 = m + 1;
    
    if (arr[m].value <= arr[start2].value) return;
    
    while (l <= m && start2 <= r) {
      if (arr[l].value <= arr[start2].value) {
        l++;
      } else {
        const value = arr[start2];
        let index = start2;
        
        while (index !== l) {
          arr[index] = arr[index - 1];
          steps.push({ type: 'overwrite', indices: [index], arr: arr.slice() });
          index--;
        }
        arr[l] = value;
        steps.push({ type: 'overwrite', indices: [l], arr: arr.slice() });
        
        l++;
        m++;
        start2++;
      }
    }
  }
  
  function mergeSort(l, r) {
    if (l < r) {
      const m = l + Math.floor((r - l) / 2);
      mergeSort(l, m);
      mergeSort(m + 1, r);
      inPlaceMerge(l, m, r);
    }
  }
  
  mergeSort(0, n - 1);
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Proxmap Sort ---
function proxmapSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  if (n === 0) return steps;
  
  const values = arr.map(a => a.value);
  const minVal = Math.min(...values);
  const maxVal = Math.max(...values);
  const range = maxVal - minVal + 1;
  
  // Create proxy map
  const map = new Array(n);
  for (let i = 0; i < n; i++) {
    map[i] = Math.floor(((arr[i].value - minVal) / range) * (n - 1));
    steps.push({ type: 'compare', indices: [i], arr: arr.slice() });
  }
  
  // Sort based on proxy map (simplified - use positions)
  const temp = arr.slice();
  const placed = new Array(n).fill(false);
  const allIndices = [];
  
  for (let i = 0; i < n; i++) {
    let pos = map[i];
    while (placed[pos]) pos = (pos + 1) % n;
    arr[pos] = temp[i];
    placed[pos] = true;
    allIndices.push(pos);
  }
  
  // Show complete redistribution result
  if (allIndices.length > 0) {
    steps.push({ type: 'overwrite', indices: allIndices, arr: arr.slice() });
  }
  
  // Final insertion sort pass
  for (let i = 1; i < n; i++) {
    const key = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j].value > key.value) {
      arr[j + 1] = arr[j];
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
      j--;
    }
    arr[j + 1] = key;
    steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Tournament Sort ---
function tournamentSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  const tree = new Array(2 * n - 1).fill(null);
  const result = [];
  
  // Build initial tournament tree
  for (let i = 0; i < n; i++) {
    tree[n - 1 + i] = i;
  }
  
  for (let i = n - 2; i >= 0; i--) {
    const left = tree[2 * i + 1];
    const right = tree[2 * i + 2];
    if (left !== null && right !== null) {
      steps.push({ type: 'compare', indices: [left, right], arr: arr.slice() });
      tree[i] = arr[left].value <= arr[right].value ? left : right;
    } else {
      tree[i] = left !== null ? left : right;
    }
  }
  
  // Extract winners
  for (let round = 0; round < n; round++) {
    const winner = tree[0];
    if (winner === null) break;
    
    result.push(arr[winner]);
    steps.push({ type: 'overwrite', indices: [round], arr: result.slice() });
    
    // Mark as used (set to infinity-like value)
    arr[winner] = { ...arr[winner], value: Infinity };
    
    // Rebuild path to root
    let idx = n - 1 + winner;
    while (idx > 0) {
      const parent = Math.floor((idx - 1) / 2);
      const sibling = idx % 2 === 1 ? idx + 1 : idx - 1;
      
      if (sibling < tree.length && tree[sibling] !== null) {
        const leftIdx = tree[idx];
        const rightIdx = tree[sibling];
        tree[parent] = arr[leftIdx].value <= arr[rightIdx].value ? leftIdx : rightIdx;
      } else {
        tree[parent] = tree[idx];
      }
      idx = parent;
    }
  }
  
  for (let i = 0; i < n; i++) {
    arr[i] = result[i];
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Dual-Pivot Quicksort ---
function dualPivotQuicksortSteps(array) {
  const steps = [];
  const arr = array.slice();
  
  function dualPivotSort(left, right) {
    if (right - left < 1) return;
    
    // Choose pivots
    if (arr[left].value > arr[right].value) {
      [arr[left], arr[right]] = [arr[right], arr[left]];
      steps.push({ type: 'swap', indices: [left, right], arr: arr.slice() });
    }
    
    const pivot1 = arr[left].value;
    const pivot2 = arr[right].value;
    
    steps.push({ type: 'pivot', indices: [left, right], arr: arr.slice() });
    
    let i = left + 1;
    let lt = left + 1;
    let gt = right - 1;
    
    while (i <= gt) {
      if (arr[i].value < pivot1) {
        [arr[i], arr[lt]] = [arr[lt], arr[i]];
        steps.push({ type: 'swap', indices: [i, lt], arr: arr.slice() });
        lt++;
        i++;
      } else if (arr[i].value >= pivot2) {
        while (arr[gt].value > pivot2 && i < gt) {
          gt--;
        }
        [arr[i], arr[gt]] = [arr[gt], arr[i]];
        steps.push({ type: 'swap', indices: [i, gt], arr: arr.slice() });
        gt--;
        if (arr[i].value < pivot1) {
          [arr[i], arr[lt]] = [arr[lt], arr[i]];
          steps.push({ type: 'swap', indices: [i, lt], arr: arr.slice() });
          lt++;
        }
        i++;
      } else {
        i++;
      }
    }
    
    lt--;
    gt++;
    
    [arr[left], arr[lt]] = [arr[lt], arr[left]];
    steps.push({ type: 'swap', indices: [left, lt], arr: arr.slice() });
    [arr[right], arr[gt]] = [arr[gt], arr[right]];
    steps.push({ type: 'swap', indices: [right, gt], arr: arr.slice() });
    
    dualPivotSort(left, lt - 1);
    dualPivotSort(lt + 1, gt - 1);
    dualPivotSort(gt + 1, right);
  }
  
  dualPivotSort(0, arr.length - 1);
  for (let i = 0; i < arr.length; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- PDQ Sort (Pattern-Defeating Quicksort - simplified) ---
function pdqSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  
  function insertionSort(left, right) {
    for (let i = left + 1; i <= right; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= left && arr[j].value > key.value) {
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  }
  
  function heapsort(left, right) {
    function heapify(n, i, offset) {
      let largest = i;
      const l = 2 * i + 1;
      const r = 2 * i + 2;
      
      if (l < n && arr[offset + l].value > arr[offset + largest].value) largest = l;
      if (r < n && arr[offset + r].value > arr[offset + largest].value) largest = r;
      
      if (largest !== i) {
        [arr[offset + i], arr[offset + largest]] = [arr[offset + largest], arr[offset + i]];
        steps.push({ type: 'swap', indices: [offset + i, offset + largest], arr: arr.slice() });
        heapify(n, largest, offset);
      }
    }
    
    const n = right - left + 1;
    for (let i = Math.floor(n / 2) - 1; i >= 0; i--) heapify(n, i, left);
    for (let i = n - 1; i > 0; i--) {
      [arr[left], arr[left + i]] = [arr[left + i], arr[left]];
      steps.push({ type: 'swap', indices: [left, left + i], arr: arr.slice() });
      heapify(i, 0, left);
    }
  }
  
  function partition(left, right) {
    const pivotIdx = left + Math.floor((right - left) / 2);
    const pivot = arr[pivotIdx].value;
    [arr[pivotIdx], arr[right]] = [arr[right], arr[pivotIdx]];
    steps.push({ type: 'swap', indices: [pivotIdx, right], arr: arr.slice() });
    
    let i = left;
    for (let j = left; j < right; j++) {
      steps.push({ type: 'compare', indices: [j, right], arr: arr.slice() });
      if (arr[j].value < pivot) {
        if (i !== j) {
          [arr[i], arr[j]] = [arr[j], arr[i]];
          steps.push({ type: 'swap', indices: [i, j], arr: arr.slice() });
        }
        i++;
      }
    }
    [arr[i], arr[right]] = [arr[right], arr[i]];
    steps.push({ type: 'swap', indices: [i, right], arr: arr.slice() });
    return i;
  }
  
  function pdq(left, right, badAllowed) {
    const size = right - left + 1;
    
    if (size < 16) {
      insertionSort(left, right);
      return;
    }
    
    if (badAllowed === 0) {
      heapsort(left, right);
      return;
    }
    
    const p = partition(left, right);
    pdq(left, p - 1, badAllowed - 1);
    pdq(p + 1, right, badAllowed - 1);
  }
  
  const maxBad = Math.floor(Math.log2(arr.length));
  pdq(0, arr.length - 1, maxBad);
  
  for (let i = 0; i < arr.length; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// --- Block Merge Sort (Grail Sort - simplified) ---
function blockMergeSortSteps(array) {
  const steps = [];
  const arr = array.slice();
  const n = arr.length;
  
  function insertionSort(l, r) {
    for (let i = l + 1; i <= r; i++) {
      const key = arr[i];
      let j = i - 1;
      while (j >= l && arr[j].value > key.value) {
        arr[j + 1] = arr[j];
        steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
        j--;
      }
      arr[j + 1] = key;
      steps.push({ type: 'overwrite', indices: [j + 1], arr: arr.slice() });
    }
  }
  
  function rotate(l, m, r) {
    // Reverse-based rotation
    function reverse(start, end) {
      while (start < end) {
        [arr[start], arr[end]] = [arr[end], arr[start]];
        steps.push({ type: 'swap', indices: [start, end], arr: arr.slice() });
        start++;
        end--;
      }
    }
    
    reverse(l, m);
    reverse(m + 1, r);
    reverse(l, r);
  }
  
  function blockMerge(l, m, r) {
    const blockSize = Math.floor(Math.sqrt(r - l + 1));
    
    if (blockSize <= 1) {
      // Fall back to simple merge
      let i = l, j = m + 1;
      while (i < j && j <= r) {
        if (arr[i].value <= arr[j].value) {
          i++;
        } else {
          const temp = arr[j];
          for (let k = j; k > i; k--) {
            arr[k] = arr[k - 1];
            steps.push({ type: 'overwrite', indices: [k], arr: arr.slice() });
          }
          arr[i] = temp;
          steps.push({ type: 'overwrite', indices: [i], arr: arr.slice() });
          i++;
          j++;
        }
      }
      return;
    }
    
    // Simplified block merge (not full grail)
    let left = l, right = m + 1;
    while (left < right && right <= r) {
      if (arr[left].value <= arr[right].value) {
        left++;
      } else {
        const value = arr[right];
        let index = right;
        while (index !== left) {
          arr[index] = arr[index - 1];
          steps.push({ type: 'overwrite', indices: [index], arr: arr.slice() });
          index--;
        }
        arr[left] = value;
        steps.push({ type: 'overwrite', indices: [left], arr: arr.slice() });
        left++;
        right++;
      }
    }
  }
  
  const blockSize = 16;
  for (let i = 0; i < n; i += blockSize) {
    insertionSort(i, Math.min(i + blockSize - 1, n - 1));
  }
  
  for (let size = blockSize; size < n; size *= 2) {
    for (let l = 0; l < n; l += size * 2) {
      const m = l + size - 1;
      const r = Math.min(l + size * 2 - 1, n - 1);
      if (m < r) blockMerge(l, m, r);
    }
  }
  
  for (let i = 0; i < n; i++) steps.push({ type: 'sorted', indices: [i], arr: arr.slice() });
  return steps;
}

// Algorithm-specific defaults (size, speed in ms)
const ALGORITHM_DEFAULTS = {
  bubble: { size: 50, speed: 5 },
  selection: { size: 50, speed: 5 },
  insertion: { size: 50, speed: 5 },
  merge: { size: 200, speed: 1 },
  quick: { size: 200, speed: 1 },
  heap: { size: 100, speed: 5 },
  shell: { size: 100, speed: 3 },
  cocktail: { size: 75, speed: 1 },
  comb: { size: 80, speed: 5 },
  gnome: { size: 50, speed: 5 },
  cycle: { size: 50, speed: 10 },
  radix: { size: 200, speed: 10 },
  counting: { size: 150, speed: 5 },
  bucket: { size: 100, speed: 10 },
  pigeonhole: { size: 100, speed: 10 },
  flash: { size: 100, speed: 10 },
  bitonic: { size: 64, speed: 5 },
  oddeven: { size: 80, speed: 2 },
  pairwise: { size: 64, speed: 10 },
  bogo: { size: 10, speed: 1 },
  stooge: { size: 30, speed: 1 },
  stupid: { size: 15, speed: 1 },
  pancake: { size: 50, speed: 10 },
  timsort: { size: 150, speed: 1 },
  intro: { size: 150, speed: 5 },
  pdq: { size: 150, speed: 5 },
  dualpivot: { size: 250, speed: 2 },
  tree: { size: 80, speed: 15 },
  tournament: { size: 80, speed: 15 },
  strand: { size: 50, speed: 10 },
  library: { size: 120, speed: 5 },
  patience: { size: 60, speed: 20 },
  minmaxselection: { size: 50, speed: 10 },
  oddmerge: { size: 128, speed: 15 },
  gravity: { size: 40, speed: 25 },
  stalin: { size: 100, speed: 20 },
  americanflag: { size: 100, speed: 10 },
  proxmap: { size: 150, speed: 10 },
  block: { size: 80, speed: 10 },
  blockmerge: { size: 80, speed: 5 },
  franceschini: { size: 60, speed: 10 },
  adaptivemerge: { size: 100, speed: 5 },
  smooth: { size: 100, speed: 5 },
  spreadsort: { size: 150, speed: 5 }
};

export default function App() {
  const [array, setArray] = useState([]);
  const [speed, setSpeed] = useState(50);
  const [size, setSize] = useState(50);
  const [isSorting, setIsSorting] = useState(false);
  const [currentIndices, setCurrentIndices] = useState([]);
  const [currentStepType, setCurrentStepType] = useState(null);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [animateSwap, setAnimateSwap] = useState(false);
  const [showHome, setShowHome] = useState(true);
  // Audio context for playing tones
  const audioRef = useRef(null);
  // Hold the active sorting interval so we can stop it from other UI (Stop button)
  const intervalRef = useRef(null);

  // Generate random array
  function generateArray() {
    if (isSorting) return;
    const arr = buildShuffledArray();
    setArray(arr);
    setCurrentIndices([]);
    return arr;
  }

  // Build a linearly spaced shuffled array (returns the array but does not set state)
  function buildShuffledArray() {
    const minVal = 5;
    const maxVal = 105;
    const step = (maxVal - minVal) / Math.max(1, size - 1);
    const linear = Array.from({ length: size }, (_, i) => ({ id: i, value: Math.round(minVal + i * step) }));
    for (let i = linear.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [linear[i], linear[j]] = [linear[j], linear[i]];
    }
    return linear.map((it, idx) => ({ id: idx, value: it.value }));
  }

  useEffect(() => {
    generateArray();
  }, [size]);

  // Apply algorithm-specific defaults and clear visualization state when algorithm changes
  useEffect(() => {
    if (!isSorting) {
      setCurrentIndices([]);
      setCurrentStepType(null);
      
      // Apply algorithm-specific defaults
      const defaults = ALGORITHM_DEFAULTS[algorithm];
      if (defaults) {
        setSize(defaults.size);
        setSpeed(defaults.speed);
      }
      
      // Ensure power of 2 for network sorts
      if ((algorithm === 'bitonic' || algorithm === 'oddevenmerge' || algorithm === 'pairwise') && !isSorting) {
        const isPowerOf2 = size > 0 && (size & (size - 1)) === 0;
        if (!isPowerOf2) {
          // Find nearest power of 2
          const powers = [16, 32, 64, 128, 256];
          const nearest = powers.reduce((prev, curr) => 
            Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
          );
          setSize(nearest);
        }
      }
    }
  }, [algorithm]);

  // Visualize sorting process
  function visualizeSorting(explicitArray) {
    // Defensive: sometimes an event is passed (onClick passes SyntheticEvent). If so, ignore it.
    const sourceArray = Array.isArray(explicitArray) ? explicitArray : array;

    // If the array is already sorted, regenerate a randomized array and auto-start on it
    function isSorted(arr) {
      for (let i = 0; i < arr.length - 1; i++) {
        if (arr[i].value > arr[i + 1].value) return false;
      }
      return true;
    }

    if (sourceArray.length > 1 && isSorted(sourceArray)) {
      const newArr = buildShuffledArray();
      setArray(newArr);
      // start sorting using the freshly generated array
      visualizeSorting(newArr);
      return;
    }
    let steps = [];
    switch (algorithm) {
      case 'selection':
        steps = selectionSortSteps(sourceArray);
        break;
      case 'merge':
        steps = mergeSortSteps(sourceArray);
        break;
      case 'quick':
        steps = quickSortSteps(sourceArray);
        break;
      case 'insertion':
        steps = insertionSortSteps(sourceArray);
        break;
      case 'heap':
        steps = heapSortSteps(sourceArray);
        break;
      case 'shell':
        steps = shellSortSteps(sourceArray);
        break;
      case 'counting':
        steps = countingSortSteps(sourceArray);
        break;
      case 'radix':
        steps = radixSortSteps(sourceArray);
        break;
      case 'bucket':
        steps = bucketSortSteps(sourceArray);
        break;
      case 'cocktail':
        steps = cocktailShakerSteps(sourceArray);
        break;
      case 'comb':
        steps = combSortSteps(sourceArray);
        break;
      case 'gnome':
        steps = gnomeSortSteps(sourceArray);
        break;
      case 'cycle':
        steps = cycleSortSteps(sourceArray);
        break;
      case 'pancake':
        steps = pancakeSortSteps(sourceArray);
        break;
      case 'bitonic':
        steps = bitonicSortSteps(sourceArray);
        break;
      case 'timsort':
        steps = timsortSteps(sourceArray);
        break;
      case 'bogo':
        steps = bogoSortSteps(sourceArray);
        break;
      case 'stooge':
        steps = stoogeSortSteps(sourceArray);
        break;
      case 'oddeven':
        steps = oddEvenSortSteps(sourceArray);
        break;
      case 'stalin':
        steps = stalinSortSteps(sourceArray);
        break;
      case 'intro':
        steps = introSortSteps(sourceArray);
        break;
      case 'block':
        steps = blockSortSteps(sourceArray);
        break;
      case 'smooth':
        steps = smoothsortSteps(sourceArray);
        break;
      case 'strand':
        steps = strandSortSteps(sourceArray);
        break;
      case 'library':
        steps = librarySortSteps(sourceArray);
        break;
      case 'tree':
        steps = treeSortSteps(sourceArray);
        break;
      case 'gravity':
        steps = gravitySortSteps(sourceArray);
        break;
      case 'pigeonhole':
        steps = pigeonholeSortSteps(sourceArray);
        break;
      case 'minmaxselection':
        steps = minMaxSelectionSortSteps(sourceArray);
        break;
      case 'oddevenmerge':
        steps = oddEvenMergeSortSteps(sourceArray);
        break;
      case 'americanflag':
        steps = americanFlagSortSteps(sourceArray);
        break;
      case 'flash':
        steps = flashSortSteps(sourceArray);
        break;
      case 'patience':
        steps = patienceSortSteps(sourceArray);
        break;
      case 'adaptivemerge':
        steps = adaptiveMergeSortSteps(sourceArray);
        break;
      case 'pairwise':
        steps = pairwiseSortSteps(sourceArray);
        break;
      case 'stupid':
        steps = stupidSortSteps(sourceArray);
        break;
      case 'spreadsort':
        steps = spreadsortSteps(sourceArray);
        break;
      case 'franceschini':
        steps = franceschiniSortSteps(sourceArray);
        break;
      case 'proxmap':
        steps = proxmapSortSteps(sourceArray);
        break;
      case 'tournament':
        steps = tournamentSortSteps(sourceArray);
        break;
      case 'dualpivot':
        steps = dualPivotQuicksortSteps(sourceArray);
        break;
      case 'pdq':
        steps = pdqSortSteps(sourceArray);
        break;
      case 'blockmerge':
        steps = blockMergeSortSteps(sourceArray);
        break;
      default:
        steps = bubbleSortSteps(sourceArray);
    }
    let i = 0;
    setIsSorting(true);
    // ensure any existing interval is cleared first
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    intervalRef.current = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsSorting(false);
        setCurrentIndices([]);
        setCurrentStepType(null);
        return;
      }
  setArray(steps[i].arr);
  setCurrentIndices(steps[i].indices || []);
  setCurrentStepType(steps[i].type || null);
      // Play tone(s) for current indices
      try {
        if (!audioRef.current) {
          audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioRef.current;
        const indices = steps[i].indices || [];
        // For simplicity play the tone of the first current index if multiple
        if (indices.length > 0) {
          const el = steps[i].arr[indices[0]] || { value: 0 };
          const val = el.value || 0;
          playTone(ctx, valueToFrequency(val), 0.12);
        }
      } catch (e) {
        // Audio may be blocked by browser until user gesture; ignore errors
        // console.warn('Audio unavailable', e);
      }
      i++;
    }, speed);
  }

  // Stop the currently running sort early
  function stopSorting() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSorting(false);
    setCurrentIndices([]);
    setCurrentStepType(null);
    // optionally suspend audio context
    try {
      if (audioRef.current && audioRef.current.state === 'running') audioRef.current.suspend();
    } catch (e) {
      // ignore
    }
  }

  // Map array value (5..105 approx) to frequency
  // Lower overall pitch range to be warmer and easier on the ears
  function valueToFrequency(value) {
    const minVal = 5;
    const maxVal = 105;
    // use a lower, musical range (A2 ~110Hz up to E5 ~660Hz)
    const minFreq = 110;
    const maxFreq = 660;
    const v = Math.min(Math.max(value, minVal), maxVal);
    const t = (v - minVal) / (maxVal - minVal);
    // small easing (sqrt) to emphasize lower-mid frequencies slightly
    const eased = Math.sqrt(t);
    return Math.round(minFreq + eased * (maxFreq - minFreq));
  }

  function playTone(ctx, freq, duration = 0.12) {
    const t = ctx.currentTime;
    // Create two gentle oscillators for a warm timbre
    const o1 = ctx.createOscillator();
    const o2 = ctx.createOscillator();
    const g1 = ctx.createGain();
    const g2 = ctx.createGain();
    const master = ctx.createGain();
    const filter = ctx.createBiquadFilter();

    // Primary is a sine, secondary is a subtle triangle an octave or fifth above
    o1.type = 'sine';
    o1.frequency.value = freq;

    o2.type = 'triangle';
    // second oscillator at a pleasant harmonic (close to octave but detuned)
    o2.frequency.value = freq * 1.98;
    o2.detune.value = 6; // slight positive detune for warmth

    // Gentle envelope parameters (slightly longer attack & release for smoothness)
    const attack = Math.min(0.02, duration * 0.3);
    const release = Math.max(0.04, duration - attack);

    // Start gains very low to avoid clicks
    g1.gain.setValueAtTime(0.0001, t);
    g2.gain.setValueAtTime(0.0001, t);
    master.gain.setValueAtTime(0.0001, t);

    // Filter to warm the tone and remove harsh high harmonics
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(Math.min(1200, freq * 2.5), t);
    filter.Q.setValueAtTime(0.8, t);

    // Envelope - ramp up to modest levels
    g1.gain.linearRampToValueAtTime(0.09, t + attack);
    g2.gain.linearRampToValueAtTime(0.035, t + attack);
    // master gain lower so overall volume stays comfortable
    master.gain.linearRampToValueAtTime(0.6, t + attack);

    // Ramp down to near-silence
    g1.gain.linearRampToValueAtTime(0.0001, t + duration);
    g2.gain.linearRampToValueAtTime(0.0001, t + duration);
    master.gain.linearRampToValueAtTime(0.0001, t + duration + 0.02);

    // Connect nodes
    o1.connect(g1);
    o2.connect(g2);
    g1.connect(master);
    g2.connect(master);
    master.connect(filter);
    filter.connect(ctx.destination);

    // Resume context if needed
    try {
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
    } catch (e) {
      // ignore
    }

    // Start and schedule stop slightly after duration to allow release to finish
    o1.start(t);
    o2.start(t);
    o1.stop(t + duration + 0.05);
    o2.stop(t + duration + 0.05);
  }

  // Algorithm descriptions and complexities (used in the render)
  const ALGO_INFO = {
    bubble: {
      complexity: 'O(n^2) average/worst, O(n) best. Stable.',
      steps: [
        'Compare each pair of adjacent elements.',
        'Swap pairs that are out of order.',
        'Repeat passes; largest elements move to the end each pass.',
        'Stop when a full pass has no swaps.'
      ]
    },
    selection: {
      complexity: 'O(n^2) all cases. Not stable.',
      steps: [
        'Scan unsorted portion to find the minimum.',
        'Swap the minimum with the first unsorted element.',
        'Move the sorted boundary right by one.',
        'Repeat until array is sorted.'
      ]
    },
    merge: {
      complexity: 'O(n log n) worst/average/best. Stable.',
      steps: [
        'Recursively split the array into halves.',
        'Sort each half (recursively).',
        'Merge two sorted halves by choosing smaller head elements.',
        'Continue merging until fully rebuilt.'
      ]
    },
    quick: {
      complexity: 'O(n log n) average, O(n^2) worst. Not stable.',
      steps: [
        'Choose a pivot element.',
        'Partition elements into left (< pivot) and right (>= pivot).',
        'Recursively sort both partitions.',
        'Concatenate results: left + pivot + right.'
      ]
    },
    insertion: {
      complexity: 'O(n^2) average/worst, O(n) best. Stable.',
      steps: [
        'Take next element from unsorted portion (the key).',
        'Shift larger sorted elements to the right to make space.',
        'Insert key into the correct position.',
        'Repeat for each element.'
      ]
    },
    heap: {
      complexity: 'O(n log n) worst/average/best. Not stable.',
      steps: [
        'Build a max-heap from the array.',
        'Swap the heap root with the last element.',
        'Reduce heap size and sift-down the new root.',
        'Repeat until heap size is 1.'
      ]
    },
    shell: {
      complexity: 'Depends on gap sequence (between O(n log n) and O(n^2)). Not stable.',
      steps: [
        'Start with a large gap and compare elements that far apart.',
        'Perform insertion-like shifts for each gap.',
        'Reduce the gap and repeat.',
        'Finish with a final insertion pass (gap=1).' 
      ]
    },
    counting: {
      complexity: 'O(n + k) where k is range size. Stable.',
      steps: [
        'Count occurrences of each value into a frequency array.',
        'Compute prefix sums (positions) if needed.',
        'Place elements into output positions by count.',
        'Copy output back to original array.'
      ]
    },
    radix: {
      complexity: 'O(n * k) where k is number of digits. Stable if bucket is stable.',
      steps: [
        'Process digits from least significant to most (LSD).',
        'Group elements into buckets by current digit.',
        'Concatenate buckets to form new array for next pass.',
        'Repeat for each digit position.'
      ]
    },
    bucket: {
      complexity: 'Average O(n + k) depending on distribution. Stable if inner sorts are stable.',
      steps: [
        'Distribute elements into buckets (by range).',
        'Sort each bucket individually (e.g., insertion).',
        'Concatenate buckets back into the array.',
        'Optionally normalize ranges to improve distribution.'
      ]
    },
    cocktail: {
      complexity: 'O(n^2) average/worst. Stable.',
      steps: [
        'Perform a forward bubble pass pushing large elements to the end.',
        'If swaps occurred, perform a backward pass pushing small elements to the front.',
        'Narrow the unsorted window and repeat.',
        'Stop when a full forward+backward cycle has no swaps.'
      ]
    },
    comb: {
      complexity: 'O(n^2) worst, better than bubble practically. Not stable.',
      steps: [
        'Compare elements separated by a shrinking gap.',
        'Swap out-of-order pairs.',
        'Reduce the gap using a shrink factor and repeat.',
        'Finish with gap=1 (like bubble/insertion).' 
      ]
    },
    gnome: {
      complexity: 'O(n^2) worst. Stable.',
      steps: [
        'Compare adjacent elements and move forward if in order.',
        'If out of order, swap and step backward.',
        'Repeat walking forwards/backwards until array is sorted.',
        'It behaves like a simple insertion-sort walk.'
      ]
    },
    cycle: {
      complexity: 'O(n^2) worst. Not stable (minimizes writes).',
      steps: [
        'For each cycle start, find the correct position of the element.',
        'Rotate the cycle by placing elements into their final positions.',
        'Repeat until all cycles are resolved.',
        'Useful when write operations are expensive.'
      ]
    },
    pancake: {
      complexity: 'O(n^2) worst. Not stable.',
      steps: [
        'Find the maximum of the unsorted portion.',
        'Flip the prefix to move the max to the front.',
        'Flip the whole unsorted prefix to move max to its final position.',
        'Repeat for smaller prefixes.'
      ]
    },
    bitonic: {
      complexity: 'O(log^2 n) for parallel networks; sequential costs vary. Typically used in parallel. Not stable.',
      steps: [
        'Construct bitonic sequences (ascending then descending).',
        'Perform compare-and-swap stages to merge bitonic sequences.',
        'Recursively merge sub-sequences.',
        'Result is a fully sorted sequence when network completes.'
      ]
    },
    timsort: {
      complexity: 'O(n log n) worst, highly optimized in practice. Stable.',
      steps: [
        'Identify natural runs (increasing or decreasing subsequences).',
        'Extend short runs with insertion sort to a minimum run size.',
        'Merge runs using a stack-based strategy with invariants.',
        'Repeat merges until one run covers the whole array.'
      ]
    },
    bogo: {
      complexity: 'O((n+1)!) average, O(∞) worst. Not stable. Hilariously inefficient!',
      steps: [
        'Randomly shuffle the entire array.',
        'Check if the array is now sorted.',
        'If not sorted, repeat step 1.',
        'Eventually (maybe) the array will be sorted by chance.'
      ]
    },
    stooge: {
      complexity: 'O(n^2.7) approximately. Not stable.',
      steps: [
        'Compare and swap first and last elements if out of order.',
        'If array has 3+ elements, recursively sort first 2/3.',
        'Recursively sort last 2/3.',
        'Recursively sort first 2/3 again to ensure order.'
      ]
    },
    oddeven: {
      complexity: 'O(n^2) worst. Stable. Parallel-friendly!',
      steps: [
        'Compare and swap all odd-indexed pairs (1-2, 3-4, 5-6, etc).',
        'Compare and swap all even-indexed pairs (0-1, 2-3, 4-5, etc).',
        'Repeat alternating odd/even phases until no swaps occur.',
        'Creates a distinctive visual pattern of parallel comparisons.'
      ]
    },
    stalin: {
      complexity: 'O(n) time. Not a real sort - removes non-compliant elements!',
      steps: [
        'Scan through array from left to right.',
        'Keep elements that are >= the previous kept element.',
        'Remove (purge) any elements smaller than the last kept.',
        'Result is sorted but may have fewer elements than input!'
      ]
    },
    intro: {
      complexity: 'O(n log n) worst/average. Not stable. Used in C++ std::sort!',
      steps: [
        'Start with quicksort for most partitions.',
        'Switch to heapsort if recursion depth gets too deep (avoids O(n^2)).',
        'Use insertion sort for small subarrays (<16 elements).',
        'Combines best properties: fast average, good worst-case guarantee.'
      ]
    },
    block: {
      complexity: 'O(n log n) time, O(1) space. Stable in-place merge!',
      steps: [
        'Divide array into blocks and sort each with insertion sort.',
        'Use buffered merging to combine sorted blocks.',
        'Merge progressively larger blocks until fully sorted.',
        'In-place stable merge achieves O(n log n) without extra space.'
      ]
    },
    smooth: {
      complexity: 'O(n log n) worst, O(n) best if nearly sorted. Not stable.',
      steps: [
        'Build Leonardo heaps (Fibonacci-like structure) instead of binary heaps.',
        'Extract maximum and rebuild heaps adaptively.',
        'Takes advantage of existing order in input.',
        'Adaptive variant of heapsort with better best-case performance.'
      ]
    },
    strand: {
      complexity: 'O(n^2) worst, O(n) best if sorted. Stable.',
      steps: [
        'Extract an ascending sublist (strand) from remaining elements.',
        'Merge the strand into the growing sorted result list.',
        'Repeat extracting strands from remaining elements.',
        'Continue until all elements are merged into result.'
      ]
    },
    library: {
      complexity: 'O(n log n) expected. Stable. Like insertion with gaps!',
      steps: [
        'Allocate extra space with gaps between elements.',
        'Insert elements with space to shift into gaps.',
        'Reduces number of shifts compared to insertion sort.',
        'Compact final result by removing gaps.'
      ]
    },
    tree: {
      complexity: 'O(n log n) average, O(n^2) worst (unbalanced tree). Stable if ties go right.',
      steps: [
        'Insert each element into a binary search tree.',
        'Smaller values go left, larger values go right.',
        'Perform in-order traversal of the tree.',
        'Traversal outputs elements in sorted order.'
      ]
    },
    gravity: {
      complexity: 'O(n*max) where max is largest value. Only for positive integers!',
      steps: [
        'Represent each number as a row of beads (1s).',
        'Let gravity pull beads down through columns.',
        'Beads naturally settle with larger values at bottom.',
        'Read back sorted values from bead positions.'
      ]
    },
    pigeonhole: {
      complexity: 'O(n + range) where range is max-min. Stable.',
      steps: [
        'Create pigeonholes (buckets) for each distinct value in range.',
        'Place each element into its corresponding pigeonhole.',
        'Collect elements from pigeonholes in order.',
        'Works well when range is close to array size.'
      ]
    },
    minmaxselection: {
      complexity: 'O(n^2) all cases, but ~25% fewer comparisons. Not stable.',
      steps: [
        'Find both minimum and maximum in each pass through unsorted portion.',
        'Swap minimum to the front and maximum to the back.',
        'Shrink the unsorted region from both ends.',
        'Continue until the unsorted region is empty.'
      ]
    },
    oddevenmerge: {
      complexity: 'O(n log^2 n) comparisons. Parallel sorting network.',
      steps: [
        'Recursively split array into halves and sort them.',
        'Merge sorted halves using Batcher\'s odd-even merge network.',
        'Compare elements at specific indices determined by the network.',
        'Network structure allows parallel execution of comparisons.'
      ]
    },
    americanflag: {
      complexity: 'O(n * k) where k is number of digits. In-place MSD radix sort.',
      steps: [
        'Process digits from most significant to least significant (MSD).',
        'Count occurrences of each digit value.',
        'Partition array in-place by swapping elements to correct buckets.',
        'Recursively sort each bucket by next digit position.'
      ]
    },
    flash: {
      complexity: 'O(n) average, O(n^2) worst. Distribution sort.',
      steps: [
        'Classify elements into buckets based on value distribution.',
        'Use uniform distribution assumption for bucket assignment.',
        'Insert each element into its classified bucket position.',
        'Apply insertion sort for final cleanup within buckets.'
      ]
    },
    patience: {
      complexity: 'O(n log n) worst case. Stable. Based on patience solitaire game.',
      steps: [
        'Build piles: place each element on leftmost pile with larger top.',
        'If no suitable pile exists, create a new pile.',
        'Number of piles equals length of longest increasing subsequence.',
        'Merge all piles using k-way merge (like merge sort final step).'
      ]
    },
    adaptivemerge: {
      complexity: 'O(n) best, O(n log n) worst. Timsort-like natural runs.',
      steps: [
        'Detect natural runs (already sorted sequences) in the array.',
        'Extend short runs to minimum length using insertion sort.',
        'Merge adjacent runs in a balanced manner.',
        'Adapts to existing order, very fast on partially sorted data.'
      ]
    },
    pairwise: {
      complexity: 'O(n log^2 n) comparisons. Parallel sorting network.',
      steps: [
        'Build a pairwise sorting network with log^2 n depth.',
        'Compare and swap elements at predetermined pairs in each layer.',
        'Network structure guarantees correct sorting through fixed comparisons.',
        'Can be fully parallelized across network layers.'
      ]
    },
    stupid: {
      complexity: 'O((n+1)!) average, unbounded worst. Random shuffle approach.',
      steps: [
        'Randomly shuffle the entire array.',
        'Check if the resulting permutation is sorted.',
        'If not sorted, shuffle again and repeat.',
        'Similar to Bogo Sort; educational example of terrible efficiency.'
      ]
    },
    spreadsort: {
      complexity: 'O(n log n) average, O(n * k/s + n * log(s)) for integers.',
      steps: [
        'Hybrid of radix sort and comparison sort.',
        'Distribute elements into buckets using most significant bits.',
        'Switch to quicksort or other comparison sort for small buckets.',
        'Optimized for speed with modern CPU cache behavior.'
      ]
    },
    franceschini: {
      complexity: 'O(n log n) time, O(1) space. In-place stable merge.',
      steps: [
        'Merge sorted runs using internal buffer via block rotations.',
        'Use sqrt(n)-sized buffer to facilitate merging without extra space.',
        'Perform complex rotation operations to maintain stability.',
        'Theoretical algorithm, rarely used in practice due to complexity.'
      ]
    },
    proxmap: {
      complexity: 'O(n) average, O(n^2) worst. Hash-based distribution.',
      steps: [
        'Map each element to a hash-based approximate position (proxy).',
        'Place elements in proxmap array at calculated positions.',
        'Handle collisions by finding nearby empty slots.',
        'Extract elements from proxmap in order, apply insertion sort cleanup.'
      ]
    },
    tournament: {
      complexity: 'O(n log n) all cases. Selection-based with tournament tree.',
      steps: [
        'Build a tournament tree where each node holds minimum of its children.',
        'Root contains overall minimum; extract it to output.',
        'Replace extracted element with infinity; rebuild affected path.',
        'Repeat n times to extract all elements in sorted order.'
      ]
    },
    dualpivot: {
      complexity: 'O(n log n) average, O(n^2) worst. Used in Java Arrays.sort.',
      steps: [
        'Choose two pivots (smaller and larger) from the array.',
        'Partition array into three regions: <pivot1, between pivots, >pivot2.',
        'Recursively sort the three partitions.',
        'Performs fewer swaps than single-pivot quicksort on average.'
      ]
    },
    pdq: {
      complexity: 'O(n log n) worst case. Pattern-defeating quicksort (Rust).',
      steps: [
        'Start with quicksort using median-of-3 pivot selection.',
        'Detect bad patterns (e.g., already sorted partitions).',
        'Switch to heapsort if recursion depth exceeds limit.',
        'Use insertion sort for small partitions; highly optimized hybrid.'
      ]
    },
    blockmerge: {
      complexity: 'O(n log n) time, O(1) space. Grail sort / block merge.',
      steps: [
        'Merge sorted blocks using internal buffer blocks for stability.',
        'Collect unique keys into a small buffer at array start.',
        'Use block-wise merging with key tagging to maintain order.',
        'Complex in-place stable merge; used in production block sort algorithms.'
      ]
    }
  };

  const currentInfo = ALGO_INFO[algorithm] || ALGO_INFO.bubble;

  // Algorithm list for the homescreen grid
  const algorithmList = [
    { value: 'bubble', label: 'Bubble Sort' },
    { value: 'selection', label: 'Selection Sort' },
    { value: 'insertion', label: 'Insertion Sort' },
    { value: 'merge', label: 'Merge Sort' },
    { value: 'quick', label: 'Quick Sort' },
    { value: 'heap', label: 'Heap Sort' },
    { value: 'shell', label: 'Shell Sort' },
    { value: 'counting', label: 'Counting Sort' },
    { value: 'radix', label: 'Radix Sort' },
    { value: 'bucket', label: 'Bucket Sort' },
    { value: 'timsort', label: 'Timsort' },
    { value: 'intro', label: 'Intro Sort' },
    { value: 'pdq', label: 'PDQ Sort' },
    { value: 'dualpivot', label: 'Dual-Pivot Quicksort' },
    { value: 'cocktail', label: 'Cocktail Shaker' },
    { value: 'comb', label: 'Comb Sort' },
    { value: 'gnome', label: 'Gnome Sort' },
    { value: 'oddeven', label: 'Odd-Even Sort' },
    { value: 'cycle', label: 'Cycle Sort' },
    { value: 'pancake', label: 'Pancake Sort' },
    { value: 'stooge', label: 'Stooge Sort' },
    { value: 'bogo', label: 'Bogo Sort' },
    { value: 'stupid', label: 'Stupid Sort' },
    { value: 'stalin', label: 'Stalin Sort' },
    { value: 'bitonic', label: 'Bitonic Sort' },
    { value: 'oddevenmerge', label: 'Odd-Even Merge Sort' },
    { value: 'pairwise', label: 'Pairwise Network' },
    { value: 'smooth', label: 'Smoothsort' },
    { value: 'tree', label: 'Tree Sort' },
    { value: 'tournament', label: 'Tournament Sort' },
    { value: 'patience', label: 'Patience Sort' },
    { value: 'strand', label: 'Strand Sort' },
    { value: 'library', label: 'Library Sort' },
    { value: 'block', label: 'Block Sort' },
    { value: 'blockmerge', label: 'Block Merge Sort' },
    { value: 'adaptivemerge', label: 'Adaptive Merge Sort' },
    { value: 'franceschini', label: 'Franceschini Sort' },
    { value: 'pigeonhole', label: 'Pigeonhole Sort' },
    { value: 'gravity', label: 'Gravity Sort' },
    { value: 'flash', label: 'Flash Sort' },
    { value: 'americanflag', label: 'American Flag Sort' },
    { value: 'proxmap', label: 'Proxmap Sort' },
    { value: 'spreadsort', label: 'Spreadsort' },
    { value: 'minmaxselection', label: 'Min-Max Selection' }
  ];

  // Handle algorithm selection from homescreen
  function selectAlgorithm(algoValue) {
    setAlgorithm(algoValue);
    setShowHome(false);
  }

  // Homescreen view
  if (showHome) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl font-bold text-center mb-4">The Art of Sorting</h1>
          <h2 className="text-center mb-12">
            <a
              href="https://faigan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
            >
              By Gabriel Faigan
            </a>
          </h2>

          <div className="flex flex-col gap-2 max-w-2xl mx-auto">
            {algorithmList.map(algo => (
              <button
                key={algo.value}
                onClick={() => selectAlgorithm(algo.value)}
                className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500 px-4 py-3 flex justify-between items-center transition-all duration-200"
              >
                <span className="font-semibold text-white">{algo.label}</span>
                <span className="text-sm text-zinc-500">
                  {ALGO_INFO[algo.value]?.complexity.split('.')[0] || ''}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-black text-white p-4">
      <style>{`
        .algorithm-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .algorithm-scroll::-webkit-scrollbar-track {
          background: #09090b;
        }
        .algorithm-scroll::-webkit-scrollbar-thumb {
          background: #27272a;
        }
        .algorithm-scroll::-webkit-scrollbar-thumb:hover {
          background: #3f3f46;
        }
      `}</style>

      <button
        onClick={() => setShowHome(true)}
        disabled={isSorting}
        className={`absolute top-4 left-4 px-3 py-1 text-sm ${isSorting ? 'bg-zinc-700 text-zinc-500 pointer-events-none' : 'bg-zinc-800 hover:bg-zinc-700 text-white'}`}
      >
        &larr; Back
      </button>

      <h1 className="text-3xl font-bold mb-4">The Art of Sorting</h1>
      <h2 style={{ marginBottom: "20px" }}>
        <a
          href="https://faigan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-400 hover:text-blue-300 underline transition-colors duration-200"
        >
          By Gabriel Faigan
        </a>
      </h2>
      
      <div className="flex gap-4 mb-4 items-center">
        <button
          onClick={generateArray}
          disabled={isSorting}
          className={`px-4 py-2 ${isSorting ? 'bg-zinc-700 text-zinc-400 pointer-events-none' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
        >
          Generate New Array
        </button>
        {/* Algorithm selector moved to a left-side list next to the visualization */}
        <label className="flex items-center text-sm ml-2">
          <input type="checkbox" checked={animateSwap} onChange={(e) => setAnimateSwap(e.target.checked)} className="mr-2" />
          Animate swaps
        </label>
        <button
          onClick={() => visualizeSorting()}
          disabled={isSorting}
          className={`px-4 py-2 ${isSorting ? 'bg-zinc-700 text-zinc-400 pointer-events-none' : 'bg-green-500 hover:bg-green-600 text-white'}`}
        >
          Start
        </button>

        <button
          onClick={stopSorting}
          disabled={!isSorting}
          className={`px-4 py-2 ${!isSorting ? 'bg-zinc-800 text-zinc-500 pointer-events-none' : 'bg-red-600 hover:bg-red-700 text-white'}`}
        >
          Stop
        </button>
      </div>

      <div className="flex flex-col items-center mb-4">
        <label>Array Size: {size}</label>
        {(algorithm === 'bitonic' || algorithm === 'oddevenmerge' || algorithm === 'pairwise') ? (
          <select
            value={size}
            disabled={isSorting}
            onChange={(e) => setSize(Number(e.target.value))}
            className={`w-64 px-3 py-2 bg-zinc-900 border border-zinc-800 text-white ${isSorting ? 'opacity-60 pointer-events-none' : ''}`}
          >
            <option value={16}>16</option>
            <option value={32}>32</option>
            <option value={64}>64</option>
            <option value={128}>128</option>
            <option value={256}>256</option>
          </select>
        ) : (
          <input
            type="range"
            min="10"
            max="250"
            value={size}
            disabled={isSorting}
            onChange={(e) => setSize(Number(e.target.value))}
            className={`w-64 ${isSorting ? 'opacity-60 pointer-events-none' : ''}`}
          />
        )}
      </div>

      <div className="flex flex-col items-center mb-8">
        <label>Speed (ms): {speed}</label>
        <input
          type="range"
          min="1"
          max="30"
          value={speed}
          disabled={isSorting}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className={`w-64 ${isSorting ? 'opacity-60 pointer-events-none' : ''}`}
        />
      </div>

  {/* Main area: algorithm list + visualization (stacked on mobile, side-by-side on desktop) */}
  <div className="w-full max-w-5xl flex flex-col md:flex-row md:flex-wrap gap-4 items-start">
    <div className="w-full md:w-56 bg-zinc-900 p-2 h-64 md:h-96 flex flex-col relative order-3 md:order-1">
      <div className="text-sm text-zinc-400 font-semibold mb-2 text-center">Algorithms</div>
      <div className="flex-1 overflow-y-scroll space-y-1 pr-1 algorithm-scroll" style={{
        scrollbarWidth: 'thin',
        scrollbarColor: '#27272a #09090b'
      }}>
        {([
          { value: 'adaptivemerge', label: 'Adaptive Merge Sort' },
          { value: 'americanflag', label: 'American Flag Sort' },
          { value: 'bitonic', label: 'Bitonic Sort' },
          { value: 'block', label: 'Block Sort' },
          { value: 'blockmerge', label: 'Block Merge Sort' },
          { value: 'bogo', label: 'Bogo Sort' },
          { value: 'bubble', label: 'Bubble Sort' },
          { value: 'bucket', label: 'Bucket Sort' },
          { value: 'cocktail', label: 'Cocktail Shaker' },
          { value: 'comb', label: 'Comb Sort' },
          { value: 'counting', label: 'Counting Sort' },
          { value: 'cycle', label: 'Cycle Sort' },
          { value: 'dualpivot', label: 'Dual-Pivot Quicksort' },
          { value: 'flash', label: 'Flash Sort' },
          { value: 'franceschini', label: 'Franceschini Sort' },
          { value: 'gnome', label: 'Gnome Sort' },
          { value: 'gravity', label: 'Gravity Sort' },
          { value: 'heap', label: 'Heap Sort' },
          { value: 'insertion', label: 'Insertion Sort' },
          { value: 'intro', label: 'Intro Sort' },
          { value: 'library', label: 'Library Sort' },
          { value: 'merge', label: 'Merge Sort' },
          { value: 'minmaxselection', label: 'Min-Max Selection Sort' },
          { value: 'oddeven', label: 'Odd-Even Sort' },
          { value: 'oddevenmerge', label: 'Odd-Even Merge Sort' },
          { value: 'pairwise', label: 'Pairwise Sorting Network' },
          { value: 'pancake', label: 'Pancake Sort' },
          { value: 'patience', label: 'Patience Sort' },
          { value: 'pdq', label: 'PDQ Sort' },
          { value: 'pigeonhole', label: 'Pigeonhole Sort' },
          { value: 'proxmap', label: 'Proxmap Sort' },
          { value: 'quick', label: 'Quick Sort' },
          { value: 'radix', label: 'Radix Sort' },
          { value: 'selection', label: 'Selection Sort' },
          { value: 'shell', label: 'Shell Sort' },
          { value: 'smooth', label: 'Smoothsort' },
          { value: 'spreadsort', label: 'Spreadsort' },
          { value: 'stalin', label: 'Stalin Sort' },
          { value: 'stooge', label: 'Stooge Sort' },
          { value: 'strand', label: 'Strand Sort' },
          { value: 'stupid', label: 'Stupid Sort' },
          { value: 'timsort', label: 'Timsort (simplified)' },
          { value: 'tournament', label: 'Tournament Sort' },
          { value: 'tree', label: 'Tree Sort' }
        ]).map(opt => (
          <button
            key={opt.value}
            onClick={() => { if (!isSorting) setAlgorithm(opt.value); }}
            disabled={isSorting}
            className={`w-full text-left px-3 py-2 ${algorithm === opt.value ? (isSorting ? 'bg-zinc-700 text-zinc-400' : 'bg-green-600 text-white') : (isSorting ? 'text-zinc-600 pointer-events-none' : 'text-zinc-300 hover:bg-zinc-800')}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      {/* Scroll indicator gradient */}
      <div className="absolute bottom-2 left-2 right-2 h-8 pointer-events-none" style={{
        background: 'linear-gradient(to top, rgba(24, 24, 27, 0.95), transparent)'
      }}></div>
    </div>

    <div className="flex-1 order-1 md:order-2 w-full">
      <div className="relative h-64 md:h-96 w-full border border-zinc-800 bg-zinc-900 p-2 overflow-hidden">
        {array.map((item, idx) => {
          const barWidth = 100 / Math.max(1, array.length);
          const leftPercent = idx * barWidth;
          // Scale bar height relative to container height as a percentage
          // Use same domain as buildShuffledArray (minVal..maxVal)
          const minVal = 5;
          const maxVal = 105;
          const v = Math.min(Math.max(item.value, minVal), maxVal);
          let heightPercent = ((v - minVal) / (maxVal - minVal)) * 100;
          // Ensure the smallest bar is visible (minimum 3% of container height)
          const minHeightPercent = 0.5;
          if (heightPercent < minHeightPercent) heightPercent = minHeightPercent;

          // Normalize current indices to a safe array of numeric indexes only
          const rawCi = currentIndices || [];
          const ci = Array.isArray(rawCi) ? rawCi.filter(x => Number.isInteger(x) && x >= 0 && x < array.length) : [];

          // color logic: prefer roles (sorted, pivot, min, compare, swap, overwrite)
          let colorClass = 'bg-blue-400';

          // Sorted and pivot highlights are straightforward
          if (currentStepType === 'sorted' && ci.includes(idx)) {
            colorClass = 'bg-green-500';
          } else if (currentStepType === 'pivot' && ci.includes(idx)) {
            colorClass = 'bg-purple-500';
          } else if (currentStepType === 'swap' && ci.includes(idx)) {
            colorClass = 'bg-red-500';
          } else if (algorithm === 'selection' && ci.length > 0) {
            // selection compare may include [startIdx, minIdx, compIdx]
            if (ci.length === 3) {
              const [startIdx, minIdx, compIdx] = ci;
              if (idx === startIdx) colorClass = 'bg-teal-400';
              else if (idx === minIdx) colorClass = 'bg-yellow-400';
              else if (idx === compIdx) colorClass = 'bg-orange-400';
            } else if (ci.length === 2) {
              // fallback two-index highlights (min and compare)
              const [a, b] = ci;
              if (idx === a) colorClass = 'bg-yellow-400';
              else if (idx === b) colorClass = 'bg-orange-400';
            }
          } else if ((currentStepType === 'compare' || currentStepType === 'overwrite') && ci.includes(idx)) {
            // generic compare/overwrite highlights
            colorClass = 'bg-orange-400';
          }

          return (
            <div
              key={idx}
              style={{
                position: 'absolute',
                bottom: 0,
                left: `${leftPercent}%`,
                width: `calc(${100 / array.length}% - 1px)`,
                height: `${heightPercent}%`,
                transition: animateSwap ? 'height 0.25s ease' : 'none',
              }}
              className={`${colorClass} mx-[0.5px]`}
            />
          );
        })}
      </div>
    </div>

    <div className="w-full md:w-full text-sm text-zinc-400 px-4 order-2 md:order-3">
      <h3 className="font-semibold">How it works</h3>
      <div className="text-xs text-zinc-500 mb-2">{currentInfo.complexity}</div>
      <ol className="list-decimal ml-6">
        {currentInfo.steps.map((s, i) => <li key={i}>{s}</li>)}
      </ol>
    </div>
  </div>
</div>
  );
}
