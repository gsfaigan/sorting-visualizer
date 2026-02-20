import { useState, useRef, useEffect, useMemo } from 'react';

// Complexity definitions
const complexities = [
  { key: 'o1', label: 'O(1)', color: '#22c55e', fn: () => 1 },
  { key: 'logn', label: 'O(log n)', color: '#38bdf8', fn: (n) => Math.log2(n) },
  { key: 'n', label: 'O(n)', color: '#f59e0b', fn: (n) => n },
  { key: 'nlogn', label: 'O(n log n)', color: '#f97316', fn: (n) => n * Math.log2(n) },
  { key: 'n2', label: 'O(n²)', color: '#ef4444', fn: (n) => n * n },
  { key: '2n', label: 'O(2ⁿ)', color: '#a78bfa', fn: (n) => Math.pow(2, n) },
];

// Algorithm examples
const algorithmExamples = [
  { complexity: 'O(1)', examples: 'Stack push/pop, Queue enqueue/dequeue, Heap peek, Array index access' },
  { complexity: 'O(log n)', examples: 'Binary search, BST search (balanced), Heap insert/extract' },
  { complexity: 'O(n)', examples: 'Linear search, Linked list traversal, Tree traversal, Array scan' },
  { complexity: 'O(n log n)', examples: 'Merge sort, Heap sort, Quick sort (average), Timsort' },
  { complexity: 'O(n²)', examples: 'Bubble sort, Selection sort, Insertion sort (worst), Nested loops' },
  { complexity: 'O(n log²n)', examples: 'Bitonic sort, Odd-even merge sort' },
  { complexity: 'O(2ⁿ)', examples: 'Tower of Hanoi, Subset enumeration, Naive recursive Fibonacci' },
];

// Callout cards
const callouts = [
  { title: 'Best / Average / Worst', text: 'Same algorithm can have different complexities. Quicksort: O(n log n) average but O(n²) worst case.' },
  { title: 'Amortized O(1)', text: 'vector::push_back is usually O(1) but occasionally O(n) for realloc — amortized over many calls = O(1) per call.' },
  { title: 'Space Complexity', text: 'O(1) = in-place (cycle sort), O(n) = extra storage (merge sort), O(log n) = recursion stack (quicksort).' },
  { title: 'n and k factors', text: 'Counting sort is O(n + k) — when k (value range) is small, it beats O(n log n) comparison sorts.' },
];

export default function BigOVisualizer({ onBack }) {
  const canvasRef = useRef(null);
  const [nValue, setNValue] = useState(50);
  const [visibleComplexities, setVisibleComplexities] = useState({
    o1: true, logn: true, n: true, nlogn: true, n2: true, '2n': true,
  });
  const [hoverN, setHoverN] = useState(null);
  const [highlightedComplexity, setHighlightedComplexity] = useState(null);

  // Calculate chart bounds
  const chartConfig = useMemo(() => {
    const padding = { top: 40, right: 100, bottom: 60, left: 80 };
    const width = 800;
    const height = 400;

    // Find max Y based on visible complexities
    let maxY = 0;
    const visibleKeys = Object.entries(visibleComplexities)
      .filter(([_, v]) => v)
      .map(([k]) => k);

    for (let n = 1; n <= nValue; n++) {
      for (const key of visibleKeys) {
        const comp = complexities.find(c => c.key === key);
        if (comp) {
          // Cap 2^n at n=20 for display
          if (key === '2n' && n > 20) continue;
          const val = comp.fn(n);
          if (val > maxY && val < Infinity) maxY = val;
        }
      }
    }

    // Add some padding to maxY
    maxY = maxY * 1.1;

    return { padding, width, height, maxY, maxN: nValue };
  }, [nValue, visibleComplexities]);

  // Draw chart
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const { padding, width, height, maxY, maxN } = chartConfig;

    // Clear canvas
    ctx.fillStyle = '#09090b';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const chartWidth = width - padding.left - padding.right;
    const chartHeight = height - padding.top - padding.bottom;

    // Draw grid
    ctx.strokeStyle = '#27272a';
    ctx.lineWidth = 1;

    // Vertical grid lines
    for (let i = 0; i <= 10; i++) {
      const x = padding.left + (chartWidth / 10) * i;
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
    }

    // Horizontal grid lines
    for (let i = 0; i <= 5; i++) {
      const y = padding.top + (chartHeight / 5) * i;
      ctx.beginPath();
      ctx.moveTo(padding.left, y);
      ctx.lineTo(width - padding.right, y);
      ctx.stroke();
    }

    // Draw axes
    ctx.strokeStyle = '#52525b';
    ctx.lineWidth = 2;

    // X axis
    ctx.beginPath();
    ctx.moveTo(padding.left, height - padding.bottom);
    ctx.lineTo(width - padding.right, height - padding.bottom);
    ctx.stroke();

    // Y axis
    ctx.beginPath();
    ctx.moveTo(padding.left, padding.top);
    ctx.lineTo(padding.left, height - padding.bottom);
    ctx.stroke();

    // Axis labels
    ctx.fillStyle = '#71717a';
    ctx.font = '12px monospace';
    ctx.textAlign = 'center';

    // X axis labels
    for (let i = 0; i <= 5; i++) {
      const n = Math.round((maxN / 5) * i);
      const x = padding.left + (chartWidth / 5) * i;
      ctx.fillText(n.toString(), x, height - padding.bottom + 20);
    }
    ctx.fillText('n', width - padding.right + 30, height - padding.bottom + 5);

    // Y axis labels
    ctx.textAlign = 'right';
    for (let i = 0; i <= 5; i++) {
      const val = Math.round((maxY / 5) * (5 - i));
      const y = padding.top + (chartHeight / 5) * i;
      ctx.fillText(formatNumber(val), padding.left - 10, y + 4);
    }
    ctx.save();
    ctx.translate(20, height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.textAlign = 'center';
    ctx.fillText('Operations', 0, 0);
    ctx.restore();

    // Draw complexity lines
    for (const comp of complexities) {
      if (!visibleComplexities[comp.key]) continue;

      ctx.strokeStyle = comp.color;
      ctx.lineWidth = highlightedComplexity === comp.key ? 4 : 2;
      ctx.globalAlpha = visibleComplexities[comp.key] ? 1 : 0.1;

      ctx.beginPath();
      let firstPoint = true;

      for (let n = 1; n <= maxN; n++) {
        // Cap 2^n display
        if (comp.key === '2n' && n > 20) break;

        const val = comp.fn(n);
        if (val > maxY * 1.5 || !isFinite(val)) continue;

        const x = padding.left + ((n - 1) / (maxN - 1)) * chartWidth;
        const y = height - padding.bottom - (val / maxY) * chartHeight;

        if (firstPoint) {
          ctx.moveTo(x, y);
          firstPoint = false;
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.stroke();

      // Draw label at end of line
      const lastN = comp.key === '2n' ? Math.min(20, maxN) : maxN;
      const lastVal = comp.fn(lastN);
      if (lastVal <= maxY * 1.5 && isFinite(lastVal)) {
        const x = padding.left + ((lastN - 1) / (maxN - 1)) * chartWidth;
        const y = Math.max(padding.top + 10, height - padding.bottom - (lastVal / maxY) * chartHeight);

        ctx.fillStyle = comp.color;
        ctx.font = 'bold 11px monospace';
        ctx.textAlign = 'left';
        ctx.fillText(comp.label, x + 5, y);
      }
    }

    ctx.globalAlpha = 1;

    // Draw hover line
    if (hoverN !== null && hoverN >= 1 && hoverN <= maxN) {
      const x = padding.left + ((hoverN - 1) / (maxN - 1)) * chartWidth;

      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 5]);
      ctx.beginPath();
      ctx.moveTo(x, padding.top);
      ctx.lineTo(x, height - padding.bottom);
      ctx.stroke();
      ctx.setLineDash([]);
    }

  }, [chartConfig, visibleComplexities, hoverN, highlightedComplexity]);

  // Handle mouse move on canvas
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const { padding, width, maxN } = chartConfig;
    const chartWidth = width - padding.left - padding.right;

    if (x >= padding.left && x <= width - padding.right) {
      const n = Math.round(1 + ((x - padding.left) / chartWidth) * (maxN - 1));
      setHoverN(Math.max(1, Math.min(maxN, n)));
    } else {
      setHoverN(null);
    }
  };

  const handleMouseLeave = () => {
    setHoverN(null);
  };

  const toggleComplexity = (key) => {
    setVisibleComplexities(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleExampleClick = (complexity) => {
    const comp = complexities.find(c => c.label === complexity);
    if (comp) {
      setHighlightedComplexity(comp.key);
      setTimeout(() => setHighlightedComplexity(null), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button
          onClick={onBack}
          className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700"
        >
          &larr; Back
        </button>
        <h1 className="text-sm font-semibold tracking-widest text-zinc-300">BIG-O COMPLEXITY VISUALIZER</h1>
        <div className="flex items-center gap-4">
          <span className="text-xs text-zinc-500">n:</span>
          <input
            type="range"
            min="10"
            max="100"
            value={nValue}
            onChange={(e) => setNValue(parseInt(e.target.value, 10))}
            className="w-32 accent-blue-500"
          />
          <span className="text-sm font-mono w-8">{nValue}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col p-4 gap-4 overflow-auto">
        {/* Chart */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={800}
              height={400}
              className="w-full max-w-[800px] mx-auto"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            />

            {/* Hover tooltip */}
            {hoverN !== null && (
              <div className="absolute top-4 right-4 bg-zinc-900 border border-zinc-700 p-3 rounded text-xs font-mono">
                <div className="text-zinc-400 mb-2">n = {hoverN}</div>
                {complexities.map(comp => {
                  if (!visibleComplexities[comp.key]) return null;
                  if (comp.key === '2n' && hoverN > 20) {
                    return (
                      <div key={comp.key} className="flex justify-between gap-4">
                        <span style={{ color: comp.color }}>{comp.label}</span>
                        <span className="text-zinc-500">(capped at n=20)</span>
                      </div>
                    );
                  }
                  const val = comp.fn(hoverN);
                  return (
                    <div key={comp.key} className="flex justify-between gap-4">
                      <span style={{ color: comp.color }}>{comp.label}</span>
                      <span className="text-white">{formatNumber(Math.round(val))}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Complexity toggles */}
          <div className="flex flex-wrap gap-2 mt-4 justify-center">
            {complexities.map(comp => (
              <button
                key={comp.key}
                onClick={() => toggleComplexity(comp.key)}
                className={`px-3 py-1 text-xs font-mono border rounded transition-all ${
                  visibleComplexities[comp.key]
                    ? 'border-current'
                    : 'border-zinc-700 opacity-40'
                }`}
                style={{
                  color: comp.color,
                  backgroundColor: visibleComplexities[comp.key] ? `${comp.color}20` : 'transparent'
                }}
              >
                {visibleComplexities[comp.key] ? '✓ ' : ''}{comp.label}
              </button>
            ))}
          </div>
        </div>

        {/* Algorithm examples table */}
        <div className="bg-zinc-900 border border-zinc-800 rounded overflow-hidden">
          <div className="px-4 py-2 border-b border-zinc-800 text-xs text-zinc-500 uppercase tracking-wider">
            Algorithm Examples
          </div>
          <div className="divide-y divide-zinc-800">
            {algorithmExamples.map((row, i) => (
              <div
                key={i}
                onClick={() => handleExampleClick(row.complexity)}
                className="flex px-4 py-2 hover:bg-zinc-800 cursor-pointer transition-colors"
              >
                <div className="w-28 font-mono text-sm" style={{
                  color: complexities.find(c => c.label === row.complexity)?.color || '#fff'
                }}>
                  {row.complexity}
                </div>
                <div className="flex-1 text-sm text-zinc-400">{row.examples}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Callout cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {callouts.map((card, i) => (
            <div key={i} className="bg-zinc-900 border border-zinc-700 p-4 rounded">
              <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">{card.title}</div>
              <div className="text-sm text-zinc-300">{card.text}</div>
            </div>
          ))}
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

// Format large numbers
function formatNumber(n) {
  if (n >= 1e12) return (n / 1e12).toFixed(1) + 'T';
  if (n >= 1e9) return (n / 1e9).toFixed(1) + 'B';
  if (n >= 1e6) return (n / 1e6).toFixed(1) + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1) + 'K';
  return n.toString();
}
