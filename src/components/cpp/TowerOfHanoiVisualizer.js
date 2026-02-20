import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import PseudocodePanel from '../shared/PseudocodePanel';
import CallStackPanel from '../shared/CallStackPanel';
import CourseCallout from '../shared/CourseCallout';

// Disk colors by size (1-8)
const diskColors = [
  '#ef4444', // red
  '#f97316', // orange
  '#eab308', // yellow
  '#22c55e', // green
  '#06b6d4', // cyan
  '#3b82f6', // blue
  '#8b5cf6', // purple
  '#ec4899', // pink
];

// Pseudocode
const pseudocode = [
  'hanoi(n, src, dst, aux):',
  '  if n == 0: return',
  '  hanoi(n-1, src, aux, dst)',
  '  move disk n from src to dst',
  '  hanoi(n-1, aux, dst, src)',
];

// Peg positions (x coordinates)
const pegX = { A: 200, B: 450, C: 700 };
const pegNames = { A: 'Source', B: 'Auxiliary', C: 'Destination' };

// Generate all Hanoi moves recursively
function generateHanoiSteps(n) {
  const steps = [];
  const pegs = { A: [], B: [], C: [] };

  // Initialize: all disks on peg A (largest at bottom)
  for (let i = n; i >= 1; i--) {
    pegs.A.push(i);
  }

  // Initial state
  steps.push({
    stateA: [...pegs.A],
    stateB: [...pegs.B],
    stateC: [...pegs.C],
    disk: null,
    from: null,
    to: null,
    callStack: [],
    pseudoLine: -1,
    message: 'Initial state',
    isMoving: false,
  });

  let frameId = 0;

  function hanoi(n, src, dst, aux, stack) {
    if (n === 0) return;

    // Push frame for this call
    const frame = { id: frameId++, func: 'hanoi', args: `${n}, ${src}, ${dst}, ${aux}` };
    stack.push(frame);

    // Step: entering hanoi(n-1, src, aux, dst)
    steps.push({
      stateA: [...pegs.A],
      stateB: [...pegs.B],
      stateC: [...pegs.C],
      disk: null,
      from: null,
      to: null,
      callStack: stack.map(s => ({ ...s })),
      pseudoLine: 2,
      message: `hanoi(${n-1}, ${src}, ${aux}, ${dst})`,
      isMoving: false,
    });

    hanoi(n - 1, src, aux, dst, stack);

    // Step: move disk n from src to dst
    const disk = pegs[src].pop();
    pegs[dst].push(disk);

    steps.push({
      stateA: [...pegs.A],
      stateB: [...pegs.B],
      stateC: [...pegs.C],
      disk: n,
      from: src,
      to: dst,
      callStack: stack.map(s => ({ ...s })),
      pseudoLine: 3,
      message: `Move disk ${n} from ${src} to ${dst}`,
      isMoving: true,
    });

    // Step: entering hanoi(n-1, aux, dst, src)
    steps.push({
      stateA: [...pegs.A],
      stateB: [...pegs.B],
      stateC: [...pegs.C],
      disk: null,
      from: null,
      to: null,
      callStack: stack.map(s => ({ ...s })),
      pseudoLine: 4,
      message: `hanoi(${n-1}, ${aux}, ${dst}, ${src})`,
      isMoving: false,
    });

    hanoi(n - 1, aux, dst, src, stack);

    stack.pop();
  }

  hanoi(n, 'A', 'C', 'B', []);

  // Final state
  steps.push({
    stateA: [...pegs.A],
    stateB: [...pegs.B],
    stateC: [...pegs.C],
    disk: null,
    from: null,
    to: null,
    callStack: [],
    pseudoLine: -1,
    message: 'Complete!',
    isMoving: false,
  });

  return steps;
}

export default function TowerOfHanoiVisualizer({ onBack }) {
  const [n, setN] = useState(4);
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(500);
  const [traceMode, setTraceMode] = useState(true);
  const [animatingDisk, setAnimatingDisk] = useState(null);
  const [animationPhase, setAnimationPhase] = useState(null); // 'lift', 'slide', 'drop'
  const animationRef = useRef(null);
  const playIntervalRef = useRef(null);

  const steps = useMemo(() => generateHanoiSteps(n), [n]);
  const currentState = steps[currentStep] || steps[0];

  const minMoves = Math.pow(2, n) - 1;
  const moveCount = steps.filter(s => s.isMoving).slice(0, currentStep + 1).length;

  // Clean up intervals on unmount
  useEffect(() => {
    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
      if (animationRef.current) clearTimeout(animationRef.current);
    };
  }, []);

  // Auto-play logic
  useEffect(() => {
    if (isPlaying && currentStep < steps.length - 1) {
      playIntervalRef.current = setTimeout(() => {
        stepForward();
      }, speed);
    } else if (currentStep >= steps.length - 1) {
      setIsPlaying(false);
    }

    return () => {
      if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    };
  }, [isPlaying, currentStep, speed, steps.length]);

  const stepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      const nextStep = steps[currentStep + 1];

      if (nextStep.isMoving) {
        // Animate the disk movement
        setAnimatingDisk({
          disk: nextStep.disk,
          from: nextStep.from,
          to: nextStep.to,
        });
        setAnimationPhase('lift');

        // Phase 1: lift
        animationRef.current = setTimeout(() => {
          setAnimationPhase('slide');

          // Phase 2: slide
          animationRef.current = setTimeout(() => {
            setAnimationPhase('drop');

            // Phase 3: drop and complete
            animationRef.current = setTimeout(() => {
              setAnimatingDisk(null);
              setAnimationPhase(null);
              setCurrentStep(currentStep + 1);
            }, speed / 4);
          }, speed / 4);
        }, speed / 4);
      } else {
        setCurrentStep(currentStep + 1);
      }
    }
  }, [currentStep, steps, speed]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      setAnimatingDisk(null);
      setAnimationPhase(null);
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    setCurrentStep(0);
    setAnimatingDisk(null);
    setAnimationPhase(null);
    if (playIntervalRef.current) clearTimeout(playIntervalRef.current);
    if (animationRef.current) clearTimeout(animationRef.current);
  }, []);

  const handleNChange = (newN) => {
    setN(newN);
    reset();
  };

  // SVG dimensions
  const svgWidth = 900;
  const svgHeight = 300;
  const pegHeight = 200;
  const baseY = 260;
  const diskHeight = 22;
  const minDiskWidth = 40;
  const maxDiskWidth = 140;

  // Calculate disk width based on size
  const getDiskWidth = (size) => {
    return minDiskWidth + ((size - 1) / 7) * (maxDiskWidth - minDiskWidth);
  };

  // Get current peg state (accounting for animation)
  const getPegDisks = (peg) => {
    const stateKey = `state${peg}`;
    let disks = [...(currentState[stateKey] || [])];

    // If we're animating, adjust the display
    if (animatingDisk && animationPhase) {
      if (animatingDisk.from === peg && animationPhase !== 'drop') {
        // Disk is being lifted from this peg - it's already removed in the next state
        // But we're showing current state, so we need to show it leaving
      }
    }

    return disks;
  };

  // Render a single peg with its disks
  const renderPeg = (peg) => {
    const x = pegX[peg];
    const disks = getPegDisks(peg);

    return (
      <g key={peg}>
        {/* Peg pole */}
        <rect
          x={x - 3}
          y={baseY - pegHeight}
          width={6}
          height={pegHeight}
          fill="#334155"
        />
        {/* Peg base */}
        <rect
          x={x - 80}
          y={baseY}
          width={160}
          height={8}
          fill="#334155"
        />
        {/* Peg label */}
        <text
          x={x}
          y={baseY + 28}
          textAnchor="middle"
          fill="#71717a"
          fontSize="14"
        >
          {peg}
        </text>
        <text
          x={x}
          y={baseY + 44}
          textAnchor="middle"
          fill="#52525b"
          fontSize="11"
        >
          {pegNames[peg]}
        </text>

        {/* Disks on this peg */}
        {disks.map((diskSize, index) => {
          // Skip the disk that's being animated
          if (animatingDisk && animatingDisk.disk === diskSize && animatingDisk.from === peg && animationPhase !== 'drop') {
            return null;
          }

          const diskWidth = getDiskWidth(diskSize);
          const y = baseY - (index + 1) * diskHeight;

          return (
            <g key={`${peg}-${diskSize}`}>
              <rect
                x={x - diskWidth / 2}
                y={y}
                width={diskWidth}
                height={diskHeight - 2}
                rx={4}
                fill={diskColors[diskSize - 1]}
                stroke="#1f2937"
                strokeWidth="1"
              />
              <text
                x={x}
                y={y + 14}
                textAnchor="middle"
                fill="white"
                fontSize="12"
                fontWeight="bold"
              >
                {diskSize}
              </text>
            </g>
          );
        })}
      </g>
    );
  };

  // Render animating disk
  const renderAnimatingDisk = () => {
    if (!animatingDisk || !animationPhase) return null;

    const { disk, from, to } = animatingDisk;
    const diskWidth = getDiskWidth(disk);
    const fromX = pegX[from];
    const toX = pegX[to];

    // Get the next state to know where the disk will land
    const nextState = steps[currentStep + 1];
    const toDisks = nextState ? nextState[`state${to}`] : [];
    const landingY = baseY - toDisks.length * diskHeight;

    // Current peg disk count for lift position
    const fromDisks = currentState[`state${from}`] || [];
    const liftFromY = baseY - fromDisks.length * diskHeight;

    const travelY = baseY - pegHeight - 30; // Above all pegs

    let x, y;

    switch (animationPhase) {
      case 'lift':
        x = fromX;
        y = travelY;
        break;
      case 'slide':
        x = toX;
        y = travelY;
        break;
      case 'drop':
        x = toX;
        y = landingY;
        break;
      default:
        return null;
    }

    return (
      <g className="transition-all duration-150">
        <rect
          x={x - diskWidth / 2}
          y={y}
          width={diskWidth}
          height={diskHeight - 2}
          rx={4}
          fill={diskColors[disk - 1]}
          stroke="white"
          strokeWidth="2"
          className="drop-shadow-lg"
        />
        <text
          x={x}
          y={y + 14}
          textAnchor="middle"
          fill="white"
          fontSize="12"
          fontWeight="bold"
        >
          {disk}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-zinc-800">
        <button
          onClick={onBack}
          className="px-4 py-3 text-sm bg-zinc-900 hover:bg-zinc-800 border-r border-zinc-800"
        >
          &larr; Back
        </button>
        <div className="px-4 py-2 text-zinc-400 text-sm">Tower of Hanoi</div>
      </div>

      {/* Stats bar */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center justify-center gap-8 text-sm">
        <div>
          <span className="text-zinc-500">Moves:</span>{' '}
          <span className="text-white font-mono">{moveCount}</span>
          <span className="text-zinc-600"> / {minMoves}</span>
        </div>
        <div>
          <span className="text-zinc-500">n =</span>{' '}
          <span className="text-white font-mono">{n}</span>
        </div>
        <div>
          <span className="text-zinc-500">Min moves = 2</span>
          <sup className="text-zinc-500">n</sup>
          <span className="text-zinc-500"> - 1 =</span>{' '}
          <span className="text-green-400 font-mono">{minMoves}</span>
        </div>
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-4 flex-wrap">
        {/* N selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">n:</span>
          {[1, 2, 3, 4, 5, 6, 7, 8].map((num) => (
            <button
              key={num}
              onClick={() => handleNChange(num)}
              disabled={isPlaying}
              className={`w-7 h-7 text-xs ${
                n === num ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
              } disabled:opacity-50`}
            >
              {num}
            </button>
          ))}
        </div>

        {/* Playback controls */}
        <div className="flex items-center gap-2 ml-auto">
          <button
            onClick={stepBackward}
            disabled={isPlaying || currentStep === 0 || animatingDisk}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm"
          >
            &lt;&lt;
          </button>
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            disabled={currentStep >= steps.length - 1 || animatingDisk}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm min-w-[80px]"
          >
            {isPlaying ? 'Pause' : 'Play'}
          </button>
          <button
            onClick={stepForward}
            disabled={isPlaying || currentStep >= steps.length - 1 || animatingDisk}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm"
          >
            &gt;&gt;
          </button>
          <button
            onClick={reset}
            disabled={animatingDisk}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm"
          >
            Reset
          </button>
        </div>

        {/* Speed control */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-400">Speed:</span>
          <input
            type="range"
            min="100"
            max="1000"
            step="100"
            value={1100 - speed}
            onChange={(e) => setSpeed(1100 - Number(e.target.value))}
            className="w-24"
          />
        </div>

        {/* Trace toggle */}
        <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
          <input
            type="checkbox"
            checked={traceMode}
            onChange={(e) => setTraceMode(e.target.checked)}
            className="w-4 h-4"
          />
          Trace Recursion
        </label>
      </div>

      {/* Message banner */}
      {currentState.message && (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-center">
          <span className={`font-mono text-sm ${currentState.isMoving ? 'text-green-400' : 'text-zinc-400'}`}>
            {currentState.message}
          </span>
        </div>
      )}

      {/* Course Notes Callout */}
      <div className="px-4 pt-2">
        <CourseCallout title="Tower of Hanoi — Classic Recursion" storageKey="towerofhanoi">
{`Recurrence: T(n) = 2·T(n-1) + 1, T(0) = 0
Closed form: T(n) = 2^n - 1

Algorithm: Move n-1 disks to aux, move largest to dest, move n-1 from aux to dest

Example times at 1 move/sec:
  n=10: ~17 min | n=20: ~12 days | n=64: 585 billion years`}
        </CourseCallout>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* SVG visualization */}
        <div className="flex-1 flex flex-col">
          <div className="flex-1 flex items-center justify-center p-4">
            <svg width={svgWidth} height={svgHeight} className="bg-zinc-950">
              {renderPeg('A')}
              {renderPeg('B')}
              {renderPeg('C')}
              {renderAnimatingDisk()}
            </svg>
          </div>

          {/* Educational callout */}
          <div className="px-4 py-3 bg-zinc-900 border-t border-zinc-800">
            <div className="max-w-2xl mx-auto text-xs font-mono text-zinc-500 space-y-1">
              <div className="text-zinc-400 mb-2">Recurrence: T(n) = 2 * T(n-1) + 1 &rarr; T(n) = 2^n - 1</div>
              <div className="flex gap-6 flex-wrap">
                <span>n=1: <span className="text-zinc-300">1 move</span></span>
                <span>n=4: <span className="text-zinc-300">15 moves</span></span>
                <span>n=8: <span className="text-zinc-300">255 moves</span></span>
              </div>
              <div className="flex gap-6 flex-wrap text-zinc-600">
                <span>n=20: ~1M moves</span>
                <span>n=64: 1.8 x 10^19 moves (longer than the age of the universe at 1B/sec)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right panels (trace mode) */}
        {traceMode && (
          <div className="w-[300px] flex flex-col border-l border-zinc-800">
            {/* Pseudocode panel */}
            <div className="flex-1 border-b border-zinc-800">
              <PseudocodePanel
                lines={pseudocode}
                currentLine={currentState.pseudoLine}
              />
            </div>

            {/* Call stack panel */}
            <div className="h-64">
              <CallStackPanel frames={currentState.callStack || []} />
            </div>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-blue-600 transition-all duration-200"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
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
