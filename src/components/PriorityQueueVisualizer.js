import { useState, useMemo, useEffect } from 'react';
import { useAnimator } from '../hooks/useAnimator';
import PseudocodePanel from './PseudocodePanel';
import CourseCallout from './CourseCallout';

// ============================================
// PSEUDOCODE DEFINITIONS
// ============================================

const PSEUDOCODE = {
  // Array mode
  insertArray: [
    { text: 'i = arr.length - 1', indent: 0 },
    { text: 'while i >= 0 and arr[i].pri < newPri:', indent: 0 },
    { text: 'arr[i+1] = arr[i]  // shift right', indent: 1 },
    { text: 'i--', indent: 1 },
    { text: 'arr[i+1] = newElement', indent: 0 },
  ],
  extractArray: [
    { text: 'if isEmpty(): return error', indent: 0 },
    { text: 'result = arr[0]', indent: 0 },
    { text: 'shift all elements left', indent: 0 },
    { text: 'return result', indent: 0 },
  ],
  peekArray: [
    { text: 'if isEmpty(): return error', indent: 0 },
    { text: 'return arr[0]', indent: 0 },
  ],
  changePriorityArray: [
    { text: 'find element with value', indent: 0 },
    { text: 'update priority', indent: 0 },
    { text: 're-sort array', indent: 0 },
  ],
  // LoL mode
  insertLoL: [
    { text: 'lists[priority].append(val)', indent: 0 },
  ],
  extractLoL: [
    { text: 'for p = maxPriority downto 0:', indent: 0 },
    { text: 'if lists[p] not empty:', indent: 1 },
    { text: 'return lists[p].dequeue()', indent: 2 },
    { text: 'return null', indent: 0 },
  ],
  peekLoL: [
    { text: 'for p = maxPriority downto 0:', indent: 0 },
    { text: 'if lists[p] not empty:', indent: 1 },
    { text: 'return lists[p].head', indent: 2 },
    { text: 'return null', indent: 0 },
  ],
};

// ============================================
// COMPLEXITY DATA
// ============================================

const COMPLEXITY_ARRAY = [
  { op: 'insert', time: 'O(n)', note: 'shift on insert' },
  { op: 'extractMax', time: 'O(1)', note: 'always front' },
  { op: 'peek', time: 'O(1)', note: '' },
  { op: 'changePri', time: 'O(n)', note: 're-sort' },
];

const COMPLEXITY_LOL = [
  { op: 'insert', time: 'O(K)', note: 'find row' },
  { op: 'extractMax', time: 'O(K)', note: 'scan rows' },
  { op: 'peek', time: 'O(K)', note: '' },
];

// ============================================
// STEP GENERATORS - ARRAY MODE
// ============================================

let nextId = 100;

function insertArraySteps(items, val, priority) {
  const steps = [];
  const newItem = { id: nextId++, val, priority };
  const arr = [...items];

  steps.push({
    items: arr,
    newItem,
    pseudoLine: 0,
    message: `Inserting (${val}, priority=${priority}). Finding position...`,
  });

  let insertIdx = arr.length;
  for (let i = arr.length - 1; i >= 0; i--) {
    steps.push({
      items: arr,
      newItem,
      compareIndex: i,
      pseudoLine: 1,
      message: `Comparing: priority ${arr[i].priority} < ${priority}?`,
    });

    if (arr[i].priority < priority) {
      steps.push({
        items: arr,
        newItem,
        shiftIndex: i,
        pseudoLine: 2,
        message: `Shifting element at index ${i} right`,
      });
      insertIdx = i;
    } else {
      break;
    }
  }

  // Insert at the correct position
  const newItems = [...arr.slice(0, insertIdx), newItem, ...arr.slice(insertIdx)];

  steps.push({
    items: newItems,
    highlightIndex: insertIdx,
    pseudoLine: 4,
    message: `Inserted at index ${insertIdx}`,
  });

  return { steps, newItems };
}

function extractArraySteps(items) {
  const steps = [];

  if (items.length === 0) {
    steps.push({
      items: [],
      errorFlash: true,
      pseudoLine: 0,
      message: `Error: Priority queue is empty!`,
    });
    return { steps, newItems: [], extractedValue: null };
  }

  const extracted = items[0];

  steps.push({
    items,
    highlightIndex: 0,
    extractingIndex: 0,
    pseudoLine: 1,
    message: `Extracting max priority element: ${extracted.val} (pri=${extracted.priority})`,
  });

  steps.push({
    items,
    shiftingAll: true,
    pseudoLine: 2,
    message: `Shifting all elements left`,
  });

  const newItems = items.slice(1);

  steps.push({
    items: newItems,
    returnValue: extracted,
    pseudoLine: 3,
    message: `Returned: ${extracted.val}`,
  });

  return { steps, newItems, extractedValue: extracted };
}

function peekArraySteps(items) {
  if (items.length === 0) {
    return [{
      items: [],
      errorFlash: true,
      pseudoLine: 0,
      message: `Error: Priority queue is empty!`,
    }];
  }

  return [{
    items,
    peekIndex: 0,
    pseudoLine: 1,
    message: `Peek: ${items[0].val} (priority=${items[0].priority})`,
  }];
}

function changePriorityArraySteps(items, targetVal, newPriority) {
  const steps = [];

  const idx = items.findIndex(item => item.val === targetVal);
  if (idx === -1) {
    steps.push({
      items,
      errorFlash: true,
      pseudoLine: 0,
      message: `Element ${targetVal} not found!`,
    });
    return { steps, newItems: items };
  }

  steps.push({
    items,
    highlightIndex: idx,
    pseudoLine: 0,
    message: `Found ${targetVal} at index ${idx}`,
  });

  const updatedItems = [...items];
  updatedItems[idx] = { ...updatedItems[idx], priority: newPriority };

  steps.push({
    items: updatedItems,
    highlightIndex: idx,
    pseudoLine: 1,
    message: `Updated priority to ${newPriority}`,
  });

  // Re-sort
  const sortedItems = [...updatedItems].sort((a, b) => b.priority - a.priority);

  steps.push({
    items: sortedItems,
    pseudoLine: 2,
    message: `Re-sorted by priority`,
  });

  return { steps, newItems: sortedItems };
}

// ============================================
// STEP GENERATORS - LOL MODE
// ============================================

function insertLoLSteps(lists, val, priority, maxPriority) {
  const steps = [];
  const newItem = { id: nextId++, val };

  steps.push({
    lists,
    targetPriority: priority,
    newItem,
    pseudoLine: 0,
    message: `Inserting ${val} into priority level ${priority}`,
  });

  const newLists = lists.map((list, i) =>
    i === priority ? [...list, newItem] : [...list]
  );

  steps.push({
    lists: newLists,
    highlightPriority: priority,
    highlightItem: newItem.id,
    pseudoLine: 0,
    message: `Added ${val} to priority ${priority} list`,
  });

  return { steps, newLists };
}

function extractLoLSteps(lists, maxPriority) {
  const steps = [];

  for (let p = maxPriority; p >= 0; p--) {
    steps.push({
      lists,
      scanningPriority: p,
      pseudoLine: 0,
      message: `Checking priority level ${p}...`,
    });

    if (lists[p].length > 0) {
      steps.push({
        lists,
        highlightPriority: p,
        pseudoLine: 1,
        message: `Found non-empty list at priority ${p}`,
      });

      const extracted = lists[p][0];

      steps.push({
        lists,
        extractingPriority: p,
        extractingItem: extracted.id,
        pseudoLine: 2,
        message: `Extracting ${extracted.val}`,
      });

      const newLists = lists.map((list, i) =>
        i === p ? list.slice(1) : [...list]
      );

      steps.push({
        lists: newLists,
        returnValue: extracted,
        pseudoLine: 2,
        message: `Returned: ${extracted.val}`,
      });

      return { steps, newLists, extractedValue: extracted };
    }
  }

  steps.push({
    lists,
    errorFlash: true,
    pseudoLine: 3,
    message: `Priority queue is empty!`,
  });

  return { steps, newLists: lists, extractedValue: null };
}

function peekLoLSteps(lists, maxPriority) {
  const steps = [];

  for (let p = maxPriority; p >= 0; p--) {
    steps.push({
      lists,
      scanningPriority: p,
      pseudoLine: 0,
      message: `Checking priority level ${p}...`,
    });

    if (lists[p].length > 0) {
      const peeked = lists[p][0];
      steps.push({
        lists,
        peekPriority: p,
        peekItem: peeked.id,
        pseudoLine: 2,
        message: `Peek: ${peeked.val} at priority ${p}`,
      });
      return steps;
    }
  }

  steps.push({
    lists,
    errorFlash: true,
    pseudoLine: 3,
    message: `Priority queue is empty!`,
  });

  return steps;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function PriorityQueueVisualizer({ onBack }) {
  const [mode, setMode] = useState('array'); // 'array' or 'lol'
  const maxPriority = 4;

  // Array mode state
  const [arrayItems, setArrayItems] = useState([
    { id: 1, val: 'A', priority: 5 },
    { id: 2, val: 'B', priority: 4 },
    { id: 3, val: 'C', priority: 3 },
    { id: 4, val: 'D', priority: 2 },
    { id: 5, val: 'E', priority: 1 },
  ]);

  // LoL mode state
  const [lists, setLists] = useState(() => {
    const initial = Array.from({ length: maxPriority + 1 }, () => []);
    initial[4] = [{ id: 10, val: 'X' }, { id: 11, val: 'Y' }];
    initial[2] = [{ id: 12, val: 'Z' }];
    initial[1] = [{ id: 13, val: 'W' }, { id: 14, val: 'V' }, { id: 15, val: 'U' }];
    return initial;
  });

  const [inputVal, setInputVal] = useState('');
  const [inputPriority, setInputPriority] = useState('');
  const [inputChangePriority, setInputChangePriority] = useState('');
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [message, setMessage] = useState('');
  const [currentPseudo, setCurrentPseudo] = useState(null);
  const [returnBubble, setReturnBubble] = useState(null);

  const animator = useAnimator(steps, speed);

  const currentStep = useMemo(() => {
    if (animator.stepIdx < 0 || animator.stepIdx >= steps.length) {
      return {
        items: arrayItems,
        lists,
        pseudoLine: -1,
        message: '',
      };
    }
    return steps[animator.stepIdx];
  }, [animator.stepIdx, steps, arrayItems, lists]);

  useEffect(() => {
    if (currentStep.message) {
      setMessage(currentStep.message);
    }
    if (currentStep.returnValue) {
      setReturnBubble(currentStep.returnValue.val);
      setTimeout(() => setReturnBubble(null), 1500);
    }
  }, [currentStep]);

  const handleInsert = () => {
    if (!inputVal || !inputPriority) return;
    const priority = parseInt(inputPriority, 10);
    if (isNaN(priority) || priority < 0 || priority > maxPriority) return;

    if (mode === 'array') {
      const result = insertArraySteps(arrayItems, inputVal, priority);
      setCurrentPseudo('insertArray');
      setSteps(result.steps);
      setArrayItems(result.newItems);
    } else {
      const result = insertLoLSteps(lists, inputVal, priority, maxPriority);
      setCurrentPseudo('insertLoL');
      setSteps(result.steps);
      setLists(result.newLists);
    }

    setInputVal('');
    setInputPriority('');
    animator.reset();
    setTimeout(() => animator.play(), 50);
  };

  const handleExtract = () => {
    if (mode === 'array') {
      const result = extractArraySteps(arrayItems);
      setCurrentPseudo('extractArray');
      setSteps(result.steps);
      setArrayItems(result.newItems);
    } else {
      const result = extractLoLSteps(lists, maxPriority);
      setCurrentPseudo('extractLoL');
      setSteps(result.steps);
      setLists(result.newLists);
    }

    animator.reset();
    setTimeout(() => animator.play(), 50);
  };

  const handlePeek = () => {
    if (mode === 'array') {
      const result = peekArraySteps(arrayItems);
      setCurrentPseudo('peekArray');
      setSteps(result);
    } else {
      const result = peekLoLSteps(lists, maxPriority);
      setCurrentPseudo('peekLoL');
      setSteps(result);
    }

    animator.reset();
    setTimeout(() => animator.play(), 50);
  };

  const handleChangePriority = () => {
    if (mode !== 'array') return;
    if (!inputVal || !inputChangePriority) return;
    const newPri = parseInt(inputChangePriority, 10);
    if (isNaN(newPri)) return;

    const result = changePriorityArraySteps(arrayItems, inputVal, newPri);
    setCurrentPseudo('changePriorityArray');
    setSteps(result.steps);
    setArrayItems(result.newItems);
    setInputVal('');
    setInputChangePriority('');
    animator.reset();
    setTimeout(() => animator.play(), 50);
  };

  const handleReset = () => {
    animator.reset();
    setSteps([]);
    setMessage('');
    setReturnBubble(null);
    setArrayItems([
      { id: 1, val: 'A', priority: 5 },
      { id: 2, val: 'B', priority: 4 },
      { id: 3, val: 'C', priority: 3 },
      { id: 4, val: 'D', priority: 2 },
      { id: 5, val: 'E', priority: 1 },
    ]);
    const initial = Array.from({ length: maxPriority + 1 }, () => []);
    initial[4] = [{ id: 10, val: 'X' }, { id: 11, val: 'Y' }];
    initial[2] = [{ id: 12, val: 'Z' }];
    initial[1] = [{ id: 13, val: 'W' }, { id: 14, val: 'V' }, { id: 15, val: 'U' }];
    setLists(initial);
    nextId = 100;
  };

  const displayItems = currentStep.items || arrayItems;
  const displayLists = currentStep.lists || lists;
  const pseudoLines = PSEUDOCODE[currentPseudo] || [];
  const complexityData = mode === 'array' ? COMPLEXITY_ARRAY : COMPLEXITY_LOL;

  const isEmpty = mode === 'array'
    ? displayItems.length === 0
    : displayLists.every(list => list.length === 0);

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
        <h1 className="text-sm font-semibold tracking-widest text-zinc-300">PRIORITY QUEUE</h1>
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

      {/* Mode Toggle */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
        <span className="text-xs text-zinc-500 mr-2">Implementation:</span>
        <button
          onClick={() => setMode('array')}
          className={`px-3 py-1 text-xs border transition-colors ${
            mode === 'array'
              ? 'border-blue-500 text-blue-400 bg-zinc-800'
              : 'border-zinc-700 text-zinc-400 bg-zinc-900 hover:bg-zinc-800'
          }`}
        >
          Sorted Array
        </button>
        <button
          onClick={() => setMode('lol')}
          className={`px-3 py-1 text-xs border transition-colors ${
            mode === 'lol'
              ? 'border-purple-500 text-purple-400 bg-zinc-800'
              : 'border-zinc-700 text-zinc-400 bg-zinc-900 hover:bg-zinc-800'
          }`}
        >
          List of Lists
        </button>
      </div>

      {/* Operations Row */}
      <div className="flex flex-wrap items-center gap-3 px-4 py-3 border-b border-zinc-800">
        <input
          type="text"
          placeholder="Value"
          value={inputVal}
          onChange={(e) => setInputVal(e.target.value)}
          className="w-16 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
        />
        <input
          type="number"
          placeholder={`Pri (0-${maxPriority})`}
          value={inputPriority}
          onChange={(e) => setInputPriority(e.target.value)}
          min="0"
          max={maxPriority}
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
          ExtractMax
        </button>
        <button
          onClick={handlePeek}
          disabled={animator.running}
          className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
        >
          Peek
        </button>

        {mode === 'array' && (
          <>
            <div className="w-px h-6 bg-zinc-700 mx-2" />
            <input
              type="number"
              placeholder="New Pri"
              value={inputChangePriority}
              onChange={(e) => setInputChangePriority(e.target.value)}
              className="w-20 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={handleChangePriority}
              disabled={animator.running}
              className="px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-700 disabled:text-zinc-500 text-white border border-zinc-700"
            >
              ChangePri
            </button>
          </>
        )}

        <button
          onClick={handleReset}
          className="ml-auto px-3 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
        >
          Reset
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-4 relative">
        <CourseCallout title="Priority Queue Implementations" storageKey="priorityqueue">
{`Priority Queue implementations:

Sorted Array:
• Insert O(n), Extract O(1)
• Simple but slow for inserts

List of Lists (by priority level):
• Insert O(K), Extract O(K) where K = priority levels
• Good when priorities are bounded integers

Binary Heap (most common):
• Insert O(log n), Extract O(log n)
• C++ STL: std::priority_queue<T>`}
        </CourseCallout>
        {/* Return bubble */}
        {returnBubble !== null && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-green-900 border border-green-500 text-green-300 text-sm rounded animate-pulse z-10">
            Extracted: {returnBubble}
          </div>
        )}

        {/* Visualization */}
        <div className="flex-1 flex items-center justify-center">
          {mode === 'array' ? (
            // ARRAY MODE VISUALIZATION
            <div className="flex flex-col items-center gap-4">
              <div className="text-xs text-zinc-500 uppercase tracking-widest">Sorted Array (Highest Priority First)</div>

              {/* FRONT pointer */}
              {displayItems.length > 0 && (
                <div className="flex items-center gap-2 text-blue-400 text-xs">
                  <span>FRONT / MAX PRIORITY</span>
                  <span>↓</span>
                </div>
              )}

              {/* Array strip */}
              <div className="flex gap-1">
                {displayItems.map((item, i) => {
                  const isHighlighted = currentStep.highlightIndex === i;
                  const isComparing = currentStep.compareIndex === i;
                  const isShifting = currentStep.shiftIndex === i;
                  const isExtracting = currentStep.extractingIndex === i;
                  const isPeek = currentStep.peekIndex === i;

                  let bgClass = 'bg-zinc-800';
                  let borderClass = 'border-zinc-700';

                  if (isPeek) {
                    bgClass = 'bg-green-900';
                    borderClass = 'border-green-500';
                  } else if (isExtracting) {
                    bgClass = 'bg-red-900';
                    borderClass = 'border-red-500';
                  } else if (isHighlighted) {
                    bgClass = 'bg-blue-900';
                    borderClass = 'border-blue-500';
                  } else if (isComparing) {
                    bgClass = 'bg-yellow-900';
                    borderClass = 'border-yellow-500';
                  } else if (isShifting) {
                    bgClass = 'bg-orange-900';
                    borderClass = 'border-orange-500';
                  }

                  return (
                    <div
                      key={item.id}
                      className={`flex flex-col items-center justify-center w-16 h-16 border-2 transition-all ${bgClass} ${borderClass}`}
                      style={isShifting || (currentStep.shiftingAll && i > 0) ? { animation: 'shiftLeft 0.3s ease-out' } : {}}
                    >
                      <span className="text-white font-bold text-lg">{item.val}</span>
                      <span className="text-zinc-400 text-[10px]">pri: {item.priority}</span>
                    </div>
                  );
                })}
                {displayItems.length === 0 && (
                  <div className="flex items-center justify-center w-32 h-16 border-2 border-dashed border-zinc-700 text-zinc-600 text-sm">
                    empty
                  </div>
                )}
              </div>

              {/* Index labels */}
              <div className="flex gap-1">
                {displayItems.map((_, i) => (
                  <div key={i} className="w-16 text-center text-[10px] text-zinc-600">
                    [{i}]
                  </div>
                ))}
              </div>
            </div>
          ) : (
            // LOL MODE VISUALIZATION
            <div className="flex flex-col gap-2 w-full max-w-2xl">
              <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">List of Lists (Priority Levels)</div>

              {Array.from({ length: maxPriority + 1 }).map((_, p) => {
                const priority = maxPriority - p; // Render high to low
                const list = displayLists[priority] || [];
                const isScanning = currentStep.scanningPriority === priority;
                const isHighlighted = currentStep.highlightPriority === priority;
                const isExtracting = currentStep.extractingPriority === priority;
                const isPeek = currentStep.peekPriority === priority;
                const targetPriority = currentStep.targetPriority === priority;

                let rowBg = 'bg-zinc-900';
                let rowBorder = 'border-zinc-800';

                if (isPeek || isHighlighted) {
                  rowBg = 'bg-green-900/30';
                  rowBorder = 'border-green-700';
                } else if (isExtracting) {
                  rowBg = 'bg-red-900/30';
                  rowBorder = 'border-red-700';
                } else if (isScanning) {
                  rowBg = 'bg-yellow-900/20';
                  rowBorder = 'border-yellow-700';
                } else if (targetPriority) {
                  rowBg = 'bg-blue-900/30';
                  rowBorder = 'border-blue-700';
                }

                return (
                  <div
                    key={priority}
                    className={`flex items-center gap-3 p-2 rounded border transition-all ${rowBg} ${rowBorder}`}
                  >
                    <div className="w-20 text-right text-sm text-zinc-400">
                      Priority {priority}:
                    </div>
                    <div className="flex items-center gap-1 flex-1">
                      {list.length === 0 ? (
                        <div className="text-zinc-600 text-xs italic">(empty)</div>
                      ) : (
                        list.map((item, idx) => {
                          const isItemHighlight = currentStep.highlightItem === item.id;
                          const isItemExtracting = currentStep.extractingItem === item.id;
                          const isItemPeek = currentStep.peekItem === item.id;

                          let itemBg = 'bg-zinc-800';
                          let itemBorder = 'border-zinc-700';

                          if (isItemPeek) {
                            itemBg = 'bg-green-900';
                            itemBorder = 'border-green-500';
                          } else if (isItemExtracting) {
                            itemBg = 'bg-red-900';
                            itemBorder = 'border-red-500';
                          } else if (isItemHighlight) {
                            itemBg = 'bg-blue-900';
                            itemBorder = 'border-blue-500';
                          }

                          return (
                            <div key={item.id} className="flex items-center">
                              <div
                                className={`px-3 py-1 border text-sm font-mono transition-all ${itemBg} ${itemBorder}`}
                              >
                                {item.val}
                              </div>
                              {idx < list.length - 1 && (
                                <span className="text-zinc-600 mx-1">→</span>
                              )}
                            </div>
                          );
                        })
                      )}
                      {list.length > 0 && (
                        <span className="text-zinc-600 text-xs ml-1">→ null</span>
                      )}
                    </div>
                  </div>
                );
              })}

              {/* Callout box */}
              <div className="mt-4 p-3 bg-zinc-900 border border-zinc-800 rounded text-xs text-zinc-500">
                <div className="font-bold text-zinc-400 mb-1">When to use LoL vs Heap:</div>
                <ul className="space-y-1">
                  <li>• LoL insert: O(K) — best when K (priority levels) is small</li>
                  <li>• LoL extractMax: O(K) scan</li>
                  <li>• Heap: O(log n) both — better when n &gt;&gt; K or K is unbounded</li>
                  <li>• LoL shines with bounded integer priorities (e.g., OS scheduling: 0–15)</li>
                </ul>
              </div>
            </div>
          )}
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
          <div className="w-52 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono p-3">
            <div className="text-zinc-600 text-[10px] tracking-widest uppercase mb-2 border-b border-zinc-800 pb-1">
              {mode === 'array' ? 'Array PQ Complexity' : 'LoL PQ Complexity'}
            </div>
            <table className="w-full">
              <thead>
                <tr className="text-zinc-500">
                  <th className="text-left font-normal pb-1">Op</th>
                  <th className="text-right font-normal pb-1">Time</th>
                </tr>
              </thead>
              <tbody className="text-zinc-600">
                {complexityData.map((row) => (
                  <tr key={row.op}>
                    <td className="py-[2px]">{row.op}</td>
                    <td className="text-right">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {mode === 'lol' && (
              <div className="mt-2 pt-2 border-t border-zinc-800 text-zinc-600 text-[10px]">
                K = number of priority levels ({maxPriority + 1})
              </div>
            )}
          </div>
        </div>

        {/* Message Bar */}
        <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 min-h-[36px]">
          {message || 'Select an operation'}
        </div>
      </div>

      {/* CSS */}
      <style>{`
        @keyframes shiftLeft {
          from { transform: translateX(10px); }
          to { transform: translateX(0); }
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
