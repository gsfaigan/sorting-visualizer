import React, { useState } from "react";
import { Analytics } from "@vercel/analytics/react";
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

  let view;
  switch (currentView) {
    case 'sort':
      view = <SortingVisualizer onBack={handleBack} initialAlgorithm={initialAlgorithm} />;
      break;
    case 'search':
      view = <SearchVisualizer onBack={handleBack} initialAlgorithm={initialAlgorithm} />;
      break;
    case 'pathfind':
      view = <PathfindingVisualizer onBack={handleBack} initialAlgorithm={initialAlgorithm} />;
      break;
    case 'ds':
      switch (initialAlgorithm) {
        case 'singly':    view = <LinkedListVisualizer type="singly" onBack={handleBack} />; break;
        case 'doubly':    view = <LinkedListVisualizer type="doubly" onBack={handleBack} />; break;
        case 'stack':     view = <StackQueueVisualizer type="stack"  onBack={handleBack} />; break;
        case 'queue':     view = <StackQueueVisualizer type="queue"  onBack={handleBack} />; break;
        case 'heap':      view = <HeapVisualizer        onBack={handleBack} />; break;
        case 'pq':        view = <PriorityQueueVisualizer onBack={handleBack} />; break;
        case 'bst':       view = <BSTVisualizer          onBack={handleBack} />; break;
        case 'bst-algos': view = <BSTAlgorithmsVisualizer onBack={handleBack} />; break;
        case 'nary':      view = <NaryTreeVisualizer      onBack={handleBack} />; break;
        default:          view = <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      }
      break;
    case 'cpp':
      switch (initialAlgorithm) {
        case 'io':            view = <CppIOVisualizer       onBack={handleBack} />; break;
        case 'filestreams':   view = <CppIOVisualizer       onBack={handleBack} initialTab="file" />; break;
        case 'stringstreams': view = <CppIOVisualizer       onBack={handleBack} initialTab="string" />; break;
        case 'memory':        view = <CppMemoryVisualizer   onBack={handleBack} initialTab="memory" />; break;
        case 'pointers':      view = <CppMemoryVisualizer   onBack={handleBack} initialTab="pointers" />; break;
        case 'types':         view = <CppMemoryVisualizer   onBack={handleBack} initialTab="types" />; break;
        case 'bigo':          view = <BigOVisualizer        onBack={handleBack} />; break;
        case 'hanoi':         view = <TowerOfHanoiVisualizer onBack={handleBack} />; break;
        default:              view = <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      }
      break;
    case 'bash':
      switch (initialAlgorithm) {
        case 'filesystem':  view = <BashVisualizer onBack={handleBack} initialTab="filesystem" />; break;
        case 'permissions': view = <BashVisualizer onBack={handleBack} initialTab="permissions" />; break;
        case 'terminal':    view = <BashVisualizer onBack={handleBack} initialTab="terminal" />; break;
        case 'redirection': view = <BashVisualizer onBack={handleBack} initialTab="redirection" />; break;
        case 'globbing':    view = <BashVisualizer onBack={handleBack} initialTab="globbing" />; break;
        case 'grep':        view = <BashVisualizer onBack={handleBack} initialTab="grep" />; break;
        default:            view = <Home onSelectAlgorithm={handleSelectAlgorithm} />;
      }
      break;
    default:
      view = <Home onSelectAlgorithm={handleSelectAlgorithm} initialCategory={selectedCategory} onClearCategory={() => setSelectedCategory(null)} />;
  }

  return (
    <>
      {view}
      <Analytics />
    </>
  );
}
