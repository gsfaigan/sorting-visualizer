import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import PseudocodePanel from './PseudocodePanel';
import CallStackPanel from './CallStackPanel';
import CourseCallout from './CourseCallout';

// Modes
const modes = [
  { value: 'freeBuild', label: 'Free Build' },
  { value: 'traversals', label: 'Traversals' },
  { value: 'serialize', label: 'Serialize / Deserialize' },
  { value: 'maxDepth', label: 'Max Depth' },
  { value: 'allPaths', label: 'All Paths' },
];

// Pseudocode for each mode/algorithm (using { text, indent } format)
const pseudocodeMap = {
  preorder: [
    { text: 'visit(node):', indent: 0 },
    { text: 'output node', indent: 1 },
    { text: 'for each child in node.children:', indent: 1 },
    { text: 'visit(child)', indent: 2 },
  ],
  levelOrder: [
    { text: 'queue = [root]', indent: 0 },
    { text: 'while queue not empty:', indent: 0 },
    { text: 'node = queue.dequeue()', indent: 1 },
    { text: 'output node', indent: 1 },
    { text: 'for each child:', indent: 1 },
    { text: 'queue.enqueue(child)', indent: 2 },
  ],
  serialize: [
    { text: 'serialize(node):', indent: 0 },
    { text: 'result += node.val + " ["', indent: 1 },
    { text: 'for each child:', indent: 1 },
    { text: 'result += serialize(child)', indent: 2 },
    { text: 'result += "] "', indent: 1 },
  ],
  deserialize: [
    { text: 'deserialize(data):', indent: 0 },
    { text: 'parse token', indent: 1 },
    { text: 'if token is value:', indent: 1 },
    { text: 'create node', indent: 2 },
    { text: 'parse children recursively', indent: 2 },
    { text: 'return node', indent: 1 },
  ],
  maxDepth: [
    { text: 'maxDepth(node):', indent: 0 },
    { text: 'if node == null: return 0', indent: 1 },
    { text: 'max = 0', indent: 1 },
    { text: 'for each child:', indent: 1 },
    { text: 'max = Math.max(max, maxDepth(child))', indent: 2 },
    { text: 'return 1 + max', indent: 1 },
  ],
  allPaths: [
    { text: 'dfs(node, path):', indent: 0 },
    { text: 'path.push(node.val)', indent: 1 },
    { text: 'if node is leaf:', indent: 1 },
    { text: 'output path', indent: 2 },
    { text: 'for each child:', indent: 1 },
    { text: 'dfs(child, path)', indent: 2 },
    { text: 'path.pop()', indent: 1 },
  ],
};

// Node colors
const nodeColors = {
  idle: '#3f3f46',
  visiting: '#2563eb',
  sorted: '#22c55e',
  current: '#8b5cf6',
  path: '#ec4899',
  selected: '#3b82f6',
};

// Example tree structure
const createExampleTree = () => {
  const nodes = {
    'node-1': { id: 'node-1', val: 1, children: ['node-2', 'node-3', 'node-4'] },
    'node-2': { id: 'node-2', val: 2, children: ['node-5', 'node-6'] },
    'node-3': { id: 'node-3', val: 3, children: ['node-7'] },
    'node-4': { id: 'node-4', val: 4, children: ['node-8', 'node-9'] },
    'node-5': { id: 'node-5', val: 5, children: [] },
    'node-6': { id: 'node-6', val: 6, children: [] },
    'node-7': { id: 'node-7', val: 7, children: [] },
    'node-8': { id: 'node-8', val: 8, children: [] },
    'node-9': { id: 'node-9', val: 9, children: [] },
  };
  return { nodes, rootId: 'node-1', nextId: 10 };
};

// Layout N-ary tree
function layoutNaryTree(nodes, rootId) {
  if (!rootId || !nodes[rootId]) {
    return { positions: {}, width: 800, height: 400 };
  }

  const positions = {};
  let xIndex = 0;
  const nodeSpacing = 70;
  const levelHeight = 80;

  function assignPositions(nodeId, depth) {
    if (!nodeId || !nodes[nodeId]) return;

    const node = nodes[nodeId];
    const children = node.children || [];

    // Process children first (post-order for x positioning)
    for (const childId of children) {
      assignPositions(childId, depth + 1);
    }

    if (children.length === 0) {
      // Leaf node
      positions[nodeId] = {
        x: xIndex * nodeSpacing + 60,
        y: depth * levelHeight + 50,
      };
      xIndex++;
    } else {
      // Internal node: center above children
      const childXs = children.map(cid => positions[cid]?.x || 0);
      const minX = Math.min(...childXs);
      const maxX = Math.max(...childXs);
      positions[nodeId] = {
        x: (minX + maxX) / 2,
        y: depth * levelHeight + 50,
      };
    }
  }

  assignPositions(rootId, 0);

  const allX = Object.values(positions).map(p => p.x);
  const allY = Object.values(positions).map(p => p.y);
  const width = Math.max(800, Math.max(...allX) + 100);
  const height = Math.max(400, Math.max(...allY) + 100);

  return { positions, width, height };
}

export default function NaryTreeVisualizer({ onBack }) {
  const [mode, setMode] = useState('freeBuild');
  const [treeState, setTreeState] = useState(createExampleTree);
  const [maxChildren, setMaxChildren] = useState(3);
  const [selectedNode, setSelectedNode] = useState(null);
  const [nodeStates, setNodeStates] = useState({});
  const [highlightLine, setHighlightLine] = useState(-1);
  const [callStack, setCallStack] = useState([]);
  const [traversalSequence, setTraversalSequence] = useState([]);
  const [bfsQueue, setBfsQueue] = useState([]);
  const [foundPaths, setFoundPaths] = useState([]);
  const [resultText, setResultText] = useState('');
  const [depthBadges, setDepthBadges] = useState({});
  const [highlightedPath, setHighlightedPath] = useState([]);

  // Traversal sub-mode
  const [traversalType, setTraversalType] = useState('preorder');

  // Serialize mode
  const [serializedString, setSerializedString] = useState('');
  const [serializeInput, setSerializeInput] = useState('1 [2 [5 [] 6 []] 3 [7 []] 4 [8 [] 9 []]]');
  const [serializeMode, setSerializeMode] = useState('serialize'); // 'serialize' or 'deserialize'
  const [parsingCursor, setParsingCursor] = useState(-1);

  // Add child input
  const [newChildVal, setNewChildVal] = useState('');
  const [editVal, setEditVal] = useState('');

  const { nodes, rootId, nextId } = treeState;
  const { positions, width, height } = useMemo(
    () => layoutNaryTree(nodes, rootId),
    [nodes, rootId]
  );

  const resetVisualization = useCallback(() => {
    setNodeStates({});
    setHighlightLine(-1);
    setCallStack([]);
    setTraversalSequence([]);
    setBfsQueue([]);
    setFoundPaths([]);
    setResultText('');
    setDepthBadges({});
    setHighlightedPath([]);
    setSerializedString('');
    setParsingCursor(-1);
  }, []);

  // Generate steps based on mode
  const generateSteps = useCallback(() => {
    const steps = [];
    let frameId = 0;

    const addStep = (updates) => {
      steps.push({
        nodeStates: { ...updates.nodeStates },
        highlightLine: updates.highlightLine ?? -1,
        callStack: updates.callStack ? [...updates.callStack] : [],
        traversalSequence: updates.traversalSequence ? [...updates.traversalSequence] : [],
        bfsQueue: updates.bfsQueue ? [...updates.bfsQueue] : [],
        foundPaths: updates.foundPaths ? updates.foundPaths.map(p => [...p]) : [],
        resultText: updates.resultText || '',
        depthBadges: updates.depthBadges ? { ...updates.depthBadges } : {},
        highlightedPath: updates.highlightedPath ? [...updates.highlightedPath] : [],
        serializedString: updates.serializedString || '',
        parsingCursor: updates.parsingCursor ?? -1,
      });
    };

    if (!rootId || !nodes[rootId]) {
      addStep({ nodeStates: {} });
      return steps;
    }

    // Traversals mode
    if (mode === 'traversals') {
      if (traversalType === 'preorder') {
        const states = {};
        const sequence = [];
        const stack = [];

        function preorder(nodeId) {
          if (!nodeId || !nodes[nodeId]) return;
          const node = nodes[nodeId];

          stack.push({ id: frameId++, func: 'visit', args: `${node.val}` });
          states[nodeId] = 'visiting';
          addStep({ nodeStates: states, highlightLine: 0, callStack: stack, traversalSequence: sequence });

          sequence.push(node.val);
          states[nodeId] = 'sorted';
          addStep({ nodeStates: states, highlightLine: 1, callStack: stack, traversalSequence: sequence });

          for (let i = 0; i < node.children.length; i++) {
            addStep({ nodeStates: states, highlightLine: 2, callStack: stack, traversalSequence: sequence });
            preorder(node.children[i]);
          }

          stack.pop();
        }

        preorder(rootId);
        addStep({ nodeStates: states, highlightLine: -1, callStack: [], traversalSequence: sequence, resultText: `Preorder: [${sequence.join(', ')}]` });
      } else {
        // Level Order (BFS)
        const states = {};
        const sequence = [];
        const queue = [rootId];

        addStep({ nodeStates: states, highlightLine: 0, bfsQueue: queue.map(id => nodes[id]?.val), traversalSequence: sequence });

        while (queue.length > 0) {
          addStep({ nodeStates: states, highlightLine: 1, bfsQueue: queue.map(id => nodes[id]?.val), traversalSequence: sequence });

          const nodeId = queue.shift();
          const node = nodes[nodeId];
          states[nodeId] = 'visiting';
          addStep({ nodeStates: states, highlightLine: 2, bfsQueue: queue.map(id => nodes[id]?.val), traversalSequence: sequence });

          sequence.push(node.val);
          states[nodeId] = 'sorted';
          addStep({ nodeStates: states, highlightLine: 3, bfsQueue: queue.map(id => nodes[id]?.val), traversalSequence: sequence });

          for (const childId of node.children) {
            queue.push(childId);
            addStep({ nodeStates: states, highlightLine: 5, bfsQueue: queue.map(id => nodes[id]?.val), traversalSequence: sequence });
          }
        }

        addStep({ nodeStates: states, highlightLine: -1, bfsQueue: [], traversalSequence: sequence, resultText: `Level Order: [${sequence.join(', ')}]` });
      }
    }

    // Serialize mode
    else if (mode === 'serialize') {
      if (serializeMode === 'serialize') {
        const states = {};
        let output = '';
        const stack = [];

        function serialize(nodeId) {
          if (!nodeId || !nodes[nodeId]) return;
          const node = nodes[nodeId];

          stack.push({ id: frameId++, func: 'serialize', args: `${node.val}` });
          states[nodeId] = 'visiting';
          output += node.val + ' [';
          addStep({ nodeStates: states, highlightLine: 1, callStack: stack, serializedString: output });

          for (const childId of node.children) {
            addStep({ nodeStates: states, highlightLine: 2, callStack: stack, serializedString: output });
            serialize(childId);
          }

          output += '] ';
          states[nodeId] = 'sorted';
          addStep({ nodeStates: states, highlightLine: 4, callStack: stack, serializedString: output });
          stack.pop();
        }

        serialize(rootId);
        addStep({ nodeStates: states, highlightLine: -1, callStack: [], serializedString: output.trim(), resultText: 'Serialization complete!' });
      } else {
        // Deserialize animation
        const input = serializeInput.trim();
        const states = {};

        // Simple parsing animation - show cursor moving through string
        for (let i = 0; i <= input.length; i++) {
          addStep({ nodeStates: states, highlightLine: 1, parsingCursor: i, serializedString: input });
        }

        addStep({ nodeStates: states, highlightLine: -1, parsingCursor: -1, serializedString: input, resultText: 'Deserialization complete!' });
      }
    }

    // Max Depth mode
    else if (mode === 'maxDepth') {
      const states = {};
      const badges = {};
      const stack = [];

      function maxDepthRec(nodeId) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'maxDepth', args: 'null', returning: true, returnVal: '0' });
          addStep({ nodeStates: states, highlightLine: 1, callStack: stack, depthBadges: badges });
          stack.pop();
          return 0;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'maxDepth', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep({ nodeStates: states, highlightLine: 0, callStack: stack, depthBadges: badges });

        let maxD = 0;
        addStep({ nodeStates: states, highlightLine: 2, callStack: stack, depthBadges: badges });

        for (const childId of node.children) {
          addStep({ nodeStates: states, highlightLine: 3, callStack: stack, depthBadges: badges });
          const childDepth = maxDepthRec(childId);
          maxD = Math.max(maxD, childDepth);
          addStep({ nodeStates: states, highlightLine: 4, callStack: stack, depthBadges: badges });
        }

        const result = 1 + maxD;
        badges[nodeId] = result;
        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result.toString();
        states[nodeId] = 'sorted';
        addStep({ nodeStates: states, highlightLine: 5, callStack: stack, depthBadges: badges });
        stack.pop();
        return result;
      }

      const finalDepth = maxDepthRec(rootId);
      addStep({ nodeStates: states, highlightLine: -1, callStack: [], depthBadges: badges, resultText: `Max Depth: ${finalDepth}` });
    }

    // All Paths mode
    else if (mode === 'allPaths') {
      const states = {};
      const paths = [];
      const currentPath = [];
      const stack = [];

      function dfs(nodeId) {
        if (!nodeId || !nodes[nodeId]) return;
        const node = nodes[nodeId];

        stack.push({ id: frameId++, func: 'dfs', args: `${node.val}` });
        currentPath.push(nodeId);
        states[nodeId] = 'path';
        addStep({ nodeStates: states, highlightLine: 1, callStack: stack, foundPaths: paths, highlightedPath: currentPath });

        const isLeaf = node.children.length === 0;
        if (isLeaf) {
          const pathVals = currentPath.map(id => nodes[id].val);
          paths.push([...pathVals]);
          currentPath.forEach(id => { states[id] = 'sorted'; });
          addStep({ nodeStates: states, highlightLine: 3, callStack: stack, foundPaths: paths, highlightedPath: currentPath });
        }

        for (const childId of node.children) {
          addStep({ nodeStates: states, highlightLine: 4, callStack: stack, foundPaths: paths, highlightedPath: currentPath });
          dfs(childId);
        }

        states[nodeId] = 'idle';
        currentPath.pop();
        addStep({ nodeStates: states, highlightLine: 6, callStack: stack, foundPaths: paths, highlightedPath: currentPath });
        stack.pop();
      }

      dfs(rootId);
      addStep({ nodeStates: states, highlightLine: -1, callStack: [], foundPaths: paths, highlightedPath: [], resultText: `Found ${paths.length} path(s)` });
    }

    return steps;
  }, [mode, nodes, rootId, traversalType, serializeMode, serializeInput]);

  const steps = useMemo(() => generateSteps(), [generateSteps]);

  const applyStep = useCallback((step) => {
    if (!step) return;
    setNodeStates(step.nodeStates || {});
    setHighlightLine(step.highlightLine ?? -1);
    setCallStack(step.callStack || []);
    setTraversalSequence(step.traversalSequence || []);
    setBfsQueue(step.bfsQueue || []);
    setFoundPaths(step.foundPaths || []);
    setResultText(step.resultText || '');
    setDepthBadges(step.depthBadges || {});
    setHighlightedPath(step.highlightedPath || []);
    setSerializedString(step.serializedString || '');
    setParsingCursor(step.parsingCursor ?? -1);
  }, []);

  // Custom animator state
  const [currentStep, setCurrentStep] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1000);
  const intervalRef = useRef(null);

  // Apply step when currentStep changes
  useEffect(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      applyStep(steps[currentStep]);
    }
  }, [currentStep, steps, applyStep]);

  const play = useCallback(() => {
    if (steps.length === 0) return;

    setIsPlaying(true);
    let startIdx = currentStep < 0 || currentStep >= steps.length - 1 ? 0 : currentStep;
    setCurrentStep(startIdx);

    if (intervalRef.current) clearInterval(intervalRef.current);

    let idx = startIdx;
    intervalRef.current = setInterval(() => {
      idx++;
      if (idx >= steps.length) {
        clearInterval(intervalRef.current);
        setIsPlaying(false);
        return;
      }
      setCurrentStep(idx);
    }, speed);
  }, [steps, currentStep, speed]);

  const pause = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
  }, []);

  const reset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(-1);
    resetVisualization();
  }, [resetVisualization]);

  const stepForward = useCallback(() => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, steps.length]);

  const stepBackward = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Free Build handlers
  const handleAddChild = () => {
    if (!selectedNode || !newChildVal) return;
    const parent = nodes[selectedNode];
    if (!parent || parent.children.length >= maxChildren) return;

    const newId = `node-${nextId}`;
    const newNodes = {
      ...nodes,
      [selectedNode]: { ...parent, children: [...parent.children, newId] },
      [newId]: { id: newId, val: parseInt(newChildVal) || newChildVal, children: [] },
    };

    setTreeState({ nodes: newNodes, rootId, nextId: nextId + 1 });
    setNewChildVal('');
  };

  const handleDeleteNode = (nodeId) => {
    if (nodeId === rootId) {
      setTreeState({ nodes: {}, rootId: null, nextId: 1 });
      setSelectedNode(null);
      return;
    }

    // Find parent and remove this node
    const newNodes = { ...nodes };
    let parentId = null;

    for (const [id, node] of Object.entries(nodes)) {
      if (node.children.includes(nodeId)) {
        parentId = id;
        break;
      }
    }

    if (parentId) {
      newNodes[parentId] = {
        ...newNodes[parentId],
        children: newNodes[parentId].children.filter(c => c !== nodeId),
      };
    }

    // Remove node and all descendants
    const toRemove = [nodeId];
    while (toRemove.length > 0) {
      const curr = toRemove.pop();
      if (newNodes[curr]) {
        toRemove.push(...newNodes[curr].children);
        delete newNodes[curr];
      }
    }

    setTreeState({ nodes: newNodes, rootId, nextId });
    setSelectedNode(null);
  };

  const handleEditValue = () => {
    if (!selectedNode || !editVal) return;
    const newNodes = {
      ...nodes,
      [selectedNode]: { ...nodes[selectedNode], val: parseInt(editVal) || editVal },
    };
    setTreeState({ nodes: newNodes, rootId, nextId });
    setEditVal('');
  };

  const handleClearTree = () => {
    setTreeState({ nodes: {}, rootId: null, nextId: 1 });
    setSelectedNode(null);
    resetVisualization();
  };

  const handleLoadExample = () => {
    setTreeState(createExampleTree());
    setSelectedNode(null);
    resetVisualization();
  };

  const handleModeChange = useCallback((newMode) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(-1);
    setMode(newMode);
    resetVisualization();
    setSelectedNode(null);
  }, [resetVisualization]);

  // Get pseudocode for current mode
  const getPseudocode = () => {
    if (mode === 'traversals') {
      return pseudocodeMap[traversalType] || [];
    }
    if (mode === 'serialize') {
      return pseudocodeMap[serializeMode] || [];
    }
    if (mode === 'maxDepth') {
      return pseudocodeMap.maxDepth;
    }
    if (mode === 'allPaths') {
      return pseudocodeMap.allPaths;
    }
    return [];
  };

  // Render tree node
  const renderNode = (nodeId, pos) => {
    const node = nodes[nodeId];
    if (!node || !pos) return null;

    const state = nodeStates[nodeId] || 'idle';
    const isSelected = selectedNode === nodeId;
    const isInPath = highlightedPath.includes(nodeId);
    const color = isInPath ? nodeColors.path : nodeColors[state] || nodeColors.idle;
    const depthBadge = depthBadges[nodeId];

    return (
      <g key={nodeId}>
        {/* Edges to children */}
        {node.children.map((childId) => {
          const childPos = positions[childId];
          if (!childPos) return null;
          return (
            <line
              key={`${nodeId}-${childId}`}
              x1={pos.x}
              y1={pos.y}
              x2={childPos.x}
              y2={childPos.y}
              stroke="#52525b"
              strokeWidth="2"
            />
          );
        })}
        {/* Node circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r="24"
          fill={color}
          stroke={isSelected ? '#3b82f6' : '#71717a'}
          strokeWidth={isSelected ? '3' : '2'}
          strokeDasharray={isSelected ? '5,3' : 'none'}
          className="cursor-pointer transition-all duration-200"
          onClick={() => mode === 'freeBuild' && setSelectedNode(nodeId)}
        />
        {/* Value */}
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
          className="pointer-events-none"
        >
          {node.val}
        </text>
        {/* Depth badge */}
        {depthBadge !== undefined && (
          <g>
            <circle cx={pos.x + 20} cy={pos.y - 20} r="12" fill="#22c55e" />
            <text x={pos.x + 20} y={pos.y - 16} textAnchor="middle" fill="white" fontSize="10" fontWeight="bold">
              {depthBadge}
            </text>
          </g>
        )}
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
        <div className="px-4 py-2 text-zinc-400 text-sm">N-ary Tree Visualizer</div>
      </div>

      {/* Mode tabs */}
      <div className="flex border-b border-zinc-800 bg-zinc-950">
        {modes.map((m) => (
          <button
            key={m.value}
            onClick={() => handleModeChange(m.value)}
            className={`px-4 py-2 text-sm transition-colors ${
              mode === m.value
                ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
                : 'text-zinc-400 hover:bg-zinc-900'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* Controls based on mode */}
      <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-4 flex-wrap">
        {mode === 'freeBuild' && (
          <>
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400">Max children N:</span>
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  onClick={() => setMaxChildren(n)}
                  className={`px-2 py-1 text-xs ${
                    maxChildren === n ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <button
              onClick={handleClearTree}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm"
            >
              Clear tree
            </button>
            <button
              onClick={handleLoadExample}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm"
            >
              Load example tree
            </button>
          </>
        )}

        {mode === 'traversals' && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setTraversalType('preorder'); reset(); }}
                className={`px-3 py-1 text-sm ${
                  traversalType === 'preorder' ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Preorder
              </button>
              <button
                onClick={() => { setTraversalType('levelOrder'); reset(); }}
                className={`px-3 py-1 text-sm ${
                  traversalType === 'levelOrder' ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Level Order (BFS)
              </button>
            </div>
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={stepBackward} disabled={isPlaying || currentStep === 0} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm">&lt;</button>
              <button onClick={isPlaying ? pause : play} disabled={steps.length === 0} className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm min-w-[80px]">{isPlaying ? 'Pause' : 'Play'}</button>
              <button onClick={stepForward} disabled={isPlaying || currentStep >= steps.length - 1} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm">&gt;</button>
              <button onClick={reset} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm">Reset</button>
              <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm">
                <option value={2000}>0.5x</option>
                <option value={1000}>1x</option>
                <option value={500}>2x</option>
                <option value={250}>4x</option>
              </select>
            </div>
          </>
        )}

        {mode === 'serialize' && (
          <>
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setSerializeMode('serialize'); reset(); }}
                className={`px-3 py-1 text-sm ${
                  serializeMode === 'serialize' ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Serialize
              </button>
              <button
                onClick={() => { setSerializeMode('deserialize'); reset(); }}
                className={`px-3 py-1 text-sm ${
                  serializeMode === 'deserialize' ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                Deserialize
              </button>
            </div>
            {serializeMode === 'deserialize' && (
              <input
                type="text"
                value={serializeInput}
                onChange={(e) => setSerializeInput(e.target.value)}
                className="flex-1 max-w-md px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm font-mono"
                placeholder="Enter serialized string..."
              />
            )}
            <div className="flex items-center gap-2 ml-auto">
              <button onClick={stepBackward} disabled={isPlaying || currentStep === 0} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm">&lt;</button>
              <button onClick={isPlaying ? pause : play} disabled={steps.length === 0} className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm min-w-[80px]">{isPlaying ? 'Pause' : 'Play'}</button>
              <button onClick={stepForward} disabled={isPlaying || currentStep >= steps.length - 1} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm">&gt;</button>
              <button onClick={reset} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm">Reset</button>
            </div>
          </>
        )}

        {(mode === 'maxDepth' || mode === 'allPaths') && (
          <div className="flex items-center gap-2 ml-auto">
            <button onClick={stepBackward} disabled={isPlaying || currentStep === 0} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm">&lt;</button>
            <button onClick={isPlaying ? pause : play} disabled={steps.length === 0} className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm min-w-[80px]">{isPlaying ? 'Pause' : 'Play'}</button>
            <button onClick={stepForward} disabled={isPlaying || currentStep >= steps.length - 1} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm">&gt;</button>
            <button onClick={reset} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm">Reset</button>
            <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))} className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm">
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        )}
      </div>

      {/* Result banner */}
      {resultText && (
        <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-center">
          <span className="text-green-400 font-mono">{resultText}</span>
        </div>
      )}

      {/* Course Notes Callout */}
      <div className="px-4 pt-2">
        <CourseCallout title="N-ary Tree Fundamentals" storageKey="narytree">
{`N-ary tree: each node can have any number of children

C++ representation:
struct Node {
  T val;
  vector<Node*> children;
};

Traversals: Preorder (DFS) and Level-order (BFS)
Applications: File systems, DOM trees, organization charts`}
        </CourseCallout>
      </div>

      {/* Main content */}
      <div className="flex-1 flex">
        {/* Tree visualization */}
        <div className="flex-1 flex flex-col relative">
          {/* Traversal sequence strip */}
          {mode === 'traversals' && traversalSequence.length > 0 && (
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <div className="text-xs text-zinc-500 mb-1">Visited:</div>
              <div className="flex gap-1 flex-wrap">
                {traversalSequence.map((val, i) => (
                  <div key={i} className="w-8 h-8 bg-green-600 flex items-center justify-center text-sm font-mono">
                    {val}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* BFS Queue strip */}
          {mode === 'traversals' && traversalType === 'levelOrder' && bfsQueue.length > 0 && (
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <div className="text-xs text-zinc-500 mb-1">Queue:</div>
              <div className="flex gap-1">
                {bfsQueue.map((val, i) => (
                  <div key={i} className="w-8 h-8 bg-blue-600 flex items-center justify-center text-sm font-mono">
                    {val}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Serialized string display */}
          {mode === 'serialize' && serializedString && (
            <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800">
              <div className="text-xs text-zinc-500 mb-1">{serializeMode === 'serialize' ? 'Output:' : 'Parsing:'}</div>
              <div className="font-mono text-sm text-green-400 break-all">
                {serializeMode === 'deserialize' && parsingCursor >= 0 ? (
                  <>
                    <span>{serializedString.slice(0, parsingCursor)}</span>
                    <span className="bg-yellow-500 text-black">{serializedString[parsingCursor] || ''}</span>
                    <span className="text-zinc-500">{serializedString.slice(parsingCursor + 1)}</span>
                  </>
                ) : (
                  serializedString
                )}
              </div>
            </div>
          )}

          {/* SVG Tree */}
          <div className="flex-1 overflow-auto p-4">
            <svg width={width} height={height} className="mx-auto">
              {Object.keys(nodes).map((nodeId) => renderNode(nodeId, positions[nodeId]))}
            </svg>
          </div>

          {/* Selected node popover (Free Build mode) */}
          {mode === 'freeBuild' && selectedNode && nodes[selectedNode] && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-zinc-900 border border-zinc-700 p-4 shadow-lg z-10">
              <div className="text-sm text-zinc-400 mb-3">Node: {nodes[selectedNode].val}</div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newChildVal}
                    onChange={(e) => setNewChildVal(e.target.value)}
                    placeholder="Value"
                    className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
                  />
                  <button
                    onClick={handleAddChild}
                    disabled={nodes[selectedNode].children.length >= maxChildren}
                    className="px-3 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-sm"
                  >
                    Add child
                  </button>
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    placeholder="New value"
                    className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
                  />
                  <button
                    onClick={handleEditValue}
                    className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-sm"
                  >
                    Edit value
                  </button>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDeleteNode(selectedNode)}
                    className="px-3 py-1 bg-red-600 hover:bg-red-500 text-sm"
                  >
                    Delete node
                  </button>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="px-3 py-1 bg-zinc-700 hover:bg-zinc-600 text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right panels */}
        {mode !== 'freeBuild' && (
          <div className="w-[350px] flex flex-col border-l border-zinc-800">
            {/* Pseudocode panel */}
            <div className="flex-1 border-b border-zinc-800 overflow-auto">
              <PseudocodePanel lines={getPseudocode()} activeLine={highlightLine} title={mode} />
            </div>

            {/* Call stack panel */}
            {(mode === 'maxDepth' || mode === 'allPaths' || mode === 'serialize' || mode === 'traversals') && (
              <div className="h-48">
                <CallStackPanel frames={callStack} />
              </div>
            )}

            {/* Found paths panel (All Paths mode) */}
            {mode === 'allPaths' && foundPaths.length > 0 && (
              <div className="border-t border-zinc-800 p-3">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Found Paths</div>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {foundPaths.map((path, i) => (
                    <div key={i} className="text-sm text-green-400 font-mono">
                      [{path.join(' -> ')}]
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Progress bar */}
      {mode !== 'freeBuild' && (
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: steps.length > 0 ? `${((currentStep + 1) / steps.length) * 100}%` : '0%' }}
          />
        </div>
      )}

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
