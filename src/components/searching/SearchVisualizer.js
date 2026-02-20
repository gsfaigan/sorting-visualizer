import React, { useState, useEffect, useRef } from 'react';
import {
  linearSearchSteps,
  binarySearchSteps,
  jumpSearchSteps,
  interpolationSearchSteps,
  exponentialSearchSteps,
  ternarySearchSteps,
  fibonacciSearchSteps,
  SEARCH_ALGO_INFO,
  SEARCH_ALGORITHM_DEFAULTS,
  searchAlgorithmList
} from '../../algorithms/search';
import { valueToFrequency, playTone } from '../../utils/audio';

export default function SearchVisualizer({ onBack, initialAlgorithm }) {
  const [array, setArray] = useState([]);
  const [speed, setSpeed] = useState(50);
  const [size, setSize] = useState(50);
  const [target, setTarget] = useState(50);
  const [isSearching, setIsSearching] = useState(false);
  const [currentIndices, setCurrentIndices] = useState([]);
  const [currentStepType, setCurrentStepType] = useState(null);
  const [eliminatedIndices, setEliminatedIndices] = useState([]);
  const [foundIndex, setFoundIndex] = useState(null);
  const [algorithm, setAlgorithm] = useState(initialAlgorithm || 'linear');
  const [searchResult, setSearchResult] = useState(null);

  const audioRef = useRef(null);
  const intervalRef = useRef(null);

  const currentInfo = SEARCH_ALGO_INFO[algorithm] || SEARCH_ALGO_INFO.linear;

  // Generate array
  function generateArray() {
    if (isSearching) return;
    const minVal = 5;
    const maxVal = 105;
    const step = (maxVal - minVal) / Math.max(1, size - 1);
    const linear = Array.from({ length: size }, (_, i) => ({ id: i, value: Math.round(minVal + i * step) }));
    // Shuffle for unsorted array
    for (let i = linear.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [linear[i], linear[j]] = [linear[j], linear[i]];
    }
    const arr = linear.map((it, idx) => ({ id: idx, value: it.value }));
    setArray(arr);
    setCurrentIndices([]);
    setEliminatedIndices([]);
    setFoundIndex(null);
    setSearchResult(null);
    // Set a random target from the array values
    const randomValue = arr[Math.floor(Math.random() * arr.length)].value;
    setTarget(randomValue);
    return arr;
  }

  useEffect(() => {
    generateArray();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  useEffect(() => {
    if (!isSearching) {
      setCurrentIndices([]);
      setEliminatedIndices([]);
      setFoundIndex(null);
      setSearchResult(null);
      const defaults = SEARCH_ALGORITHM_DEFAULTS[algorithm];
      if (defaults) {
        setSize(defaults.size);
        setSpeed(defaults.speed);
      }
      // Regenerate array when algorithm changes
      setTimeout(() => {
        generateArray();
      }, 0);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [algorithm]);

  function visualizeSearch() {
    let steps = [];
    switch (algorithm) {
      case 'binary':
        steps = binarySearchSteps(array, target);
        break;
      case 'jump':
        steps = jumpSearchSteps(array, target);
        break;
      case 'interpolation':
        steps = interpolationSearchSteps(array, target);
        break;
      case 'exponential':
        steps = exponentialSearchSteps(array, target);
        break;
      case 'ternary':
        steps = ternarySearchSteps(array, target);
        break;
      case 'fibonacci':
        steps = fibonacciSearchSteps(array, target);
        break;
      default:
        steps = linearSearchSteps(array, target);
    }

    let i = 0;
    setIsSearching(true);
    setEliminatedIndices([]);
    setFoundIndex(null);
    setSearchResult(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      if (i >= steps.length) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
        setIsSearching(false);
        return;
      }

      const step = steps[i];
      setArray(step.arr);
      setCurrentIndices(step.indices || []);
      setCurrentStepType(step.type);

      if (step.type === 'eliminate') {
        setEliminatedIndices(prev => [...new Set([...prev, ...(step.indices || [])])]);
      }

      if (step.type === 'found') {
        setFoundIndex(step.indices[0]);
        setSearchResult('found');
      }

      if (step.type === 'not_found') {
        setSearchResult('not_found');
      }

      // Play audio
      try {
        if (!audioRef.current) {
          audioRef.current = new (window.AudioContext || window.webkitAudioContext)();
        }
        const ctx = audioRef.current;
        const indices = step.indices || [];
        if (indices.length > 0 && step.arr[indices[0]]) {
          const val = step.arr[indices[0]].value || 0;
          playTone(ctx, valueToFrequency(val), 0.12);
        }
      } catch (e) {
        // ignore
      }

      i++;
    }, speed);
  }

  function stopSearch() {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    setIsSearching(false);
    setCurrentIndices([]);
    try {
      if (audioRef.current && audioRef.current.state === 'running') {
        audioRef.current.suspend();
      }
    } catch (e) {
      // ignore
    }
  }

  // Get bar color based on state
  function getBarColor(idx) {
    if (foundIndex === idx) return 'bg-green-500';
    if (currentStepType === 'sorted' && currentIndices.includes(idx)) return 'bg-blue-300';
    if (eliminatedIndices.includes(idx)) return 'bg-zinc-600';
    if (currentIndices.includes(idx)) {
      if (currentStepType === 'check' || currentStepType === 'interpolate' || currentStepType === 'fibonacci') {
        return 'bg-yellow-400';
      }
      if (currentStepType === 'jump' || currentStepType === 'exponential' || currentStepType === 'ternary') {
        return 'bg-orange-400';
      }
      return 'bg-orange-400';
    }
    return 'bg-blue-400';
  }

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={onBack}
          disabled={isSearching}
          className={`px-3 py-1 text-sm ${isSearching ? 'bg-zinc-700 text-zinc-500' : 'bg-zinc-800 hover:bg-zinc-700'}`}
        >
          &larr; Back
        </button>
        <h1 className="text-sm font-semibold tracking-widest text-zinc-300">SEARCH ALGORITHM VISUALIZER</h1>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Target:</span>
            <input
              type="number"
              min="5"
              max="105"
              value={target}
              disabled={isSearching}
              onChange={(e) => setTarget(Number(e.target.value))}
              className={`w-16 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white ${isSearching ? 'opacity-60' : ''}`}
            />
          </div>
          <button
            onClick={generateArray}
            disabled={isSearching}
            className={`px-3 py-1 text-sm ${isSearching ? 'bg-zinc-700 text-zinc-400' : 'bg-blue-600 hover:bg-blue-500'}`}
          >
            Generate
          </button>
          <button
            onClick={visualizeSearch}
            disabled={isSearching}
            className={`px-3 py-1 text-sm ${isSearching ? 'bg-zinc-700 text-zinc-400' : 'bg-green-600 hover:bg-green-500'}`}
          >
            Start
          </button>
          <button
            onClick={stopSearch}
            disabled={!isSearching}
            className={`px-3 py-1 text-sm ${!isSearching ? 'bg-zinc-800 text-zinc-500' : 'bg-red-600 hover:bg-red-500'}`}
          >
            Stop
          </button>
        </div>
      </div>

      {/* Result Banner */}
      {searchResult && (
        <div className={`px-4 py-2 text-center text-sm ${searchResult === 'found' ? 'bg-green-600' : 'bg-red-600'}`}>
          {searchResult === 'found' ? `Found ${target} at index ${foundIndex}!` : `${target} not found in array`}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex p-4 gap-4 overflow-auto">
        {/* Algorithm List */}
        <div className="w-48 bg-zinc-950 border border-zinc-800 rounded flex flex-col">
          <div className="px-3 py-2 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
            Algorithms
          </div>
          <div className="flex-1 overflow-auto p-2 space-y-1">
            {searchAlgorithmList.map(opt => (
              <button
                key={opt.value}
                onClick={() => { if (!isSearching) setAlgorithm(opt.value); }}
                disabled={isSearching}
                className={`w-full text-left px-3 py-2 text-sm rounded transition-colors ${
                  algorithm === opt.value
                    ? 'bg-green-600 text-white'
                    : isSearching
                      ? 'text-zinc-600'
                      : 'text-zinc-300 hover:bg-zinc-800'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Visualization */}
        <div className="flex-1 flex flex-col gap-4">
          {/* Controls */}
          <div className="flex items-center gap-6 bg-zinc-950 border border-zinc-800 rounded px-4 py-3">
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Size:</span>
              <input
                type="range"
                min="10"
                max="100"
                value={size}
                disabled={isSearching}
                onChange={(e) => setSize(Number(e.target.value))}
                className={`w-24 ${isSearching ? 'opacity-60' : ''}`}
              />
              <span className="text-xs text-zinc-400 w-8">{size}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-500">Speed:</span>
              <input
                type="range"
                min="10"
                max="200"
                value={speed}
                disabled={isSearching}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className={`w-24 ${isSearching ? 'opacity-60' : ''}`}
              />
              <span className="text-xs text-zinc-400 w-12">{speed}ms</span>
            </div>
          </div>

          {/* Bar Chart */}
          <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-4">
            <div className="relative h-full w-full">
              {array.map((item, idx) => {
                const barWidth = 100 / Math.max(1, array.length);
                const leftPercent = idx * barWidth;
                const minVal = 5;
                const maxVal = 105;
                const v = Math.min(Math.max(item.value, minVal), maxVal);
                let heightPercent = ((v - minVal) / (maxVal - minVal)) * 100;
                if (heightPercent < 0.5) heightPercent = 0.5;

                const colorClass = getBarColor(idx);

                return (
                  <div
                    key={idx}
                    style={{
                      position: 'absolute',
                      bottom: 0,
                      left: `${leftPercent}%`,
                      width: `calc(${100 / array.length}% - 1px)`,
                      height: `${heightPercent}%`,
                    }}
                    className={`${colorClass} mx-[0.5px] transition-all duration-100`}
                  />
                );
              })}
              {/* Target line */}
              <div
                style={{
                  position: 'absolute',
                  bottom: `${((target - 5) / 100) * 100}%`,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: '#ef4444',
                  opacity: 0.7
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  bottom: `${((target - 5) / 100) * 100 + 1}%`,
                  right: '8px',
                  fontSize: '12px',
                  color: '#ef4444'
                }}
              >
                Target: {target}
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        <div className="w-72 space-y-4">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">How It Works</div>
            <div className="text-xs text-zinc-500 mb-3">{currentInfo.complexity}</div>
            <ol className="text-sm text-zinc-300 space-y-1 list-decimal ml-4">
              {currentInfo.steps.map((s, i) => <li key={i}>{s}</li>)}
            </ol>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Legend</div>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-400"></div>
                <span className="text-zinc-400">Unchecked</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-400"></div>
                <span className="text-zinc-400">Checking</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-zinc-600"></div>
                <span className="text-zinc-400">Eliminated</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-500"></div>
                <span className="text-zinc-400">Found</span>
              </div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Search Types</div>
            <div className="text-xs text-zinc-400 space-y-2">
              <div><span className="text-green-400">Linear</span>: O(n) - check each element</div>
              <div><span className="text-green-400">Binary</span>: O(log n) - requires sorted array</div>
              <div><span className="text-green-400">Jump</span>: O(√n) - block jumping</div>
            </div>
          </div>
        </div>
      </div>

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
