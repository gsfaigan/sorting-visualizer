import { useState, useEffect } from 'react';
import { useAnimator } from '../../hooks/useAnimator';

// Tab definitions
const tabs = [
  { value: 'memory', label: 'Stack vs Heap' },
  { value: 'pointers', label: 'Pointers & References' },
  { value: 'types', label: 'Types, Strings & Vectors' },
];

// Memory scenarios
const memoryScenarios = [
  { value: 'locals', label: 'Local Variables' },
  { value: 'newdelete', label: 'new / delete' },
  { value: 'leak', label: 'Memory Leak' },
  { value: 'dangling', label: 'Dangling Pointer' },
  { value: 'frames', label: 'Stack Frames' },
  { value: 'array', label: 'new[] / delete[]' },
];

const pointerScenarios = [
  { value: 'declare', label: 'Pointer Declaration' },
  { value: 'deref', label: 'Dereference' },
  { value: 'nullptr', label: 'nullptr' },
  { value: 'reference', label: 'Reference' },
  { value: 'constref', label: 'const Reference' },
  { value: 'arrow', label: 'Arrow Operator' },
  { value: 'passby', label: 'Pass by Value vs Reference' },
];

const typesSections = [
  { value: 'types', label: 'Types & Chars' },
  { value: 'strings', label: 'Strings' },
  { value: 'vectors', label: 'Vectors' },
];

// Memory code snippets
const memoryCode = {
  locals: [
    { text: 'void foo() {', indent: 0 },
    { text: 'int a = 3;', indent: 1 },
    { text: '}', indent: 0 },
    { text: '', indent: 0 },
    { text: 'int main() {', indent: 0 },
    { text: 'int x = 5;', indent: 1 },
    { text: 'int y = 10;', indent: 1 },
    { text: 'foo();', indent: 1 },
    { text: 'return 0;', indent: 1 },
    { text: '}', indent: 0 },
  ],
  newdelete: [
    { text: 'int* p = new int(42);', indent: 0 },
    { text: '// p points to heap memory', indent: 0 },
    { text: 'cout << *p << endl;', indent: 0 },
    { text: 'delete p;', indent: 0 },
    { text: '// Memory freed', indent: 0 },
  ],
  leak: [
    { text: 'void leaky() {', indent: 0 },
    { text: 'int* p = new int(42);', indent: 1 },
    { text: '// No delete!', indent: 1 },
    { text: '}  // p goes out of scope', indent: 0 },
    { text: '// Memory leaked!', indent: 0 },
  ],
  dangling: [
    { text: 'int* p = new int(42);', indent: 0 },
    { text: 'delete p;', indent: 0 },
    { text: '// p is now dangling!', indent: 0 },
    { text: 'cout << *p;  // UNDEFINED!', indent: 0 },
  ],
  frames: [
    { text: 'void bar() { int z = 1; }', indent: 0 },
    { text: 'void foo() { int y = 2; bar(); }', indent: 0 },
    { text: 'int main() { int x = 3; foo(); }', indent: 0 },
  ],
  array: [
    { text: 'int* arr = new int[4];', indent: 0 },
    { text: 'arr[0] = 10; arr[1] = 20;', indent: 0 },
    { text: 'arr[2] = 30; arr[3] = 40;', indent: 0 },
    { text: 'delete[] arr;', indent: 0 },
  ],
};

const memoryCallouts = {
  locals: 'Stack: automatic lifetime — created at declaration, destroyed when scope ends. Fast, limited size.',
  newdelete: 'Heap: manual lifetime — new to create, delete to destroy. Flexible, larger, but you must track it.',
  leak: 'Memory leak: heap memory with no pointer to it. Lost forever until program ends!',
  dangling: 'Dangling pointer: points to freed memory. Using it is UNDEFINED BEHAVIOR.',
  frames: 'Each function call pushes a new stack frame. Return pops it. Variables live in their frame.',
  array: 'Every new must have exactly one delete. Every new[] needs delete[] (not delete).',
};

// Generate memory steps
function generateMemorySteps(scenario) {
  const steps = [];
  switch (scenario) {
    case 'locals':
      steps.push({ line: 4, stack: [{ name: 'main()', vars: [] }], heap: [] });
      steps.push({ line: 5, stack: [{ name: 'main()', vars: [{ name: 'x', value: 5 }] }], heap: [] });
      steps.push({ line: 6, stack: [{ name: 'main()', vars: [{ name: 'x', value: 5 }, { name: 'y', value: 10 }] }], heap: [] });
      steps.push({ line: 7, stack: [{ name: 'main()', vars: [{ name: 'x', value: 5 }, { name: 'y', value: 10 }] }, { name: 'foo()', vars: [], entering: true }], heap: [], message: 'Calling foo()...' });
      steps.push({ line: 1, stack: [{ name: 'main()', vars: [{ name: 'x', value: 5 }, { name: 'y', value: 10 }] }, { name: 'foo()', vars: [{ name: 'a', value: 3 }] }], heap: [] });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'x', value: 5 }, { name: 'y', value: 10 }] }, { name: 'foo()', vars: [{ name: 'a', value: 3 }], exiting: true }], heap: [], message: 'foo() returning...' });
      steps.push({ line: 8, stack: [{ name: 'main()', vars: [{ name: 'x', value: 5 }, { name: 'y', value: 10 }] }], heap: [], message: 'foo() frame popped' });
      steps.push({ line: 9, stack: [], heap: [], done: true, message: 'main() returns' });
      break;
    case 'newdelete':
      steps.push({ line: 0, stack: [{ name: 'main()', vars: [] }], heap: [], message: 'About to allocate...' });
      steps.push({ line: 0, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x1000', isPointer: true, pointsTo: 0 }] }], heap: [{ id: 0, value: 42, address: '0x1000' }], message: 'new int(42) allocates on heap' });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x1000', isPointer: true, pointsTo: 0 }] }], heap: [{ id: 0, value: 42, address: '0x1000', highlight: true }], message: '*p = 42' });
      steps.push({ line: 3, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x1000', isPointer: true, pointsTo: null }] }], heap: [{ id: 0, value: 42, address: '0x1000', freed: true }], message: 'delete p frees the memory' });
      steps.push({ line: 4, stack: [{ name: 'main()', vars: [{ name: 'p', value: '???', isPointer: true }] }], heap: [], done: true });
      break;
    case 'leak':
      steps.push({ line: 0, stack: [{ name: 'main()', vars: [] }, { name: 'leaky()', vars: [] }], heap: [] });
      steps.push({ line: 1, stack: [{ name: 'main()', vars: [] }, { name: 'leaky()', vars: [{ name: 'p', value: '0x2000', isPointer: true, pointsTo: 0 }] }], heap: [{ id: 0, value: 42, address: '0x2000' }] });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [] }, { name: 'leaky()', vars: [{ name: 'p', value: '0x2000', isPointer: true, pointsTo: 0 }] }], heap: [{ id: 0, value: 42, address: '0x2000' }], message: 'No delete called!' });
      steps.push({ line: 3, stack: [{ name: 'main()', vars: [] }], heap: [{ id: 0, value: 42, address: '0x2000', leaked: true }], message: 'p gone, but memory still allocated!' });
      steps.push({ line: 4, stack: [{ name: 'main()', vars: [] }], heap: [{ id: 0, value: 42, address: '0x2000', leaked: true }], done: true, message: 'MEMORY LEAK!' });
      break;
    case 'dangling':
      steps.push({ line: 0, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x3000', isPointer: true, pointsTo: 0 }] }], heap: [{ id: 0, value: 42, address: '0x3000' }] });
      steps.push({ line: 1, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x3000', isPointer: true, dangling: true }] }], heap: [{ id: 0, value: '?', address: '0x3000', freed: true }], message: 'Memory freed but p still holds address' });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x3000', isPointer: true, dangling: true }] }], heap: [{ id: 0, value: '?', address: '0x3000', freed: true }], message: 'p is now DANGLING!' });
      steps.push({ line: 3, stack: [{ name: 'main()', vars: [{ name: 'p', value: '0x3000', isPointer: true, dangling: true }] }], heap: [{ id: 0, value: '?', address: '0x3000', freed: true, error: true }], done: true, message: 'UNDEFINED BEHAVIOR!' });
      break;
    case 'frames':
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'x', value: 3 }] }], heap: [], message: 'main() starts' });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'x', value: 3 }] }, { name: 'foo()', vars: [{ name: 'y', value: 2 }], entering: true }], heap: [], message: 'Calling foo()...' });
      steps.push({ line: 1, stack: [{ name: 'main()', vars: [{ name: 'x', value: 3 }] }, { name: 'foo()', vars: [{ name: 'y', value: 2 }] }, { name: 'bar()', vars: [{ name: 'z', value: 1 }], entering: true }], heap: [], message: 'Calling bar()...' });
      steps.push({ line: 0, stack: [{ name: 'main()', vars: [{ name: 'x', value: 3 }] }, { name: 'foo()', vars: [{ name: 'y', value: 2 }] }, { name: 'bar()', vars: [{ name: 'z', value: 1 }], exiting: true }], heap: [], message: 'bar() returns' });
      steps.push({ line: 1, stack: [{ name: 'main()', vars: [{ name: 'x', value: 3 }] }, { name: 'foo()', vars: [{ name: 'y', value: 2 }], exiting: true }], heap: [], message: 'foo() returns' });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'x', value: 3 }] }], heap: [], done: true, message: 'Back to main()' });
      break;
    case 'array':
      steps.push({ line: 0, stack: [{ name: 'main()', vars: [{ name: 'arr', value: '0x4000', isPointer: true, pointsTo: 'arr' }] }], heap: [{ id: 'arr', isArray: true, values: ['?', '?', '?', '?'], address: '0x4000' }], message: 'Allocating 4-element array' });
      steps.push({ line: 1, stack: [{ name: 'main()', vars: [{ name: 'arr', value: '0x4000', isPointer: true, pointsTo: 'arr' }] }], heap: [{ id: 'arr', isArray: true, values: [10, 20, '?', '?'], address: '0x4000' }] });
      steps.push({ line: 2, stack: [{ name: 'main()', vars: [{ name: 'arr', value: '0x4000', isPointer: true, pointsTo: 'arr' }] }], heap: [{ id: 'arr', isArray: true, values: [10, 20, 30, 40], address: '0x4000' }] });
      steps.push({ line: 3, stack: [{ name: 'main()', vars: [{ name: 'arr', value: '???', isPointer: true }] }], heap: [], done: true, message: 'delete[] frees entire array' });
      break;
    default:
      break;
  }
  return steps;
}

// Pointer code snippets
const pointerCode = {
  declare: [
    { text: 'int x = 42;', indent: 0 },
    { text: 'int* p = &x;', indent: 0 },
    { text: '// p holds address of x', indent: 0 },
  ],
  deref: [
    { text: 'int x = 42;', indent: 0 },
    { text: 'int* p = &x;', indent: 0 },
    { text: '*p = 100;', indent: 0 },
    { text: '// x is now 100!', indent: 0 },
  ],
  nullptr: [
    { text: 'int* p = nullptr;', indent: 0 },
    { text: 'if (p != nullptr) {', indent: 0 },
    { text: 'cout << *p;', indent: 1 },
    { text: '}', indent: 0 },
    { text: '// Safe: check before use', indent: 0 },
  ],
  reference: [
    { text: 'int x = 42;', indent: 0 },
    { text: 'int& r = x;  // r is alias for x', indent: 0 },
    { text: 'r = 100;', indent: 0 },
    { text: '// x is now 100!', indent: 0 },
  ],
  constref: [
    { text: 'int x = 42;', indent: 0 },
    { text: 'const int& cr = x;', indent: 0 },
    { text: 'cout << cr;  // OK: read', indent: 0 },
    { text: '// cr = 50;  // ERROR: read-only', indent: 0 },
  ],
  arrow: [
    { text: 'struct Node { int val; };', indent: 0 },
    { text: 'Node* n = new Node();', indent: 0 },
    { text: 'n->val = 5;', indent: 0 },
    { text: '// Same as: (*n).val = 5', indent: 0 },
  ],
  passby: [
    { text: 'void byVal(int x) { x = 99; }', indent: 0 },
    { text: 'void byRef(int& x) { x = 99; }', indent: 0 },
    { text: '', indent: 0 },
    { text: 'int a = 1, b = 1;', indent: 0 },
    { text: 'byVal(a);  // a still 1', indent: 0 },
    { text: 'byRef(b);  // b is now 99', indent: 0 },
  ],
};

const pointerCallouts = {
  declare: 'Pointer: holds an address. &x means "address of x". *p means "value at address p".',
  deref: '*p (dereference) accesses the value pointed to. Changing *p changes the original!',
  nullptr: 'nullptr is the only safe uninitialized pointer. Always check before dereferencing.',
  reference: 'Reference: alias for existing variable. Cannot be null, cannot be reseated.',
  constref: 'const T& = efficient read-only. No copy made, no modification allowed. Use for function params.',
  arrow: '-> is (*ptr).member — syntactic sugar for the common pattern of dereferencing then accessing.',
  passby: 'Pass by value: copy made, original unchanged. Pass by reference: no copy, original modified.',
};

function generatePointerSteps(scenario) {
  const steps = [];
  switch (scenario) {
    case 'declare':
      steps.push({ line: 0, vars: [{ name: 'x', value: 42, address: '0x100' }], pointers: [] });
      steps.push({ line: 1, vars: [{ name: 'x', value: 42, address: '0x100' }], pointers: [{ name: 'p', pointsTo: 'x', address: '0x100' }] });
      steps.push({ line: 2, vars: [{ name: 'x', value: 42, address: '0x100' }], pointers: [{ name: 'p', pointsTo: 'x', address: '0x100' }], done: true });
      break;
    case 'deref':
      steps.push({ line: 0, vars: [{ name: 'x', value: 42 }], pointers: [] });
      steps.push({ line: 1, vars: [{ name: 'x', value: 42 }], pointers: [{ name: 'p', pointsTo: 'x' }] });
      steps.push({ line: 2, vars: [{ name: 'x', value: 42, changing: true }], pointers: [{ name: 'p', pointsTo: 'x', active: true }], message: 'Writing through pointer...' });
      steps.push({ line: 3, vars: [{ name: 'x', value: 100, changed: true }], pointers: [{ name: 'p', pointsTo: 'x' }], done: true });
      break;
    case 'nullptr':
      steps.push({ line: 0, pointers: [{ name: 'p', isNull: true }], message: 'p is nullptr (points to nothing)' });
      steps.push({ line: 1, pointers: [{ name: 'p', isNull: true }], message: 'Checking if p is null...' });
      steps.push({ line: 4, pointers: [{ name: 'p', isNull: true }], done: true, message: 'Safe: skipped dereference' });
      break;
    case 'reference':
      steps.push({ line: 0, vars: [{ name: 'x', value: 42 }], refs: [] });
      steps.push({ line: 1, vars: [{ name: 'x', value: 42 }], refs: [{ name: 'r', aliasOf: 'x' }], message: 'r is now an alias for x' });
      steps.push({ line: 2, vars: [{ name: 'x', value: 42, changing: true }], refs: [{ name: 'r', aliasOf: 'x', active: true }], message: 'Writing through r...' });
      steps.push({ line: 3, vars: [{ name: 'x', value: 100, changed: true }], refs: [{ name: 'r', aliasOf: 'x' }], done: true, message: 'x changed because r IS x!' });
      break;
    case 'constref':
      steps.push({ line: 0, vars: [{ name: 'x', value: 42 }] });
      steps.push({ line: 1, vars: [{ name: 'x', value: 42 }], refs: [{ name: 'cr', aliasOf: 'x', isConst: true }], message: 'cr is a const reference' });
      steps.push({ line: 2, vars: [{ name: 'x', value: 42 }], refs: [{ name: 'cr', aliasOf: 'x', isConst: true, reading: true }], message: 'Reading: OK' });
      steps.push({ line: 3, vars: [{ name: 'x', value: 42 }], refs: [{ name: 'cr', aliasOf: 'x', isConst: true, error: true }], done: true, message: 'Writing: ERROR!' });
      break;
    case 'arrow':
      steps.push({ line: 0, message: 'Defining Node struct' });
      steps.push({ line: 1, heap: [{ type: 'Node', val: '?' }], pointers: [{ name: 'n', pointsTo: 'heap' }], message: 'n points to heap Node' });
      steps.push({ line: 2, heap: [{ type: 'Node', val: 5 }], pointers: [{ name: 'n', pointsTo: 'heap', active: true }], message: 'n->val = 5' });
      steps.push({ line: 3, heap: [{ type: 'Node', val: 5 }], pointers: [{ name: 'n', pointsTo: 'heap' }], done: true, message: '-> is shorthand for (*n).val' });
      break;
    case 'passby':
      steps.push({ line: 3, vars: [{ name: 'a', value: 1 }, { name: 'b', value: 1 }], message: 'Both start at 1' });
      steps.push({ line: 4, vars: [{ name: 'a', value: 1 }, { name: 'b', value: 1 }], callFrame: { name: 'byVal', param: { name: 'x', value: 1, isCopy: true } }, message: 'Copy of a passed to byVal' });
      steps.push({ line: 0, vars: [{ name: 'a', value: 1 }, { name: 'b', value: 1 }], callFrame: { name: 'byVal', param: { name: 'x', value: 99, isCopy: true } }, message: 'x changed to 99 (copy only!)' });
      steps.push({ line: 4, vars: [{ name: 'a', value: 1, unchanged: true }, { name: 'b', value: 1 }], message: 'a unchanged!' });
      steps.push({ line: 5, vars: [{ name: 'a', value: 1 }, { name: 'b', value: 1 }], callFrame: { name: 'byRef', param: { name: 'x', aliasOf: 'b' } }, message: 'b passed by reference' });
      steps.push({ line: 1, vars: [{ name: 'a', value: 1 }, { name: 'b', value: 99, changed: true }], done: true, message: 'b IS 99 now!' });
      break;
    default:
      break;
  }
  return steps;
}

// Stack/Heap visualization component
function MemoryDiagram({ stack, heap }) {
  return (
    <div className="flex gap-8 h-full">
      {/* Stack */}
      <div className="flex-1 flex flex-col">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 text-center">Call Stack</div>
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-3 flex flex-col-reverse gap-2">
          {(stack || []).map((frame, i) => (
            <div
              key={i}
              className={`border rounded p-2 transition-all ${
                frame.entering ? 'border-green-500 bg-green-900/20 animate-pulse' :
                frame.exiting ? 'border-yellow-500 bg-yellow-900/20' :
                'border-zinc-700 bg-zinc-800'
              }`}
            >
              <div className="text-xs text-blue-400 mb-1">{frame.name}</div>
              <div className="flex flex-wrap gap-2">
                {frame.vars?.map((v, j) => (
                  <div key={j} className={`px-2 py-1 rounded text-xs ${
                    v.isPointer ? 'bg-purple-900/50 border border-purple-700' : 'bg-zinc-700'
                  }`}>
                    <span className="text-zinc-400">{v.name} = </span>
                    <span className={v.dangling ? 'text-red-400' : 'text-green-400'}>{v.value}</span>
                  </div>
                ))}
                {(!frame.vars || frame.vars.length === 0) && (
                  <span className="text-zinc-600 text-xs italic">empty</span>
                )}
              </div>
            </div>
          ))}
          {(!stack || stack.length === 0) && (
            <div className="text-zinc-600 text-center text-sm">Stack empty</div>
          )}
        </div>
      </div>

      {/* Heap */}
      <div className="flex-1 flex flex-col">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2 text-center">Heap (Freestore)</div>
        <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded p-3">
          <div className="flex flex-wrap gap-3">
            {(heap || []).map((block, i) => (
              <div
                key={i}
                className={`border rounded p-3 transition-all ${
                  block.leaked ? 'border-red-500 bg-red-900/30 animate-pulse' :
                  block.freed ? 'border-zinc-600 bg-zinc-800/50 opacity-50' :
                  block.error ? 'border-red-500 bg-red-900/50' :
                  block.highlight ? 'border-blue-500 bg-blue-900/30' :
                  'border-zinc-700 bg-zinc-800'
                }`}
              >
                {block.isArray ? (
                  <div>
                    <div className="text-[10px] text-zinc-500 mb-1">{block.address}</div>
                    <div className="flex gap-1">
                      {block.values.map((v, j) => (
                        <div key={j} className="w-8 h-8 border border-zinc-600 flex items-center justify-center text-xs bg-zinc-700">
                          {v}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="text-[10px] text-zinc-500 mb-1">{block.address}</div>
                    <div className={`text-lg font-mono ${block.freed ? 'text-zinc-500' : 'text-green-400'}`}>
                      {block.value}
                    </div>
                    {block.leaked && <div className="text-[10px] text-red-400 mt-1">LEAKED!</div>}
                  </div>
                )}
              </div>
            ))}
            {(!heap || heap.length === 0) && (
              <div className="text-zinc-600 text-sm">No heap allocations</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Pointer visualization component
function PointerDiagram({ vars, pointers, refs, heap, callFrame }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
      <div className="flex gap-8 items-start">
        {/* Variables */}
        <div className="flex flex-col gap-3">
          <div className="text-xs text-zinc-500 uppercase tracking-wider">Variables</div>
          {(vars || []).map((v, i) => (
            <div
              key={i}
              className={`flex items-center gap-2 px-3 py-2 border rounded transition-all ${
                v.changing ? 'border-yellow-500 bg-yellow-900/20 animate-pulse' :
                v.changed ? 'border-green-500 bg-green-900/20' :
                v.unchanged ? 'border-zinc-600' :
                'border-zinc-700 bg-zinc-800'
              }`}
            >
              <span className="text-zinc-400 font-mono">{v.name}</span>
              <span className="text-zinc-600">=</span>
              <span className={`font-mono ${v.changed ? 'text-green-400' : 'text-white'}`}>{v.value}</span>
              {v.address && <span className="text-[10px] text-zinc-500 ml-2">{v.address}</span>}
            </div>
          ))}
        </div>

        {/* Pointers */}
        {pointers && pointers.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Pointers</div>
            {pointers.map((p, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className={`px-3 py-2 border rounded ${
                  p.isNull ? 'border-zinc-600 bg-zinc-800' :
                  p.active ? 'border-purple-500 bg-purple-900/30' :
                  'border-purple-700 bg-zinc-800'
                }`}>
                  <span className="text-purple-400 font-mono">{p.name}</span>
                  {p.isNull && <span className="ml-2 text-zinc-500">nullptr</span>}
                </div>
                {!p.isNull && <span className="text-yellow-400">→</span>}
              </div>
            ))}
          </div>
        )}

        {/* References */}
        {refs && refs.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">References</div>
            {refs.map((r, i) => (
              <div key={i} className={`flex items-center gap-2 px-3 py-2 border rounded ${
                r.error ? 'border-red-500 bg-red-900/30' :
                r.active || r.reading ? 'border-cyan-500 bg-cyan-900/30' :
                'border-cyan-700 bg-zinc-800'
              }`}>
                <span className="text-cyan-400 font-mono">{r.name}</span>
                {r.isConst && <span className="text-[10px] text-yellow-400 ml-1">const</span>}
                <span className="text-zinc-500">=</span>
                <span className="text-zinc-400">(alias of {r.aliasOf})</span>
              </div>
            ))}
          </div>
        )}

        {/* Heap for arrow scenario */}
        {heap && heap.length > 0 && (
          <div className="flex flex-col gap-3">
            <div className="text-xs text-zinc-500 uppercase tracking-wider">Heap</div>
            {heap.map((h, i) => (
              <div key={i} className="px-3 py-2 border border-zinc-700 bg-zinc-800 rounded">
                <div className="text-[10px] text-zinc-500">{h.type}</div>
                <div className="font-mono">val = <span className="text-green-400">{h.val}</span></div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Call frame for pass-by */}
      {callFrame && (
        <div className="mt-4 pt-4 border-t border-zinc-700">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Function: {callFrame.name}()</div>
          <div className={`inline-flex items-center gap-2 px-3 py-2 border rounded ${
            callFrame.param.isCopy ? 'border-orange-500 bg-orange-900/20' : 'border-cyan-500 bg-cyan-900/20'
          }`}>
            <span className="text-zinc-400">{callFrame.param.name} = </span>
            <span className="text-green-400">{callFrame.param.value}</span>
            {callFrame.param.isCopy && <span className="text-[10px] text-orange-400 ml-2">(COPY)</span>}
            {callFrame.param.aliasOf && <span className="text-[10px] text-cyan-400 ml-2">(alias of {callFrame.param.aliasOf})</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// Types visualization
function TypesPanel({ section, onOperation }) {
  const [charInput, setCharInput] = useState('A');
  const [stringOp, setStringOp] = useState('index');
  const [vectorState, setVectorState] = useState({ data: [10, 25, 47], capacity: 4 });

  const charCode = charInput.charCodeAt(0);

  const handleVectorOp = (op) => {
    const newState = { ...vectorState };
    switch (op) {
      case 'push_back':
        if (newState.data.length < newState.capacity) {
          newState.data = [...newState.data, Math.floor(Math.random() * 90) + 10];
        } else {
          // Reallocation
          newState.capacity *= 2;
          newState.data = [...newState.data, Math.floor(Math.random() * 90) + 10];
        }
        break;
      case 'pop_back':
        if (newState.data.length > 0) {
          newState.data = newState.data.slice(0, -1);
        }
        break;
      case 'reset':
        newState.data = [10, 25, 47];
        newState.capacity = 4;
        break;
      default:
        break;
    }
    setVectorState(newState);
  };

  if (section === 'types') {
    return (
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Primitive Types</div>
          <div className="grid grid-cols-2 gap-3 text-sm font-mono">
            <div className="bg-zinc-800 p-2 rounded">bool <span className="text-zinc-500">(1 byte)</span> — true/false</div>
            <div className="bg-zinc-800 p-2 rounded">char <span className="text-zinc-500">(1 byte)</span> — 'a', '\n', 65</div>
            <div className="bg-zinc-800 p-2 rounded">int <span className="text-zinc-500">(4 bytes)</span> — -2B to 2B</div>
            <div className="bg-zinc-800 p-2 rounded">size_t <span className="text-zinc-500">(8 bytes)</span> — unsigned</div>
            <div className="bg-zinc-800 p-2 rounded">double <span className="text-zinc-500">(8 bytes)</span> — floating point</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Character Demo</div>
          <div className="flex items-center gap-4">
            <input
              type="text"
              maxLength={1}
              value={charInput}
              onChange={(e) => setCharInput(e.target.value || 'A')}
              className="w-16 px-3 py-2 bg-zinc-800 border border-zinc-700 text-center text-xl font-mono"
            />
            <span className="text-zinc-500">=</span>
            <div className="bg-zinc-800 px-4 py-2 rounded">
              <span className="text-zinc-400">ASCII: </span>
              <span className="text-green-400 font-mono">{charCode}</span>
            </div>
          </div>
          <div className="mt-3 text-sm text-zinc-400">
            <code>'a' + 'b' = {97} + {98} = <span className="text-yellow-400">195</span></code>
            <span className="text-zinc-500 ml-2">(int, NOT "ab"!)</span>
          </div>
        </div>
      </div>
    );
  }

  if (section === 'strings') {
    const str = "hello";
    return (
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">String Visualization</div>
          <div className="font-mono mb-3">string s = "hello";</div>
          <div className="flex mb-2">
            {str.split('').map((c, i) => (
              <div key={i} className={`w-10 h-10 border border-zinc-700 flex items-center justify-center ${
                stringOp === 'index' && i === 2 ? 'bg-blue-500/30 border-blue-500' :
                stringOp === 'substr' && i >= 1 && i <= 3 ? 'bg-green-500/30 border-green-500' :
                'bg-zinc-800'
              }`}>
                {c}
              </div>
            ))}
          </div>
          <div className="flex text-xs text-zinc-500 mb-4">
            {[0,1,2,3,4].map(i => <div key={i} className="w-10 text-center">{i}</div>)}
          </div>
          <div className="flex gap-2 mb-3">
            <button onClick={() => setStringOp('index')} className={`px-3 py-1 text-xs rounded ${stringOp === 'index' ? 'bg-blue-600' : 'bg-zinc-800'}`}>s[2]</button>
            <button onClick={() => setStringOp('substr')} className={`px-3 py-1 text-xs rounded ${stringOp === 'substr' ? 'bg-green-600' : 'bg-zinc-800'}`}>s.substr(1,3)</button>
          </div>
          <div className="text-sm">
            {stringOp === 'index' && <span>s[2] = <span className="text-blue-400">'l'</span> <span className="text-yellow-400 ml-2">⚠ No bounds check!</span></span>}
            {stringOp === 'substr' && <span>s.substr(1,3) = <span className="text-green-400">"ell"</span></span>}
          </div>
        </div>
      </div>
    );
  }

  if (section === 'vectors') {
    return (
      <div className="space-y-4">
        <div className="bg-zinc-900 border border-zinc-800 rounded p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Vector Visualization</div>

          <div className="mb-4">
            <div className="text-xs text-zinc-500 mb-2">Control Block (Stack)</div>
            <div className="bg-zinc-800 border border-zinc-700 p-2 rounded inline-flex gap-4 font-mono text-sm">
              <span>ptr ↓</span>
              <span>size = <span className="text-green-400">{vectorState.data.length}</span></span>
              <span>capacity = <span className="text-blue-400">{vectorState.capacity}</span></span>
            </div>
          </div>

          <div className="mb-4">
            <div className="text-xs text-zinc-500 mb-2">Heap Array</div>
            <div className="flex">
              {Array.from({ length: vectorState.capacity }).map((_, i) => (
                <div key={i} className={`w-12 h-12 border flex items-center justify-center font-mono ${
                  i < vectorState.data.length
                    ? 'border-zinc-600 bg-zinc-800 text-white'
                    : 'border-zinc-700 bg-zinc-900 text-zinc-600'
                }`}>
                  {i < vectorState.data.length ? vectorState.data[i] : '?'}
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-2">
            <button onClick={() => handleVectorOp('push_back')} className="px-3 py-1 text-xs bg-green-700 hover:bg-green-600 rounded">push_back()</button>
            <button onClick={() => handleVectorOp('pop_back')} className="px-3 py-1 text-xs bg-red-700 hover:bg-red-600 rounded">pop_back()</button>
            <button onClick={() => handleVectorOp('reset')} className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded">Reset</button>
          </div>

          {vectorState.data.length === vectorState.capacity && (
            <div className="mt-3 text-xs text-yellow-400">Next push_back will trigger reallocation!</div>
          )}
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-3 rounded text-sm">
          <span className="text-blue-400">Note:</span> C-style array <code>int arr[5]</code> has no .size(), no bounds checking. Always prefer <code>vector&lt;T&gt;</code>.
        </div>
      </div>
    );
  }

  return null;
}

// Code panel
function CodePanel({ lines, activeLine }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded font-mono text-sm">
      <div className="px-3 py-1 text-zinc-600 border-b border-zinc-800 text-[10px] uppercase tracking-wider">Code</div>
      <div className="p-2">
        {lines.map((line, i) => (
          <div key={i} className={`px-2 py-1 rounded transition-colors ${
            i === activeLine ? 'bg-zinc-800 text-green-400' : 'text-zinc-400'
          }`} style={{ paddingLeft: `${8 + (line.indent || 0) * 16}px` }}>
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CppMemoryVisualizer({ onBack, initialTab = 'memory' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [scenario, setScenario] = useState('locals');
  const [typesSection, setTypesSection] = useState('types');
  const [speed, setSpeed] = useState(800);

  const scenarioList = activeTab === 'memory' ? memoryScenarios : pointerScenarios;

  const getSteps = () => {
    if (activeTab === 'memory') return generateMemorySteps(scenario);
    if (activeTab === 'pointers') return generatePointerSteps(scenario);
    return [];
  };

  const getCode = () => {
    if (activeTab === 'memory') return memoryCode[scenario] || [];
    if (activeTab === 'pointers') return pointerCode[scenario] || [];
    return [];
  };

  const getCallout = () => {
    if (activeTab === 'memory') return memoryCallouts[scenario];
    if (activeTab === 'pointers') return pointerCallouts[scenario];
    return '';
  };

  const steps = getSteps();
  const animator = useAnimator(steps, speed);
  const currentStep = animator.stepIdx >= 0 ? steps[animator.stepIdx] : {};

  useEffect(() => {
    if (activeTab === 'memory') setScenario('locals');
    else if (activeTab === 'pointers') setScenario('declare');
    animator.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => {
    animator.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scenario]);

  return (
    <div className="min-h-screen bg-black text-white flex flex-col">
      {/* Header */}
      <div className="flex items-center border-b border-zinc-800">
        <button onClick={onBack} className="px-4 py-3 text-sm bg-zinc-900 hover:bg-zinc-800 border-r border-zinc-800">
          &larr; Back
        </button>
        <div className="flex-1 px-4">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.value ? 'bg-zinc-800 text-white border-b-2 border-blue-500' : 'text-zinc-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        {activeTab !== 'types' && (
          <div className="px-4 flex items-center gap-2">
            <span className="text-xs text-zinc-500">Speed:</span>
            <input
              type="range" min="200" max="1500" step="100"
              value={1700 - speed}
              onChange={(e) => setSpeed(1700 - parseInt(e.target.value, 10))}
              className="w-20 accent-blue-500"
            />
          </div>
        )}
      </div>

      {/* Controls */}
      {activeTab !== 'types' && (
        <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          <select value={scenario} onChange={(e) => setScenario(e.target.value)}
            className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 text-sm rounded">
            {scenarioList.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          <button onClick={() => animator.play()} disabled={animator.running}
            className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white text-sm rounded">
            {animator.running ? 'Running...' : 'Play'}
          </button>
          <button onClick={() => animator.stepBack()} disabled={animator.running || animator.stepIdx <= 0}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-sm rounded">
            Step Back
          </button>
          <button onClick={() => animator.stepForward()} disabled={animator.running || animator.stepIdx >= steps.length - 1}
            className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-sm rounded">
            Step Forward
          </button>
          <button onClick={() => animator.reset()} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-sm rounded">Reset</button>
          {currentStep.message && <span className="text-zinc-400 text-sm ml-4">{currentStep.message}</span>}
        </div>
      )}

      {/* Types sub-tabs */}
      {activeTab === 'types' && (
        <div className="flex gap-2 px-4 py-3 bg-zinc-950 border-b border-zinc-800">
          {typesSections.map(s => (
            <button key={s.value} onClick={() => setTypesSection(s.value)}
              className={`px-4 py-1 text-sm rounded ${typesSection === s.value ? 'bg-blue-600' : 'bg-zinc-800 hover:bg-zinc-700'}`}>
              {s.label}
            </button>
          ))}
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex p-4 gap-4 overflow-auto">
        {activeTab === 'memory' && (
          <>
            <div className="w-1/3 flex flex-col gap-4">
              <CodePanel lines={getCode()} activeLine={currentStep.line} />
              <div className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Key Concept</div>
                <div className="text-sm text-zinc-300">{getCallout()}</div>
              </div>
            </div>
            <div className="flex-1">
              <MemoryDiagram stack={currentStep.stack} heap={currentStep.heap} />
            </div>
          </>
        )}

        {activeTab === 'pointers' && (
          <>
            <div className="w-1/3 flex flex-col gap-4">
              <CodePanel lines={getCode()} activeLine={currentStep.line} />
              <div className="bg-zinc-900 border border-zinc-700 p-3 rounded">
                <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Key Concept</div>
                <div className="text-sm text-zinc-300">{getCallout()}</div>
              </div>
            </div>
            <div className="flex-1">
              <PointerDiagram
                vars={currentStep.vars}
                pointers={currentStep.pointers}
                refs={currentStep.refs}
                heap={currentStep.heap}
                callFrame={currentStep.callFrame}
              />
            </div>
          </>
        )}

        {activeTab === 'types' && (
          <div className="flex-1">
            <TypesPanel section={typesSection} />
          </div>
        )}
      </div>

      {/* Progress bar */}
      {activeTab !== 'types' && (
        <div className="h-1 bg-zinc-800">
          <div className="h-full bg-blue-600 transition-all" style={{ width: steps.length > 0 ? `${((animator.stepIdx + 1) / steps.length) * 100}%` : '0%' }} />
        </div>
      )}

      <footer className="text-center py-2 border-t border-zinc-800">
        <a href="https://faigan.com" target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-blue-400 text-xs">faigan.com</a>
      </footer>
    </div>
  );
}
