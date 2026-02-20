import { useState, useMemo, useEffect } from 'react';
import { useAnimator } from '../../hooks/useAnimator';
import PseudocodePanel from '../shared/PseudocodePanel';
import CourseCallout from '../shared/CourseCallout';

// ============================================
// PSEUDOCODE DEFINITIONS
// ============================================

const PSEUDOCODE = {
  insert: [
    { text: 'arr.push(val)', indent: 0 },
    { text: 'i = arr.length - 1', indent: 0 },
    { text: 'while i > 0:', indent: 0 },
    { text: 'parent = (i - 1) / 2', indent: 1 },
    { text: 'if arr[parent] > arr[i]:', indent: 1 },
    { text: 'swap(arr[parent], arr[i])', indent: 2 },
    { text: 'i = parent', indent: 2 },
    { text: 'else: break', indent: 1 },
  ],
  insertMax: [
    { text: 'arr.push(val)', indent: 0 },
    { text: 'i = arr.length - 1', indent: 0 },
    { text: 'while i > 0:', indent: 0 },
    { text: 'parent = (i - 1) / 2', indent: 1 },
    { text: 'if arr[parent] < arr[i]:', indent: 1 },
    { text: 'swap(arr[parent], arr[i])', indent: 2 },
    { text: 'i = parent', indent: 2 },
    { text: 'else: break', indent: 1 },
  ],
  extract: [
    { text: 'result = arr[0]', indent: 0 },
    { text: 'arr[0] = arr[arr.length - 1]', indent: 0 },
    { text: 'arr.pop()', indent: 0 },
    { text: 'i = 0', indent: 0 },
    { text: 'while true:', indent: 0 },
    { text: 'left = 2*i+1, right = 2*i+2', indent: 1 },
    { text: 'smallest = i', indent: 1 },
    { text: 'if arr[left] < arr[smallest]: smallest = left', indent: 1 },
    { text: 'if arr[right] < arr[smallest]: smallest = right', indent: 1 },
    { text: 'if smallest == i: break', indent: 1 },
    { text: 'swap(arr[i], arr[smallest])', indent: 1 },
    { text: 'i = smallest', indent: 1 },
  ],
  extractMax: [
    { text: 'result = arr[0]', indent: 0 },
    { text: 'arr[0] = arr[arr.length - 1]', indent: 0 },
    { text: 'arr.pop()', indent: 0 },
    { text: 'i = 0', indent: 0 },
    { text: 'while true:', indent: 0 },
    { text: 'left = 2*i+1, right = 2*i+2', indent: 1 },
    { text: 'largest = i', indent: 1 },
    { text: 'if arr[left] > arr[largest]: largest = left', indent: 1 },
    { text: 'if arr[right] > arr[largest]: largest = right', indent: 1 },
    { text: 'if largest == i: break', indent: 1 },
    { text: 'swap(arr[i], arr[largest])', indent: 1 },
    { text: 'i = largest', indent: 1 },
  ],
  peek: [
    { text: 'return arr[0]', indent: 0 },
  ],
  heapify: [
    { text: 'for i = n/2-1 down to 0:', indent: 0 },
    { text: 'siftDown(i)', indent: 1 },
  ],
};

// ============================================
// HEAP HELPER FUNCTIONS
// ============================================

function parent(i) { return Math.floor((i - 1) / 2); }
function left(i) { return 2 * i + 1; }
function right(i) { return 2 * i + 2; }

// ============================================
// STEP GENERATORS
// ============================================

function insertSteps(heap, val, isMinHeap) {
  const steps = [];
  const arr = [...heap, val];
  let i = arr.length - 1;

  steps.push({
    array: [...arr],
    highlightIndices: [i],
    pseudoLine: 0,
    message: `Added ${val} at index ${i}`,
  });

  steps.push({
    array: [...arr],
    highlightIndices: [i],
    pseudoLine: 1,
    message: `Starting sift-up from index ${i}`,
  });

  while (i > 0) {
    const p = parent(i);

    steps.push({
      array: [...arr],
      highlightIndices: [i],
      compareIndices: [p, i],
      pseudoLine: 3,
      message: `parent(${i}) = ${p}`,
    });

    const shouldSwap = isMinHeap ? arr[p] > arr[i] : arr[p] < arr[i];
    const comparison = isMinHeap ? `${arr[p]} > ${arr[i]}` : `${arr[p]} < ${arr[i]}`;

    steps.push({
      array: [...arr],
      highlightIndices: [i, p],
      compareIndices: [p, i],
      pseudoLine: 4,
      message: `Comparing: ${comparison}? ${shouldSwap ? 'Yes' : 'No'}`,
    });

    if (shouldSwap) {
      [arr[p], arr[i]] = [arr[i], arr[p]];
      steps.push({
        array: [...arr],
        swapIndices: [p, i],
        pseudoLine: 5,
        message: `Swapping ${arr[i]} and ${arr[p]}`,
      });
      i = p;
      steps.push({
        array: [...arr],
        highlightIndices: [i],
        pseudoLine: 6,
        message: `Moving up to index ${i}`,
      });
    } else {
      steps.push({
        array: [...arr],
        highlightIndices: [i],
        confirmedIndex: i,
        pseudoLine: 7,
        message: `Heap property satisfied. Done!`,
      });
      break;
    }
  }

  if (i === 0) {
    steps.push({
      array: [...arr],
      highlightIndices: [0],
      confirmedIndex: 0,
      pseudoLine: 7,
      message: `Reached root. Heap property restored!`,
    });
  }

  return { steps, newHeap: arr };
}

function extractSteps(heap, isMinHeap) {
  const steps = [];

  if (heap.length === 0) {
    steps.push({
      array: [],
      pseudoLine: -1,
      message: `Heap is empty!`,
    });
    return { steps, newHeap: [], extractedValue: null };
  }

  const extractedValue = heap[0];
  let arr = [...heap];

  steps.push({
    array: [...arr],
    highlightIndices: [0],
    extractingIndex: 0,
    pseudoLine: 0,
    message: `Extracting root: ${extractedValue}`,
  });

  if (arr.length === 1) {
    steps.push({
      array: [],
      pseudoLine: 2,
      message: `Removed last element. Heap empty.`,
    });
    return { steps, newHeap: [], extractedValue };
  }

  arr[0] = arr[arr.length - 1];
  steps.push({
    array: [...arr],
    highlightIndices: [0, arr.length - 1],
    swapIndices: [0, arr.length - 1],
    pseudoLine: 1,
    message: `Moving last element (${arr[0]}) to root`,
  });

  arr = arr.slice(0, -1);
  steps.push({
    array: [...arr],
    highlightIndices: [0],
    pseudoLine: 2,
    message: `Removed last position. Starting sift-down.`,
  });

  let i = 0;
  steps.push({
    array: [...arr],
    highlightIndices: [i],
    pseudoLine: 3,
    message: `i = 0`,
  });

  while (true) {
    const l = left(i);
    const r = right(i);
    let target = i;

    steps.push({
      array: [...arr],
      highlightIndices: [i],
      pseudoLine: 5,
      message: `left = ${l}, right = ${r}`,
    });

    if (l < arr.length) {
      const compare = isMinHeap ? arr[l] < arr[target] : arr[l] > arr[target];
      steps.push({
        array: [...arr],
        compareIndices: [target, l],
        pseudoLine: isMinHeap ? 7 : 7,
        message: `Comparing with left child: arr[${l}]=${arr[l]} ${isMinHeap ? '<' : '>'} arr[${target}]=${arr[target]}? ${compare}`,
      });
      if (compare) target = l;
    }

    if (r < arr.length) {
      const compare = isMinHeap ? arr[r] < arr[target] : arr[r] > arr[target];
      steps.push({
        array: [...arr],
        compareIndices: [target, r],
        pseudoLine: isMinHeap ? 8 : 8,
        message: `Comparing with right child: arr[${r}]=${arr[r]} ${isMinHeap ? '<' : '>'} arr[${target}]=${arr[target]}? ${compare}`,
      });
      if (compare) target = r;
    }

    if (target === i) {
      steps.push({
        array: [...arr],
        highlightIndices: [i],
        confirmedIndex: i,
        pseudoLine: 9,
        message: `No swap needed. Heap property restored!`,
      });
      break;
    }

    [arr[i], arr[target]] = [arr[target], arr[i]];
    steps.push({
      array: [...arr],
      swapIndices: [i, target],
      pseudoLine: 10,
      message: `Swapping arr[${i}] and arr[${target}]`,
    });

    i = target;
    steps.push({
      array: [...arr],
      highlightIndices: [i],
      pseudoLine: 11,
      message: `Moving down to index ${i}`,
    });

    if (left(i) >= arr.length) {
      steps.push({
        array: [...arr],
        highlightIndices: [i],
        confirmedIndex: i,
        pseudoLine: 9,
        message: `Reached leaf. Heap property restored!`,
      });
      break;
    }
  }

  return { steps, newHeap: arr, extractedValue };
}

function peekSteps(heap) {
  if (heap.length === 0) {
    return [{
      array: [],
      pseudoLine: 0,
      message: `Heap is empty!`,
    }];
  }

  return [{
    array: [...heap],
    highlightIndices: [0],
    peekIndex: 0,
    pseudoLine: 0,
    message: `Peek: ${heap[0]}`,
  }];
}

function heapifySteps(inputArray, isMinHeap) {
  const steps = [];
  const arr = [...inputArray];
  const n = arr.length;

  steps.push({
    array: [...arr],
    pseudoLine: 0,
    message: `Starting heapify. Processing internal nodes from ${Math.floor(n / 2) - 1} down to 0`,
  });

  for (let start = Math.floor(n / 2) - 1; start >= 0; start--) {
    steps.push({
      array: [...arr],
      highlightIndices: [start],
      pseudoLine: 0,
      message: `Sifting down node at index ${start}`,
    });

    let i = start;
    while (true) {
      const l = left(i);
      const r = right(i);
      let target = i;

      if (l < n) {
        const compare = isMinHeap ? arr[l] < arr[target] : arr[l] > arr[target];
        if (compare) target = l;
      }

      if (r < n) {
        const compare = isMinHeap ? arr[r] < arr[target] : arr[r] > arr[target];
        if (compare) target = r;
      }

      if (target === i) {
        steps.push({
          array: [...arr],
          highlightIndices: [i],
          confirmedIndex: i,
          pseudoLine: 1,
          message: `Node ${i} is in correct position`,
        });
        break;
      }

      [arr[i], arr[target]] = [arr[target], arr[i]];
      steps.push({
        array: [...arr],
        swapIndices: [i, target],
        pseudoLine: 1,
        message: `Swapping ${arr[target]} and ${arr[i]}`,
      });

      i = target;
    }
  }

  steps.push({
    array: [...arr],
    pseudoLine: 1,
    message: `Heapify complete!`,
  });

  return { steps, newHeap: arr };
}

// ============================================
// TREE LAYOUT HELPERS
// ============================================

function computeTreePositions(size, width, height) {
  const positions = [];
  if (size === 0) return positions;

  const levels = Math.floor(Math.log2(size)) + 1;
  const nodeRadius = 22;
  const verticalSpacing = (height - 80) / Math.max(levels, 1);

  for (let i = 0; i < size; i++) {
    const level = Math.floor(Math.log2(i + 1));
    const posInLevel = i - (Math.pow(2, level) - 1);
    const nodesInLevel = Math.pow(2, level);
    const levelWidth = width - 60;
    const spacing = levelWidth / (nodesInLevel + 1);
    const x = spacing * (posInLevel + 1) + 30;
    const y = 40 + level * verticalSpacing;
    positions.push({ x, y, radius: nodeRadius });
  }

  return positions;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function HeapVisualizer({ onBack }) {
  const [heap, setHeap] = useState([1, 3, 2, 7, 6, 4, 5, 9]);
  const [isMinHeap, setIsMinHeap] = useState(true);
  const [inputVal, setInputVal] = useState('');
  const [inputArray, setInputArray] = useState('');
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [message, setMessage] = useState('');
  const [currentPseudo, setCurrentPseudo] = useState(null);
  const [hoverIndex, setHoverIndex] = useState(null);
  const [returnBubble, setReturnBubble] = useState(null);

  const animator = useAnimator(steps, speed);

  const currentStep = useMemo(() => {
    if (animator.stepIdx < 0 || animator.stepIdx >= steps.length) {
      return {
        array: heap,
        highlightIndices: [],
        pseudoLine: -1,
        message: '',
      };
    }
    return steps[animator.stepIdx];
  }, [animator.stepIdx, steps, heap]);

  useEffect(() => {
    if (currentStep.message) {
      setMessage(currentStep.message);
    }
  }, [currentStep]);

  const handleInsert = () => {
    const val = parseInt(inputVal, 10);
    if (isNaN(val)) return;

    const result = insertSteps(heap, val, isMinHeap);
    setCurrentPseudo(isMinHeap ? 'insert' : 'insertMax');
    setSteps(result.steps);
    setHeap(result.newHeap);
    setInputVal('');
    animator.reset();
    setTimeout(() => animator.play(result.steps), 50);
  };

  const handleExtract = () => {
    const result = extractSteps(heap, isMinHeap);
    setCurrentPseudo(isMinHeap ? 'extract' : 'extractMax');
    setSteps(result.steps);
    setHeap(result.newHeap);
    if (result.extractedValue !== null) {
      setReturnBubble(result.extractedValue);
      setTimeout(() => setReturnBubble(null), 1500);
    }
    animator.reset();
    setTimeout(() => animator.play(result.steps), 50);
  };

  const handlePeek = () => {
    const result = peekSteps(heap);
    setCurrentPseudo('peek');
    setSteps(result);
    animator.reset();
    setTimeout(() => animator.play(result), 50);
  };

  const handleHeapify = () => {
    const values = inputArray.split(',').map(v => parseInt(v.trim(), 10)).filter(v => !isNaN(v));
    if (values.length === 0) return;

    const result = heapifySteps(values, isMinHeap);
    setCurrentPseudo('heapify');
    setSteps(result.steps);
    setHeap(result.newHeap);
    setInputArray('');
    animator.reset();
    setTimeout(() => animator.play(result.steps), 50);
  };

  const handleBuildRandom = () => {
    const randomArray = Array.from({ length: 8 }, () => Math.floor(Math.random() * 99) + 1);
    const result = heapifySteps(randomArray, isMinHeap);
    setCurrentPseudo('heapify');
    setSteps(result.steps);
    setHeap(result.newHeap);
    animator.reset();
    setTimeout(() => animator.play(result.steps), 50);
  };

  const handleToggleHeapType = () => {
    const newIsMin = !isMinHeap;
    setIsMinHeap(newIsMin);
    if (heap.length > 0) {
      const result = heapifySteps(heap, newIsMin);
      setCurrentPseudo('heapify');
      setSteps(result.steps);
      setHeap(result.newHeap);
      animator.reset();
      setTimeout(() => animator.play(result.steps), 50);
    }
  };

  const handleReset = () => {
    animator.reset();
    setSteps([]);
    setMessage('');
    setReturnBubble(null);
    setHeap([1, 3, 2, 7, 6, 4, 5, 9]);
    setIsMinHeap(true);
  };

  const displayArray = currentStep.array || heap;
  const treePositions = computeTreePositions(displayArray.length, 400, 280);
  const pseudoLines = PSEUDOCODE[currentPseudo] || [];

  const accentColor = isMinHeap ? '#38bdf8' : '#f97316';
  const accentBg = isMinHeap ? '#1e3a5f' : '#3b1f00';

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white"
        >
          &larr; Back
        </button>
        <h1 className="text-sm font-semibold tracking-widest text-zinc-300">
          {isMinHeap ? 'MIN HEAP' : 'MAX HEAP'}
        </h1>
        <div className="flex items-center gap-4">
          <button
            onClick={handleToggleHeapType}
            className={`px-3 py-1 text-xs border transition-colors ${
              isMinHeap
                ? 'border-blue-500 text-blue-400 bg-zinc-800'
                : 'border-orange-500 text-orange-400 bg-zinc-800'
            }`}
          >
            Toggle: {isMinHeap ? 'Min' : 'Max'}
          </button>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Speed:</span>
            <input
              type="range"
              min="100"
              max="1500"
              step="100"
              value={1600 - speed}
              onChange={(e) => setSpeed(1600 - parseInt(e.target.value, 10))}
              className="w-24 accent-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Operations Row */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <input
          type="number"
          placeholder="Value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-20 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleInsert}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-blue-500"
        >
          Insert
        </button>
        <button
          onClick={handleExtract}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Extract{isMinHeap ? 'Min' : 'Max'}
        </button>
        <button
          onClick={handlePeek}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Peek
        </button>

        <div className="w-px h-6 bg-zinc-700 mx-2" />

        <input
          type="text"
          placeholder="5,3,8,1,9,2"
          value={inputArray}
          onChange={(e) => setInputArray(e.target.value)}
          className="w-32 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
        />
        <button
          onClick={handleHeapify}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Heapify
        </button>
        <button
          onClick={handleBuildRandom}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Build Random
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
        >
          Reset
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-4 relative">
        <CourseCallout title="Binary Heap Fundamentals" storageKey="heap">
{`Binary heap stored in array/vector:
• Parent of i: (i-1)/2
• Left child: 2*i+1
• Right child: 2*i+2

Complete tree property = no holes in array

C++ STL: std::priority_queue<T>
• Default is max-heap
• For min-heap: std::priority_queue<T, vector<T>, greater<T>>`}
        </CourseCallout>
        {/* Return bubble */}
        {returnBubble !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-900 border border-green-500 text-green-300 text-sm rounded animate-pulse z-10">
            Extracted: {returnBubble}
          </div>
        )}

        {/* Dual Panel Visualization */}
        <div className="flex gap-4 flex-1">
          {/* Array Panel */}
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Array (Vector)</div>

            {/* Array tiles */}
            <div className="flex flex-wrap gap-2 mb-4">
              {displayArray.map((val, i) => {
                const isHighlighted = currentStep.highlightIndices?.includes(i);
                const isSwapping = currentStep.swapIndices?.includes(i);
                const isComparing = currentStep.compareIndices?.includes(i);
                const isConfirmed = currentStep.confirmedIndex === i;
                const isPeek = currentStep.peekIndex === i;
                const isExtracting = currentStep.extractingIndex === i;
                const isHovered = hoverIndex === i;
                const isParentOfHovered = hoverIndex !== null && parent(hoverIndex) === i && hoverIndex > 0;
                const isLeftChildOfHovered = hoverIndex !== null && left(hoverIndex) === i;
                const isRightChildOfHovered = hoverIndex !== null && right(hoverIndex) === i;

                let bgClass = 'bg-zinc-800';
                let borderClass = 'border-zinc-700';

                if (isPeek || isConfirmed) {
                  bgClass = 'bg-green-900';
                  borderClass = 'border-green-500';
                } else if (isSwapping || isExtracting) {
                  bgClass = 'bg-red-900';
                  borderClass = 'border-red-500';
                } else if (isComparing) {
                  bgClass = isMinHeap ? 'bg-blue-900' : 'bg-orange-900';
                  borderClass = isMinHeap ? 'border-blue-500' : 'border-orange-500';
                } else if (isHighlighted) {
                  bgClass = isMinHeap ? 'bg-blue-900/50' : 'bg-orange-900/50';
                  borderClass = isMinHeap ? 'border-blue-400' : 'border-orange-400';
                } else if (isHovered) {
                  bgClass = 'bg-zinc-700';
                  borderClass = 'border-zinc-500';
                } else if (isParentOfHovered) {
                  bgClass = 'bg-purple-900/50';
                  borderClass = 'border-purple-500';
                } else if (isLeftChildOfHovered || isRightChildOfHovered) {
                  bgClass = 'bg-blue-900/30';
                  borderClass = 'border-blue-400';
                }

                return (
                  <div
                    key={i}
                    className="flex flex-col items-center"
                    onMouseEnter={() => setHoverIndex(i)}
                    onMouseLeave={() => setHoverIndex(null)}
                  >
                    <div
                      className={`w-12 h-12 flex items-center justify-center border-2 text-sm font-bold transition-all cursor-pointer ${bgClass} ${borderClass}`}
                      style={isSwapping ? { animation: 'pulse 0.3s ease-in-out' } : {}}
                    >
                      {val}
                    </div>
                    <span className="text-[10px] text-zinc-600 mt-1">[{i}]</span>
                    {isParentOfHovered && <span className="text-[9px] text-purple-400">parent</span>}
                    {isLeftChildOfHovered && <span className="text-[9px] text-blue-400">left</span>}
                    {isRightChildOfHovered && <span className="text-[9px] text-blue-400">right</span>}
                  </div>
                );
              })}
            </div>

            {/* Index formula display */}
            {hoverIndex !== null && (
              <div className="text-[11px] text-zinc-400 font-mono bg-zinc-900 p-2 rounded border border-zinc-800">
                <span className="text-zinc-500">Hover index i={hoverIndex}:</span>{' '}
                <span className="text-purple-400">parent=({hoverIndex}-1)/2={parent(hoverIndex)}</span>{' '}
                <span className="text-blue-400">left=2*{hoverIndex}+1={left(hoverIndex)}</span>{' '}
                <span className="text-blue-400">right=2*{hoverIndex}+2={right(hoverIndex)}</span>
              </div>
            )}

            {/* Static formula reference */}
            {hoverIndex === null && (
              <div className="text-[10px] text-zinc-600 font-mono">
                parent(i) = (i-1)/2 | left(i) = 2i+1 | right(i) = 2i+2
              </div>
            )}
          </div>

          {/* Tree Panel */}
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-3">Tree View</div>

            <svg width="100%" height="280" viewBox="0 0 400 280">
              {/* Draw edges first */}
              {displayArray.map((_, i) => {
                if (i === 0) return null;
                const p = parent(i);
                const parentPos = treePositions[p];
                const childPos = treePositions[i];
                if (!parentPos || !childPos) return null;

                return (
                  <line
                    key={`edge-${i}`}
                    x1={parentPos.x}
                    y1={parentPos.y + parentPos.radius}
                    x2={childPos.x}
                    y2={childPos.y - childPos.radius}
                    stroke="#3f3f46"
                    strokeWidth={1.5}
                  />
                );
              })}

              {/* Draw nodes */}
              {displayArray.map((val, i) => {
                const pos = treePositions[i];
                if (!pos) return null;

                const isHighlighted = currentStep.highlightIndices?.includes(i);
                const isSwapping = currentStep.swapIndices?.includes(i);
                const isComparing = currentStep.compareIndices?.includes(i);
                const isConfirmed = currentStep.confirmedIndex === i;
                const isPeek = currentStep.peekIndex === i;
                const isExtracting = currentStep.extractingIndex === i;

                let fill = '#27272a';
                let stroke = '#3f3f46';

                if (isPeek || isConfirmed) {
                  fill = '#14532d';
                  stroke = '#22c55e';
                } else if (isSwapping || isExtracting) {
                  fill = '#4a0d0d';
                  stroke = '#ef4444';
                } else if (isComparing) {
                  fill = accentBg;
                  stroke = accentColor;
                } else if (isHighlighted) {
                  fill = accentBg;
                  stroke = accentColor;
                }

                return (
                  <g key={`node-${i}`}>
                    <circle
                      cx={pos.x}
                      cy={pos.y}
                      r={pos.radius}
                      fill={fill}
                      stroke={stroke}
                      strokeWidth={2}
                      style={isSwapping ? { animation: 'pulse 0.3s ease-in-out' } : {}}
                    />
                    <text
                      x={pos.x}
                      y={pos.y}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      fill="white"
                      fontSize={12}
                      fontWeight="bold"
                    >
                      {val}
                    </text>
                    <text
                      x={pos.x + 12}
                      y={pos.y + 12}
                      textAnchor="middle"
                      fill="#6b7280"
                      fontSize={9}
                    >
                      {i}
                    </text>
                  </g>
                );
              })}

              {/* Empty state */}
              {displayArray.length === 0 && (
                <text x="200" y="140" textAnchor="middle" fill="#52525b" fontSize={14}>
                  Empty Heap
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="flex gap-4 mt-4">
          {/* Pseudocode */}
          <div className="flex-1">
            <PseudocodePanel
              lines={pseudoLines}
              activeLine={currentStep.pseudoLine}
              title={currentPseudo || 'Pseudocode'}
            />
          </div>

          {/* Complexity Sidebar */}
          <div className="w-56 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono p-3">
            <div className="text-zinc-600 text-[10px] tracking-widest uppercase mb-2 border-b border-zinc-800 pb-1">
              Complexity
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-zinc-500">
                  <th className="text-left font-normal pb-1">Operation</th>
                  <th className="text-right font-normal pb-1">Time</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600">
                <tr><td className="py-[2px]">insert</td><td className="text-right">O(log n)</td></tr>
                <tr><td className="py-[2px]">extract{isMinHeap ? 'Min' : 'Max'}</td><td className="text-right">O(log n)</td></tr>
                <tr><td className="py-[2px]">peek</td><td className="text-right">O(1)</td></tr>
                <tr><td className="py-[2px]">heapify(n)</td><td className="text-right">O(n)</td></tr>
              </tbody>
            </table>
            <div className="mt-3 pt-2 border-t border-zinc-800 text-zinc-600 text-[10px] leading-relaxed">
              Space: O(n) — array, no pointers!
              <br /><br />
              <span className="text-zinc-500">Index math:</span>
              <br />
              parent(i) = (i-1)/2
              <br />
              left(i) = 2i + 1
              <br />
              right(i) = 2i + 2
              <br /><br />
              Complete binary tree guarantees O(log n) ops.
            </div>
          </div>
        </div>

        {/* Message Bar */}
        <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 min-h-[36px]">
          {message || 'Select an operation'}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
      `}</style>

      <footer className="text-center py-2 border-t border-zinc-800">
        <a
          href="https://faigan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-blue-400 transition-colors duration-200 text-xs"
        >
          faigan.com
        </a>
      </footer>
    </div>
  );
}
