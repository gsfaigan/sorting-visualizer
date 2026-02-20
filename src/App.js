import React, { useState } from "react";
// Shared
import Home from "./components/shared/Home";
// Sorting
import SortingVisualizer from "./components/sorting/SortingVisualizer";
// Searching
import SearchVisualizer from "./components/searching/SearchVisualizer";
// Pathfinding
import PathfindingVisualizer from "./components/pathfinding/PathfindingVisualizer";
// Data Structures
import LinkedListVisualizer from "./components/data-structures/LinkedListVisualizer";
import StackQueueVisualizer from "./components/data-structures/StackQueueVisualizer";
import HeapVisualizer from "./components/data-structures/HeapVisualizer";
import PriorityQueueVisualizer from "./components/data-structures/PriorityQueueVisualizer";
import BSTVisualizer from "./components/data-structures/BSTVisualizer";
import BSTAlgorithmsVisualizer from "./components/data-structures/BSTAlgorithmsVisualizer";
import NaryTreeVisualizer from "./components/data-structures/NaryTreeVisualizer";
// C++ Essentials
import TowerOfHanoiVisualizer from "./components/cpp/TowerOfHanoiVisualizer";
import CppIOVisualizer from "./components/cpp/CppIOVisualizer";
import CppMemoryVisualizer from "./components/cpp/CppMemoryVisualizer";
import BigOVisualizer from "./components/cpp/BigOVisualizer";
// Bash & Unix
import BashVisualizer from "./components/bash/BashVisualizer";

export default function App() {
  const [currentView, setCurrentView] = useState('home');
  const [initialAlgorithm, setInitialAlgorithm] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

  const handleSelectAlgorithm = (category, algorithm) => {
    setSelectedCategory(category);
    setInitialAlgorithm(algorithm);
    setCurrentView(category);
  };

  const handleBack = () => {
    // Go back to the category selection, not all the way to home
    setCurrentView('home');
    setInitialAlgorithm(null);
    // Keep selectedCategory so Home shows the algorithm list for that category
  };

  switch (currentView) {
    case 'sort':
      return <SortingVisualizer onBack={handleBack} initialAlgorithm={initialAlgorithm} />;
    case 'search':
      return <SearchVisualizer onBack={handleBack} initialAlgorithm={initialAlgorithm} />;
    case 'pathfind':
      return <PathfindingVisualizer onBack={handleBack} initialAlgorithm={initialAlgorithm} />;
    case 'ds':
      switch (initialAlgorithm) {
        case 'singly':    return <LinkedListVisualizer type="singly" onBack={handleBack} />;
        case 'doubly':    return <LinkedListVisualizer type="doubly" onBack={handleBack} />;
        case 'stack':     return <StackQueueVisualizer type="stack"  onBack={handleBack} />;
        case 'queue':     return <StackQueueVisualizer type="queue"  onBack={handleBack} />;
        case 'heap':      return <HeapVisualizer        onBack={handleBack} />;
        case 'pq':        return <PriorityQueueVisualizer onBack={handleBack} />;
        case 'bst':       return <BSTVisualizer          onBack={handleBack} />;
        case 'bst-algos': return <BSTAlgorithmsVisualizer onBack={handleBack} />;
        case 'nary':      return <NaryTreeVisualizer      onBack={handleBack} />;
        default:          return <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      }
    case 'cpp':
      switch (initialAlgorithm) {
        case 'io':            return <CppIOVisualizer       onBack={handleBack} />;
        case 'filestreams':   return <CppIOVisualizer       onBack={handleBack} initialTab="file" />;
        case 'stringstreams': return <CppIOVisualizer       onBack={handleBack} initialTab="string" />;
        case 'memory':        return <CppMemoryVisualizer   onBack={handleBack} initialTab="memory" />;
        case 'pointers':      return <CppMemoryVisualizer   onBack={handleBack} initialTab="pointers" />;
        case 'types':         return <CppMemoryVisualizer   onBack={handleBack} initialTab="types" />;
        case 'bigo':          return <BigOVisualizer        onBack={handleBack} />;
        case 'hanoi':         return <TowerOfHanoiVisualizer onBack={handleBack} />;
        default:              return <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      }
    case 'bash':
      switch (initialAlgorithm) {
        case 'filesystem':  return <BashVisualizer onBack={handleBack} initialTab="filesystem" />;
        case 'permissions': return <BashVisualizer onBack={handleBack} initialTab="permissions" />;
        case 'terminal':    return <BashVisualizer onBack={handleBack} initialTab="terminal" />;
        case 'redirection': return <BashVisualizer onBack={handleBack} initialTab="redirection" />;
        case 'globbing':    return <BashVisualizer onBack={handleBack} initialTab="globbing" />;
        case 'grep':        return <BashVisualizer onBack={handleBack} initialTab="grep" />;
        default:            return <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      }
    default:
      return <Home onSelectAlgorithm={handleSelectAlgorithm} initialCategory={selectedCategory} onClearCategory={() => setSelectedCategory(null)} />;
  }
}
