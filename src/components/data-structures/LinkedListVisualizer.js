import React, { useState, useMemo } from 'react';
import { useAnimator } from '../../hooks/useAnimator';
import PseudocodePanel from '../shared/PseudocodePanel';
import CourseCallout from '../shared/CourseCallout';

// ============================================
// PSEUDOCODE DEFINITIONS
// ============================================

const PSEUDOCODE = {
  insertAtHead: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'newNode.next = head', indent: 0 },
    { text: 'head = newNode', indent: 0 },
  ],
  insertAtHeadDoubly: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'newNode.next = head', indent: 0 },
    { text: 'if head ≠ null: head.prev = newNode', indent: 0 },
    { text: 'head = newNode', indent: 0 },
  ],
  insertAtTail: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'curr = head', indent: 0 },
    { text: 'while curr.next ≠ null:', indent: 0 },
    { text: 'curr = curr.next', indent: 1 },
    { text: 'curr.next = newNode', indent: 0 },
  ],
  insertAtTailDoubly: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'newNode.prev = tail', indent: 0 },
    { text: 'tail.next = newNode', indent: 0 },
    { text: 'tail = newNode', indent: 0 },
  ],
  insertAtIndex: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'curr = head, i = 0', indent: 0 },
    { text: 'while i < idx - 1:', indent: 0 },
    { text: 'curr = curr.next; i++', indent: 1 },
    { text: 'newNode.next = curr.next', indent: 0 },
    { text: 'curr.next = newNode', indent: 0 },
  ],
  deleteAtHead: [
    { text: 'temp = head', indent: 0 },
    { text: 'head = head.next', indent: 0 },
    { text: 'delete temp', indent: 0 },
  ],
  deleteAtHeadDoubly: [
    { text: 'temp = head', indent: 0 },
    { text: 'head = head.next', indent: 0 },
    { text: 'if head ≠ null: head.prev = null', indent: 0 },
    { text: 'delete temp', indent: 0 },
  ],
  deleteAtTail: [
    { text: 'curr = head', indent: 0 },
    { text: 'while curr.next.next ≠ null:', indent: 0 },
    { text: 'curr = curr.next', indent: 1 },
    { text: 'delete curr.next', indent: 0 },
    { text: 'curr.next = null', indent: 0 },
  ],
  deleteAtTailDoubly: [
    { text: 'temp = tail', indent: 0 },
    { text: 'tail = tail.prev', indent: 0 },
    { text: 'tail.next = null', indent: 0 },
    { text: 'delete temp', indent: 0 },
  ],
  deleteByValue: [
    { text: 'curr = head', indent: 0 },
    { text: 'while curr.next ≠ null:', indent: 0 },
    { text: 'if curr.next.val == val:', indent: 1 },
    { text: 'curr.next = curr.next.next', indent: 2 },
    { text: 'return', indent: 2 },
    { text: 'curr = curr.next', indent: 1 },
    { text: '// not found', indent: 0 },
  ],
  deleteByValueDoubly: [
    { text: 'curr = head', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'if curr.val == val:', indent: 1 },
    { text: 'if curr.prev: curr.prev.next = curr.next', indent: 2 },
    { text: 'if curr.next: curr.next.prev = curr.prev', indent: 2 },
    { text: 'if curr == head: head = curr.next', indent: 2 },
    { text: 'if curr == tail: tail = curr.prev', indent: 2 },
    { text: 'delete curr; return', indent: 2 },
    { text: 'curr = curr.next', indent: 1 },
  ],
  search: [
    { text: 'curr = head', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'if curr.val == val: return curr', indent: 1 },
    { text: 'curr = curr.next', indent: 1 },
    { text: 'return null', indent: 0 },
  ],
  reverse: [
    { text: 'prev = null', indent: 0 },
    { text: 'curr = head', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'next = curr.next', indent: 1 },
    { text: 'curr.next = prev', indent: 1 },
    { text: 'prev = curr', indent: 1 },
    { text: 'curr = next', indent: 1 },
    { text: 'head = prev', indent: 0 },
  ],
  reverseDoubly: [
    { text: 'curr = head', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'swap(curr.prev, curr.next)', indent: 1 },
    { text: 'curr = curr.prev', indent: 1 },
    { text: 'swap(head, tail)', indent: 0 },
  ],
  insertAtIndexDoubly: [
    { text: 'newNode = new Node(val)', indent: 0 },
    { text: 'curr = head, i = 0', indent: 0 },
    { text: 'while i < idx:', indent: 0 },
    { text: 'curr = curr.next; i++', indent: 1 },
    { text: 'newNode.prev = curr.prev', indent: 0 },
    { text: 'newNode.next = curr', indent: 0 },
    { text: 'if curr.prev: curr.prev.next = newNode', indent: 0 },
    { text: 'curr.prev = newNode', indent: 0 },
  ],
  length: [
    { text: 'count = 0, curr = head', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'count++', indent: 1 },
    { text: 'curr = curr.next', indent: 1 },
    { text: 'return count', indent: 0 },
  ],
  traverseBackward: [
    { text: 'curr = tail', indent: 0 },
    { text: 'while curr ≠ null:', indent: 0 },
    { text: 'visit(curr)', indent: 1 },
    { text: 'curr = curr.prev', indent: 1 },
  ],
};

// ============================================
// STEP GENERATORS
// ============================================

let nextId = 100;

function insertAtHeadSteps(nodes, val, isDoubly) {
  const steps = [];
  const newNode = { id: nextId++, val };
  const newNodes = [newNode, ...nodes];

  // Step 0: Create new node
  steps.push({
    nodes: newNodes,
    highlightIds: [newNode.id],
    pointerLabels: { [newNode.id]: 'new' },
    fadeInIds: [newNode.id],
    headId: nodes.length > 0 ? nodes[0].id : newNode.id,
    tailId: isDoubly && nodes.length > 0 ? nodes[nodes.length - 1].id : (isDoubly ? newNode.id : null),
    pseudoLine: 0,
    message: `Creating new node with value ${val}`,
  });

  // Step 1: Point new node to old head
  steps.push({
    nodes: newNodes,
    highlightIds: [newNode.id],
    pointerLabels: { [newNode.id]: 'new', ...(nodes.length > 0 ? { [nodes[0].id]: 'head' } : {}) },
    arrowAnimate: nodes.length > 0 ? { from: newNode.id, to: nodes[0].id } : null,
    headId: nodes.length > 0 ? nodes[0].id : newNode.id,
    tailId: isDoubly && nodes.length > 0 ? nodes[nodes.length - 1].id : (isDoubly ? newNode.id : null),
    pseudoLine: 1,
    message: `Setting newNode.next = head`,
  });

  // Step 2 (doubly): Set old head's prev to new node
  if (isDoubly && nodes.length > 0) {
    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id, nodes[0].id],
      pointerLabels: { [newNode.id]: 'new', [nodes[0].id]: 'oldHead' },
      headId: nodes[0].id,
      tailId: nodes[nodes.length - 1].id,
      pseudoLine: 2,
      message: `Setting oldHead.prev = newNode`,
    });
  }

  // Final step: Move head to new node
  steps.push({
    nodes: newNodes,
    highlightIds: [],
    pointerLabels: {},
    headId: newNode.id,
    tailId: isDoubly ? (nodes.length > 0 ? nodes[nodes.length - 1].id : newNode.id) : null,
    pseudoLine: isDoubly ? 3 : 2,
    message: `Head now points to new node`,
  });

  return { steps, newNodes };
}

function insertAtTailSteps(nodes, val, isDoubly) {
  const steps = [];
  const newNode = { id: nextId++, val };

  if (nodes.length === 0) {
    const newNodes = [newNode];
    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id],
      pointerLabels: { [newNode.id]: 'new' },
      fadeInIds: [newNode.id],
      headId: newNode.id,
      tailId: isDoubly ? newNode.id : null,
      pseudoLine: 0,
      message: `List is empty. Creating new node as head${isDoubly ? ' and tail' : ''}.`,
    });
    return { steps, newNodes };
  }

  // For doubly linked list, O(1) operation
  if (isDoubly) {
    const newNodes = [...nodes, newNode];
    const tailNode = nodes[nodes.length - 1];

    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id],
      pointerLabels: { [newNode.id]: 'new' },
      fadeInIds: [newNode.id],
      headId: nodes[0].id,
      tailId: tailNode.id,
      pseudoLine: 0,
      message: `Creating new node with value ${val}`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id, tailNode.id],
      pointerLabels: { [newNode.id]: 'new', [tailNode.id]: 'tail' },
      headId: nodes[0].id,
      tailId: tailNode.id,
      pseudoLine: 1,
      message: `Setting newNode.prev = tail`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [tailNode.id],
      pointerLabels: { [tailNode.id]: 'tail', [newNode.id]: 'new' },
      arrowAnimate: { from: tailNode.id, to: newNode.id },
      headId: nodes[0].id,
      tailId: tailNode.id,
      pseudoLine: 2,
      message: `Setting tail.next = newNode`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [],
      pointerLabels: {},
      headId: nodes[0].id,
      tailId: newNode.id,
      pseudoLine: 3,
      message: `Tail now points to new node`,
    });

    return { steps, newNodes };
  }

  // Singly linked list: O(n) traversal
  const newNodes = [...nodes, newNode];

  steps.push({
    nodes: newNodes,
    highlightIds: [newNode.id],
    pointerLabels: { [newNode.id]: 'new' },
    fadeInIds: [newNode.id],
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 0,
    message: `Creating new node with value ${val}`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [nodes[0].id],
    pointerLabels: { [nodes[0].id]: 'curr' },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 1,
    message: `Starting at head (curr = head)`,
  });

  // Traverse to find the tail
  for (let i = 0; i < nodes.length - 1; i++) {
    steps.push({
      nodes: newNodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 2,
      message: `curr.next ≠ null, continuing...`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [nodes[i + 1].id],
      pointerLabels: { [nodes[i + 1].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 3,
      message: `Moving curr to next node`,
    });
  }

  // At the last node
  steps.push({
    nodes: newNodes,
    highlightIds: [nodes[nodes.length - 1].id],
    pointerLabels: { [nodes[nodes.length - 1].id]: 'curr' },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 2,
    message: `curr.next == null, found tail`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [nodes[nodes.length - 1].id, newNode.id],
    pointerLabels: { [nodes[nodes.length - 1].id]: 'curr', [newNode.id]: 'new' },
    arrowAnimate: { from: nodes[nodes.length - 1].id, to: newNode.id },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 4,
    message: `Setting curr.next = newNode`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [],
    pointerLabels: {},
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 4,
    message: `New node inserted at tail`,
  });

  return { steps, newNodes };
}

function insertAtIndexSteps(nodes, val, idx, isDoubly = false) {
  const steps = [];
  const newNode = { id: nextId++, val };

  if (idx <= 0) {
    return insertAtHeadSteps(nodes, val, isDoubly);
  }

  if (idx >= nodes.length) {
    return insertAtTailSteps(nodes, val, isDoubly);
  }

  const newNodes = [...nodes.slice(0, idx), newNode, ...nodes.slice(idx)];
  const tailId = isDoubly ? nodes[nodes.length - 1].id : null;

  steps.push({
    nodes: newNodes,
    highlightIds: [newNode.id],
    pointerLabels: { [newNode.id]: 'new' },
    fadeInIds: [newNode.id],
    headId: nodes[0].id,
    tailId,
    pseudoLine: 0,
    message: `Creating new node with value ${val}`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [nodes[0].id],
    pointerLabels: { [nodes[0].id]: 'curr' },
    counter: 0,
    headId: nodes[0].id,
    tailId,
    pseudoLine: 1,
    message: `Starting at head (curr = head, i = 0)`,
  });

  // For doubly, traverse to position idx (not idx-1)
  const targetIdx = isDoubly ? idx : idx - 1;

  for (let i = 0; i < targetIdx; i++) {
    steps.push({
      nodes: newNodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      counter: i,
      headId: nodes[0].id,
      tailId,
      pseudoLine: 2,
      message: `i = ${i} < ${targetIdx}, continue loop`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [nodes[i + 1].id],
      pointerLabels: { [nodes[i + 1].id]: 'curr' },
      counter: i + 1,
      headId: nodes[0].id,
      tailId,
      pseudoLine: 3,
      message: `Moving curr to next (i = ${i + 1})`,
    });
  }

  if (isDoubly) {
    // Doubly linked list insertion
    const currNode = nodes[idx];
    const prevNodeDoubly = nodes[idx - 1];

    steps.push({
      nodes: newNodes,
      highlightIds: [currNode.id],
      pointerLabels: { [currNode.id]: 'curr' },
      headId: nodes[0].id,
      tailId,
      pseudoLine: 2,
      message: `i = ${idx}, reached target position`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id, prevNodeDoubly.id],
      pointerLabels: { [currNode.id]: 'curr', [newNode.id]: 'new', [prevNodeDoubly.id]: 'curr.prev' },
      headId: nodes[0].id,
      tailId,
      pseudoLine: 4,
      message: `Setting newNode.prev = curr.prev`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id, currNode.id],
      pointerLabels: { [currNode.id]: 'curr', [newNode.id]: 'new' },
      arrowAnimate: { from: newNode.id, to: currNode.id },
      headId: nodes[0].id,
      tailId,
      pseudoLine: 5,
      message: `Setting newNode.next = curr`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [prevNodeDoubly.id, newNode.id],
      pointerLabels: { [prevNodeDoubly.id]: 'curr.prev', [newNode.id]: 'new' },
      arrowAnimate: { from: prevNodeDoubly.id, to: newNode.id },
      headId: nodes[0].id,
      tailId,
      pseudoLine: 6,
      message: `Setting curr.prev.next = newNode`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [currNode.id, newNode.id],
      pointerLabels: { [currNode.id]: 'curr', [newNode.id]: 'new' },
      headId: nodes[0].id,
      tailId,
      pseudoLine: 7,
      message: `Setting curr.prev = newNode`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [],
      pointerLabels: {},
      headId: nodes[0].id,
      tailId,
      pseudoLine: 7,
      message: `Node inserted at index ${idx}`,
    });
  } else {
    // Singly linked list insertion
    const prevNode = nodes[idx - 1];
    const nextNode = nodes[idx];

    steps.push({
      nodes: newNodes,
      highlightIds: [prevNode.id],
      pointerLabels: { [prevNode.id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 2,
      message: `i = ${idx - 1}, reached target position`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [newNode.id, nextNode.id],
      pointerLabels: { [prevNode.id]: 'curr', [newNode.id]: 'new', [nextNode.id]: 'curr.next' },
      arrowAnimate: { from: newNode.id, to: nextNode.id },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 4,
      message: `Setting newNode.next = curr.next`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [prevNode.id, newNode.id],
      pointerLabels: { [prevNode.id]: 'curr', [newNode.id]: 'new' },
      arrowAnimate: { from: prevNode.id, to: newNode.id },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 5,
      message: `Setting curr.next = newNode`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [],
      pointerLabels: {},
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 5,
      message: `Node inserted at index ${idx}`,
    });
  }

  return { steps, newNodes };
}

function deleteAtHeadSteps(nodes, isDoubly) {
  const steps = [];

  if (nodes.length === 0) {
    steps.push({
      nodes: [],
      highlightIds: [],
      pointerLabels: {},
      headId: null,
      tailId: null,
      pseudoLine: -1,
      message: `List is empty, nothing to delete`,
    });
    return { steps, newNodes: [] };
  }

  const headNode = nodes[0];
  const newNodes = nodes.slice(1);

  steps.push({
    nodes,
    highlightIds: [headNode.id],
    pointerLabels: { [headNode.id]: 'temp' },
    headId: headNode.id,
    tailId: isDoubly && nodes.length > 1 ? nodes[nodes.length - 1].id : (isDoubly ? headNode.id : null),
    pseudoLine: 0,
    message: `Storing reference to head (temp = head)`,
  });

  steps.push({
    nodes,
    highlightIds: [headNode.id, ...(newNodes.length > 0 ? [newNodes[0].id] : [])],
    pointerLabels: { [headNode.id]: 'temp', ...(newNodes.length > 0 ? { [newNodes[0].id]: 'head' } : {}) },
    headId: newNodes.length > 0 ? newNodes[0].id : null,
    tailId: isDoubly && newNodes.length > 0 ? newNodes[newNodes.length - 1].id : null,
    pseudoLine: 1,
    message: `Moving head to next node`,
  });

  if (isDoubly && newNodes.length > 0) {
    steps.push({
      nodes,
      highlightIds: [newNodes[0].id],
      pointerLabels: { [headNode.id]: 'temp', [newNodes[0].id]: 'head' },
      headId: newNodes[0].id,
      tailId: newNodes[newNodes.length - 1].id,
      pseudoLine: 2,
      message: `Setting new head.prev = null`,
    });
  }

  steps.push({
    nodes,
    highlightIds: [headNode.id],
    fadeOutIds: [headNode.id],
    pointerLabels: { [headNode.id]: 'temp' },
    headId: newNodes.length > 0 ? newNodes[0].id : null,
    tailId: isDoubly && newNodes.length > 0 ? newNodes[newNodes.length - 1].id : null,
    pseudoLine: isDoubly ? 3 : 2,
    message: `Deleting temp node`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [],
    pointerLabels: {},
    headId: newNodes.length > 0 ? newNodes[0].id : null,
    tailId: isDoubly && newNodes.length > 0 ? newNodes[newNodes.length - 1].id : null,
    pseudoLine: isDoubly ? 3 : 2,
    message: `Head deleted successfully`,
  });

  return { steps, newNodes };
}

function deleteAtTailSteps(nodes, isDoubly) {
  const steps = [];

  if (nodes.length === 0) {
    steps.push({
      nodes: [],
      highlightIds: [],
      pointerLabels: {},
      headId: null,
      tailId: null,
      pseudoLine: -1,
      message: `List is empty, nothing to delete`,
    });
    return { steps, newNodes: [] };
  }

  if (nodes.length === 1) {
    return deleteAtHeadSteps(nodes, isDoubly);
  }

  const tailNode = nodes[nodes.length - 1];
  const newNodes = nodes.slice(0, -1);

  if (isDoubly) {
    // O(1) for doubly linked list
    const newTail = nodes[nodes.length - 2];

    steps.push({
      nodes,
      highlightIds: [tailNode.id],
      pointerLabels: { [tailNode.id]: 'temp' },
      headId: nodes[0].id,
      tailId: tailNode.id,
      pseudoLine: 0,
      message: `Storing reference to tail (temp = tail)`,
    });

    steps.push({
      nodes,
      highlightIds: [newTail.id, tailNode.id],
      pointerLabels: { [tailNode.id]: 'temp', [newTail.id]: 'tail' },
      headId: nodes[0].id,
      tailId: newTail.id,
      pseudoLine: 1,
      message: `Moving tail to previous node`,
    });

    steps.push({
      nodes,
      highlightIds: [newTail.id],
      pointerLabels: { [newTail.id]: 'tail', [tailNode.id]: 'temp' },
      headId: nodes[0].id,
      tailId: newTail.id,
      pseudoLine: 2,
      message: `Setting new tail.next = null`,
    });

    steps.push({
      nodes,
      highlightIds: [tailNode.id],
      fadeOutIds: [tailNode.id],
      pointerLabels: { [tailNode.id]: 'temp' },
      headId: nodes[0].id,
      tailId: newTail.id,
      pseudoLine: 3,
      message: `Deleting temp node`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [],
      pointerLabels: {},
      headId: newNodes[0].id,
      tailId: newTail.id,
      pseudoLine: 3,
      message: `Tail deleted successfully`,
    });

    return { steps, newNodes };
  }

  // Singly linked list: O(n) traversal
  steps.push({
    nodes,
    highlightIds: [nodes[0].id],
    pointerLabels: { [nodes[0].id]: 'curr' },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 0,
    message: `Starting at head (curr = head)`,
  });

  for (let i = 0; i < nodes.length - 2; i++) {
    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 1,
      message: `curr.next.next ≠ null, continue`,
    });

    steps.push({
      nodes,
      highlightIds: [nodes[i + 1].id],
      pointerLabels: { [nodes[i + 1].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 2,
      message: `Moving curr to next`,
    });
  }

  const secondToLast = nodes[nodes.length - 2];

  steps.push({
    nodes,
    highlightIds: [secondToLast.id],
    pointerLabels: { [secondToLast.id]: 'curr' },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 1,
    message: `curr.next.next == null, found second-to-last`,
  });

  steps.push({
    nodes,
    highlightIds: [tailNode.id],
    fadeOutIds: [tailNode.id],
    pointerLabels: { [secondToLast.id]: 'curr', [tailNode.id]: 'curr.next' },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 3,
    message: `Deleting curr.next`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [secondToLast.id],
    pointerLabels: { [secondToLast.id]: 'curr' },
    headId: newNodes[0].id,
    tailId: null,
    pseudoLine: 4,
    message: `Setting curr.next = null`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [],
    pointerLabels: {},
    headId: newNodes[0].id,
    tailId: null,
    pseudoLine: 4,
    message: `Tail deleted successfully`,
  });

  return { steps, newNodes };
}

function deleteByValueSteps(nodes, val, isDoubly = false) {
  const steps = [];
  const tailId = isDoubly && nodes.length > 0 ? nodes[nodes.length - 1].id : null;

  if (nodes.length === 0) {
    steps.push({
      nodes: [],
      highlightIds: [],
      pointerLabels: {},
      headId: null,
      tailId: null,
      pseudoLine: -1,
      message: `List is empty, nothing to delete`,
    });
    return { steps, newNodes: [] };
  }

  // Check if head is the value
  if (nodes[0].val === val) {
    const headNode = nodes[0];
    const newNodes = nodes.slice(1);
    const newTailId = isDoubly && newNodes.length > 0 ? newNodes[newNodes.length - 1].id : null;

    steps.push({
      nodes,
      highlightIds: [headNode.id],
      pointerLabels: { [headNode.id]: 'curr' },
      headId: headNode.id,
      tailId,
      pseudoLine: isDoubly ? 2 : 0,
      message: `Checking curr: ${headNode.val} == ${val}? Yes!`,
    });

    if (isDoubly) {
      // Doubly linked: update next node's prev
      if (newNodes.length > 0) {
        steps.push({
          nodes,
          highlightIds: [headNode.id, newNodes[0].id],
          pointerLabels: { [headNode.id]: 'curr', [newNodes[0].id]: 'curr.next' },
          headId: headNode.id,
          tailId,
          pseudoLine: 4,
          message: `Setting curr.next.prev = null`,
        });
      }

      steps.push({
        nodes,
        highlightIds: [headNode.id],
        pointerLabels: { [headNode.id]: 'curr' },
        headId: newNodes.length > 0 ? newNodes[0].id : null,
        tailId: newTailId,
        pseudoLine: 5,
        message: `curr == head, so head = curr.next`,
      });
    }

    steps.push({
      nodes,
      highlightIds: [headNode.id],
      fadeOutIds: [headNode.id],
      foundId: headNode.id,
      pointerLabels: { [headNode.id]: 'curr' },
      headId: newNodes.length > 0 ? newNodes[0].id : null,
      tailId: newTailId,
      pseudoLine: isDoubly ? 7 : 3,
      message: `Deleting curr`,
    });

    steps.push({
      nodes: newNodes,
      highlightIds: [],
      pointerLabels: {},
      headId: newNodes.length > 0 ? newNodes[0].id : null,
      tailId: newTailId,
      pseudoLine: isDoubly ? 7 : 4,
      message: `Node with value ${val} deleted`,
    });

    return { steps, newNodes };
  }

  steps.push({
    nodes,
    highlightIds: [nodes[0].id],
    pointerLabels: { [nodes[0].id]: 'curr' },
    headId: nodes[0].id,
    tailId,
    pseudoLine: 0,
    message: `Starting at head (curr = head)`,
  });

  let foundIdx = -1;

  if (isDoubly) {
    // Doubly linked: check curr.val == val
    for (let i = 1; i < nodes.length; i++) {
      const currNode = nodes[i];

      steps.push({
        nodes,
        highlightIds: [currNode.id],
        pointerLabels: { [currNode.id]: 'curr' },
        headId: nodes[0].id,
        tailId,
        pseudoLine: 1,
        message: `curr ≠ null, checking curr.val`,
      });

      if (currNode.val === val) {
        foundIdx = i;
        const newNodes = [...nodes.slice(0, foundIdx), ...nodes.slice(foundIdx + 1)];
        const prevNode = nodes[i - 1];
        const nextNode = i < nodes.length - 1 ? nodes[i + 1] : null;
        const newTailId = newNodes.length > 0 ? newNodes[newNodes.length - 1].id : null;

        steps.push({
          nodes,
          highlightIds: [currNode.id],
          foundId: currNode.id,
          pointerLabels: { [currNode.id]: 'curr' },
          headId: nodes[0].id,
          tailId,
          pseudoLine: 2,
          message: `curr.val (${currNode.val}) == ${val}? Yes!`,
        });

        steps.push({
          nodes,
          highlightIds: [prevNode.id, currNode.id],
          pointerLabels: { [currNode.id]: 'curr', [prevNode.id]: 'curr.prev' },
          headId: nodes[0].id,
          tailId,
          pseudoLine: 3,
          message: `Setting curr.prev.next = curr.next`,
        });

        if (nextNode) {
          steps.push({
            nodes,
            highlightIds: [nextNode.id, currNode.id],
            pointerLabels: { [currNode.id]: 'curr', [nextNode.id]: 'curr.next' },
            headId: nodes[0].id,
            tailId,
            pseudoLine: 4,
            message: `Setting curr.next.prev = curr.prev`,
          });
        }

        if (i === nodes.length - 1) {
          steps.push({
            nodes,
            highlightIds: [currNode.id],
            pointerLabels: { [currNode.id]: 'curr' },
            headId: nodes[0].id,
            tailId: newTailId,
            pseudoLine: 6,
            message: `curr == tail, so tail = curr.prev`,
          });
        }

        steps.push({
          nodes,
          highlightIds: [currNode.id],
          fadeOutIds: [currNode.id],
          pointerLabels: { [currNode.id]: 'curr' },
          headId: nodes[0].id,
          tailId: newTailId,
          pseudoLine: 7,
          message: `Deleting curr`,
        });

        steps.push({
          nodes: newNodes,
          highlightIds: [],
          pointerLabels: {},
          headId: newNodes[0].id,
          tailId: newTailId,
          pseudoLine: 7,
          message: `Node with value ${val} deleted`,
        });

        return { steps, newNodes };
      } else {
        steps.push({
          nodes,
          highlightIds: [currNode.id],
          dimmedIds: [currNode.id],
          pointerLabels: { [currNode.id]: 'curr' },
          headId: nodes[0].id,
          tailId,
          pseudoLine: 2,
          message: `curr.val (${currNode.val}) == ${val}? No`,
        });

        steps.push({
          nodes,
          highlightIds: [currNode.id],
          pointerLabels: { [currNode.id]: 'curr' },
          headId: nodes[0].id,
          tailId,
          pseudoLine: 8,
          message: `Moving curr to next`,
        });
      }
    }

    // Not found
    steps.push({
      nodes,
      highlightIds: [],
      pointerLabels: {},
      headId: nodes[0].id,
      tailId,
      pseudoLine: -1,
      message: `Value ${val} not found in list`,
    });

    return { steps, newNodes: nodes };
  }

  // Singly linked: check curr.next.val == val
  for (let i = 0; i < nodes.length - 1; i++) {
    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 1,
      message: `curr.next ≠ null, checking curr.next.val`,
    });

    const nextNode = nodes[i + 1];
    if (nextNode.val === val) {
      foundIdx = i + 1;

      steps.push({
        nodes,
        highlightIds: [nodes[i].id, nextNode.id],
        foundId: nextNode.id,
        pointerLabels: { [nodes[i].id]: 'curr', [nextNode.id]: 'found' },
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 2,
        message: `curr.next.val (${nextNode.val}) == ${val}? Yes!`,
      });

      const newNodes = [...nodes.slice(0, foundIdx), ...nodes.slice(foundIdx + 1)];

      steps.push({
        nodes,
        highlightIds: [nodes[i].id],
        fadeOutIds: [nextNode.id],
        pointerLabels: { [nodes[i].id]: 'curr' },
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 3,
        message: `Bypassing node: curr.next = curr.next.next`,
      });

      steps.push({
        nodes: newNodes,
        highlightIds: [],
        pointerLabels: {},
        headId: newNodes[0].id,
        tailId: null,
        pseudoLine: 4,
        message: `Node with value ${val} deleted`,
      });

      return { steps, newNodes };
    } else {
      steps.push({
        nodes,
        highlightIds: [nextNode.id],
        dimmedIds: [nextNode.id],
        pointerLabels: { [nodes[i].id]: 'curr' },
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 2,
        message: `curr.next.val (${nextNode.val}) == ${val}? No`,
      });

      steps.push({
        nodes,
        highlightIds: [nextNode.id],
        pointerLabels: { [nextNode.id]: 'curr' },
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 5,
        message: `Moving curr to next`,
      });
    }
  }

  // Not found
  steps.push({
    nodes,
    highlightIds: [],
    pointerLabels: {},
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 6,
    message: `Value ${val} not found in list`,
  });

  return { steps, newNodes: nodes };
}

function searchSteps(nodes, val) {
  const steps = [];

  if (nodes.length === 0) {
    steps.push({
      nodes: [],
      highlightIds: [],
      pointerLabels: {},
      headId: null,
      tailId: null,
      pseudoLine: 4,
      message: `List is empty, value not found`,
    });
    return steps;
  }

  steps.push({
    nodes,
    highlightIds: [nodes[0].id],
    pointerLabels: { [nodes[0].id]: 'curr' },
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 0,
    message: `Starting at head (curr = head)`,
  });

  for (let i = 0; i < nodes.length; i++) {
    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 1,
      message: `curr ≠ null, checking value`,
    });

    if (nodes[i].val === val) {
      steps.push({
        nodes,
        highlightIds: [nodes[i].id],
        foundId: nodes[i].id,
        pointerLabels: { [nodes[i].id]: 'found' },
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 2,
        message: `Found! curr.val (${nodes[i].val}) == ${val}`,
      });
      return steps;
    }

    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      dimmedIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 2,
      message: `curr.val (${nodes[i].val}) ≠ ${val}`,
    });

    if (i < nodes.length - 1) {
      steps.push({
        nodes,
        highlightIds: [nodes[i + 1].id],
        pointerLabels: { [nodes[i + 1].id]: 'curr' },
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 3,
        message: `Moving curr to next`,
      });
    }
  }

  steps.push({
    nodes,
    highlightIds: [],
    pointerLabels: {},
    headId: nodes[0].id,
    tailId: null,
    pseudoLine: 4,
    message: `curr == null, value ${val} not found`,
  });

  return steps;
}

function reverseSteps(nodes, isDoubly = false) {
  const steps = [];
  const tailId = isDoubly && nodes.length > 0 ? nodes[nodes.length - 1].id : null;

  if (nodes.length <= 1) {
    steps.push({
      nodes,
      highlightIds: [],
      pointerLabels: {},
      headId: nodes.length > 0 ? nodes[0].id : null,
      tailId,
      pseudoLine: isDoubly ? 4 : 7,
      message: nodes.length === 0 ? 'List is empty' : 'List has only one node, already reversed',
    });
    return { steps, newNodes: nodes };
  }

  let workingNodes = [...nodes];

  steps.push({
    nodes: workingNodes,
    highlightIds: [],
    pointerLabels: {},
    prevNodeId: null,
    headId: workingNodes[0].id,
    tailId,
    pseudoLine: 0,
    message: isDoubly ? `Initialize curr = head` : `Initialize prev = null`,
  });

  steps.push({
    nodes: workingNodes,
    highlightIds: [workingNodes[0].id],
    pointerLabels: { [workingNodes[0].id]: 'curr' },
    prevNodeId: null,
    headId: workingNodes[0].id,
    tailId,
    pseudoLine: isDoubly ? 1 : 1,
    message: isDoubly ? `curr ≠ null, continue loop` : `Initialize curr = head`,
  });

  // Track the actual reversal state
  let reversedOrder = [];
  let remaining = [...nodes];

  for (let i = 0; i < nodes.length; i++) {
    const currNode = remaining[0];
    const nextNode = remaining.length > 1 ? remaining[1] : null;
    const prevNode = reversedOrder.length > 0 ? reversedOrder[0] : null;

    steps.push({
      nodes: workingNodes,
      highlightIds: [currNode.id],
      pointerLabels: {
        [currNode.id]: 'curr',
        ...(prevNode ? { [prevNode.id]: 'prev' } : {}),
      },
      headId: workingNodes[0].id,
      tailId: null,
      pseudoLine: 2,
      message: `curr ≠ null, continue loop`,
    });

    if (nextNode) {
      steps.push({
        nodes: workingNodes,
        highlightIds: [currNode.id, nextNode.id],
        pointerLabels: {
          [currNode.id]: 'curr',
          [nextNode.id]: 'next',
          ...(prevNode ? { [prevNode.id]: 'prev' } : {}),
        },
        headId: workingNodes[0].id,
        tailId: null,
        pseudoLine: 3,
        message: `Saving next = curr.next`,
      });
    } else {
      steps.push({
        nodes: workingNodes,
        highlightIds: [currNode.id],
        pointerLabels: {
          [currNode.id]: 'curr',
          ...(prevNode ? { [prevNode.id]: 'prev' } : {}),
        },
        headId: workingNodes[0].id,
        tailId: null,
        pseudoLine: 3,
        message: `next = null (end of list)`,
      });
    }

    steps.push({
      nodes: workingNodes,
      highlightIds: [currNode.id, ...(prevNode ? [prevNode.id] : [])],
      pointerLabels: {
        [currNode.id]: 'curr',
        ...(prevNode ? { [prevNode.id]: 'prev' } : {}),
        ...(nextNode ? { [nextNode.id]: 'next' } : {}),
      },
      reverseArrow: prevNode ? { from: currNode.id, to: prevNode.id } : null,
      headId: workingNodes[0].id,
      tailId: null,
      pseudoLine: 4,
      message: `Reversing: curr.next = prev`,
    });

    // Update the order for visualization
    reversedOrder = [currNode, ...reversedOrder];
    remaining = remaining.slice(1);

    steps.push({
      nodes: workingNodes,
      highlightIds: [currNode.id],
      pointerLabels: {
        [currNode.id]: 'prev',
        ...(nextNode ? { [nextNode.id]: 'next' } : {}),
      },
      headId: workingNodes[0].id,
      tailId: null,
      pseudoLine: 5,
      message: `Moving prev = curr`,
    });

    if (nextNode) {
      steps.push({
        nodes: workingNodes,
        highlightIds: [nextNode.id],
        pointerLabels: {
          [currNode.id]: 'prev',
          [nextNode.id]: 'curr',
        },
        headId: workingNodes[0].id,
        tailId: null,
        pseudoLine: 6,
        message: `Moving curr = next`,
      });
    }
  }

  const newNodes = [...nodes].reverse();
  const newTailId = isDoubly ? newNodes[newNodes.length - 1].id : null;

  steps.push({
    nodes: newNodes,
    highlightIds: [newNodes[0].id],
    pointerLabels: { [newNodes[0].id]: 'head' },
    headId: newNodes[0].id,
    tailId: newTailId,
    pseudoLine: isDoubly ? 4 : 7,
    message: isDoubly ? `swap(head, tail), list reversed!` : `head = prev, list reversed!`,
  });

  steps.push({
    nodes: newNodes,
    highlightIds: [],
    pointerLabels: {},
    headId: newNodes[0].id,
    tailId: newTailId,
    pseudoLine: isDoubly ? 4 : 7,
    message: `Reversal complete`,
  });

  return { steps, newNodes };
}

function lengthSteps(nodes) {
  const steps = [];

  steps.push({
    nodes,
    highlightIds: nodes.length > 0 ? [nodes[0].id] : [],
    pointerLabels: nodes.length > 0 ? { [nodes[0].id]: 'curr' } : {},
    counter: 0,
    headId: nodes.length > 0 ? nodes[0].id : null,
    tailId: null,
    pseudoLine: 0,
    message: `Initialize count = 0, curr = head`,
  });

  for (let i = 0; i < nodes.length; i++) {
    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      counter: i,
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 1,
      message: `curr ≠ null`,
    });

    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      counter: i + 1,
      headId: nodes[0].id,
      tailId: null,
      pseudoLine: 2,
      message: `count++ (count = ${i + 1})`,
    });

    if (i < nodes.length - 1) {
      steps.push({
        nodes,
        highlightIds: [nodes[i + 1].id],
        pointerLabels: { [nodes[i + 1].id]: 'curr' },
        counter: i + 1,
        headId: nodes[0].id,
        tailId: null,
        pseudoLine: 3,
        message: `Moving curr to next`,
      });
    }
  }

  steps.push({
    nodes,
    highlightIds: [],
    pointerLabels: {},
    counter: nodes.length,
    headId: nodes.length > 0 ? nodes[0].id : null,
    tailId: null,
    pseudoLine: 4,
    message: `curr == null, returning count = ${nodes.length}`,
  });

  return steps;
}

function traverseBackwardSteps(nodes) {
  const steps = [];

  if (nodes.length === 0) {
    steps.push({
      nodes: [],
      highlightIds: [],
      pointerLabels: {},
      headId: null,
      tailId: null,
      pseudoLine: 0,
      message: `List is empty`,
    });
    return steps;
  }

  const tailNode = nodes[nodes.length - 1];

  steps.push({
    nodes,
    highlightIds: [tailNode.id],
    pointerLabels: { [tailNode.id]: 'curr' },
    headId: nodes[0].id,
    tailId: tailNode.id,
    pseudoLine: 0,
    message: `Starting at tail (curr = tail)`,
  });

  for (let i = nodes.length - 1; i >= 0; i--) {
    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      visitedBackward: [nodes[i].id],
      headId: nodes[0].id,
      tailId: tailNode.id,
      pseudoLine: 1,
      message: `curr ≠ null`,
    });

    steps.push({
      nodes,
      highlightIds: [nodes[i].id],
      pointerLabels: { [nodes[i].id]: 'curr' },
      visitedBackward: [nodes[i].id],
      headId: nodes[0].id,
      tailId: tailNode.id,
      pseudoLine: 2,
      message: `Visiting node with value ${nodes[i].val}`,
    });

    if (i > 0) {
      steps.push({
        nodes,
        highlightIds: [nodes[i - 1].id],
        pointerLabels: { [nodes[i - 1].id]: 'curr' },
        headId: nodes[0].id,
        tailId: tailNode.id,
        pseudoLine: 3,
        message: `Moving curr to prev`,
      });
    }
  }

  steps.push({
    nodes,
    highlightIds: [],
    pointerLabels: {},
    headId: nodes[0].id,
    tailId: tailNode.id,
    pseudoLine: 3,
    message: `curr == null, traversal complete`,
  });

  return steps;
}

// ============================================
// COMPLEXITY DATA
// ============================================

const COMPLEXITY_SINGLY = [
  { op: 'insertHead', time: 'O(1)' },
  { op: 'insertTail', time: 'O(n)' },
  { op: 'insertAt', time: 'O(n)' },
  { op: 'deleteHead', time: 'O(1)' },
  { op: 'deleteTail', time: 'O(n)' },
  { op: 'deleteVal', time: 'O(n)' },
  { op: 'search', time: 'O(n)' },
  { op: 'reverse', time: 'O(n)' },
  { op: 'length', time: 'O(n)' },
];

const COMPLEXITY_DOUBLY = [
  { op: 'insertHead', time: 'O(1)' },
  { op: 'insertTail', time: 'O(1)' },
  { op: 'insertAt', time: 'O(n)' },
  { op: 'deleteHead', time: 'O(1)' },
  { op: 'deleteTail', time: 'O(1)' },
  { op: 'deleteVal', time: 'O(n)' },
  { op: 'search', time: 'O(n)' },
  { op: 'reverse', time: 'O(n)' },
  { op: 'length', time: 'O(n)' },
  { op: 'traverseBack', time: 'O(n)' },
];

// ============================================
// MAIN COMPONENT
// ============================================

export default function LinkedListVisualizer({ type, onBack }) {
  const isDoubly = type === 'doubly';
  const label = isDoubly ? 'DOUBLY LINKED LIST' : 'SINGLY LINKED LIST';

  const [nodes, setNodes] = useState([
    { id: 0, val: 10 },
    { id: 1, val: 25 },
    { id: 2, val: 47 },
    { id: 3, val: 63 },
    { id: 4, val: 82 },
  ]);
  const [inputVal, setInputVal] = useState('');
  const [inputIdx, setInputIdx] = useState('');
  const [activeOp, setActiveOp] = useState(null);
  const [steps, setSteps] = useState([]);
  const [speed, setSpeed] = useState(500);
  const [message, setMessage] = useState('');
  const [currentPseudo, setCurrentPseudo] = useState(null);

  const animator = useAnimator(steps, speed);

  const currentStep = useMemo(() => {
    if (animator.stepIdx < 0 || animator.stepIdx >= steps.length) {
      return {
        nodes,
        highlightIds: [],
        pointerLabels: {},
        headId: nodes.length > 0 ? nodes[0].id : null,
        tailId: isDoubly && nodes.length > 0 ? nodes[nodes.length - 1].id : null,
        pseudoLine: -1,
        message: '',
      };
    }
    return steps[animator.stepIdx];
  }, [animator.stepIdx, steps, nodes, isDoubly]);

  // Update message when step changes
  React.useEffect(() => {
    if (currentStep.message) {
      setMessage(currentStep.message);
    }
  }, [currentStep]);

  const operations = isDoubly
    ? ['insertHead', 'insertTail', 'insertAt', 'deleteHead', 'deleteTail', 'deleteVal', 'search', 'reverse', 'length', 'traverseBack']
    : ['insertHead', 'insertTail', 'insertAt', 'deleteHead', 'deleteTail', 'deleteVal', 'search', 'reverse', 'length'];

  const opLabels = {
    insertHead: 'Insert Head',
    insertTail: 'Insert Tail',
    insertAt: 'Insert At',
    deleteHead: 'Delete Head',
    deleteTail: 'Delete Tail',
    deleteVal: 'Delete Value',
    search: 'Search',
    reverse: 'Reverse',
    length: 'Length',
    traverseBack: 'Traverse Back',
  };

  const needsValue = ['insertHead', 'insertTail', 'insertAt', 'deleteVal', 'search'];
  const needsIndex = ['insertAt'];

  const handleRun = () => {
    if (!activeOp) return;

    const val = parseInt(inputVal, 10);
    const idx = parseInt(inputIdx, 10);

    let result;
    let pseudoKey = activeOp;

    switch (activeOp) {
      case 'insertHead':
        if (isNaN(val)) return;
        result = insertAtHeadSteps(nodes, val, isDoubly);
        pseudoKey = isDoubly ? 'insertAtHeadDoubly' : 'insertAtHead';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'insertTail':
        if (isNaN(val)) return;
        result = insertAtTailSteps(nodes, val, isDoubly);
        pseudoKey = isDoubly ? 'insertAtTailDoubly' : 'insertAtTail';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'insertAt':
        if (isNaN(val) || isNaN(idx)) return;
        result = insertAtIndexSteps(nodes, val, idx, isDoubly);
        pseudoKey = isDoubly ? 'insertAtIndexDoubly' : 'insertAtIndex';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'deleteHead':
        result = deleteAtHeadSteps(nodes, isDoubly);
        pseudoKey = isDoubly ? 'deleteAtHeadDoubly' : 'deleteAtHead';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'deleteTail':
        result = deleteAtTailSteps(nodes, isDoubly);
        pseudoKey = isDoubly ? 'deleteAtTailDoubly' : 'deleteAtTail';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'deleteVal':
        if (isNaN(val)) return;
        result = deleteByValueSteps(nodes, val, isDoubly);
        pseudoKey = isDoubly ? 'deleteByValueDoubly' : 'deleteByValue';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'search':
        if (isNaN(val)) return;
        result = searchSteps(nodes, val);
        pseudoKey = 'search';
        setSteps(result);
        break;
      case 'reverse':
        result = reverseSteps(nodes, isDoubly);
        pseudoKey = isDoubly ? 'reverseDoubly' : 'reverse';
        setNodes(result.newNodes);
        setSteps(result.steps);
        break;
      case 'length':
        result = lengthSteps(nodes);
        pseudoKey = 'length';
        setSteps(result);
        break;
      case 'traverseBack':
        result = traverseBackwardSteps(nodes);
        pseudoKey = 'traverseBackward';
        setSteps(result);
        break;
      default:
        return;
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
    setNodes([
      { id: 0, val: 10 },
      { id: 1, val: 25 },
      { id: 2, val: 47 },
      { id: 3, val: 63 },
      { id: 4, val: 82 },
    ]);
    nextId = 100;
  };

  const displayNodes = currentStep.nodes || nodes;
  const nodeSpacing = isDoubly ? 140 : 100;
  const svgWidth = Math.max(600, displayNodes.length * nodeSpacing + 160);
  const svgHeight = isDoubly ? 200 : 160;

  const complexityData = isDoubly ? COMPLEXITY_DOUBLY : COMPLEXITY_SINGLY;
  const pseudoLines = PSEUDOCODE[currentPseudo] || [];

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
        {needsValue.includes(activeOp) && (
          <input
            type="number"
            placeholder="Value"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            className="w-20 px-2 py-1 text-sm bg-zinc-900 border border-zinc-700 text-white focus:outline-none focus:border-blue-500"
          />
        )}
        {needsIndex.includes(activeOp) && (
          <input
            type="number"
            placeholder="Index"
            value={inputIdx}
            onChange={(e) => setInputIdx(e.target.value)}
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
        {typeof currentStep.counter === 'number' && (
          <div className="ml-4 px-3 py-1 text-sm bg-zinc-800 border border-zinc-700">
            Count: <span className="text-green-400 font-bold">{currentStep.counter}</span>
          </div>
        )}
      </div>

      {/* Main Visualization Area */}
      <div className="flex-1 flex flex-col px-4 py-4">
        <CourseCallout title={isDoubly ? "Doubly Linked List" : "Singly Linked List"} storageKey={isDoubly ? "doublylinked" : "singlylinked"}>
{isDoubly ? `Doubly linked lists have prev and next pointers:
struct Node { T val; Node* prev; Node* next; };

Key advantage: O(1) tail operations with tail pointer.
Bidirectional traversal: curr = curr->prev;

Trade-offs:
• Extra memory per node (prev pointer)
• More pointers to update on insert/delete

STL equivalent: std::list` : `Singly linked lists in C++ use heap-allocated nodes:
struct Node { T val; Node* next; };

Traversal: while(curr != nullptr) { ... curr = curr->next; }

Common pitfalls:
• Dangling pointer after delete
• Lost memory when reassigning head

STL equivalent: std::forward_list`}
        </CourseCallout>
        {/* SVG Container */}
        <div className="flex-1 flex items-center justify-center overflow-x-auto">
          <div className="overflow-x-auto">
            <svg width={svgWidth} height={svgHeight} className="min-w-full">
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#38bdf8" />
                </marker>
                <marker
                  id="arrowhead-prev"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#a78bfa" />
                </marker>
                <marker
                  id="arrowhead-animate"
                  markerWidth="8"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#22c55e" />
                </marker>
              </defs>

              {/* Render nodes and arrows */}
              {displayNodes.map((node, i) => {
                const x = 80 + i * nodeSpacing;
                const y = isDoubly ? 100 : 80;
                const isHighlighted = currentStep.highlightIds?.includes(node.id);
                const isFadeIn = currentStep.fadeInIds?.includes(node.id);
                const isFadeOut = currentStep.fadeOutIds?.includes(node.id);
                const isFound = currentStep.foundId === node.id;
                const isDimmed = currentStep.dimmedIds?.includes(node.id);
                const isVisitedBackward = currentStep.visitedBackward?.includes(node.id);
                const label = currentStep.pointerLabels?.[node.id];
                const isHead = currentStep.headId === node.id;
                const isTail = isDoubly && currentStep.tailId === node.id;

                let fill = '#27272a';
                let stroke = '#3f3f46';

                if (isFound) {
                  fill = '#166534';
                  stroke = '#22c55e';
                } else if (isHighlighted) {
                  fill = '#78350f';
                  stroke = '#f97316';
                } else if (isDimmed) {
                  fill = '#18181b';
                  stroke = '#27272a';
                } else if (isVisitedBackward) {
                  fill = '#4c1d95';
                  stroke = '#a78bfa';
                }

                const opacity = isFadeOut ? 0.3 : isFadeIn ? 0.9 : 1;

                const nodeWidth = isDoubly ? 98 : 70;
                const valueWidth = 44;
                const pointerWidth = isDoubly ? 26 : 26;

                return (
                  <g key={node.id}>
                    {/* Node group */}
                    <g
                      transform={`translate(${x}, ${y})`}
                      style={{ opacity, transition: 'opacity 0.3s' }}
                    >
                      {/* HEAD label */}
                      {isHead && (
                        <g>
                          <text
                            y={-38}
                            textAnchor="middle"
                            fill="#38bdf8"
                            fontSize={10}
                            fontWeight="bold"
                          >
                            HEAD
                          </text>
                          <path
                            d="M 0 -32 L 0 -22"
                            stroke="#38bdf8"
                            strokeWidth={1.5}
                            markerEnd="url(#arrowhead)"
                          />
                        </g>
                      )}

                      {/* TAIL label (doubly only) */}
                      {isTail && !isHead && (
                        <g>
                          <text
                            y={-38}
                            textAnchor="middle"
                            fill="#a78bfa"
                            fontSize={10}
                            fontWeight="bold"
                          >
                            TAIL
                          </text>
                          <path
                            d="M 0 -32 L 0 -22"
                            stroke="#a78bfa"
                            strokeWidth={1.5}
                            markerEnd="url(#arrowhead-prev)"
                          />
                        </g>
                      )}

                      {/* HEAD + TAIL label */}
                      {isHead && isTail && (
                        <g>
                          <text
                            y={-38}
                            textAnchor="middle"
                            fill="#38bdf8"
                            fontSize={10}
                            fontWeight="bold"
                          >
                            HEAD/TAIL
                          </text>
                        </g>
                      )}

                      {/* Pointer label */}
                      {label && (
                        <text
                          y={isDoubly ? 52 : 42}
                          textAnchor="middle"
                          fill="#f97316"
                          fontSize={10}
                          fontWeight="bold"
                        >
                          {label}
                        </text>
                      )}

                      {/* Doubly: prev compartment */}
                      {isDoubly && (
                        <>
                          <rect
                            x={-nodeWidth / 2}
                            y={-18}
                            width={pointerWidth}
                            height={36}
                            rx={4}
                            fill="#1c1c1e"
                            stroke={stroke}
                            strokeWidth={1.5}
                          />
                          <text
                            x={-nodeWidth / 2 + pointerWidth / 2}
                            textAnchor="middle"
                            dominantBaseline="middle"
                            fill="#a78bfa"
                            fontSize={8}
                          >
                            ←
                          </text>
                        </>
                      )}

                      {/* Value compartment */}
                      <rect
                        x={isDoubly ? -nodeWidth / 2 + pointerWidth + 1 : -nodeWidth / 2}
                        y={-18}
                        width={valueWidth}
                        height={36}
                        rx={4}
                        fill={fill}
                        stroke={stroke}
                        strokeWidth={1.5}
                      />
                      <text
                        x={isDoubly ? -nodeWidth / 2 + pointerWidth + 1 + valueWidth / 2 : -nodeWidth / 2 + valueWidth / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="white"
                        fontSize={12}
                        fontWeight="bold"
                      >
                        {node.val}
                      </text>

                      {/* Next compartment */}
                      <rect
                        x={isDoubly ? nodeWidth / 2 - pointerWidth : nodeWidth / 2 - pointerWidth}
                        y={-18}
                        width={pointerWidth}
                        height={36}
                        rx={4}
                        fill="#1c1c1e"
                        stroke={stroke}
                        strokeWidth={1.5}
                      />
                      <text
                        x={isDoubly ? nodeWidth / 2 - pointerWidth / 2 : nodeWidth / 2 - pointerWidth / 2}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fill="#38bdf8"
                        fontSize={8}
                      >
                        →
                      </text>
                    </g>

                    {/* Next arrow (to next node) */}
                    {i < displayNodes.length - 1 && (
                      <path
                        d={`M ${x + nodeWidth / 2} ${y} Q ${x + nodeSpacing / 2} ${y - (isDoubly ? 25 : 0)}, ${x + nodeSpacing - nodeWidth / 2} ${y}`}
                        fill="none"
                        stroke="#38bdf8"
                        strokeWidth={1.5}
                        markerEnd="url(#arrowhead)"
                        style={{ opacity }}
                      />
                    )}

                    {/* Prev arrow (doubly only, below nodes) */}
                    {isDoubly && i > 0 && (
                      <path
                        d={`M ${x - nodeWidth / 2} ${y + 5} Q ${x - nodeSpacing / 2} ${y + 30}, ${x - nodeSpacing + nodeWidth / 2} ${y + 5}`}
                        fill="none"
                        stroke="#a78bfa"
                        strokeWidth={1.5}
                        markerEnd="url(#arrowhead-prev)"
                        style={{ opacity }}
                      />
                    )}

                    {/* NULL terminator for last node */}
                    {i === displayNodes.length - 1 && (
                      <g transform={`translate(${x + (isDoubly ? 75 : 55)}, ${y})`} style={{ opacity }}>
                        <rect
                          x={-12}
                          y={-10}
                          width={28}
                          height={20}
                          rx={3}
                          fill="#18181b"
                          stroke="#3f3f46"
                          strokeWidth={1}
                        />
                        <text
                          textAnchor="middle"
                          x={2}
                          dominantBaseline="middle"
                          fill="#52525b"
                          fontSize={8}
                        >
                          NULL
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}

              {/* Animated arrow for current step */}
              {currentStep.arrowAnimate && (
                (() => {
                  const fromIdx = displayNodes.findIndex(n => n.id === currentStep.arrowAnimate.from);
                  const toIdx = displayNodes.findIndex(n => n.id === currentStep.arrowAnimate.to);
                  if (fromIdx === -1 || toIdx === -1) return null;
                  const fromX = 80 + fromIdx * nodeSpacing;
                  const toX = 80 + toIdx * nodeSpacing;
                  const y = isDoubly ? 100 : 80;
                  const animNodeWidth = isDoubly ? 98 : 70;
                  return (
                    <path
                      d={`M ${fromX + animNodeWidth / 2} ${y} Q ${(fromX + toX) / 2} ${y - 40}, ${toX - animNodeWidth / 2} ${y}`}
                      fill="none"
                      stroke="#22c55e"
                      strokeWidth={2}
                      strokeDasharray="6 3"
                      markerEnd="url(#arrowhead-animate)"
                      style={{ animation: 'dash 0.5s linear infinite' }}
                    />
                  );
                })()
              )}

              {/* Empty state */}
              {displayNodes.length === 0 && (
                <text
                  x={svgWidth / 2}
                  y={svgHeight / 2}
                  textAnchor="middle"
                  fill="#52525b"
                  fontSize={14}
                >
                  Empty List
                </text>
              )}
            </svg>
          </div>
        </div>

        {/* Bottom Section: Pseudocode + Complexity */}
        <div className="flex gap-4 mt-4">
          {/* Pseudocode Panel */}
          <div className="flex-1">
            <PseudocodePanel
              lines={pseudoLines}
              activeLine={currentStep.pseudoLine}
              title={activeOp ? opLabels[activeOp] : 'Pseudocode'}
            />
          </div>

          {/* Complexity Sidebar */}
          <div className="w-44 bg-zinc-950 border border-zinc-800 rounded text-xs font-mono p-3">
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
              <tbody>
                {complexityData.map((row) => (
                  <tr
                    key={row.op}
                    className={activeOp === row.op ? 'text-blue-400' : 'text-zinc-600'}
                  >
                    <td className="py-[2px]">{row.op}</td>
                    <td className="text-right">{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {isDoubly && (
              <div className="mt-2 pt-2 border-t border-zinc-800 text-zinc-600 text-[10px]">
                O(1) tail ops via TAIL pointer
              </div>
            )}
          </div>
        </div>

        {/* Message Bar */}
        <div className="mt-4 px-4 py-2 bg-zinc-900 border border-zinc-800 text-sm text-zinc-300 min-h-[36px]">
          {message || 'Select an operation and click Run'}
        </div>
      </div>

      {/* CSS for dash animation */}
      <style>{`
        @keyframes dash {
          to {
            stroke-dashoffset: -9;
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
