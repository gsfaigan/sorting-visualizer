import { useState, useMemo, useEffect, useRef } from 'react';
import { useAnimator } from '../../hooks/useAnimator';
import PseudocodePanel from '../shared/PseudocodePanel';
import CourseCallout from '../shared/CourseCallout';

// ============================================
// PSEUDOCODE DEFINITIONS
// ============================================

const PSEUDOCODE = {
  // Stack operations
  push: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'newNode.next = top', indent: 0 },
    { text: 'top = newNode', indent: 0 },
    { text: 'size++', indent: 0 },
  ],
  pop: [
    { text: 'if isEmpty(): return error', indent: 0 },
    { text: 'temp = top', indent: 0 },
    { text: 'top = top.next', indent: 0 },
    { text: 'size--', indent: 0 },
    { text: 'return temp.val', indent: 0 },
  ],
  peekStack: [
    { text: 'if isEmpty(): return error', indent: 0 },
    { text: 'return top.val', indent: 0 },
  ],
  isEmptyStack: [
    { text: 'return top == null', indent: 0 },
  ],
  sizeOp: [
    { text: 'return count', indent: 0 },
  ],
  // Queue operations
  enqueue: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'if isEmpty(): front = newNode', indent: 0 },
    { text: 'else: rear.next = newNode', indent: 0 },
    { text: 'rear = newNode', indent: 0 },
    { text: 'size++', indent: 0 },
  ],
  dequeue: [
    { text: 'if isEmpty(): return error', indent: 0 },
    { text: 'temp = front', indent: 0 },
    { text: 'front = front.next', indent: 0 },
    { text: 'if front == null: rear = null', indent: 0 },
    { text: 'size--', indent: 0 },
    { text: 'return temp.val', indent: 0 },
  ],
  peekQueue: [
    { text: 'if isEmpty(): return error', indent: 0 },
    { text: 'return front.val', indent: 0 },
  ],
  isEmptyQueue: [
    { text: 'return front == null', indent: 0 },
  ],
};

// ============================================
// COMPLEXITY DATA
// ============================================

const COMPLEXITY_STACK = [
  { op: 'push', time: 'O(1)', space: 'O(1)' },
  { op: 'pop', time: 'O(1)', space: 'O(1)' },
  { op: 'peek', time: 'O(1)', space: 'O(1)' },
  { op: 'isEmpty', time: 'O(1)', space: 'O(1)' },
  { op: 'size', time: 'O(1)', space: 'O(1)' },
];

const COMPLEXITY_QUEUE = [
  { op: 'enqueue', time: 'O(1)', space: 'O(1)' },
  { op: 'dequeue', time: 'O(1)', space: 'O(1)' },
  { op: 'peek', time: 'O(1)', space: 'O(1)' },
  { op: 'isEmpty', time: 'O(1)', space: 'O(1)' },
  { op: 'size', time: 'O(1)', space: 'O(1)' },
];

// ============================================
// STEP GENERATORS
// ============================================

let nextId = 100;

// Stack step generators
function pushSteps(items, val) {
  const steps = [];
  const newItem = { id: nextId++, val };
  const newItems = [...items, newItem];

  steps.push({
    items: newItems,
    highlightIds: [newItem.id],
    enteringId: newItem.id,
    topIdx: items.length,
    size: items.length,
    pseudoLine: 0,
    message: `Creating new node with value ${val}`,
  });

  steps.push({
    items: newItems,
    highlightIds: [newItem.id],
    enteringId: newItem.id,
    arrowFrom: newItem.id,
    arrowTo: items.length > 0 ? items[items.length - 1].id : null,
    topIdx: items.length,
    size: items.length,
    pseudoLine: 1,
    message: `Setting newNode.next = top`,
  });

  steps.push({
    items: newItems,
    highlightIds: [newItem.id],
    topIdx: newItems.length - 1,
    size: items.length,
    pseudoLine: 2,
    message: `Moving top pointer to new node`,
  });

  steps.push({
    items: newItems,
    highlightIds: [],
    topIdx: newItems.length - 1,
    size: newItems.length,
    pseudoLine: 3,
    message: `Size incremented to ${newItems.length}`,
  });

  return { steps, newItems };
}

function popSteps(items) {
  const steps = [];

  if (items.length === 0) {
    steps.push({
      items: [],
      highlightIds: [],
      errorFlash: true,
      topIdx: -1,
      size: 0,
      pseudoLine: 0,
      message: `Error: Stack is empty!`,
    });
    return { steps, newItems: [], poppedValue: null };
  }

  const topItem = items[items.length - 1];
  const newItems = items.slice(0, -1);
  const poppedValue = topItem.val;

  steps.push({
    items,
    highlightIds: [],
    topIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `Checking if empty: false`,
  });

  steps.push({
    items,
    highlightIds: [topItem.id],
    pointerLabels: { [topItem.id]: 'temp' },
    topIdx: items.length - 1,
    size: items.length,
    pseudoLine: 1,
    message: `Storing reference to top (temp = top)`,
  });

  steps.push({
    items,
    highlightIds: [topItem.id],
    pointerLabels: { [topItem.id]: 'temp' },
    topIdx: items.length - 2,
    size: items.length,
    pseudoLine: 2,
    message: `Moving top to next node`,
  });

  steps.push({
    items,
    highlightIds: [topItem.id],
    exitingId: topItem.id,
    topIdx: newItems.length - 1,
    size: newItems.length,
    pseudoLine: 3,
    message: `Size decremented to ${newItems.length}`,
  });

  steps.push({
    items: newItems,
    highlightIds: [],
    returnValue: poppedValue,
    topIdx: newItems.length - 1,
    size: newItems.length,
    pseudoLine: 4,
    message: `Returned value: ${poppedValue}`,
  });

  return { steps, newItems, poppedValue };
}

function peekStackSteps(items) {
  const steps = [];

  if (items.length === 0) {
    steps.push({
      items: [],
      errorFlash: true,
      topIdx: -1,
      size: 0,
      pseudoLine: 0,
      message: `Error: Stack is empty!`,
    });
    return steps;
  }

  const topItem = items[items.length - 1];

  steps.push({
    items,
    topIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `Checking if empty: false`,
  });

  steps.push({
    items,
    highlightIds: [topItem.id],
    peekId: topItem.id,
    topIdx: items.length - 1,
    size: items.length,
    pseudoLine: 1,
    message: `Peek value: ${topItem.val}`,
  });

  return steps;
}

function isEmptyStackSteps(items) {
  const steps = [];
  const isEmpty = items.length === 0;

  steps.push({
    items,
    emptyFlash: isEmpty,
    topIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `isEmpty() = ${isEmpty}`,
  });

  return steps;
}

function sizeStackSteps(items) {
  const steps = [];

  steps.push({
    items,
    sizePulse: true,
    topIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `size() = ${items.length}`,
  });

  return steps;
}

// Queue step generators
function enqueueSteps(items, val) {
  const steps = [];
  const newItem = { id: nextId++, val };
  const newItems = [...items, newItem];

  steps.push({
    items: newItems,
    highlightIds: [newItem.id],
    enteringId: newItem.id,
    frontIdx: 0,
    rearIdx: items.length,
    size: items.length,
    pseudoLine: 0,
    message: `Creating new node with value ${val}`,
  });

  if (items.length === 0) {
    steps.push({
      items: newItems,
      highlightIds: [newItem.id],
      frontIdx: 0,
      rearIdx: 0,
      size: items.length,
      pseudoLine: 1,
      message: `Queue was empty, setting front = newNode`,
    });
  } else {
    steps.push({
      items: newItems,
      highlightIds: [newItem.id, items[items.length - 1].id],
      arrowFrom: items[items.length - 1].id,
      arrowTo: newItem.id,
      frontIdx: 0,
      rearIdx: items.length - 1,
      size: items.length,
      pseudoLine: 2,
      message: `Setting rear.next = newNode`,
    });
  }

  steps.push({
    items: newItems,
    highlightIds: [newItem.id],
    frontIdx: 0,
    rearIdx: newItems.length - 1,
    size: items.length,
    pseudoLine: 3,
    message: `Moving rear to new node`,
  });

  steps.push({
    items: newItems,
    highlightIds: [],
    frontIdx: 0,
    rearIdx: newItems.length - 1,
    size: newItems.length,
    pseudoLine: 4,
    message: `Size incremented to ${newItems.length}`,
  });

  return { steps, newItems };
}

function dequeueSteps(items) {
  const steps = [];

  if (items.length === 0) {
    steps.push({
      items: [],
      errorFlash: true,
      frontIdx: -1,
      rearIdx: -1,
      size: 0,
      pseudoLine: 0,
      message: `Error: Queue is empty!`,
    });
    return { steps, newItems: [], dequeuedValue: null };
  }

  const frontItem = items[0];
  const newItems = items.slice(1);
  const dequeuedValue = frontItem.val;

  steps.push({
    items,
    frontIdx: 0,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `Checking if empty: false`,
  });

  steps.push({
    items,
    highlightIds: [frontItem.id],
    pointerLabels: { [frontItem.id]: 'temp' },
    frontIdx: 0,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 1,
    message: `Storing reference to front (temp = front)`,
  });

  steps.push({
    items,
    highlightIds: [frontItem.id],
    pointerLabels: { [frontItem.id]: 'temp' },
    frontIdx: newItems.length > 0 ? 1 : -1,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 2,
    message: `Moving front to next node`,
  });

  if (newItems.length === 0) {
    steps.push({
      items,
      highlightIds: [frontItem.id],
      exitingId: frontItem.id,
      frontIdx: -1,
      rearIdx: -1,
      size: items.length,
      pseudoLine: 3,
      message: `Queue now empty, setting rear = null`,
    });
  }

  steps.push({
    items,
    highlightIds: [frontItem.id],
    exitingId: frontItem.id,
    frontIdx: 0,
    rearIdx: newItems.length - 1,
    size: newItems.length,
    pseudoLine: 4,
    message: `Size decremented to ${newItems.length}`,
  });

  steps.push({
    items: newItems,
    highlightIds: [],
    returnValue: dequeuedValue,
    frontIdx: 0,
    rearIdx: newItems.length - 1,
    size: newItems.length,
    pseudoLine: 5,
    message: `Returned value: ${dequeuedValue}`,
  });

  return { steps, newItems, dequeuedValue };
}

function peekQueueSteps(items) {
  const steps = [];

  if (items.length === 0) {
    steps.push({
      items: [],
      errorFlash: true,
      frontIdx: -1,
      rearIdx: -1,
      size: 0,
      pseudoLine: 0,
      message: `Error: Queue is empty!`,
    });
    return steps;
  }

  const frontItem = items[0];

  steps.push({
    items,
    frontIdx: 0,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `Checking if empty: false`,
  });

  steps.push({
    items,
    highlightIds: [frontItem.id],
    peekId: frontItem.id,
    frontIdx: 0,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 1,
    message: `Peek value: ${frontItem.val}`,
  });

  return steps;
}

function isEmptyQueueSteps(items) {
  const steps = [];
  const isEmpty = items.length === 0;

  steps.push({
    items,
    emptyFlash: isEmpty,
    frontIdx: 0,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `isEmpty() = ${isEmpty}`,
  });

  return steps;
}

function sizeQueueSteps(items) {
  const steps = [];

  steps.push({
    items,
    sizePulse: true,
    frontIdx: 0,
    rearIdx: items.length - 1,
    size: items.length,
    pseudoLine: 0,
    message: `size() = ${items.length}`,
  });

  return steps;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function StackQueueVisualizer({ type, onBack }) {
  const isStack = type === 'stack';
  const label = isStack ? 'STACK' : 'QUEUE';

  const [items, setItems] = useState([
    { id: 0, val: 10 },
    { id: 1, val: 25 },
    { id: 2, val: 47 },
    { id: 3, val: 63 },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [message, setMessage] = useState('');
  const [currentPseudo, setCurrentPseudo] = useState(null);
  const [showArray, setShowArray] = useState(false);
  const [circularView, setCircularView] = useState(false);
  const [returnBubble, setReturnBubble] = useState(null);
  const bubbleTimeout = useRef(null);

  const animator = useAnimator(steps, speed);

  const currentStep = useMemo(() => {
    if (animator.stepIdx < 0 || animator.stepIdx >= steps.length) {
      return {
        items,
        highlightIds: [],
        topIdx: isStack ? items.length - 1 : undefined,
        frontIdx: !isStack ? 0 : undefined,
        rearIdx: !isStack ? items.length - 1 : undefined,
        size: items.length,
        pseudoLine: -1,
        message: '',
      };
    }
    return steps[animator.stepIdx];
  }, [animator.stepIdx, steps, items, isStack]);

  useEffect(() => {
    if (currentStep.message) {
      setMessage(currentStep.message);
    }
    if (currentStep.returnValue !== undefined) {
      setReturnBubble(currentStep.returnValue);
      if (bubbleTimeout.current) clearTimeout(bubbleTimeout.current);
      bubbleTimeout.current = setTimeout(() => setReturnBubble(null), 1500);
    }
  }, [currentStep]);

  const handleOperation = (op) => {
    const val = parseInt(inputVal, 10);
    let result;
    let pseudoKey;

    if (isStack) {
      switch (op) {
        case 'push':
          if (isNaN(val)) return;
          result = pushSteps(items, val);
          pseudoKey = 'push';
          setItems(result.newItems);
          setSteps(result.steps);
          break;
        case 'pop':
          result = popSteps(items);
          pseudoKey = 'pop';
          setItems(result.newItems);
          setSteps(result.steps);
          break;
        case 'peek':
          result = peekStackSteps(items);
          pseudoKey = 'peekStack';
          setSteps(result);
          break;
        case 'isEmpty':
          result = isEmptyStackSteps(items);
          pseudoKey = 'isEmptyStack';
          setSteps(result);
          break;
        case 'size':
          result = sizeStackSteps(items);
          pseudoKey = 'sizeOp';
          setSteps(result);
          break;
        default:
          return;
      }
    } else {
      switch (op) {
        case 'enqueue':
          if (isNaN(val)) return;
          result = enqueueSteps(items, val);
          pseudoKey = 'enqueue';
          setItems(result.newItems);
          setSteps(result.steps);
          break;
        case 'dequeue':
          result = dequeueSteps(items);
          pseudoKey = 'dequeue';
          setItems(result.newItems);
          setSteps(result.steps);
          break;
        case 'peek':
          result = peekQueueSteps(items);
          pseudoKey = 'peekQueue';
          setSteps(result);
          break;
        case 'isEmpty':
          result = isEmptyQueueSteps(items);
          pseudoKey = 'isEmptyQueue';
          setSteps(result);
          break;
        case 'size':
          result = sizeQueueSteps(items);
          pseudoKey = 'sizeOp';
          setSteps(result);
          break;
        default:
          return;
      }
    }

    setCurrentPseudo(pseudoKey);
    animator.reset();
    setTimeout(() => {
      animator.play(result.steps || result);
    }, 50);
  };

  const handleReset = () => {
    animator.reset();
    setSteps([]);
    setMessage('');
    setReturnBubble(null);
    setItems([
      { id: 0, val: 10 },
      { id: 1, val: 25 },
      { id: 2, val: 47 },
      { id: 3, val: 63 },
    ]);
    nextId = 100;
  };

  const displayItems = currentStep.items || items;
  const complexityData = isStack ? COMPLEXITY_STACK : COMPLEXITY_QUEUE;
  const pseudoLines = PSEUDOCODE[currentPseudo] || [];

  // SVG dimensions
  const wellWidth = 140;
  const nodeHeight = 40;
  const svgWidthStack = 200;
  const svgHeightStack = Math.max(280, displayItems.length * nodeHeight + 100);

  const nodeWidth = 60;
  const nodeHeightQ = 50;
  const svgWidthQueue = Math.max(500, displayItems.length * (nodeWidth + 10) + 200);
  const svgHeightQueue = circularView ? 320 : 160;

  const circleRadius = 100;
  const circleCenterX = svgWidthQueue / 2;
  const circleCenterY = 160;
  const maxCircleSlots = 8;

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
        <h1 className="text-sm font-semibold tracking-widest text-zinc-300">{label}</h1>
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
          onClick={() => handleOperation(isStack ? 'push' : 'enqueue')}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-blue-500"
        >
          {isStack ? 'Push' : 'Enqueue'}
        </button>
        <button
          onClick={() => handleOperation(isStack ? 'pop' : 'dequeue')}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          {isStack ? 'Pop' : 'Dequeue'}
        </button>
        <button
          onClick={() => handleOperation('peek')}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Peek
        </button>
        <button
          onClick={() => handleOperation('isEmpty')}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          isEmpty
        </button>
        <button
          onClick={() => handleOperation('size')}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Size
        </button>
        <button
          onClick={handleReset}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
        >
          Reset
        </button>

        <div className="ml-auto flex items-center gap-4">
          {isStack && (
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={showArray}
                onChange={(e) => setShowArray(e.target.checked)}
                className="accent-blue-500"
              />
              Show array view
            </label>
          )}
          {!isStack && (
            <label className="flex items-center gap-2 text-xs text-zinc-400 cursor-pointer">
              <input
                type="checkbox"
                checked={circularView}
                onChange={(e) => setCircularView(e.target.checked)}
                className="accent-blue-500"
              />
              Circular view
            </label>
          )}
        </div>
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 flex flex-col px-4 py-4 relative">
        {isStack ? (
          <CourseCallout title="Stack Fundamentals" storageKey="stack">
{`Stack = LIFO (Last-In, First-Out)
Abstract Data Type: push, pop, top/peek, isEmpty

C++ STL: std::stack<T> (adaptor over deque by default)

Real-world uses:
• Function call stack / recursion
• Undo operations
• Expression parsing`}
          </CourseCallout>
        ) : (
          <CourseCallout title="Queue Fundamentals" storageKey="queue">
{`Queue = FIFO (First-In, First-Out)
Abstract Data Type: enqueue, dequeue, front, isEmpty

C++ STL: std::queue<T> (adaptor over deque by default)

Real-world uses:
• BFS traversals
• Task scheduling
• Print queues`}
          </CourseCallout>
        )}
        {/* Return value bubble */}
        {returnBubble !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-900 border border-green-500 text-green-300 text-sm rounded animate-pulse z-10">
            Returned: {returnBubble}
          </div>
        )}

        {/* SVG Container */}
        <div className="flex-1 flex items-center justify-center overflow-auto">
          {isStack ? (
            // STACK VISUALIZATION
            <div className="flex flex-col items-center gap-4">
              <svg width={svgWidthStack} height={svgHeightStack}>
                <defs>
                  <marker id="arrow-down" markerWidth="8" markerHeight="6" refX="4" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                </defs>

                {/* U-shaped well */}
                <path
                  d={`M ${(svgWidthStack - wellWidth) / 2} 50
                      L ${(svgWidthStack - wellWidth) / 2} ${svgHeightStack - 30}
                      L ${(svgWidthStack + wellWidth) / 2} ${svgHeightStack - 30}
                      L ${(svgWidthStack + wellWidth) / 2} 50`}
                  fill="none"
                  stroke={currentStep.errorFlash ? '#ef4444' : currentStep.emptyFlash ? '#22c55e' : '#3f3f46'}
                  strokeWidth={2}
                  style={{ transition: 'stroke 0.3s' }}
                />

                {/* Empty state */}
                {displayItems.length === 0 && (
                  <text
                    x={svgWidthStack / 2}
                    y={svgHeightStack / 2}
                    textAnchor="middle"
                    fill="#52525b"
                    fontSize={12}
                    strokeDasharray="4 2"
                  >
                    empty
                  </text>
                )}

                {/* Stack nodes */}
                {displayItems.map((item, i) => {
                  const isTop = i === displayItems.length - 1;
                  const y = svgHeightStack - 40 - (i + 1) * nodeHeight;
                  const x = (svgWidthStack - wellWidth) / 2 + 5;
                  const isHighlighted = currentStep.highlightIds?.includes(item.id);
                  const isPeeking = currentStep.peekId === item.id;
                  const isEntering = currentStep.enteringId === item.id;
                  const isExiting = currentStep.exitingId === item.id;
                  const label = currentStep.pointerLabels?.[item.id];

                  let fill = '#27272a';
                  let stroke = '#3f3f46';

                  if (isPeeking) {
                    fill = '#14532d';
                    stroke = '#22c55e';
                  } else if (isHighlighted) {
                    fill = '#78350f';
                    stroke = '#f97316';
                  }

                  const enterStyle = isEntering ? {
                    animation: 'slideDown 0.4s ease-out',
                  } : {};

                  const exitStyle = isExiting ? {
                    animation: 'slideUp 0.4s ease-out',
                    opacity: 0.3,
                  } : {};

                  return (
                    <g key={item.id} style={{ ...enterStyle, ...exitStyle }}>
                      <rect
                        x={x}
                        y={y}
                        width={wellWidth - 10}
                        height={nodeHeight - 4}
                        rx={4}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={isPeeking ? 2 : 1.5}
                        style={isPeeking ? { animation: 'pulse 0.5s ease-in-out 2' } : {}}
                      />
                      <text
                        x={svgWidthStack / 2}
                        y={y + nodeHeight / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={14}
                        fontWeight="bold"
                      >
                        {item.val}
                      </text>
                      {/* Pointer label */}
                      {label && (
                        <text
                          x={svgWidthStack / 2 + wellWidth / 2 + 10}
                          y={y + nodeHeight / 2}
                          fill="#f97316"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          ← {label}
                        </text>
                      )}
                      {/* TOP pointer */}
                      {isTop && (currentStep.topIdx === i || (currentStep.topIdx === undefined && i === displayItems.length - 1)) && (
                        <g>
                          <text
                            x={(svgWidthStack - wellWidth) / 2 - 30}
                            y={y + nodeHeight / 2}
                            fill="#38bdf8"
                            fontSize={10}
                            fontWeight="bold"
                          >
                            TOP →
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Size counter */}
                <g transform={`translate(${svgWidthStack / 2}, ${svgHeightStack - 10})`}>
                  <text
                    textAnchor="middle"
                    fill={currentStep.sizePulse ? '#22c55e' : '#6b7280'}
                    fontSize={11}
                    fontWeight="bold"
                    style={currentStep.sizePulse ? { animation: 'pulse 0.5s ease-in-out 2' } : {}}
                  >
                    Size: {currentStep.size}
                  </text>
                </g>
              </svg>

              {/* Array view toggle */}
              {showArray && displayItems.length > 0 && (
                <div className="flex items-center gap-1 p-2 bg-zinc-900 border border-zinc-800 rounded">
                  {displayItems.map((item, i) => (
                    <div key={item.id} className="flex flex-col items-center">
                      <div className={`w-10 h-10 flex items-center justify-center border text-sm font-mono ${
                        i === displayItems.length - 1 ? 'border-blue-500 bg-zinc-800' : 'border-zinc-700 bg-zinc-900'
                      }`}>
                        {item.val}
                      </div>
                      <span className="text-[10px] text-zinc-600">[{i}]</span>
                      {i === displayItems.length - 1 && (
                        <span className="text-[10px] text-blue-400">top</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            // QUEUE VISUALIZATION
            <div className="flex flex-col items-center gap-4">
              <svg width={svgWidthQueue} height={svgHeightQueue}>
                <defs>
                  <marker id="arrow-right" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
                    <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                  </marker>
                  <marker id="arrow-left" markerWidth="8" markerHeight="6" refX="1" refY="3" orient="auto">
                    <polygon points="8 0, 0 3, 8 6" fill="#a78bfa" />
                  </marker>
                </defs>

                {circularView ? (
                  // Circular view
                  <>
                    {/* Circle outline */}
                    <circle
                      cx={circleCenterX}
                      cy={circleCenterY}
                      r={circleRadius}
                      fill="none"
                      stroke={currentStep.errorFlash ? '#ef4444' : currentStep.emptyFlash ? '#22c55e' : '#3f3f46'}
                      strokeWidth={2}
                      strokeDasharray={displayItems.length === 0 ? '8 4' : 'none'}
                    />
                    <text
                      x={circleCenterX}
                      y={circleCenterY + circleRadius + 30}
                      textAnchor="middle"
                      fill="#52525b"
                      fontSize={10}
                    >
                      n = {maxCircleSlots} capacity
                    </text>

                    {/* Circular nodes */}
                    {displayItems.slice(0, maxCircleSlots).map((item, i) => {
                      const angle = (i / Math.max(displayItems.length, 1)) * 2 * Math.PI - Math.PI / 2;
                      const cx = circleCenterX + circleRadius * Math.cos(angle);
                      const cy = circleCenterY + circleRadius * Math.sin(angle);
                      const isHighlighted = currentStep.highlightIds?.includes(item.id);
                      const isPeeking = currentStep.peekId === item.id;
                      const isFront = i === 0;
                      const isRear = i === displayItems.length - 1;

                      let fill = '#27272a';
                      let stroke = '#3f3f46';

                      if (isPeeking) {
                        fill = '#14532d';
                        stroke = '#22c55e';
                      } else if (isHighlighted) {
                        fill = '#78350f';
                        stroke = '#f97316';
                      }

                      return (
                        <g key={item.id}>
                          <circle
                            cx={cx}
                            cy={cy}
                            r={22}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={1.5}
                          />
                          <text
                            x={cx}
                            y={cy}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize={12}
                            fontWeight="bold"
                          >
                            {item.val}
                          </text>
                          {/* FRONT/REAR labels */}
                          {isFront && (
                            <text
                              x={cx}
                              y={cy - 32}
                              textAnchor="middle"
                              fill="#38bdf8"
                              fontSize={9}
                              fontWeight="bold"
                            >
                              FRONT
                            </text>
                          )}
                          {isRear && !isFront && (
                            <text
                              x={cx}
                              y={cy - 32}
                              textAnchor="middle"
                              fill="#a78bfa"
                              fontSize={9}
                              fontWeight="bold"
                            >
                              REAR
                            </text>
                          )}
                          {isFront && isRear && (
                            <text
                              x={cx}
                              y={cy + 35}
                              textAnchor="middle"
                              fill="#a78bfa"
                              fontSize={9}
                              fontWeight="bold"
                            >
                              REAR
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Empty state */}
                    {displayItems.length === 0 && (
                      <text
                        x={circleCenterX}
                        y={circleCenterY}
                        textAnchor="middle"
                        fill="#52525b"
                        fontSize={12}
                      >
                        empty
                      </text>
                    )}
                  </>
                ) : (
                  // Linear view
                  <>
                    {/* Tunnel outline */}
                    <rect
                      x={50}
                      y={50}
                      width={Math.max(400, displayItems.length * (nodeWidth + 10) + 40)}
                      height={nodeHeightQ + 20}
                      rx={6}
                      fill="none"
                      stroke={currentStep.errorFlash ? '#ef4444' : currentStep.emptyFlash ? '#22c55e' : '#3f3f46'}
                      strokeWidth={2}
                      strokeDasharray={displayItems.length === 0 ? '8 4' : 'none'}
                    />

                    {/* Dequeue arrow */}
                    <g>
                      <path
                        d="M 30 85 L 50 85"
                        stroke="#a78bfa"
                        strokeWidth={1.5}
                        markerEnd="url(#arrow-left)"
                      />
                      <text x={20} y={100} fill="#a78bfa" fontSize={8}>dequeue</text>
                    </g>

                    {/* Enqueue arrow */}
                    <g transform={`translate(${Math.max(470, displayItems.length * (nodeWidth + 10) + 110)}, 0)`}>
                      <path
                        d="M 0 85 L 20 85"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        markerEnd="url(#arrow-right)"
                      />
                      <text x={0} y={100} fill="#38bdf8" fontSize={8}>enqueue</text>
                    </g>

                    {/* Empty state */}
                    {displayItems.length === 0 && (
                      <text
                        x={250}
                        y={85}
                        textAnchor="middle"
                        fill="#52525b"
                        fontSize={12}
                      >
                        empty
                      </text>
                    )}

                    {/* Queue nodes */}
                    {displayItems.map((item, i) => {
                      const x = 70 + i * (nodeWidth + 10);
                      const y = 60;
                      const isHighlighted = currentStep.highlightIds?.includes(item.id);
                      const isPeeking = currentStep.peekId === item.id;
                      const isEntering = currentStep.enteringId === item.id;
                      const isExiting = currentStep.exitingId === item.id;
                      const label = currentStep.pointerLabels?.[item.id];
                      const isFront = i === 0;
                      const isRear = i === displayItems.length - 1;

                      let fill = '#27272a';
                      let stroke = '#3f3f46';

                      if (isPeeking) {
                        fill = '#14532d';
                        stroke = '#22c55e';
                      } else if (isHighlighted) {
                        fill = '#78350f';
                        stroke = '#f97316';
                      }

                      const enterStyle = isEntering ? {
                        animation: 'slideLeft 0.4s ease-out',
                      } : {};

                      const exitStyle = isExiting ? {
                        animation: 'slideLeftOut 0.4s ease-out',
                        opacity: 0.3,
                      } : {};

                      return (
                        <g key={item.id} style={{ ...enterStyle, ...exitStyle }}>
                          <rect
                            x={x}
                            y={y}
                            width={nodeWidth}
                            height={nodeHeightQ}
                            rx={4}
                            fill={fill}
                            stroke={stroke}
                            strokeWidth={isPeeking ? 2 : 1.5}
                            style={isPeeking ? { animation: 'pulse 0.5s ease-in-out 2' } : {}}
                          />
                          <text
                            x={x + nodeWidth / 2}
                            y={y + nodeHeightQ / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="white"
                            fontSize={13}
                            fontWeight="bold"
                          >
                            {item.val}
                          </text>
                          {/* Pointer label below */}
                          {label && (
                            <text
                              x={x + nodeWidth / 2}
                              y={y + nodeHeightQ + 15}
                              textAnchor="middle"
                              fill="#f97316"
                              fontSize={9}
                              fontWeight="bold"
                            >
                              {label}
                            </text>
                          )}
                          {/* FRONT label */}
                          {isFront && (
                            <g>
                              <text
                                x={x + nodeWidth / 2}
                                y={y - 18}
                                textAnchor="middle"
                                fill="#38bdf8"
                                fontSize={9}
                                fontWeight="bold"
                              >
                                FRONT
                              </text>
                              <path
                                d={`M ${x + nodeWidth / 2} ${y - 12} L ${x + nodeWidth / 2} ${y - 4}`}
                                stroke="#38bdf8"
                                strokeWidth={1.5}
                              />
                            </g>
                          )}
                          {/* REAR label */}
                          {isRear && (
                            <g>
                              <text
                                x={x + nodeWidth / 2}
                                y={y - 18}
                                textAnchor="middle"
                                fill="#a78bfa"
                                fontSize={9}
                                fontWeight="bold"
                              >
                                {isFront ? '' : 'REAR'}
                              </text>
                              {!isFront && (
                                <path
                                  d={`M ${x + nodeWidth / 2} ${y - 12} L ${x + nodeWidth / 2} ${y - 4}`}
                                  stroke="#a78bfa"
                                  strokeWidth={1.5}
                                />
                              )}
                            </g>
                          )}
                        </g>
                      );
                    })}
                  </>
                )}

                {/* Size counter */}
                <text
                  x={circularView ? circleCenterX : 250}
                  y={circularView ? circleCenterY + circleRadius + 50 : 140}
                  textAnchor="middle"
                  fill={currentStep.sizePulse ? '#22c55e' : '#6b7280'}
                  fontSize={11}
                  fontWeight="bold"
                  style={currentStep.sizePulse ? { animation: 'pulse 0.5s ease-in-out 2' } : {}}
                >
                  Size: {currentStep.size}
                </text>
              </svg>
            </div>
          )}
        </div>

        {/* Bottom Section: Pseudocode + Complexity */}
        <div className="flex gap-4 mt-4">
          {/* Pseudocode Panel */}
          <div className="flex-1">
            <PseudocodePanel
              lines={pseudoLines}
              activeLine={currentStep.pseudoLine}
              title={currentPseudo || 'Pseudocode'}
            />
          </div>

          {/* Complexity Sidebar */}
          <div className="w-48 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono p-3">
            <div className="text-zinc-600 text-[10px] tracking-widest uppercase mb-2 border-b border-zinc-800 pb-1">
              Complexity
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-zinc-500">
                  <th className="text-left font-normal pb-1">Op</th>
                  <th className="text-right font-normal pb-1">Time</th>
                  <th className="text-right font-normal pb-1">Space</th>
                </tr>
              </thead>
              <tbody>
                {complexityData.map((row) => (
                  <tr key={row.op} className="text-zinc-600">
                    <td className="py-[2px]">{row.op}</td>
                    <td className="text-right">{row.time}</td>
                    <td className="text-right">{row.space}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="mt-2 pt-2 border-t border-zinc-800 text-zinc-600 text-[10px] leading-relaxed">
              Total space: O(n)
              <br />
              {isStack
                ? 'Linked list impl. Array also O(1).'
                : 'FRONT + REAR ptrs = O(1). Without REAR: enqueue O(n).'}
            </div>
          </div>
        </div>

        {/* Message Bar */}
        <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 min-h-[36px]">
          {message || `Select an operation`}
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes slideDown {
          from {
            transform: translateY(-50px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        @keyframes slideUp {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(-50px);
            opacity: 0;
          }
        }
        @keyframes slideLeft {
          from {
            transform: translateX(50px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        @keyframes slideLeftOut {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(-50px);
            opacity: 0;
          }
        }
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
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
