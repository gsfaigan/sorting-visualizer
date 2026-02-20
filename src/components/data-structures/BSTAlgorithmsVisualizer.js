import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { layoutTree, buildTreeFromValues } from '../../utils/treeLayout';
import CallStackPanel from '../shared/CallStackPanel';
import PseudocodePanel from '../shared/PseudocodePanel';
import CourseCallout from '../shared/CourseCallout';

// Algorithm list
const bstAlgoList = [
  { value: 'maxDepth', label: 'Max Depth' },
  { value: 'isBalanced', label: 'Is Balanced' },
  { value: 'isSameTree', label: 'Is Same Tree' },
  { value: 'isSymmetric', label: 'Is Symmetric' },
  { value: 'invertTree', label: 'Invert Tree' },
  { value: 'lca', label: 'Lowest Common Ancestor' },
  { value: 'hasPathSum', label: 'Has Path Sum' },
  { value: 'pathSum', label: 'All Path Sums' },
  { value: 'diameter', label: 'Diameter of Binary Tree' },
  { value: 'isValidBST', label: 'Validate BST' },
  { value: 'kthSmallest', label: 'Kth Smallest' },
  { value: 'rightSideView', label: 'Right Side View' },
  { value: 'zigzagLevelOrder', label: 'Zigzag Level Order' },
  { value: 'flatten', label: 'Flatten to Linked List' },
  { value: 'buildTree', label: 'Build Tree (pre+in)' },
];

// Pseudocode for each algorithm (using { text, indent } format for PseudocodePanel)
const pseudocodeMap = {
  maxDepth: [
    { text: 'function maxDepth(node):', indent: 0 },
    { text: 'if node is null:', indent: 1 },
    { text: 'return 0', indent: 2 },
    { text: 'leftDepth = maxDepth(node.left)', indent: 1 },
    { text: 'rightDepth = maxDepth(node.right)', indent: 1 },
    { text: 'return 1 + max(leftDepth, rightDepth)', indent: 1 },
  ],
  isBalanced: [
    { text: 'function isBalanced(node):', indent: 0 },
    { text: 'if node is null:', indent: 1 },
    { text: 'return true', indent: 2 },
    { text: 'leftHeight = height(node.left)', indent: 1 },
    { text: 'rightHeight = height(node.right)', indent: 1 },
    { text: 'if |leftHeight - rightHeight| > 1:', indent: 1 },
    { text: 'return false', indent: 2 },
    { text: 'return isBalanced(left) && isBalanced(right)', indent: 1 },
  ],
  isSameTree: [
    { text: 'function isSameTree(p, q):', indent: 0 },
    { text: 'if p is null and q is null:', indent: 1 },
    { text: 'return true', indent: 2 },
    { text: 'if p is null or q is null:', indent: 1 },
    { text: 'return false', indent: 2 },
    { text: 'if p.val != q.val:', indent: 1 },
    { text: 'return false', indent: 2 },
    { text: 'return isSameTree(p.left, q.left) &&', indent: 1 },
    { text: '       isSameTree(p.right, q.right)', indent: 1 },
  ],
  isSymmetric: [
    { text: 'function isSymmetric(root):', indent: 0 },
    { text: 'return isMirror(root.left, root.right)', indent: 1 },
    { text: '', indent: 0 },
    { text: 'function isMirror(t1, t2):', indent: 0 },
    { text: 'if t1 is null and t2 is null:', indent: 1 },
    { text: 'return true', indent: 2 },
    { text: 'if t1 is null or t2 is null:', indent: 1 },
    { text: 'return false', indent: 2 },
    { text: 'return t1.val == t2.val &&', indent: 1 },
    { text: '       isMirror(t1.left, t2.right) &&', indent: 1 },
    { text: '       isMirror(t1.right, t2.left)', indent: 1 },
  ],
  invertTree: [
    { text: 'function invertTree(node):', indent: 0 },
    { text: 'if node is null:', indent: 1 },
    { text: 'return null', indent: 2 },
    { text: 'temp = node.left', indent: 1 },
    { text: 'node.left = invertTree(node.right)', indent: 1 },
    { text: 'node.right = invertTree(temp)', indent: 1 },
    { text: 'return node', indent: 1 },
  ],
  lca: [
    { text: 'function lca(root, p, q):', indent: 0 },
    { text: 'if root is null:', indent: 1 },
    { text: 'return null', indent: 2 },
    { text: 'if root == p or root == q:', indent: 1 },
    { text: 'return root', indent: 2 },
    { text: 'left = lca(root.left, p, q)', indent: 1 },
    { text: 'right = lca(root.right, p, q)', indent: 1 },
    { text: 'if left != null and right != null:', indent: 1 },
    { text: 'return root', indent: 2 },
    { text: 'return left != null ? left : right', indent: 1 },
  ],
  hasPathSum: [
    { text: 'function hasPathSum(node, targetSum):', indent: 0 },
    { text: 'if node is null:', indent: 1 },
    { text: 'return false', indent: 2 },
    { text: 'targetSum -= node.val', indent: 1 },
    { text: 'if node is leaf and targetSum == 0:', indent: 1 },
    { text: 'return true', indent: 2 },
    { text: 'return hasPathSum(node.left, targetSum) ||', indent: 1 },
    { text: '       hasPathSum(node.right, targetSum)', indent: 1 },
  ],
  pathSum: [
    { text: 'function pathSum(root, targetSum):', indent: 0 },
    { text: 'result = []', indent: 1 },
    { text: 'dfs(root, targetSum, [], result)', indent: 1 },
    { text: 'return result', indent: 1 },
    { text: '', indent: 0 },
    { text: 'function dfs(node, remain, path, result):', indent: 0 },
    { text: 'if node is null: return', indent: 1 },
    { text: 'path.push(node.val)', indent: 1 },
    { text: 'if node is leaf and remain == node.val:', indent: 1 },
    { text: 'result.push(copy of path)', indent: 2 },
    { text: 'dfs(node.left, remain - node.val, path, result)', indent: 1 },
    { text: 'dfs(node.right, remain - node.val, path, result)', indent: 1 },
    { text: 'path.pop()', indent: 1 },
  ],
  diameter: [
    { text: 'function diameter(root):', indent: 0 },
    { text: 'maxDiam = 0', indent: 1 },
    { text: 'height(root)', indent: 1 },
    { text: 'return maxDiam', indent: 1 },
    { text: '', indent: 0 },
    { text: 'function height(node):', indent: 0 },
    { text: 'if node is null: return 0', indent: 1 },
    { text: 'leftH = height(node.left)', indent: 1 },
    { text: 'rightH = height(node.right)', indent: 1 },
    { text: 'maxDiam = max(maxDiam, leftH + rightH)', indent: 1 },
    { text: 'return 1 + max(leftH, rightH)', indent: 1 },
  ],
  isValidBST: [
    { text: 'function isValidBST(node, min, max):', indent: 0 },
    { text: 'if node is null:', indent: 1 },
    { text: 'return true', indent: 2 },
    { text: 'if node.val <= min or node.val >= max:', indent: 1 },
    { text: 'return false', indent: 2 },
    { text: 'return isValidBST(node.left, min, node.val) &&', indent: 1 },
    { text: '       isValidBST(node.right, node.val, max)', indent: 1 },
  ],
  kthSmallest: [
    { text: 'function kthSmallest(root, k):', indent: 0 },
    { text: 'count = 0, result = null', indent: 1 },
    { text: 'inorder(root)', indent: 1 },
    { text: 'return result', indent: 1 },
    { text: '', indent: 0 },
    { text: 'function inorder(node):', indent: 0 },
    { text: 'if node is null or result != null:', indent: 1 },
    { text: 'return', indent: 2 },
    { text: 'inorder(node.left)', indent: 1 },
    { text: 'count++', indent: 1 },
    { text: 'if count == k:', indent: 1 },
    { text: 'result = node.val; return', indent: 2 },
    { text: 'inorder(node.right)', indent: 1 },
  ],
  rightSideView: [
    { text: 'function rightSideView(root):', indent: 0 },
    { text: 'result = []', indent: 1 },
    { text: 'dfs(root, 0, result)', indent: 1 },
    { text: 'return result', indent: 1 },
    { text: '', indent: 0 },
    { text: 'function dfs(node, depth, result):', indent: 0 },
    { text: 'if node is null: return', indent: 1 },
    { text: 'if depth == result.length:', indent: 1 },
    { text: 'result.push(node.val)', indent: 2 },
    { text: 'dfs(node.right, depth + 1, result)', indent: 1 },
    { text: 'dfs(node.left, depth + 1, result)', indent: 1 },
  ],
  zigzagLevelOrder: [
    { text: 'function zigzagLevelOrder(root):', indent: 0 },
    { text: 'result = []', indent: 1 },
    { text: 'if root is null: return result', indent: 1 },
    { text: 'queue = [root]', indent: 1 },
    { text: 'leftToRight = true', indent: 1 },
    { text: 'while queue is not empty:', indent: 1 },
    { text: 'level = []', indent: 2 },
    { text: 'for each node in queue:', indent: 2 },
    { text: 'if leftToRight: add to end', indent: 3 },
    { text: 'else: add to front', indent: 3 },
    { text: 'add children to next level', indent: 3 },
    { text: 'result.push(level)', indent: 2 },
    { text: 'leftToRight = !leftToRight', indent: 2 },
    { text: 'return result', indent: 1 },
  ],
  flatten: [
    { text: 'function flatten(root):', indent: 0 },
    { text: 'if root is null: return', indent: 1 },
    { text: 'flatten(root.left)', indent: 1 },
    { text: 'flatten(root.right)', indent: 1 },
    { text: 'rightSubtree = root.right', indent: 1 },
    { text: 'root.right = root.left', indent: 1 },
    { text: 'root.left = null', indent: 1 },
    { text: 'current = root', indent: 1 },
    { text: 'while current.right != null:', indent: 1 },
    { text: 'current = current.right', indent: 2 },
    { text: 'current.right = rightSubtree', indent: 1 },
  ],
  buildTree: [
    { text: 'function buildTree(preorder, inorder):', indent: 0 },
    { text: 'if preorder is empty:', indent: 1 },
    { text: 'return null', indent: 2 },
    { text: 'root = new Node(preorder[0])', indent: 1 },
    { text: 'mid = indexOf(root.val in inorder)', indent: 1 },
    { text: 'root.left = buildTree(', indent: 1 },
    { text: '  preorder[1..mid+1], inorder[0..mid])', indent: 1 },
    { text: 'root.right = buildTree(', indent: 1 },
    { text: '  preorder[mid+1..], inorder[mid+1..])', indent: 1 },
    { text: 'return root', indent: 1 },
  ],
};

// Complexity info
const complexityMap = {
  maxDepth: { time: 'O(n)', space: 'O(h)' },
  isBalanced: { time: 'O(n)', space: 'O(h)' },
  isSameTree: { time: 'O(n)', space: 'O(h)' },
  isSymmetric: { time: 'O(n)', space: 'O(h)' },
  invertTree: { time: 'O(n)', space: 'O(h)' },
  lca: { time: 'O(n)', space: 'O(h)' },
  hasPathSum: { time: 'O(n)', space: 'O(h)' },
  pathSum: { time: 'O(n)', space: 'O(n)' },
  diameter: { time: 'O(n)', space: 'O(h)' },
  isValidBST: { time: 'O(n)', space: 'O(h)' },
  kthSmallest: { time: 'O(k)', space: 'O(h)' },
  rightSideView: { time: 'O(n)', space: 'O(h)' },
  zigzagLevelOrder: { time: 'O(n)', space: 'O(n)' },
  flatten: { time: 'O(n)', space: 'O(h)' },
  buildTree: { time: 'O(n)', space: 'O(n)' },
};

// Node colors
const nodeColors = {
  idle: '#3f3f46',
  visiting: '#2563eb',
  comparing: '#f59e0b',
  found: '#22c55e',
  current: '#8b5cf6',
  returning: '#eab308',
  path: '#ec4899',
  marked: '#06b6d4',
  invalid: '#ef4444',
};

// Default tree values
const defaultTreeValues = [50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 75];
const symmetricTreeValues = [50, 30, 70, 20, 40, 40, 20];

export default function BSTAlgorithmsVisualizer({ onBack }) {
  const [algorithm, setAlgorithm] = useState('maxDepth');
  const [treeState, setTreeState] = useState(() => buildTreeFromValues(defaultTreeValues));
  const [nodeStates, setNodeStates] = useState({});
  const [callStack, setCallStack] = useState([]);
  const [resultText, setResultText] = useState('');
  const [highlightLine, setHighlightLine] = useState(-1);
  const [highlightedPath, setHighlightedPath] = useState([]);
  const [secondTree, setSecondTree] = useState(null);

  // Algorithm-specific inputs
  const [lcaP, setLcaP] = useState(20);
  const [lcaQ, setLcaQ] = useState(40);
  const [targetSum, setTargetSum] = useState(100);
  const [kValue, setKValue] = useState(3);
  const [preorderInput, setPreorderInput] = useState('3,9,20,15,7');
  const [inorderInput, setInorderInput] = useState('9,3,15,20,7');

  const { nodes, rootId } = treeState;
  const { positions, width, height } = useMemo(
    () => layoutTree(nodes, rootId),
    [nodes, rootId]
  );

  // Second tree layout for isSameTree (reserved for future use)
  // eslint-disable-next-line no-unused-vars
  const secondTreeLayout = useMemo(() => {
    if (!secondTree) return { positions: {}, width: 0, height: 0 };
    return layoutTree(secondTree.nodes, secondTree.rootId);
  }, [secondTree]);

  const resetVisualization = useCallback(() => {
    setNodeStates({});
    setCallStack([]);
    setResultText('');
    setHighlightLine(-1);
    setHighlightedPath([]);
  }, []);

  // Generate steps for each algorithm
  const generateSteps = useCallback(() => {
    const steps = [];
    let frameId = 0;

    const addStep = (states, stack, result, line, path = []) => {
      steps.push({
        nodeStates: { ...states },
        callStack: [...stack],
        resultText: result,
        highlightLine: line,
        highlightedPath: [...path],
      });
    };

    // maxDepth algorithm
    if (algorithm === 'maxDepth') {
      const stack = [];
      const states = {};

      function maxDepthRec(nodeId, depth) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'maxDepth', args: 'null', returning: true, returnVal: '0' });
          addStep(states, stack, '', 2);
          stack.pop();
          return 0;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'maxDepth', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, '', 0);

        const leftD = maxDepthRec(node.left, depth + 1);
        states[nodeId] = 'comparing';
        addStep(states, stack, `leftDepth=${leftD}`, 3);

        const rightD = maxDepthRec(node.right, depth + 1);
        addStep(states, stack, `leftDepth=${leftD}, rightDepth=${rightD}`, 4);

        const result = 1 + Math.max(leftD, rightD);
        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result.toString();
        states[nodeId] = 'returning';
        addStep(states, stack, `return ${result}`, 5);

        stack.pop();
        states[nodeId] = 'found';
        return result;
      }

      const finalResult = maxDepthRec(rootId, 0);
      addStep(states, [], `Max Depth: ${finalResult}`, -1);
    }

    // isBalanced algorithm
    else if (algorithm === 'isBalanced') {
      const stack = [];
      const states = {};

      function getHeight(nodeId) {
        if (!nodeId || !nodes[nodeId]) return 0;
        const node = nodes[nodeId];
        const leftH = getHeight(node.left);
        const rightH = getHeight(node.right);
        return 1 + Math.max(leftH, rightH);
      }

      function isBalancedRec(nodeId) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'isBalanced', args: 'null', returning: true, returnVal: 'true' });
          addStep(states, stack, '', 2);
          stack.pop();
          return true;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'isBalanced', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, '', 0);

        const leftH = getHeight(node.left);
        const rightH = getHeight(node.right);
        addStep(states, stack, `leftH=${leftH}, rightH=${rightH}`, 4);

        if (Math.abs(leftH - rightH) > 1) {
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = 'false';
          states[nodeId] = 'invalid';
          addStep(states, stack, 'Unbalanced!', 6);
          stack.pop();
          return false;
        }

        states[nodeId] = 'comparing';
        const leftB = isBalancedRec(node.left);
        const rightB = isBalancedRec(node.right);
        const result = leftB && rightB;

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result.toString();
        states[nodeId] = result ? 'found' : 'invalid';
        addStep(states, stack, `return ${result}`, 7);
        stack.pop();
        return result;
      }

      const finalResult = isBalancedRec(rootId);
      addStep(states, [], `Is Balanced: ${finalResult}`, -1);
    }

    // isSameTree algorithm
    else if (algorithm === 'isSameTree') {
      const stack = [];
      const states = {};
      const tree2 = secondTree || buildTreeFromValues(defaultTreeValues);

      function isSameTreeRec(p, q) {
        const pNode = p && nodes[p] ? nodes[p] : null;
        const qNode = q && tree2.nodes[q] ? tree2.nodes[q] : null;

        if (!pNode && !qNode) {
          stack.push({ id: frameId++, func: 'isSameTree', args: 'null, null', returning: true, returnVal: 'true' });
          addStep(states, stack, '', 2);
          stack.pop();
          return true;
        }

        if (!pNode || !qNode) {
          stack.push({ id: frameId++, func: 'isSameTree', args: `${pNode?.val || 'null'}, ${qNode?.val || 'null'}`, returning: true, returnVal: 'false' });
          addStep(states, stack, 'One is null', 4);
          stack.pop();
          return false;
        }

        stack.push({ id: frameId++, func: 'isSameTree', args: `${pNode.val}, ${qNode.val}` });
        states[p] = 'visiting';
        addStep(states, stack, '', 0);

        if (pNode.val !== qNode.val) {
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = 'false';
          states[p] = 'invalid';
          addStep(states, stack, 'Values differ!', 6);
          stack.pop();
          return false;
        }

        states[p] = 'comparing';
        const leftSame = isSameTreeRec(pNode.left, qNode.left);
        const rightSame = isSameTreeRec(pNode.right, qNode.right);
        const result = leftSame && rightSame;

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result.toString();
        states[p] = result ? 'found' : 'invalid';
        addStep(states, stack, `return ${result}`, 8);
        stack.pop();
        return result;
      }

      const finalResult = isSameTreeRec(rootId, tree2.rootId);
      addStep(states, [], `Is Same Tree: ${finalResult}`, -1);
    }

    // isSymmetric algorithm
    else if (algorithm === 'isSymmetric') {
      const stack = [];
      const states = {};

      function isMirror(t1, t2) {
        const n1 = t1 && nodes[t1] ? nodes[t1] : null;
        const n2 = t2 && nodes[t2] ? nodes[t2] : null;

        if (!n1 && !n2) {
          stack.push({ id: frameId++, func: 'isMirror', args: 'null, null', returning: true, returnVal: 'true' });
          addStep(states, stack, '', 5);
          stack.pop();
          return true;
        }

        if (!n1 || !n2) {
          stack.push({ id: frameId++, func: 'isMirror', args: `${n1?.val || 'null'}, ${n2?.val || 'null'}`, returning: true, returnVal: 'false' });
          addStep(states, stack, '', 7);
          stack.pop();
          return false;
        }

        stack.push({ id: frameId++, func: 'isMirror', args: `${n1.val}, ${n2.val}` });
        states[t1] = 'visiting';
        states[t2] = 'comparing';
        addStep(states, stack, '', 3);

        if (n1.val !== n2.val) {
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = 'false';
          states[t1] = 'invalid';
          states[t2] = 'invalid';
          addStep(states, stack, 'Values differ!', 9);
          stack.pop();
          return false;
        }

        const r1 = isMirror(n1.left, n2.right);
        const r2 = isMirror(n1.right, n2.left);
        const result = r1 && r2;

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result.toString();
        states[t1] = result ? 'found' : 'invalid';
        states[t2] = result ? 'found' : 'invalid';
        addStep(states, stack, `return ${result}`, 10);
        stack.pop();
        return result;
      }

      stack.push({ id: frameId++, func: 'isSymmetric', args: 'root' });
      addStep(states, stack, '', 1);

      const rootNode = nodes[rootId];
      const finalResult = rootNode ? isMirror(rootNode.left, rootNode.right) : true;
      stack.pop();
      addStep(states, [], `Is Symmetric: ${finalResult}`, -1);
    }

    // invertTree algorithm
    else if (algorithm === 'invertTree') {
      const stack = [];
      const states = {};
      const newNodes = JSON.parse(JSON.stringify(nodes));

      function invertRec(nodeId) {
        if (!nodeId || !newNodes[nodeId]) {
          stack.push({ id: frameId++, func: 'invertTree', args: 'null', returning: true, returnVal: 'null' });
          addStep(states, stack, '', 2);
          stack.pop();
          return null;
        }

        const node = newNodes[nodeId];
        stack.push({ id: frameId++, func: 'invertTree', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, '', 0);

        // Swap children
        const temp = node.left;
        node.left = node.right;
        node.right = temp;
        states[nodeId] = 'comparing';
        addStep(states, stack, `Swapped children of ${node.val}`, 4);

        invertRec(node.left);
        invertRec(node.right);

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = node.val.toString();
        states[nodeId] = 'found';
        addStep(states, stack, '', 6);
        stack.pop();
        return node;
      }

      invertRec(rootId);
      // Final step: update the tree
      steps.push({
        nodeStates: states,
        callStack: [],
        resultText: 'Tree Inverted!',
        highlightLine: -1,
        highlightedPath: [],
        newNodes,
      });
    }

    // lca (Lowest Common Ancestor) algorithm
    else if (algorithm === 'lca') {
      const stack = [];
      const states = {};
      let pId = null, qId = null;

      // Find node IDs for p and q values
      Object.entries(nodes).forEach(([id, node]) => {
        if (node.val === lcaP) pId = id;
        if (node.val === lcaQ) qId = id;
      });

      if (pId) states[pId] = 'marked';
      if (qId) states[qId] = 'marked';
      addStep(states, stack, `Finding LCA of ${lcaP} and ${lcaQ}`, -1);

      function lcaRec(nodeId) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'lca', args: 'null', returning: true, returnVal: 'null' });
          addStep(states, stack, '', 2);
          stack.pop();
          return null;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'lca', args: `${node.val}` });
        states[nodeId] = states[nodeId] === 'marked' ? 'marked' : 'visiting';
        addStep(states, stack, '', 0);

        if (node.val === lcaP || node.val === lcaQ) {
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = node.val.toString();
          addStep(states, stack, `Found ${node.val}!`, 4);
          stack.pop();
          return nodeId;
        }

        states[nodeId] = 'comparing';
        const left = lcaRec(node.left);
        const right = lcaRec(node.right);

        let result = null;
        if (left && right) {
          result = nodeId;
          states[nodeId] = 'found';
          addStep(states, stack, `LCA found at ${node.val}!`, 8);
        } else {
          result = left || right;
        }

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result ? nodes[result].val.toString() : 'null';
        addStep(states, stack, '', 9);
        stack.pop();
        return result;
      }

      const lcaResult = lcaRec(rootId);
      const lcaVal = lcaResult ? nodes[lcaResult].val : 'null';
      addStep(states, [], `LCA of ${lcaP} and ${lcaQ}: ${lcaVal}`, -1);
    }

    // hasPathSum algorithm
    else if (algorithm === 'hasPathSum') {
      const stack = [];
      const states = {};
      const path = [];

      function hasPathSumRec(nodeId, remain) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'hasPathSum', args: `null, ${remain}`, returning: true, returnVal: 'false' });
          addStep(states, stack, '', 2, path);
          stack.pop();
          return false;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'hasPathSum', args: `${node.val}, ${remain}` });
        states[nodeId] = 'visiting';
        path.push(nodeId);
        addStep(states, stack, `Sum so far: ${targetSum - remain + node.val}`, 0, path);

        const newRemain = remain - node.val;
        const isLeaf = !node.left && !node.right;

        if (isLeaf && newRemain === 0) {
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = 'true';
          states[nodeId] = 'found';
          path.forEach(id => { states[id] = 'found'; });
          addStep(states, stack, `Path found! Sum = ${targetSum}`, 5, path);
          stack.pop();
          return true;
        }

        states[nodeId] = 'comparing';
        if (hasPathSumRec(node.left, newRemain)) {
          stack.pop();
          return true;
        }
        if (hasPathSumRec(node.right, newRemain)) {
          stack.pop();
          return true;
        }

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = 'false';
        states[nodeId] = 'returning';
        path.pop();
        addStep(states, stack, '', 7, path);
        stack.pop();
        return false;
      }

      const result = hasPathSumRec(rootId, targetSum);
      addStep(states, [], `Has Path Sum ${targetSum}: ${result}`, -1, result ? path : []);
    }

    // pathSum (all paths) algorithm
    else if (algorithm === 'pathSum') {
      const stack = [];
      const states = {};
      const allPaths = [];
      const currentPath = [];

      function dfs(nodeId, remain) {
        if (!nodeId || !nodes[nodeId]) return;

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'dfs', args: `${node.val}, ${remain}` });
        states[nodeId] = 'visiting';
        currentPath.push(nodeId);
        addStep(states, stack, `Path: [${currentPath.map(id => nodes[id].val).join(', ')}]`, 7, currentPath);

        const newRemain = remain - node.val;
        const isLeaf = !node.left && !node.right;

        if (isLeaf && newRemain === 0) {
          allPaths.push([...currentPath]);
          currentPath.forEach(id => { states[id] = 'found'; });
          addStep(states, stack, `Found path! [${currentPath.map(id => nodes[id].val).join(', ')}]`, 9, currentPath);
        }

        states[nodeId] = 'comparing';
        dfs(node.left, newRemain);
        dfs(node.right, newRemain);

        states[nodeId] = 'returning';
        currentPath.pop();
        addStep(states, stack, '', 12, currentPath);
        stack.pop();
      }

      stack.push({ id: frameId++, func: 'pathSum', args: `root, ${targetSum}` });
      addStep(states, stack, '', 0);
      dfs(rootId, targetSum);
      stack.pop();
      addStep(states, [], `Found ${allPaths.length} path(s) with sum ${targetSum}`, -1);
    }

    // diameter algorithm
    else if (algorithm === 'diameter') {
      const stack = [];
      const states = {};
      let maxDiam = 0;

      function heightRec(nodeId) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'height', args: 'null', returning: true, returnVal: '0' });
          addStep(states, stack, `maxDiam=${maxDiam}`, 7);
          stack.pop();
          return 0;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'height', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, '', 6);

        const leftH = heightRec(node.left);
        const rightH = heightRec(node.right);

        const diamAtNode = leftH + rightH;
        maxDiam = Math.max(maxDiam, diamAtNode);
        states[nodeId] = 'comparing';
        addStep(states, stack, `leftH=${leftH}, rightH=${rightH}, diam=${diamAtNode}, maxDiam=${maxDiam}`, 10);

        const h = 1 + Math.max(leftH, rightH);
        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = h.toString();
        states[nodeId] = 'found';
        addStep(states, stack, '', 11);
        stack.pop();
        return h;
      }

      stack.push({ id: frameId++, func: 'diameter', args: 'root' });
      addStep(states, stack, '', 0);
      heightRec(rootId);
      stack.pop();
      addStep(states, [], `Diameter: ${maxDiam}`, -1);
    }

    // isValidBST algorithm
    else if (algorithm === 'isValidBST') {
      const stack = [];
      const states = {};

      function isValidRec(nodeId, min, max) {
        if (!nodeId || !nodes[nodeId]) {
          stack.push({ id: frameId++, func: 'isValidBST', args: 'null', returning: true, returnVal: 'true' });
          addStep(states, stack, '', 2);
          stack.pop();
          return true;
        }

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'isValidBST', args: `${node.val}, ${min === -Infinity ? '-∞' : min}, ${max === Infinity ? '∞' : max}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, '', 0);

        if (node.val <= min || node.val >= max) {
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = 'false';
          states[nodeId] = 'invalid';
          addStep(states, stack, `${node.val} violates BST property!`, 4);
          stack.pop();
          return false;
        }

        states[nodeId] = 'comparing';
        const leftValid = isValidRec(node.left, min, node.val);
        if (!leftValid) {
          stack.pop();
          return false;
        }
        const rightValid = isValidRec(node.right, node.val, max);

        const result = leftValid && rightValid;
        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = result.toString();
        states[nodeId] = result ? 'found' : 'invalid';
        addStep(states, stack, '', 6);
        stack.pop();
        return result;
      }

      const result = isValidRec(rootId, -Infinity, Infinity);
      addStep(states, [], `Is Valid BST: ${result}`, -1);
    }

    // kthSmallest algorithm
    else if (algorithm === 'kthSmallest') {
      const stack = [];
      const states = {};
      let count = 0;
      let result = null;
      const visited = [];

      function inorderRec(nodeId) {
        if (!nodeId || !nodes[nodeId] || result !== null) return;

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'inorder', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, `count=${count}`, 6);

        inorderRec(node.left);

        if (result !== null) {
          stack.pop();
          return;
        }

        count++;
        visited.push(nodeId);
        states[nodeId] = 'comparing';
        addStep(states, stack, `count=${count}, k=${kValue}`, 10);

        if (count === kValue) {
          result = node.val;
          stack[stack.length - 1].returning = true;
          stack[stack.length - 1].returnVal = node.val.toString();
          states[nodeId] = 'found';
          addStep(states, stack, `Found ${kValue}th smallest: ${node.val}!`, 11);
          stack.pop();
          return;
        }

        inorderRec(node.right);

        if (stack.length > 0) {
          stack.pop();
        }
      }

      stack.push({ id: frameId++, func: 'kthSmallest', args: `root, ${kValue}` });
      addStep(states, stack, '', 0);
      inorderRec(rootId);
      stack.pop();
      addStep(states, [], result !== null ? `${kValue}th Smallest: ${result}` : `Tree has fewer than ${kValue} nodes`, -1);
    }

    // rightSideView algorithm
    else if (algorithm === 'rightSideView') {
      const stack = [];
      const states = {};
      const result = [];

      function dfs(nodeId, depth) {
        if (!nodeId || !nodes[nodeId]) return;

        const node = nodes[nodeId];
        stack.push({ id: frameId++, func: 'dfs', args: `${node.val}, depth=${depth}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, `result=[${result.join(', ')}]`, 5);

        if (depth === result.length) {
          result.push(node.val);
          states[nodeId] = 'found';
          addStep(states, stack, `Added ${node.val} (first at depth ${depth})`, 8);
        }

        // Visit right first
        dfs(node.right, depth + 1);
        dfs(node.left, depth + 1);

        stack.pop();
      }

      stack.push({ id: frameId++, func: 'rightSideView', args: 'root' });
      addStep(states, stack, '', 0);
      dfs(rootId, 0);
      stack.pop();
      addStep(states, [], `Right Side View: [${result.join(', ')}]`, -1);
    }

    // zigzagLevelOrder algorithm
    else if (algorithm === 'zigzagLevelOrder') {
      const states = {};
      const result = [];

      if (rootId && nodes[rootId]) {
        let queue = [rootId];
        let leftToRight = true;
        let levelNum = 0;

        while (queue.length > 0) {
          const level = [];
          const nextQueue = [];

          for (const nodeId of queue) {
            const node = nodes[nodeId];
            states[nodeId] = 'visiting';
            addStep(states, [], `Level ${levelNum}, direction: ${leftToRight ? 'L→R' : 'R→L'}`, 6);

            if (leftToRight) {
              level.push(node.val);
            } else {
              level.unshift(node.val);
            }

            if (node.left) nextQueue.push(node.left);
            if (node.right) nextQueue.push(node.right);
          }

          for (const nodeId of queue) {
            states[nodeId] = 'found';
          }
          result.push(level);
          addStep(states, [], `Level ${levelNum}: [${level.join(', ')}]`, 11);

          queue = nextQueue;
          leftToRight = !leftToRight;
          levelNum++;
        }
      }

      addStep(states, [], `Zigzag: [${result.map(l => `[${l.join(',')}]`).join(', ')}]`, -1);
    }

    // flatten algorithm
    else if (algorithm === 'flatten') {
      const stack = [];
      const states = {};
      const newNodes = JSON.parse(JSON.stringify(nodes));
      let head = null;
      let tail = null;

      function flattenRec(nodeId) {
        if (!nodeId || !newNodes[nodeId]) return;

        const node = newNodes[nodeId];
        stack.push({ id: frameId++, func: 'flatten', args: `${node.val}` });
        states[nodeId] = 'visiting';
        addStep(states, stack, '', 0);

        const rightChild = node.right;
        const leftChild = node.left;

        if (!head) {
          head = nodeId;
          tail = nodeId;
        } else {
          newNodes[tail].right = nodeId;
          tail = nodeId;
        }
        node.left = null;
        states[nodeId] = 'found';
        addStep(states, stack, `Linked ${node.val}`, 6);

        flattenRec(leftChild);
        flattenRec(rightChild);

        stack.pop();
      }

      flattenRec(rootId);

      // Build flattened representation
      let flatList = [];
      let curr = head;
      while (curr && newNodes[curr]) {
        flatList.push(newNodes[curr].val);
        curr = newNodes[curr].right;
      }

      addStep(states, [], `Flattened: ${flatList.join(' → ')}`, -1);
    }

    // buildTree algorithm
    else if (algorithm === 'buildTree') {
      const stack = [];
      const states = {};

      const preorder = preorderInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));
      const inorder = inorderInput.split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n));

      if (preorder.length === 0 || inorder.length === 0) {
        addStep(states, [], 'Invalid input arrays', -1);
        return steps;
      }

      const builtNodes = {};
      let nodeIdCounter = 1;

      function buildRec(preStart, preEnd, inStart, inEnd) {
        if (preStart > preEnd) {
          stack.push({ id: frameId++, func: 'buildTree', args: 'empty', returning: true, returnVal: 'null' });
          addStep(states, stack, '', 2);
          stack.pop();
          return null;
        }

        const rootVal = preorder[preStart];
        const newId = `built-${nodeIdCounter++}`;
        builtNodes[newId] = { id: newId, val: rootVal, left: null, right: null };

        stack.push({ id: frameId++, func: 'buildTree', args: `root=${rootVal}` });
        states[newId] = 'visiting';
        addStep(states, stack, `Creating node ${rootVal}`, 3);

        const inorderIdx = inorder.indexOf(rootVal);
        const leftSize = inorderIdx - inStart;

        states[newId] = 'comparing';
        addStep(states, stack, `Left size: ${leftSize}`, 4);

        const leftChild = buildRec(preStart + 1, preStart + leftSize, inStart, inorderIdx - 1);
        const rightChild = buildRec(preStart + leftSize + 1, preEnd, inorderIdx + 1, inEnd);

        builtNodes[newId].left = leftChild;
        builtNodes[newId].right = rightChild;

        stack[stack.length - 1].returning = true;
        stack[stack.length - 1].returnVal = rootVal.toString();
        states[newId] = 'found';
        addStep(states, stack, '', 10);
        stack.pop();
        return newId;
      }

      const builtRoot = buildRec(0, preorder.length - 1, 0, inorder.length - 1);

      steps.push({
        nodeStates: states,
        callStack: [],
        resultText: `Tree built from preorder [${preorder.join(',')}] and inorder [${inorder.join(',')}]`,
        highlightLine: -1,
        highlightedPath: [],
        builtTree: { nodes: builtNodes, rootId: builtRoot },
      });
    }

    return steps;
  }, [algorithm, nodes, rootId, secondTree, lcaP, lcaQ, targetSum, kValue, preorderInput, inorderInput]);

  const steps = useMemo(() => generateSteps(), [generateSteps]);

  const applyStep = useCallback((step) => {
    if (!step) return;
    setNodeStates(step.nodeStates || {});
    setCallStack(step.callStack || []);
    setResultText(step.resultText || '');
    setHighlightLine(step.highlightLine ?? -1);
    setHighlightedPath(step.highlightedPath || []);

    // Handle invertTree final step
    if (step.newNodes) {
      setTreeState(prev => ({ ...prev, nodes: step.newNodes }));
    }

    // Handle buildTree final step
    if (step.builtTree) {
      setTreeState(step.builtTree);
    }
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
    // Start from beginning if at end or not started
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

  // eslint-disable-next-line no-unused-vars
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

  const handleAlgorithmChange = useCallback((newAlgo) => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(-1);
    setAlgorithm(newAlgo);
    resetVisualization();

    // Reset tree for certain algorithms
    if (newAlgo === 'isSymmetric') {
      setTreeState(buildTreeFromValues(symmetricTreeValues));
    } else if (newAlgo === 'buildTree') {
      setTreeState({ nodes: {}, rootId: null, nextId: 1 });
    } else {
      setTreeState(buildTreeFromValues(defaultTreeValues));
    }
    setSecondTree(null);
  }, [resetVisualization]);

  const handleReset = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    setIsPlaying(false);
    setCurrentStep(-1);
    resetVisualization();
    if (algorithm === 'isSymmetric') {
      setTreeState(buildTreeFromValues(symmetricTreeValues));
    } else if (algorithm === 'buildTree') {
      setTreeState({ nodes: {}, rootId: null, nextId: 1 });
    } else {
      setTreeState(buildTreeFromValues(defaultTreeValues));
    }
  }, [algorithm, resetVisualization]);

  // Render tree node
  const renderNode = (nodeId, pos) => {
    const node = nodes[nodeId];
    if (!node || !pos) return null;

    const state = nodeStates[nodeId] || 'idle';
    const isInPath = highlightedPath.includes(nodeId);
    const color = isInPath ? nodeColors.path : nodeColors[state] || nodeColors.idle;

    return (
      <g key={nodeId}>
        {/* Edges */}
        {node.left && positions[node.left] && (
          <line
            x1={pos.x}
            y1={pos.y}
            x2={positions[node.left].x}
            y2={positions[node.left].y}
            stroke="#52525b"
            strokeWidth="2"
          />
        )}
        {node.right && positions[node.right] && (
          <line
            x1={pos.x}
            y1={pos.y}
            x2={positions[node.right].x}
            y2={positions[node.right].y}
            stroke="#52525b"
            strokeWidth="2"
          />
        )}
        {/* Node circle */}
        <circle
          cx={pos.x}
          cy={pos.y}
          r="22"
          fill={color}
          stroke={isInPath ? '#ec4899' : '#71717a'}
          strokeWidth={isInPath ? '3' : '2'}
          className="transition-all duration-200"
        />
        {/* Value */}
        <text
          x={pos.x}
          y={pos.y + 5}
          textAnchor="middle"
          fill="white"
          fontSize="14"
          fontWeight="bold"
        >
          {node.val}
        </text>
      </g>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white flex">
      {/* Algorithm sidebar */}
      <div className="w-56 bg-zinc-950 border-r border-zinc-800 flex flex-col">
        <button
          onClick={onBack}
          className="px-4 py-3 text-left text-sm bg-zinc-900 hover:bg-zinc-800 border-b border-zinc-800"
        >
          &larr; Back
        </button>
        <div className="px-3 py-2 text-zinc-500 text-xs tracking-widest uppercase border-b border-zinc-800">
          Algorithms
        </div>
        <div className="flex-1 overflow-y-auto">
          {bstAlgoList.map((algo) => (
            <button
              key={algo.value}
              onClick={() => handleAlgorithmChange(algo.value)}
              className={`w-full px-4 py-2 text-left text-sm hover:bg-zinc-800 transition-colors ${
                algorithm === algo.value ? 'bg-zinc-800 text-white' : 'text-zinc-400'
              }`}
            >
              {algo.label}
            </button>
          ))}
        </div>

        {/* Complexity info */}
        <div className="border-t border-zinc-800 p-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Complexity</div>
          <div className="text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-zinc-500">Time:</span>
              <span className="text-green-400 font-mono">{complexityMap[algorithm]?.time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-zinc-500">Space:</span>
              <span className="text-blue-400 font-mono">{complexityMap[algorithm]?.space}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col">
        <div className="px-4 pt-4">
          <CourseCallout title="Recursive Tree Algorithms" storageKey="bstalgorithms">
{`These classic algorithms use depth-first recursion.
Watch the Call Stack panel to see function frames.

Pattern: Most return a value up the tree after visiting children.
Base case: node == null usually returns a neutral value (0, true, null).

Time: O(n) for traversal-based, Space: O(h) call stack`}
          </CourseCallout>
        </div>
        {/* Controls */}
        <div className="px-4 py-3 bg-zinc-950 border-b border-zinc-800 flex items-center gap-4 flex-wrap">
          {/* Algorithm-specific inputs */}
          {algorithm === 'lca' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400">p:</label>
              <input
                type="number"
                value={lcaP}
                onChange={(e) => setLcaP(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
              />
              <label className="text-xs text-zinc-400">q:</label>
              <input
                type="number"
                value={lcaQ}
                onChange={(e) => setLcaQ(parseInt(e.target.value) || 0)}
                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
              />
            </div>
          )}
          {(algorithm === 'hasPathSum' || algorithm === 'pathSum') && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400">Target Sum:</label>
              <input
                type="number"
                value={targetSum}
                onChange={(e) => setTargetSum(parseInt(e.target.value) || 0)}
                className="w-20 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
              />
            </div>
          )}
          {algorithm === 'kthSmallest' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400">k:</label>
              <input
                type="number"
                value={kValue}
                onChange={(e) => setKValue(parseInt(e.target.value) || 1)}
                min="1"
                className="w-16 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
              />
            </div>
          )}
          {algorithm === 'buildTree' && (
            <div className="flex items-center gap-2">
              <label className="text-xs text-zinc-400">Preorder:</label>
              <input
                type="text"
                value={preorderInput}
                onChange={(e) => setPreorderInput(e.target.value)}
                className="w-32 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
              />
              <label className="text-xs text-zinc-400">Inorder:</label>
              <input
                type="text"
                value={inorderInput}
                onChange={(e) => setInorderInput(e.target.value)}
                className="w-32 px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
              />
            </div>
          )}

          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={stepBackward}
              disabled={isPlaying || currentStep === 0}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm"
            >
              &lt;
            </button>
            <button
              onClick={isPlaying ? pause : play}
              disabled={steps.length === 0}
              className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-sm min-w-[80px]"
            >
              {isPlaying ? 'Pause' : 'Play'}
            </button>
            <button
              onClick={stepForward}
              disabled={isPlaying || currentStep >= steps.length - 1}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 text-sm"
            >
              &gt;
            </button>
            <button
              onClick={handleReset}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm"
            >
              Reset
            </button>
            <select
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              className="px-2 py-1 bg-zinc-800 border border-zinc-700 text-sm"
            >
              <option value={2000}>0.5x</option>
              <option value={1000}>1x</option>
              <option value={500}>2x</option>
              <option value={250}>4x</option>
            </select>
          </div>
        </div>

        {/* Result banner */}
        {resultText && (
          <div className="px-4 py-2 bg-zinc-900 border-b border-zinc-800 text-center">
            <span className="text-green-400 font-mono">{resultText}</span>
          </div>
        )}

        {/* Main visualization area */}
        <div className="flex-1 flex">
          {/* Tree visualization */}
          <div className="flex-1 overflow-auto p-4">
            <svg
              width={Math.max(width, 600)}
              height={Math.max(height, 400)}
              className="mx-auto"
            >
              {/* Render all nodes */}
              {Object.keys(nodes).map((nodeId) =>
                renderNode(nodeId, positions[nodeId])
              )}
            </svg>
          </div>

          {/* Right panels */}
          <div className="w-[400px] flex flex-col border-l border-zinc-800">
            {/* Pseudocode panel */}
            <div className="flex-1 border-b border-zinc-800">
              <PseudocodePanel
                lines={pseudocodeMap[algorithm] || []}
                activeLine={highlightLine}
                title={bstAlgoList.find(a => a.value === algorithm)?.label || 'Algorithm'}
              />
            </div>

            {/* Call stack panel */}
            <div className="h-64">
              <CallStackPanel frames={callStack} />
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="h-1 bg-zinc-800">
          <div
            className="h-full bg-blue-600 transition-all duration-200"
            style={{ width: steps.length > 0 ? `${((currentStep + 1) / steps.length) * 100}%` : '0%' }}
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
    </div>
  );
}
