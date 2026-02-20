import React, { useState } from "react";
import Home from "./components/Home";
import SortingVisualizer from "./components/SortingVisualizer";
import SearchVisualizer from "./components/SearchVisualizer";
import PathfindingVisualizer from "./components/PathfindingVisualizer";
import LinkedListVisualizer from "./components/LinkedListVisualizer";
import StackQueueVisualizer from "./components/StackQueueVisualizer";
import HeapVisualizer from "./components/HeapVisualizer";
import PriorityQueueVisualizer from "./components/PriorityQueueVisualizer";
import BSTVisualizer from "./components/BSTVisualizer";
import BSTAlgorithmsVisualizer from "./components/BSTAlgorithmsVisualizer";
import NaryTreeVisualizer from "./components/NaryTreeVisualizer";
import TowerOfHanoiVisualizer from "./components/TowerOfHanoiVisualizer";
import CppIOVisualizer from "./visualizers/CppIOVisualizer";
import CppMemoryVisualizer from "./visualizers/CppMemoryVisualizer";
import BigOVisualizer from "./visualizers/BigOVisualizer";
import BashVisualizer from "./visualizers/BashVisualizer";

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

  const handleBackToHome = () => {
    // Go all the way back to the main home page
    setCurrentView('home');
    setInitialAlgorithm(null);
    setSelectedCategory(null);
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
