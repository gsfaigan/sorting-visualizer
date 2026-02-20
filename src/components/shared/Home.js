import React, { useState } from 'react';
import { searchAlgorithmList, SEARCH_ALGO_INFO } from '../../algorithms/search';
import { pathfindingAlgorithmList, PATHFINDING_ALGO_INFO } from '../../algorithms/pathfinding';

// Sorting algorithm list (alphabetically sorted)
const sortingAlgorithmList = [
  { value: 'adaptivemerge', label: 'Adaptive Merge Sort' },
  { value: 'americanflag', label: 'American Flag Sort' },
  { value: 'bitonic', label: 'Bitonic Sort' },
  { value: 'block', label: 'Block Sort' },
  { value: 'blockmerge', label: 'Block Merge Sort' },
  { value: 'bogo', label: 'Bogo Sort' },
  { value: 'bubble', label: 'Bubble Sort' },
  { value: 'bucket', label: 'Bucket Sort' },
  { value: 'cocktail', label: 'Cocktail Shaker' },
  { value: 'comb', label: 'Comb Sort' },
  { value: 'counting', label: 'Counting Sort' },
  { value: 'cycle', label: 'Cycle Sort' },
  { value: 'dualpivot', label: 'Dual-Pivot Quicksort' },
  { value: 'flash', label: 'Flash Sort' },
  { value: 'franceschini', label: 'Franceschini Sort' },
  { value: 'gnome', label: 'Gnome Sort' },
  { value: 'gravity', label: 'Gravity Sort' },
  { value: 'heap', label: 'Heap Sort' },
  { value: 'insertion', label: 'Insertion Sort' },
  { value: 'intro', label: 'Intro Sort' },
  { value: 'library', label: 'Library Sort' },
  { value: 'merge', label: 'Merge Sort' },
  { value: 'minmaxselection', label: 'Min-Max Selection' },
  { value: 'oddeven', label: 'Odd-Even Sort' },
  { value: 'oddevenmerge', label: 'Odd-Even Merge Sort' },
  { value: 'pairwise', label: 'Pairwise Network' },
  { value: 'pancake', label: 'Pancake Sort' },
  { value: 'patience', label: 'Patience Sort' },
  { value: 'pdq', label: 'PDQ Sort' },
  { value: 'pigeonhole', label: 'Pigeonhole Sort' },
  { value: 'proxmap', label: 'Proxmap Sort' },
  { value: 'quick', label: 'Quick Sort' },
  { value: 'radix', label: 'Radix Sort' },
  { value: 'selection', label: 'Selection Sort' },
  { value: 'shell', label: 'Shell Sort' },
  { value: 'smooth', label: 'Smoothsort' },
  { value: 'spreadsort', label: 'Spreadsort' },
  { value: 'stalin', label: 'Stalin Sort' },
  { value: 'stooge', label: 'Stooge Sort' },
  { value: 'strand', label: 'Strand Sort' },
  { value: 'stupid', label: 'Stupid Sort' },
  { value: 'timsort', label: 'Timsort' },
  { value: 'tournament', label: 'Tournament Sort' },
  { value: 'tree', label: 'Tree Sort' },
];

// Sorting algorithm info - best and worst complexity
const SORTING_ALGO_INFO = {
  bubble: { best: 'O(n)', worst: 'O(n²)' },
  selection: { best: 'O(n²)', worst: 'O(n²)' },
  insertion: { best: 'O(n)', worst: 'O(n²)' },
  merge: { best: 'O(n log n)', worst: 'O(n log n)' },
  quick: { best: 'O(n log n)', worst: 'O(n²)' },
  heap: { best: 'O(n log n)', worst: 'O(n log n)' },
  shell: { best: 'O(n log n)', worst: 'O(n²)' },
  counting: { best: 'O(n+k)', worst: 'O(n+k)' },
  radix: { best: 'O(nk)', worst: 'O(nk)' },
  bucket: { best: 'O(n+k)', worst: 'O(n²)' },
  timsort: { best: 'O(n)', worst: 'O(n log n)' },
  intro: { best: 'O(n log n)', worst: 'O(n log n)' },
  pdq: { best: 'O(n)', worst: 'O(n log n)' },
  dualpivot: { best: 'O(n log n)', worst: 'O(n²)' },
  cocktail: { best: 'O(n)', worst: 'O(n²)' },
  comb: { best: 'O(n log n)', worst: 'O(n²)' },
  gnome: { best: 'O(n)', worst: 'O(n²)' },
  oddeven: { best: 'O(n)', worst: 'O(n²)' },
  cycle: { best: 'O(n²)', worst: 'O(n²)' },
  pancake: { best: 'O(n)', worst: 'O(n²)' },
  stooge: { best: 'O(n^2.7)', worst: 'O(n^2.7)' },
  bogo: { best: 'O(n)', worst: 'O(∞)' },
  stupid: { best: 'O(n)', worst: 'O(∞)' },
  stalin: { best: 'O(n)', worst: 'O(n)' },
  bitonic: { best: 'O(log²n)', worst: 'O(log²n)' },
  oddevenmerge: { best: 'O(log²n)', worst: 'O(log²n)' },
  pairwise: { best: 'O(log²n)', worst: 'O(log²n)' },
  smooth: { best: 'O(n)', worst: 'O(n log n)' },
  tree: { best: 'O(n log n)', worst: 'O(n²)' },
  tournament: { best: 'O(n log n)', worst: 'O(n log n)' },
  patience: { best: 'O(n log n)', worst: 'O(n log n)' },
  strand: { best: 'O(n)', worst: 'O(n²)' },
  library: { best: 'O(n)', worst: 'O(n²)' },
  block: { best: 'O(n log n)', worst: 'O(n log n)' },
  blockmerge: { best: 'O(n log n)', worst: 'O(n log n)' },
  adaptivemerge: { best: 'O(n)', worst: 'O(n log n)' },
  franceschini: { best: 'O(n log n)', worst: 'O(n log n)' },
  pigeonhole: { best: 'O(n+k)', worst: 'O(n+k)' },
  gravity: { best: 'O(n)', worst: 'O(n·max)' },
  flash: { best: 'O(n)', worst: 'O(n²)' },
  americanflag: { best: 'O(nk)', worst: 'O(nk)' },
  proxmap: { best: 'O(n)', worst: 'O(n²)' },
  spreadsort: { best: 'O(n)', worst: 'O(n log n)' },
  minmaxselection: { best: 'O(n²)', worst: 'O(n²)' }
};

const dataStructureList = [
  { value: 'singly',    label: 'Singly Linked List' },
  { value: 'doubly',    label: 'Doubly Linked List' },
  { value: 'stack',     label: 'Stack' },
  { value: 'queue',     label: 'Queue' },
  { value: 'heap',      label: 'Min / Max Heap' },
  { value: 'pq',        label: 'Priority Queue' },
  { value: 'bst',       label: 'Binary Search Tree' },
  { value: 'bst-algos', label: 'BST — Recursive Algorithms' },
  { value: 'nary',      label: 'N-ary Tree' },
];

const DS_ALGO_INFO = {
  singly:      { best: 'O(1) head ops', worst: 'O(n) tail/search' },
  doubly:      { best: 'O(1) head+tail', worst: 'O(n) search' },
  stack:       { best: 'O(1)', worst: 'O(1)' },
  queue:       { best: 'O(1)', worst: 'O(1)' },
  heap:        { best: 'O(1) peek', worst: 'O(log n) insert/remove' },
  pq:          { best: 'O(1) leave', worst: 'O(n) insert (array)' },
  bst:         { best: 'O(log n)', worst: 'O(n) degenerate' },
  'bst-algos': { best: 'O(n)', worst: 'O(n)' },
  nary:        { best: 'O(n)', worst: 'O(n)' },
};

const DS_GROUPS = [
  {
    label: 'Linear',
    values: ['singly', 'doubly', 'stack', 'queue'],
  },
  {
    label: 'Priority & Heap',
    values: ['heap', 'pq'],
  },
  {
    label: 'Trees',
    values: ['bst', 'bst-algos', 'nary'],
  },
];

// C++ Essentials modules
const cppModuleList = [
  { value: 'io',            label: 'cin / cout / cerr' },
  { value: 'filestreams',   label: 'File Streams' },
  { value: 'stringstreams', label: 'String Streams' },
  { value: 'memory',        label: 'Stack vs Heap' },
  { value: 'pointers',      label: 'Pointers & References' },
  { value: 'types',         label: 'Types, Strings & Vectors' },
  { value: 'bigo',          label: 'Big-O Visualizer' },
  { value: 'hanoi',         label: 'Tower of Hanoi' },
];

const CPP_MODULE_INFO = {
  io:            { best: 'Buffered',   worst: 'Blocks on bad input' },
  filestreams:   { best: 'Sequential', worst: 'Fails silently if not checked' },
  stringstreams: { best: 'In-memory',  worst: 'Copies string data' },
  memory:        { best: 'Stack O(1)', worst: 'Heap leak if no delete' },
  pointers:      { best: 'O(1) deref', worst: 'Undefined behavior if dangling' },
  types:         { best: 'vector O(1) push_back amortized', worst: 'C-array: no bounds check' },
  bigo:          { best: 'O(1)',       worst: 'O(2ⁿ)' },
  hanoi:         { best: 'O(2ⁿ - 1)',  worst: 'O(2ⁿ - 1)' },
};

const CPP_GROUPS = [
  {
    label: 'I/O & Streams',
    values: ['io', 'filestreams', 'stringstreams'],
  },
  {
    label: 'Memory & Types',
    values: ['memory', 'pointers', 'types'],
  },
  {
    label: 'Complexity',
    values: ['bigo'],
  },
  {
    label: 'Recursion',
    values: ['hanoi'],
  },
];

// Bash & Unix modules
const bashModuleList = [
  { value: 'filesystem',   label: 'Filesystem & Navigation' },
  { value: 'permissions',  label: 'Permissions (chmod)' },
  { value: 'terminal',     label: 'Terminal Simulator' },
  { value: 'redirection',  label: 'I/O Redirection & Pipes' },
  { value: 'globbing',     label: 'Globbing & Patterns' },
  { value: 'grep',         label: 'grep & find' },
];

const BASH_MODULE_INFO = {
  filesystem:  { best: 'Absolute path: always works', worst: 'Relative path: context-dependent' },
  permissions: { best: 'chmod 755 — common', worst: 'chmod 777 — dangerous' },
  terminal:    { best: 'Built-ins: fast', worst: 'External programs: fork+exec' },
  redirection: { best: 'Pipes: no temp file', worst: 'Unbuffered: slower' },
  globbing:    { best: '* fast', worst: 'Regex: backtrack O(2ⁿ) worst' },
  grep:        { best: 'grep -F: literal, fast', worst: 'grep -P: PCRE, slow' },
};

const BASH_GROUPS = [
  {
    label: 'Filesystem',
    values: ['filesystem', 'permissions'],
  },
  {
    label: 'Shell',
    values: ['terminal', 'redirection'],
  },
  {
    label: 'Search & Patterns',
    values: ['globbing', 'grep'],
  },
];

export default function Home({ onSelectAlgorithm, initialCategory, onClearCategory }) {
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || null);

  const handleBackToHome = () => {
    setSelectedCategory(null);
    if (onClearCategory) onClearCategory();
  };

  const categories = [
    {
      id: 'sort',
      title: 'Sorting',
      description: '44 sorting algorithms visualized',
      algorithms: sortingAlgorithmList,
      algoInfo: SORTING_ALGO_INFO,
      icon: (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9M3 12h5M3 16h9M3 20h13" />
        </svg>
      )
    },
    {
      id: 'search',
      title: 'Searching',
      description: '7 search algorithms visualized',
      algorithms: searchAlgorithmList,
      algoInfo: SEARCH_ALGO_INFO,
      icon: (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      )
    },
    {
      id: 'pathfind',
      title: 'Pathfinding',
      description: '7 pathfinding algorithms visualized',
      algorithms: pathfindingAlgorithmList,
      algoInfo: PATHFINDING_ALGO_INFO,
      icon: (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
        </svg>
      )
    },
    {
      id: 'ds',
      title: 'Data Structures',
      description: '9 data structure visualizers',
      algorithms: dataStructureList,
      algoInfo: DS_ALGO_INFO,
      icon: (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <circle cx="12" cy="5" r="2" strokeWidth={1.5} />
          <circle cx="6" cy="14" r="2" strokeWidth={1.5} />
          <circle cx="18" cy="14" r="2" strokeWidth={1.5} />
          <line x1="12" y1="7" x2="6" y2="12" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="12" y1="7" x2="18" y2="12" strokeWidth={1.5} strokeLinecap="round" />
          <circle cx="3" cy="20" r="1.5" strokeWidth={1.5} />
          <circle cx="9" cy="20" r="1.5" strokeWidth={1.5} />
          <circle cx="15" cy="20" r="1.5" strokeWidth={1.5} />
          <circle cx="21" cy="20" r="1.5" strokeWidth={1.5} />
          <line x1="6" y1="16" x2="3" y2="18.5" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="6" y1="16" x2="9" y2="18.5" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="18" y1="16" x2="15" y2="18.5" strokeWidth={1.5} strokeLinecap="round" />
          <line x1="18" y1="16" x2="21" y2="18.5" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'cpp',
      title: 'C++ Essentials',
      description: '8 C++ concept visualizers',
      algorithms: cppModuleList,
      algoInfo: CPP_MODULE_INFO,
      icon: (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 4l-4 8 4 8" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 4l4 8-4 8" />
          <line x1="14" y1="6" x2="10" y2="18" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      )
    },
    {
      id: 'bash',
      title: 'Bash & Unix',
      description: '6 interactive Unix modules',
      algorithms: bashModuleList,
      algoInfo: BASH_MODULE_INFO,
      icon: (
        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect x="2" y="4" width="20" height="16" rx="2" strokeWidth={1.5} />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 10l3 2-3 2" />
          <line x1="11" y1="14" x2="16" y2="14" strokeWidth={1.5} strokeLinecap="round" />
        </svg>
      )
    }
  ];

  const currentCategory = categories.find(c => c.id === selectedCategory);

  // Show algorithm submenu
  if (selectedCategory && currentCategory) {
    // Grouped layout for Data Structures, C++, and Bash
    if (selectedCategory === 'ds' || selectedCategory === 'cpp' || selectedCategory === 'bash') {
      const groupConfig = {
        ds: { groups: DS_GROUPS, list: dataStructureList, info: DS_ALGO_INFO, title: 'Data Structures' },
        cpp: { groups: CPP_GROUPS, list: cppModuleList, info: CPP_MODULE_INFO, title: 'C++ Essentials' },
        bash: { groups: BASH_GROUPS, list: bashModuleList, info: BASH_MODULE_INFO, title: 'Bash & Unix' },
      };
      const config = groupConfig[selectedCategory];

      return (
        <div className="min-h-screen bg-black text-white p-8 flex flex-col">
          <div className="max-w-3xl mx-auto flex-1 w-full">
            <button
              onClick={handleBackToHome}
              className="mb-8 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white"
            >
              &larr; Back
            </button>

            <h1 className="text-4xl font-bold text-center mb-8">{config.title}</h1>

            <div className="flex flex-col gap-6 w-full">
              {config.groups.map(group => (
                <div key={group.label}>
                  <div className="text-zinc-600 text-xs tracking-widest uppercase mb-2 px-1">
                    {group.label}
                  </div>
                  <div className="flex flex-col gap-2">
                    {group.values.map(val => {
                      const algo = config.list.find(a => a.value === val);
                      if (!algo) return null;
                      return (
                        <button
                          key={val}
                          onClick={() => onSelectAlgorithm(selectedCategory, val)}
                          className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500 px-4 py-3 text-left transition-all duration-200"
                        >
                          <span className="font-semibold text-white">{algo.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <footer className="text-center py-4 mt-8">
            <a
              href="https://faigan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-zinc-500 hover:text-blue-400 transition-colors duration-200"
            >
              faigan.com
            </a>
          </footer>
        </div>
      );
    }

    // Flat layout for all other categories
    return (
      <div className="min-h-screen bg-black text-white p-8 flex flex-col">
        <div className="max-w-3xl mx-auto flex-1 w-full">
          <button
            onClick={handleBackToHome}
            className="mb-8 px-3 py-1 text-sm bg-zinc-800 hover:bg-zinc-700 text-white"
          >
            &larr; Back
          </button>

          <h1 className="text-4xl font-bold text-center mb-8">{currentCategory.title} Algorithms</h1>

          <div className="flex flex-col gap-2 w-full">
            {currentCategory.algorithms.map(algo => {
              const info = currentCategory.algoInfo[algo.value];
              return (
                <button
                  key={algo.value}
                  onClick={() => onSelectAlgorithm(selectedCategory, algo.value)}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500 px-4 py-3 flex justify-between items-center transition-all duration-200"
                >
                  <span className="font-semibold text-white">{algo.label}</span>
                  <span className="text-xs text-zinc-500 flex">
                    {info?.best && <span className="w-28 text-right">Best: {info.best}</span>}
                    {info?.worst && <span className="w-32 text-right">Worst: {info.worst}</span>}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <footer className="text-center py-4 mt-8">
          <a
            href="https://faigan.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-500 hover:text-blue-400 transition-colors duration-200"
          >
            faigan.com
          </a>
        </footer>
      </div>
    );
  }

  // Show category selection
  return (
    <div className="min-h-screen bg-black text-white p-8 flex flex-col">
      <div className="max-w-4xl mx-auto text-center flex-1 flex flex-col justify-center">
        <h1 className="text-5xl font-bold mb-12">Until it Clicks</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 hover:border-blue-500 p-8 flex flex-col items-center transition-all duration-200"
            >
              {cat.icon}
              <span className="text-2xl font-semibold text-white mb-2">{cat.title}</span>
              <span className="text-sm text-zinc-500">{cat.description}</span>
            </button>
          ))}
        </div>
      </div>

      <footer className="text-center py-4">
        <a
          href="https://faigan.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-zinc-500 hover:text-blue-400 transition-colors duration-200"
        >
          faigan.com
        </a>
      </footer>
    </div>
  );
}
