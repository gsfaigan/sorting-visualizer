import { useState, useMemo, useEffect, useCallback } from 'react';
import { useAnimator } from '../../hooks/useAnimator';
import PseudocodePanel from '../shared/PseudocodePanel';
import CourseCallout from '../shared/CourseCallout';
import {
  layoutTree,
  computeBalanceFactor,
  buildTreeFromValues,
} from '../../utils/treeLayout';

// ============================================
// PSEUDOCODE DEFINITIONS
// ============================================

const PSEUDOCODE = {
  insert: [
    { text: 'if root == null: root = newNode; return', indent: 0 },
    { text: 'curr = root', indent: 0 },
    { text: 'while true:', indent: 0 },
    { text: 'if val < curr.val: go left', indent: 1 },
    { text: 'if curr.left == null: curr.left = newNode; break', indent: 2 },
    { text: 'else curr = curr.left', indent: 2 },
    { text: 'else: go right', indent: 1 },
    { text: 'if curr.right == null: curr.right = newNode; break', indent: 2 },
    { text: 'else curr = curr.right', indent: 2 },
  ],
  delete: [
    { text: 'find node with val (search walk)', indent: 0 },
    { text: 'Case 1 - leaf: remove directly', indent: 0 },
    { text: 'Case 2 - one child: replace with child', indent: 0 },
    { text: 'Case 3 - two children:', indent: 0 },
    { text: 'successor = leftmost of right subtree', indent: 1 },
    { text: 'replace node.val with successor.val', indent: 1 },
    { text: 'delete successor (case 1 or 2)', indent: 1 },
  ],
  search: [
    { text: 'curr = root', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'if val == curr.val: return curr', indent: 1 },
    { text: 'if val < curr.val: curr = curr.left', indent: 1 },
    { text: 'else: curr = curr.right', indent: 1 },
    { text: 'return null', indent: 0 },
  ],
  inorder: [
    { text: 'inorder(node):', indent: 0 },
    { text: 'if node == null: return', indent: 1 },
    { text: 'inorder(node.left)', indent: 1 },
    { text: 'visit(node)', indent: 1 },
    { text: 'inorder(node.right)', indent: 1 },
  ],
  preorder: [
    { text: 'preorder(node):', indent: 0 },
    { text: 'if node == null: return', indent: 1 },
    { text: 'visit(node)', indent: 1 },
    { text: 'preorder(node.left)', indent: 1 },
    { text: 'preorder(node.right)', indent: 1 },
  ],
  postorder: [
    { text: 'postorder(node):', indent: 0 },
    { text: 'if node == null: return', indent: 1 },
    { text: 'postorder(node.left)', indent: 1 },
    { text: 'postorder(node.right)', indent: 1 },
    { text: 'visit(node)', indent: 1 },
  ],
  levelOrder: [
    { text: 'queue = [root]', indent: 0 },
    { text: 'while queue not empty:', indent: 0 },
    { text: 'node = queue.dequeue()', indent: 1 },
    { text: 'visit(node)', indent: 1 },
    { text: 'if node.left: queue.enqueue(node.left)', indent: 1 },
    { text: 'if node.right: queue.enqueue(node.right)', indent: 1 },
  ],
  height: [
    { text: 'height(node):', indent: 0 },
    { text: 'if node == null: return -1', indent: 1 },
    { text: 'leftH = height(node.left)', indent: 1 },
    { text: 'rightH = height(node.right)', indent: 1 },
    { text: 'return 1 + max(leftH, rightH)', indent: 1 },
  ],
  min: [
    { text: 'curr = root', indent: 0 },
    { text: 'while curr.left ≠ null:', indent: 0 },
    { text: 'curr = curr.left', indent: 1 },
    { text: 'return curr', indent: 0 },
  ],
  max: [
    { text: 'curr = root', indent: 0 },
    { text: 'while curr.right ≠ null:', indent: 0 },
    { text: 'curr = curr.right', indent: 1 },
    { text: 'return curr', indent: 0 },
  ],
};

// Initial tree values
const INITIAL_VALUES = [50, 30, 70, 20, 40, 60, 80, 10, 35, 55, 75];

// ============================================
// STEP GENERATORS
// ============================================

function insertSteps(nodes, rootId, val, nextId) {
  const steps = [];
  const newNodeId = `node-${nextId}`;
  let newNodes = { ...nodes };

  if (!rootId) {
    newNodes[newNodeId] = { id: newNodeId, val, left: null, right: null };
    steps.push({
      nodes: newNodes,
      rootId: newNodeId,
      nodeStates: { [newNodeId]: 'visiting' },
      pseudoLine: 0,
      message: `Tree is empty. Creating root with value ${val}`,
    });
    steps.push({
      nodes: newNodes,
      rootId: newNodeId,
      nodeStates: {},
      pseudoLine: 0,
      message: `Inserted ${val} as root`,
    });
    return { steps, newNodes, newRootId: newNodeId, newNextId: nextId + 1 };
  }

  let current = rootId;
  const path = [];

  steps.push({
    nodes: newNodes,
    rootId,
    nodeStates: { [current]: 'comparing' },
    pseudoLine: 1,
    message: `Starting at root (${nodes[current].val})`,
  });

  while (true) {
    path.push(current);
    const currentNode = newNodes[current];

    if (val < currentNode.val) {
      steps.push({
        nodes: newNodes,
        rootId,
        nodeStates: { [current]: 'comparing' },
        pseudoLine: 3,
        message: `${val} < ${currentNode.val}, go left`,
      });

      if (!currentNode.left) {
        newNodes = JSON.parse(JSON.stringify(newNodes));
        newNodes[newNodeId] = { id: newNodeId, val, left: null, right: null };
        newNodes[current].left = newNodeId;

        steps.push({
          nodes: newNodes,
          rootId,
          nodeStates: { [newNodeId]: 'visiting', [current]: 'comparing' },
          pseudoLine: 4,
          message: `Left is empty. Inserting ${val}`,
        });
        break;
      } else {
        steps.push({
          nodes: newNodes,
          rootId,
          nodeStates: { [current]: 'visiting', [currentNode.left]: 'comparing' },
          pseudoLine: 5,
          message: `Moving to left child (${newNodes[currentNode.left].val})`,
        });
        current = currentNode.left;
      }
    } else {
      steps.push({
        nodes: newNodes,
        rootId,
        nodeStates: { [current]: 'comparing' },
        pseudoLine: 6,
        message: `${val} >= ${currentNode.val}, go right`,
      });

      if (!currentNode.right) {
        newNodes = JSON.parse(JSON.stringify(newNodes));
        newNodes[newNodeId] = { id: newNodeId, val, left: null, right: null };
        newNodes[current].right = newNodeId;

        steps.push({
          nodes: newNodes,
          rootId,
          nodeStates: { [newNodeId]: 'visiting', [current]: 'comparing' },
          pseudoLine: 7,
          message: `Right is empty. Inserting ${val}`,
        });
        break;
      } else {
        steps.push({
          nodes: newNodes,
          rootId,
          nodeStates: { [current]: 'visiting', [currentNode.right]: 'comparing' },
          pseudoLine: 8,
          message: `Moving to right child (${newNodes[currentNode.right].val})`,
        });
        current = currentNode.right;
      }
    }
  }

  steps.push({
    nodes: newNodes,
    rootId,
    nodeStates: { [newNodeId]: 'found' },
    pseudoLine: 4,
    message: `Successfully inserted ${val}`,
  });

  return { steps, newNodes, newRootId: rootId, newNextId: nextId + 1 };
}

function searchSteps(nodes, rootId, val) {
  const steps = [];

  if (!rootId) {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      pseudoLine: 5,
      message: `Tree is empty. Value ${val} not found.`,
    });
    return steps;
  }

  let current = rootId;

  steps.push({
    nodes,
    rootId,
    nodeStates: { [current]: 'comparing' },
    pseudoLine: 0,
    message: `Starting search at root (${nodes[current].val})`,
  });

  while (current) {
    const currentNode = nodes[current];

    steps.push({
      nodes,
      rootId,
      nodeStates: { [current]: 'comparing' },
      pseudoLine: 1,
      message: `Checking node ${currentNode.val}`,
    });

    if (val === currentNode.val) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [current]: 'found' },
        pseudoLine: 2,
        message: `Found ${val}!`,
      });
      return steps;
    }

    if (val < currentNode.val) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [current]: 'visiting' },
        pseudoLine: 3,
        message: `${val} < ${currentNode.val}, go left`,
      });

      if (!currentNode.left) {
        steps.push({
          nodes,
          rootId,
          nodeStates: {},
          pseudoLine: 5,
          message: `Left is null. Value ${val} not found.`,
        });
        return steps;
      }
      current = currentNode.left;
    } else {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [current]: 'visiting' },
        pseudoLine: 4,
        message: `${val} > ${currentNode.val}, go right`,
      });

      if (!currentNode.right) {
        steps.push({
          nodes,
          rootId,
          nodeStates: {},
          pseudoLine: 5,
          message: `Right is null. Value ${val} not found.`,
        });
        return steps;
      }
      current = currentNode.right;
    }
  }

  return steps;
}

function deleteSteps(nodes, rootId, val) {
  const steps = [];

  if (!rootId) {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      pseudoLine: 0,
      message: `Tree is empty. Cannot delete.`,
    });
    return { steps, newNodes: nodes, newRootId: rootId };
  }

  // Find the node and its parent
  let current = rootId;
  let parent = null;
  let isLeftChild = false;

  steps.push({
    nodes,
    rootId,
    nodeStates: { [current]: 'comparing' },
    pseudoLine: 0,
    message: `Searching for ${val}...`,
  });

  while (current && nodes[current].val !== val) {
    parent = current;
    if (val < nodes[current].val) {
      isLeftChild = true;
      current = nodes[current].left;
    } else {
      isLeftChild = false;
      current = nodes[current].right;
    }

    if (current) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [current]: 'comparing', ...(parent ? { [parent]: 'visiting' } : {}) },
        pseudoLine: 0,
        message: `Checking node ${nodes[current].val}`,
      });
    }
  }

  if (!current) {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      pseudoLine: 0,
      message: `Value ${val} not found in tree.`,
    });
    return { steps, newNodes: nodes, newRootId: rootId };
  }

  const nodeToDelete = nodes[current];
  let newNodes = JSON.parse(JSON.stringify(nodes));

  steps.push({
    nodes: newNodes,
    rootId,
    nodeStates: { [current]: 'deleting' },
    pseudoLine: 0,
    message: `Found node ${val}. Determining deletion case...`,
  });

  // Case 1: Leaf node
  if (!nodeToDelete.left && !nodeToDelete.right) {
    steps.push({
      nodes: newNodes,
      rootId,
      nodeStates: { [current]: 'deleting' },
      pseudoLine: 1,
      message: `Case 1: Leaf node. Removing directly.`,
    });

    if (!parent) {
      delete newNodes[current];
      steps.push({
        nodes: newNodes,
        rootId: null,
        nodeStates: {},
        pseudoLine: 1,
        message: `Deleted root. Tree is now empty.`,
      });
      return { steps, newNodes, newRootId: null };
    }

    if (isLeftChild) {
      newNodes[parent].left = null;
    } else {
      newNodes[parent].right = null;
    }
    delete newNodes[current];
  }
  // Case 2: One child
  else if (!nodeToDelete.left || !nodeToDelete.right) {
    const childId = nodeToDelete.left || nodeToDelete.right;

    steps.push({
      nodes: newNodes,
      rootId,
      nodeStates: { [current]: 'deleting', [childId]: 'visiting' },
      pseudoLine: 2,
      message: `Case 2: One child. Replacing with child (${newNodes[childId].val}).`,
    });

    if (!parent) {
      delete newNodes[current];
      steps.push({
        nodes: newNodes,
        rootId: childId,
        nodeStates: { [childId]: 'found' },
        pseudoLine: 2,
        message: `Deleted root. New root is ${newNodes[childId].val}.`,
      });
      return { steps, newNodes, newRootId: childId };
    }

    if (isLeftChild) {
      newNodes[parent].left = childId;
    } else {
      newNodes[parent].right = childId;
    }
    delete newNodes[current];
  }
  // Case 3: Two children
  else {
    steps.push({
      nodes: newNodes,
      rootId,
      nodeStates: { [current]: 'deleting' },
      pseudoLine: 3,
      message: `Case 3: Two children. Finding in-order successor.`,
    });

    // Find in-order successor (leftmost in right subtree)
    let successorParent = current;
    let successor = nodeToDelete.right;

    while (newNodes[successor].left) {
      successorParent = successor;
      successor = newNodes[successor].left;
    }

    steps.push({
      nodes: newNodes,
      rootId,
      nodeStates: { [current]: 'deleting', [successor]: 'current' },
      pseudoLine: 4,
      message: `Found successor: ${newNodes[successor].val}`,
    });

    // Replace value
    newNodes[current].val = newNodes[successor].val;

    steps.push({
      nodes: newNodes,
      rootId,
      nodeStates: { [current]: 'visiting', [successor]: 'deleting' },
      pseudoLine: 5,
      message: `Replaced ${val} with ${newNodes[successor].val}. Now deleting successor.`,
    });

    // Delete successor (it has at most one child - right child)
    if (successorParent === current) {
      newNodes[current].right = newNodes[successor].right;
    } else {
      newNodes[successorParent].left = newNodes[successor].right;
    }
    delete newNodes[successor];
  }

  steps.push({
    nodes: newNodes,
    rootId,
    nodeStates: {},
    pseudoLine: 6,
    message: `Successfully deleted ${val}`,
  });

  return { steps, newNodes, newRootId: rootId };
}

function inorderSteps(nodes, rootId) {
  const steps = [];
  const sequence = [];

  function traverse(nodeId) {
    if (!nodeId || !nodes[nodeId]) return;

    const node = nodes[nodeId];

    // Visit left
    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'visiting' },
      sequence: [...sequence],
      pseudoLine: 2,
      message: `Going left from ${node.val}`,
    });
    traverse(node.left);

    // Visit current
    sequence.push(node.val);
    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'current' },
      sequence: [...sequence],
      pseudoLine: 3,
      message: `Visiting ${node.val}`,
    });

    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'sorted' },
      sequence: [...sequence],
      pseudoLine: 3,
      message: `Added ${node.val} to sequence`,
    });

    // Visit right
    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'sorted' },
      sequence: [...sequence],
      pseudoLine: 4,
      message: `Going right from ${node.val}`,
    });
    traverse(node.right);
  }

  if (rootId) {
    traverse(rootId);
  }

  steps.push({
    nodes,
    rootId,
    nodeStates: {},
    sequence,
    pseudoLine: 4,
    message: `Inorder traversal complete: [${sequence.join(', ')}]`,
  });

  return steps;
}

function preorderSteps(nodes, rootId) {
  const steps = [];
  const sequence = [];

  function traverse(nodeId) {
    if (!nodeId || !nodes[nodeId]) return;

    const node = nodes[nodeId];

    // Visit current first
    sequence.push(node.val);
    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'current' },
      sequence: [...sequence],
      pseudoLine: 2,
      message: `Visiting ${node.val}`,
    });

    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'sorted' },
      sequence: [...sequence],
      pseudoLine: 2,
      message: `Added ${node.val} to sequence`,
    });

    // Then left
    if (node.left) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [nodeId]: 'sorted' },
        sequence: [...sequence],
        pseudoLine: 3,
        message: `Going left from ${node.val}`,
      });
    }
    traverse(node.left);

    // Then right
    if (node.right) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [nodeId]: 'sorted' },
        sequence: [...sequence],
        pseudoLine: 4,
        message: `Going right from ${node.val}`,
      });
    }
    traverse(node.right);
  }

  if (rootId) {
    traverse(rootId);
  }

  steps.push({
    nodes,
    rootId,
    nodeStates: {},
    sequence,
    pseudoLine: 4,
    message: `Preorder traversal complete: [${sequence.join(', ')}]`,
  });

  return steps;
}

function postorderSteps(nodes, rootId) {
  const steps = [];
  const sequence = [];

  function traverse(nodeId) {
    if (!nodeId || !nodes[nodeId]) return;

    const node = nodes[nodeId];

    // Visit left
    if (node.left) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [nodeId]: 'visiting' },
        sequence: [...sequence],
        pseudoLine: 2,
        message: `Going left from ${node.val}`,
      });
    }
    traverse(node.left);

    // Visit right
    if (node.right) {
      steps.push({
        nodes,
        rootId,
        nodeStates: { [nodeId]: 'visiting' },
        sequence: [...sequence],
        pseudoLine: 3,
        message: `Going right from ${node.val}`,
      });
    }
    traverse(node.right);

    // Visit current last
    sequence.push(node.val);
    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'current' },
      sequence: [...sequence],
      pseudoLine: 4,
      message: `Visiting ${node.val}`,
    });

    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'sorted' },
      sequence: [...sequence],
      pseudoLine: 4,
      message: `Added ${node.val} to sequence`,
    });
  }

  if (rootId) {
    traverse(rootId);
  }

  steps.push({
    nodes,
    rootId,
    nodeStates: {},
    sequence,
    pseudoLine: 4,
    message: `Postorder traversal complete: [${sequence.join(', ')}]`,
  });

  return steps;
}

function levelOrderSteps(nodes, rootId) {
  const steps = [];
  const sequence = [];

  if (!rootId) {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      sequence: [],
      queue: [],
      pseudoLine: 0,
      message: `Tree is empty.`,
    });
    return steps;
  }

  const queue = [rootId];

  steps.push({
    nodes,
    rootId,
    nodeStates: { [rootId]: 'visiting' },
    sequence: [...sequence],
    queue: queue.map(id => nodes[id].val),
    pseudoLine: 0,
    message: `Initialized queue with root`,
  });

  while (queue.length > 0) {
    const currentId = queue.shift();
    const node = nodes[currentId];

    steps.push({
      nodes,
      rootId,
      nodeStates: { [currentId]: 'current' },
      sequence: [...sequence],
      queue: queue.map(id => nodes[id].val),
      pseudoLine: 2,
      message: `Dequeued ${node.val}`,
    });

    sequence.push(node.val);

    steps.push({
      nodes,
      rootId,
      nodeStates: { [currentId]: 'sorted' },
      sequence: [...sequence],
      queue: queue.map(id => nodes[id].val),
      pseudoLine: 3,
      message: `Visited ${node.val}`,
    });

    if (node.left) {
      queue.push(node.left);
      steps.push({
        nodes,
        rootId,
        nodeStates: { [currentId]: 'sorted', [node.left]: 'visiting' },
        sequence: [...sequence],
        queue: queue.map(id => nodes[id].val),
        pseudoLine: 4,
        message: `Enqueued left child (${nodes[node.left].val})`,
      });
    }

    if (node.right) {
      queue.push(node.right);
      steps.push({
        nodes,
        rootId,
        nodeStates: { [currentId]: 'sorted', [node.right]: 'visiting' },
        sequence: [...sequence],
        queue: queue.map(id => nodes[id].val),
        pseudoLine: 5,
        message: `Enqueued right child (${nodes[node.right].val})`,
      });
    }
  }

  steps.push({
    nodes,
    rootId,
    nodeStates: {},
    sequence,
    queue: [],
    pseudoLine: 5,
    message: `Level order traversal complete: [${sequence.join(', ')}]`,
  });

  return steps;
}

function heightSteps(nodes, rootId) {
  const steps = [];
  const heights = {};

  function traverse(nodeId, depth = 0) {
    if (!nodeId || !nodes[nodeId]) {
      return -1;
    }

    const node = nodes[nodeId];

    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'visiting' },
      heights: { ...heights },
      pseudoLine: 0,
      message: `Computing height for node ${node.val}`,
    });

    const leftH = traverse(node.left, depth + 1);
    const rightH = traverse(node.right, depth + 1);
    const h = 1 + Math.max(leftH, rightH);

    heights[nodeId] = h;

    steps.push({
      nodes,
      rootId,
      nodeStates: { [nodeId]: 'found' },
      heights: { ...heights },
      pseudoLine: 4,
      message: `Height of ${node.val} = 1 + max(${leftH}, ${rightH}) = ${h}`,
    });

    return h;
  }

  if (rootId) {
    const totalHeight = traverse(rootId);
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      heights,
      pseudoLine: 4,
      message: `Tree height: ${totalHeight}`,
    });
  } else {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      heights: {},
      pseudoLine: 1,
      message: `Tree is empty. Height: -1`,
    });
  }

  return steps;
}

function minSteps(nodes, rootId) {
  const steps = [];

  if (!rootId) {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      pseudoLine: 0,
      message: `Tree is empty.`,
    });
    return steps;
  }

  let current = rootId;

  steps.push({
    nodes,
    rootId,
    nodeStates: { [current]: 'comparing' },
    pseudoLine: 0,
    message: `Starting at root (${nodes[current].val})`,
  });

  while (nodes[current].left) {
    steps.push({
      nodes,
      rootId,
      nodeStates: { [current]: 'visiting' },
      pseudoLine: 1,
      message: `${nodes[current].val} has left child`,
    });

    current = nodes[current].left;

    steps.push({
      nodes,
      rootId,
      nodeStates: { [current]: 'comparing' },
      pseudoLine: 2,
      message: `Moving to left child (${nodes[current].val})`,
    });
  }

  steps.push({
    nodes,
    rootId,
    nodeStates: { [current]: 'found' },
    pseudoLine: 3,
    message: `Minimum value: ${nodes[current].val}`,
  });

  return steps;
}

function maxSteps(nodes, rootId) {
  const steps = [];

  if (!rootId) {
    steps.push({
      nodes,
      rootId,
      nodeStates: {},
      pseudoLine: 0,
      message: `Tree is empty.`,
    });
    return steps;
  }

  let current = rootId;

  steps.push({
    nodes,
    rootId,
    nodeStates: { [current]: 'comparing' },
    pseudoLine: 0,
    message: `Starting at root (${nodes[current].val})`,
  });

  while (nodes[current].right) {
    steps.push({
      nodes,
      rootId,
      nodeStates: { [current]: 'visiting' },
      pseudoLine: 1,
      message: `${nodes[current].val} has right child`,
    });

    current = nodes[current].right;

    steps.push({
      nodes,
      rootId,
      nodeStates: { [current]: 'comparing' },
      pseudoLine: 2,
      message: `Moving to right child (${nodes[current].val})`,
    });
  }

  steps.push({
    nodes,
    rootId,
    nodeStates: { [current]: 'found' },
    pseudoLine: 3,
    message: `Maximum value: ${nodes[current].val}`,
  });

  return steps;
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BSTVisualizer({ onBack }) {
  const initialTree = useMemo(() => buildTreeFromValues(INITIAL_VALUES), []);

  const [nodes, setNodes] = useState(initialTree.nodes);
  const [rootId, setRootId] = useState(initialTree.rootId);
  const [nextId, setNextId] = useState(initialTree.nextId);
  const [inputVal, setInputVal] = useState('');
  const [activeOp, setActiveOp] = useState(null);
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [message, setMessage] = useState('');
  const [currentPseudo, setCurrentPseudo] = useState(null);
  const [hoverNodeId, setHoverNodeId] = useState(null);

  const animator = useAnimator(steps, speed);

  const currentStep = useMemo(() => {
    if (animator.stepIdx < 0 || animator.stepIdx >= steps.length) {
      return {
        nodes,
        rootId,
        nodeStates: {},
        sequence: [],
        heights: {},
        queue: [],
        pseudoLine: -1,
        message: '',
      };
    }
    return steps[animator.stepIdx];
  }, [animator.stepIdx, steps, nodes, rootId]);

  useEffect(() => {
    if (currentStep.message) {
      setMessage(currentStep.message);
    }
  }, [currentStep]);

  const displayNodes = currentStep.nodes || nodes;
  const displayRootId = currentStep.rootId !== undefined ? currentStep.rootId : rootId;
  const { positions, width, height } = useMemo(
    () => layoutTree(displayNodes, displayRootId),
    [displayNodes, displayRootId]
  );

  const operations = [
    'insert', 'delete', 'search', 'inorder', 'preorder', 'postorder', 'levelOrder', 'height', 'min', 'max'
  ];

  const opLabels = {
    insert: 'Insert', delete: 'Delete', search: 'Search',
    inorder: 'Inorder', preorder: 'Preorder', postorder: 'Postorder',
    levelOrder: 'Level Order', height: 'Height', min: 'Min', max: 'Max',
  };

  const needsInput = ['insert', 'delete', 'search'];

  const handleRun = useCallback(() => {
    if (!activeOp) return;

    const val = parseInt(inputVal, 10);
    let result;

    switch (activeOp) {
      case 'insert':
        if (isNaN(val)) return;
        result = insertSteps(nodes, rootId, val, nextId);
        setNodes(result.newNodes);
        setRootId(result.newRootId);
        setNextId(result.newNextId);
        setSteps(result.steps);
        break;
      case 'delete':
        if (isNaN(val)) return;
        result = deleteSteps(nodes, rootId, val);
        setNodes(result.newNodes);
        setRootId(result.newRootId);
        setSteps(result.steps);
        break;
      case 'search':
        if (isNaN(val)) return;
        result = searchSteps(nodes, rootId, val);
        setSteps(result);
        break;
      case 'inorder':
        result = inorderSteps(nodes, rootId);
        setSteps(result);
        break;
      case 'preorder':
        result = preorderSteps(nodes, rootId);
        setSteps(result);
        break;
      case 'postorder':
        result = postorderSteps(nodes, rootId);
        setSteps(result);
        break;
      case 'levelOrder':
        result = levelOrderSteps(nodes, rootId);
        setSteps(result);
        break;
      case 'height':
        result = heightSteps(nodes, rootId);
        setSteps(result);
        break;
      case 'min':
        result = minSteps(nodes, rootId);
        setSteps(result);
        break;
      case 'max':
        result = maxSteps(nodes, rootId);
        setSteps(result);
        break;
      default:
        return;
    }

    setCurrentPseudo(activeOp);
    setInputVal('');
    animator.reset();
    setTimeout(() => animator.play(result.steps || result), 50);
  }, [activeOp, inputVal, nodes, rootId, nextId, animator]);

  const handleReset = () => {
    animator.reset();
    setSteps([]);
    setMessage('');
    const newTree = buildTreeFromValues(INITIAL_VALUES);
    setNodes(newTree.nodes);
    setRootId(newTree.rootId);
    setNextId(newTree.nextId);
  };

  const pseudoLines = PSEUDOCODE[currentPseudo] || [];
  const nodeStates = currentStep.nodeStates || {};
  const sequence = currentStep.sequence || [];
  const heights = currentStep.heights || {};
  const queue = currentStep.queue || [];

  const nodeColors = {
    idle: { fill: '#27272a', stroke: '#3f3f46' },
    visiting: { fill: '#1e3a5f', stroke: '#38bdf8' },
    comparing: { fill: '#3b1f00', stroke: '#f97316' },
    found: { fill: '#14532d', stroke: '#22c55e' },
    deleting: { fill: '#4a0d0d', stroke: '#ef4444' },
    current: { fill: '#4a1d96', stroke: '#a78bfa' },
    sorted: { fill: '#14532d', stroke: '#4ade80' },
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-800">
        <button onClick={onBack} className="px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white">
          &larr; Back
        </button>
        <h1 className="text-sm font-semibold tracking-widest text-zinc-300">BINARY SEARCH TREE</h1>
        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Speed:</span>
          <input
            type="range" min="100" max="1500" step="100"
            value={1600 - speed}
            onChange={(e) => setSpeed(1600 - parseInt(e.target.value, 10))}
            className="w-24 accent-blue-500"
          />
        </div>
      </div>

      {/* Operations Row */}
      <div className="flex flex-wrap gap-2 px-4 py-3 border-b border-zinc-800">
        {operations.map((op) => (
          <button
            key={op}
            onClick={() => setActiveOp(op)}
            className={`px-3 py-1 text-xs border transition-colors ${
              activeOp === op
                ? 'border-blue-500 text-blue-400 bg-zinc-800'
                : 'border-zinc-700 text-white bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            {opLabels[op]}
          </button>
        ))}
      </div>

      {/* Input Row */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-zinc-800">
        {needsInput.includes(activeOp) && (
          <input
            type="number"
            placeholder="Value"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-20 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
          />
        )}
        <button
          onClick={handleRun}
          disabled={!activeOp || animator.running}
          className="px-4 py-1 text-sm bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 disabled:text-zinc-500 text-white"
        >
          {animator.running ? 'Running...' : '▶ Run'}
        </button>
        <button
          onClick={handleReset}
          className="px-4 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white"
        >
          Reset
        </button>
        {queue.length > 0 && (
          <div className="ml-4 flex items-center gap-2 text-xs">
            <span className="text-zinc-500">Queue:</span>
            <div className="flex gap-1">
              {queue.map((v, i) => (
                <span key={i} className="px-2 py-1 bg-zinc-800 border border-zinc-700">{v}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col px-4 py-4 overflow-hidden">
        <CourseCallout title="Binary Search Tree Fundamentals" storageKey="bst">
{`BST Property: left.val < node.val ≤ right.val
All operations O(h) where h = tree height

Balanced BST (AVL, Red-Black): h = O(log n)
Degenerate BST (linked list): h = O(n)

C++ STL equivalents:
• std::set<T> — sorted unique keys
• std::map<K,V> — sorted key-value pairs
(Both use Red-Black trees internally)`}
        </CourseCallout>
        {/* SVG Tree */}
        <div className="flex-1 overflow-auto border border-zinc-800 rounded bg-zinc-950 mb-4">
          <svg width={width} height={height} className="min-w-full">
            {/* Edges */}
            {Object.values(displayNodes).map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;

              return (
                <g key={`edges-${node.id}`}>
                  {node.left && positions[node.left] && (
                    <line
                      x1={pos.x} y1={pos.y + 22}
                      x2={positions[node.left].x} y2={positions[node.left].y - 22}
                      stroke={
                        (nodeStates[node.id] && nodeStates[node.left])
                          ? '#38bdf8' : '#1e293b'
                      }
                      strokeWidth={1.5}
                      opacity={nodeStates[node.id] && nodeStates[node.left] ? 0.8 : 0.6}
                    />
                  )}
                  {node.right && positions[node.right] && (
                    <line
                      x1={pos.x} y1={pos.y + 22}
                      x2={positions[node.right].x} y2={positions[node.right].y - 22}
                      stroke={
                        (nodeStates[node.id] && nodeStates[node.right])
                          ? '#38bdf8' : '#1e293b'
                      }
                      strokeWidth={1.5}
                      opacity={nodeStates[node.id] && nodeStates[node.right] ? 0.8 : 0.6}
                    />
                  )}
                </g>
              );
            })}

            {/* Nodes */}
            {Object.values(displayNodes).map((node) => {
              const pos = positions[node.id];
              if (!pos) return null;

              const state = nodeStates[node.id] || 'idle';
              const colors = nodeColors[state];
              const h = heights[node.id];
              const isHovered = hoverNodeId === node.id;
              const bf = isHovered ? computeBalanceFactor(displayNodes, node.id) : null;

              return (
                <g
                  key={node.id}
                  onMouseEnter={() => setHoverNodeId(node.id)}
                  onMouseLeave={() => setHoverNodeId(null)}
                  style={{ cursor: 'pointer' }}
                >
                  <circle
                    cx={pos.x} cy={pos.y} r={22}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={state === 'idle' ? 1.5 : 2.5}
                  />
                  <text
                    x={pos.x} y={pos.y + 1}
                    textAnchor="middle" dominantBaseline="middle"
                    fill="white"
                    fontSize={node.val >= 100 ? 10 : 12}
                    fontWeight={600}
                  >
                    {node.val}
                  </text>
                  {/* Height badge */}
                  {h !== undefined && (
                    <g>
                      <circle cx={pos.x + 18} cy={pos.y - 18} r={10} fill="#1e293b" />
                      <text
                        x={pos.x + 18} y={pos.y - 17}
                        textAnchor="middle" dominantBaseline="middle"
                        fill="#22c55e" fontSize={9} fontWeight={600}
                      >
                        {h}
                      </text>
                    </g>
                  )}
                  {/* Balance factor badge on hover */}
                  {isHovered && bf !== null && (
                    <g>
                      <rect
                        x={pos.x - 20} y={pos.y + 26}
                        width={40} height={16} rx={3}
                        fill="#18181b" stroke={Math.abs(bf) <= 1 ? '#22c55e' : '#ef4444'}
                      />
                      <text
                        x={pos.x} y={pos.y + 35}
                        textAnchor="middle" dominantBaseline="middle"
                        fill={Math.abs(bf) <= 1 ? '#22c55e' : '#ef4444'}
                        fontSize={9}
                      >
                        bf={bf}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Empty state */}
            {Object.keys(displayNodes).length === 0 && (
              <text x={width / 2} y={height / 2} textAnchor="middle" fill="#52525b" fontSize={14}>
                Empty Tree
              </text>
            )}
          </svg>
        </div>

        {/* Traversal Sequence Strip */}
        {sequence.length > 0 && (
          <div className="mb-4 p-3 bg-zinc-900 border border-zinc-800 rounded">
            <div className="text-xs text-zinc-500 uppercase tracking-widest mb-2">
              {currentPseudo} Sequence
            </div>
            <div className="flex flex-wrap gap-1">
              {sequence.map((val, i) => (
                <div
                  key={i}
                  className="w-10 h-10 flex items-center justify-center bg-green-900 border border-green-600 text-green-300 text-sm font-bold"
                >
                  {val}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Bottom Section */}
        <div className="flex gap-4">
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
              BST Complexity
            </div>
            <table className="w-full text-zinc-600">
              <thead>
                <tr className="text-zinc-500">
                  <th className="text-left font-normal pb-1">Op</th>
                  <th className="text-right font-normal pb-1">Avg</th>
                  <th className="text-right font-normal pb-1">Worst</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>insert</td><td className="text-right">O(log n)</td><td className="text-right">O(n)</td></tr>
                <tr><td>delete</td><td className="text-right">O(log n)</td><td className="text-right">O(n)</td></tr>
                <tr><td>search</td><td className="text-right">O(log n)</td><td className="text-right">O(n)</td></tr>
                <tr><td>traversal</td><td className="text-right">O(n)</td><td className="text-right">O(n)</td></tr>
                <tr><td>min/max</td><td className="text-right">O(log n)</td><td className="text-right">O(n)</td></tr>
              </tbody>
            </table>
            <div className="mt-3 pt-2 border-t border-zinc-800 text-zinc-600 text-[10px]">
              Space: O(n) storage, O(h) stack
              <br />
              h = tree height
              <br />
              Balanced: h = O(log n)
              <br />
              Degenerate: h = O(n)
            </div>
          </div>
        </div>

        {/* Message Bar */}
        <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 min-h-[36px]">
          {message || 'Select an operation and click Run'}
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
