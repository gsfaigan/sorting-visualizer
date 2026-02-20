// Tree layout utilities for BST visualization

// Compute in-order positions for tree layout
export function layoutTree(nodes, rootId) {
  if (!rootId || !nodes[rootId]) {
    return { positions: {}, width: 0, height: 0 };
  }

  const positions = {};
  let inorderIndex = 0;
  let maxDepth = 0;

  // In-order traversal to assign x positions
  function inorder(nodeId, depth) {
    if (!nodeId || !nodes[nodeId]) return;

    const node = nodes[nodeId];
    maxDepth = Math.max(maxDepth, depth);

    // Visit left
    if (node.left) {
      inorder(node.left, depth + 1);
    }

    // Assign position
    positions[nodeId] = {
      x: inorderIndex * 60 + 60,
      y: depth * 70 + 50,
      depth,
    };
    inorderIndex++;

    // Visit right
    if (node.right) {
      inorder(node.right, depth + 1);
    }
  }

  inorder(rootId, 0);

  const width = Math.max(800, inorderIndex * 60 + 120);
  const height = (maxDepth + 1) * 70 + 100;

  return { positions, width, height, nodeCount: inorderIndex };
}

// Compute tree height from a node
export function computeHeight(nodes, nodeId) {
  if (!nodeId || !nodes[nodeId]) return -1;
  const node = nodes[nodeId];
  const leftH = computeHeight(nodes, node.left);
  const rightH = computeHeight(nodes, node.right);
  return 1 + Math.max(leftH, rightH);
}

// Compute balance factor for a node
export function computeBalanceFactor(nodes, nodeId) {
  if (!nodeId || !nodes[nodeId]) return 0;
  const node = nodes[nodeId];
  const leftH = computeHeight(nodes, node.left);
  const rightH = computeHeight(nodes, node.right);
  return leftH - rightH;
}

// Find minimum value node
export function findMin(nodes, nodeId) {
  if (!nodeId || !nodes[nodeId]) return null;
  let current = nodeId;
  while (nodes[current].left) {
    current = nodes[current].left;
  }
  return current;
}

// Find maximum value node
export function findMax(nodes, nodeId) {
  if (!nodeId || !nodes[nodeId]) return null;
  let current = nodeId;
  while (nodes[current].right) {
    current = nodes[current].right;
  }
  return current;
}

// Get all node IDs in an array
export function getAllNodeIds(nodes, rootId) {
  const result = [];
  function traverse(nodeId) {
    if (!nodeId || !nodes[nodeId]) return;
    result.push(nodeId);
    traverse(nodes[nodeId].left);
    traverse(nodes[nodeId].right);
  }
  traverse(rootId);
  return result;
}

// Build tree from array of values (BST insert order)
export function buildTreeFromValues(values) {
  const nodes = {};
  let rootId = null;
  let nextId = 1;

  for (const val of values) {
    const newId = `node-${nextId++}`;
    nodes[newId] = { id: newId, val, left: null, right: null };

    if (!rootId) {
      rootId = newId;
    } else {
      let current = rootId;
      while (true) {
        if (val < nodes[current].val) {
          if (!nodes[current].left) {
            nodes[current].left = newId;
            break;
          }
          current = nodes[current].left;
        } else {
          if (!nodes[current].right) {
            nodes[current].right = newId;
            break;
          }
          current = nodes[current].right;
        }
      }
    }
  }

  return { nodes, rootId, nextId };
}
