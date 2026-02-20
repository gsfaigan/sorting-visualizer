import { useState, useEffect, useRef } from 'react';
import { useAnimator } from '../hooks/useAnimator';

// Tab definitions
const tabs = [
  { value: 'cout', label: 'cout / cin / cerr' },
  { value: 'file', label: 'File Streams' },
  { value: 'string', label: 'String Streams' },
];

// Scenarios for each tab
const coutScenarios = [
  { value: 'basic', label: 'Basic Output' },
  { value: 'reading', label: 'Reading a Number' },
  { value: 'failure', label: 'cin Failure' },
  { value: 'tokens', label: 'Multiple Tokens' },
  { value: 'getline', label: 'getline()' },
  { value: 'cerr', label: 'cerr vs cout' },
];

const fileScenarios = [
  { value: 'write', label: 'Write to File' },
  { value: 'read', label: 'Read from File' },
  { value: 'check', label: 'Check Validity' },
  { value: 'append', label: 'Append Mode' },
  { value: 'poly', label: 'Polymorphic ostream' },
];

const stringScenarios = [
  { value: 'parse', label: 'Parse a Line' },
  { value: 'build', label: 'Build a String' },
  { value: 'convert', label: 'Convert Types' },
  { value: 'tokenize', label: 'Tokenizing' },
];

// Code and steps for cout scenarios
const coutCode = {
  basic: [
    { text: 'cout << "Hello" << " " << "World" << endl;', indent: 0 },
  ],
  reading: [
    { text: 'int x;', indent: 0 },
    { text: 'cout << "Enter a number: ";', indent: 0 },
    { text: 'cin >> x;', indent: 0 },
    { text: 'cout << "You entered: " << x << endl;', indent: 0 },
  ],
  failure: [
    { text: 'int x;', indent: 0 },
    { text: 'cin >> x;  // user types "abc"', indent: 0 },
    { text: 'if (cin.fail()) {', indent: 0 },
    { text: 'cerr << "Invalid input!" << endl;', indent: 1 },
    { text: 'cin.clear();', indent: 1 },
    { text: 'cin.ignore(256, \'\\n\');', indent: 1 },
    { text: '}', indent: 0 },
  ],
  tokens: [
    { text: 'int a, b, c;', indent: 0 },
    { text: 'cin >> a >> b >> c;  // "10  20   30"', indent: 0 },
    { text: 'cout << a << " " << b << " " << c << endl;', indent: 0 },
  ],
  getline: [
    { text: 'string line;', indent: 0 },
    { text: 'getline(cin, line);  // "Hello World"', indent: 0 },
    { text: 'cout << "Line: " << line << endl;', indent: 0 },
  ],
  cerr: [
    { text: 'cout << "Normal output" << endl;', indent: 0 },
    { text: 'cerr << "Error message" << endl;', indent: 0 },
    { text: '// stdout is buffered, stderr is unbuffered', indent: 0 },
  ],
};

const coutCallouts = {
  basic: 'cout and cerr are both ostream — any function accepting ostream& works with both.',
  reading: 'cin >> x skips leading whitespace, stops at next whitespace.',
  failure: 'After failure, cin.fail() returns true. Must call cin.clear() then cin.ignore() to recover.',
  tokens: 'Chained >> works because each returns the stream reference.',
  getline: 'getline reads the WHOLE line including spaces — does NOT skip leading whitespace like >>.',
  cerr: 'cout → stdout (buffered), cerr → stderr (unbuffered, immediate).',
};

// Generate steps for cout scenarios
function generateCoutSteps(scenario) {
  const steps = [];
  switch (scenario) {
    case 'basic':
      steps.push({ line: 0, output: '', typing: 'Hello' });
      steps.push({ line: 0, output: 'Hello', typing: ' ' });
      steps.push({ line: 0, output: 'Hello ', typing: 'World' });
      steps.push({ line: 0, output: 'Hello World', typing: '\n' });
      steps.push({ line: 0, output: 'Hello World\n', done: true });
      break;
    case 'reading':
      steps.push({ line: 0, output: '', message: 'Declaring int x' });
      steps.push({ line: 1, output: '', typing: 'Enter a number: ' });
      steps.push({ line: 1, output: 'Enter a number: ' });
      steps.push({ line: 2, output: 'Enter a number: ', waiting: true, inputValue: '42' });
      steps.push({ line: 2, output: 'Enter a number: 42\n', variables: { x: 42 } });
      steps.push({ line: 3, output: 'Enter a number: 42\n', typing: 'You entered: 42\n' });
      steps.push({ line: 3, output: 'Enter a number: 42\nYou entered: 42\n', done: true });
      break;
    case 'failure':
      steps.push({ line: 0, output: '', message: 'Declaring int x' });
      steps.push({ line: 1, output: '', waiting: true, inputValue: 'abc', fail: true });
      steps.push({ line: 1, output: 'abc\n', cinFail: true, message: 'cin enters fail state!' });
      steps.push({ line: 2, output: 'abc\n', cinFail: true, message: 'Checking cin.fail()...' });
      steps.push({ line: 3, output: 'abc\n', typing: 'Invalid input!\n', stream: 'cerr' });
      steps.push({ line: 4, output: 'abc\n', cerrOutput: 'Invalid input!\n', message: 'Clearing fail flag' });
      steps.push({ line: 5, output: 'abc\n', cerrOutput: 'Invalid input!\n', message: 'Ignoring bad input' });
      steps.push({ line: 6, output: 'abc\n', cerrOutput: 'Invalid input!\n', cinFail: false, done: true });
      break;
    case 'tokens':
      steps.push({ line: 0, output: '', message: 'Declaring a, b, c' });
      steps.push({ line: 1, output: '', waiting: true, inputValue: '10  20   30' });
      steps.push({ line: 1, output: '10  20   30\n', message: 'Extracting a=10, skipping whitespace...' });
      steps.push({ line: 1, output: '10  20   30\n', variables: { a: 10 }, message: 'Extracting b=20...' });
      steps.push({ line: 1, output: '10  20   30\n', variables: { a: 10, b: 20 }, message: 'Extracting c=30...' });
      steps.push({ line: 1, output: '10  20   30\n', variables: { a: 10, b: 20, c: 30 } });
      steps.push({ line: 2, output: '10  20   30\n', typing: '10 20 30\n' });
      steps.push({ line: 2, output: '10  20   30\n10 20 30\n', done: true });
      break;
    case 'getline':
      steps.push({ line: 0, output: '', message: 'Declaring string line' });
      steps.push({ line: 1, output: '', waiting: true, inputValue: 'Hello World' });
      steps.push({ line: 1, output: 'Hello World\n', variables: { line: 'Hello World' }, message: 'Entire line captured!' });
      steps.push({ line: 2, output: 'Hello World\n', typing: 'Line: Hello World\n' });
      steps.push({ line: 2, output: 'Hello World\nLine: Hello World\n', done: true });
      break;
    case 'cerr':
      steps.push({ line: 0, output: '', typing: 'Normal output\n', stream: 'cout' });
      steps.push({ line: 0, output: 'Normal output\n' });
      steps.push({ line: 1, output: 'Normal output\n', typing: 'Error message\n', stream: 'cerr' });
      steps.push({ line: 1, output: 'Normal output\n', cerrOutput: 'Error message\n' });
      steps.push({ line: 2, output: 'Normal output\n', cerrOutput: 'Error message\n', done: true });
      break;
    default:
      break;
  }
  return steps;
}

// File stream code
const fileCode = {
  write: [
    { text: 'ofstream out("output.txt");', indent: 0 },
    { text: 'out << "Hello, file!" << endl;', indent: 0 },
    { text: 'out << "Line 2" << endl;', indent: 0 },
    { text: 'out.close();', indent: 0 },
  ],
  read: [
    { text: 'ifstream in("input.txt");', indent: 0 },
    { text: 'string word;', indent: 0 },
    { text: 'while (in >> word) {', indent: 0 },
    { text: 'cout << word << endl;', indent: 1 },
    { text: '}', indent: 0 },
  ],
  check: [
    { text: 'ifstream file("missing.txt");', indent: 0 },
    { text: 'if (!file) {', indent: 0 },
    { text: 'cerr << "Failed to open!" << endl;', indent: 1 },
    { text: 'return 1;', indent: 1 },
    { text: '}', indent: 0 },
  ],
  append: [
    { text: 'ofstream log("log.txt", ios::app);', indent: 0 },
    { text: 'log << "New entry" << endl;', indent: 0 },
    { text: '// Previous content preserved', indent: 0 },
  ],
  poly: [
    { text: 'void write(ostream& os) {', indent: 0 },
    { text: 'os << "Hello!" << endl;', indent: 1 },
    { text: '}', indent: 0 },
    { text: '', indent: 0 },
    { text: 'write(cout);      // to terminal', indent: 0 },
    { text: 'write(outfile);   // to file', indent: 0 },
  ],
};

const fileCallouts = {
  write: 'ofstream truncates by default — use ios::app to append.',
  read: 'Always check if file opened: if (!myfile) — fails silently otherwise.',
  check: 'File open can fail silently. Always check with if (!file) before use.',
  append: 'ios::app flag preserves existing content and appends new data.',
  poly: 'ifstream/ofstream inherit from istream/ostream — that\'s why ostream& works for both.',
};

function generateFileSteps(scenario) {
  const steps = [];
  switch (scenario) {
    case 'write':
      steps.push({ line: 0, files: { 'output.txt': '' }, message: 'Opening output.txt for writing' });
      steps.push({ line: 1, files: { 'output.txt': 'Hello, file!\n' }, message: 'Writing first line' });
      steps.push({ line: 2, files: { 'output.txt': 'Hello, file!\nLine 2\n' }, message: 'Writing second line' });
      steps.push({ line: 3, files: { 'output.txt': 'Hello, file!\nLine 2\n' }, message: 'File closed', done: true });
      break;
    case 'read':
      steps.push({ line: 0, files: { 'input.txt': 'one two three' }, readPos: 0, message: 'Opening input.txt' });
      steps.push({ line: 1, message: 'Declaring word variable' });
      steps.push({ line: 2, readPos: 0, word: 'one', message: 'Reading word: "one"' });
      steps.push({ line: 3, output: 'one\n' });
      steps.push({ line: 2, readPos: 4, word: 'two', message: 'Reading word: "two"' });
      steps.push({ line: 3, output: 'one\ntwo\n' });
      steps.push({ line: 2, readPos: 8, word: 'three', message: 'Reading word: "three"' });
      steps.push({ line: 3, output: 'one\ntwo\nthree\n' });
      steps.push({ line: 4, output: 'one\ntwo\nthree\n', message: 'End of file reached', done: true });
      break;
    case 'check':
      steps.push({ line: 0, fileError: true, message: 'Attempting to open missing.txt...' });
      steps.push({ line: 1, fileError: true, message: 'File failed to open!' });
      steps.push({ line: 2, cerrOutput: 'Failed to open!\n', message: 'Error reported' });
      steps.push({ line: 3, message: 'Returning error code', done: true });
      break;
    case 'append':
      steps.push({ line: 0, files: { 'log.txt': 'Previous log\n' }, message: 'Opening with ios::app' });
      steps.push({ line: 1, files: { 'log.txt': 'Previous log\nNew entry\n' }, message: 'Appending new entry' });
      steps.push({ line: 2, files: { 'log.txt': 'Previous log\nNew entry\n' }, done: true });
      break;
    case 'poly':
      steps.push({ line: 0, message: 'Defining polymorphic write function' });
      steps.push({ line: 1, message: 'Function accepts any ostream&' });
      steps.push({ line: 4, output: 'Hello!\n', message: 'Called with cout' });
      steps.push({ line: 5, files: { 'outfile.txt': 'Hello!\n' }, message: 'Called with ofstream', done: true });
      break;
    default:
      break;
  }
  return steps;
}

// String stream code
const stringCode = {
  parse: [
    { text: 'string data = "42 hello 3.14";', indent: 0 },
    { text: 'istringstream ss(data);', indent: 0 },
    { text: 'int i; string s; double d;', indent: 0 },
    { text: 'ss >> i >> s >> d;', indent: 0 },
    { text: '// i=42, s="hello", d=3.14', indent: 0 },
  ],
  build: [
    { text: 'ostringstream oss;', indent: 0 },
    { text: 'oss << "Value: " << 42;', indent: 0 },
    { text: 'oss << ", Pi: " << 3.14;', indent: 0 },
    { text: 'string result = oss.str();', indent: 0 },
  ],
  convert: [
    { text: 'int n = stoi("123");', indent: 0 },
    { text: 'double d = stod("3.14");', indent: 0 },
    { text: 'string s = to_string(42);', indent: 0 },
  ],
  tokenize: [
    { text: 'string line = "apple,banana,cherry";', indent: 0 },
    { text: 'istringstream ss(line);', indent: 0 },
    { text: 'string token;', indent: 0 },
    { text: 'while (getline(ss, token, \',\')) {', indent: 0 },
    { text: 'cout << token << endl;', indent: 1 },
    { text: '}', indent: 0 },
  ],
};

const stringCallouts = {
  parse: 'istringstream is the C++ way to parse a line — combine getline + istringstream in a loop.',
  build: 'ostringstream builds strings efficiently — better than repeated + concatenation.',
  convert: 'stoi, stod, to_string are modern C++ — simpler than stringstreams for single values.',
  tokenize: 'getline with delimiter lets you split strings — third parameter is the separator char.',
};

function generateStringSteps(scenario) {
  const steps = [];
  switch (scenario) {
    case 'parse':
      steps.push({ line: 0, buffer: '42 hello 3.14', cursor: 0, message: 'Creating string' });
      steps.push({ line: 1, buffer: '42 hello 3.14', cursor: 0, message: 'Creating istringstream' });
      steps.push({ line: 2, message: 'Declaring variables' });
      steps.push({ line: 3, buffer: '42 hello 3.14', cursor: 0, extracting: '42', type: 'int' });
      steps.push({ line: 3, buffer: '42 hello 3.14', cursor: 3, vars: { i: 42 }, extracting: 'hello', type: 'string' });
      steps.push({ line: 3, buffer: '42 hello 3.14', cursor: 9, vars: { i: 42, s: 'hello' }, extracting: '3.14', type: 'double' });
      steps.push({ line: 4, buffer: '42 hello 3.14', cursor: 14, vars: { i: 42, s: 'hello', d: 3.14 }, done: true });
      break;
    case 'build':
      steps.push({ line: 0, buffer: '', message: 'Creating empty ostringstream' });
      steps.push({ line: 1, buffer: 'Value: 42', message: 'Appending to stream' });
      steps.push({ line: 2, buffer: 'Value: 42, Pi: 3.14', message: 'Appending more' });
      steps.push({ line: 3, buffer: 'Value: 42, Pi: 3.14', result: 'Value: 42, Pi: 3.14', done: true });
      break;
    case 'convert':
      steps.push({ line: 0, convert: { from: '"123"', to: 123, type: 'int' } });
      steps.push({ line: 1, convert: { from: '"3.14"', to: 3.14, type: 'double' } });
      steps.push({ line: 2, convert: { from: 42, to: '"42"', type: 'string' }, done: true });
      break;
    case 'tokenize':
      steps.push({ line: 0, buffer: 'apple,banana,cherry', cursor: 0 });
      steps.push({ line: 1, buffer: 'apple,banana,cherry', cursor: 0 });
      steps.push({ line: 3, buffer: 'apple,banana,cherry', cursor: 0, token: 'apple' });
      steps.push({ line: 4, output: 'apple\n' });
      steps.push({ line: 3, buffer: 'apple,banana,cherry', cursor: 6, token: 'banana' });
      steps.push({ line: 4, output: 'apple\nbanana\n' });
      steps.push({ line: 3, buffer: 'apple,banana,cherry', cursor: 13, token: 'cherry' });
      steps.push({ line: 4, output: 'apple\nbanana\ncherry\n' });
      steps.push({ line: 5, output: 'apple\nbanana\ncherry\n', done: true });
      break;
    default:
      break;
  }
  return steps;
}

// Stream diagram component
function StreamDiagram({ activeStream }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 p-4 rounded text-xs font-mono">
      <div className="text-zinc-500 text-[10px] uppercase tracking-wider mb-3">Stream Flow</div>
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <span className="w-16 text-right">cout</span>
          <div className={`flex-1 h-1 ${activeStream === 'cout' ? 'bg-green-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-zinc-500">stdout</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-right">cin</span>
          <div className={`flex-1 h-1 ${activeStream === 'cin' ? 'bg-blue-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-zinc-500">stdin</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-16 text-right">cerr</span>
          <div className={`flex-1 h-1 ${activeStream === 'cerr' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
          <span className="text-zinc-500">stderr</span>
        </div>
      </div>
    </div>
  );
}

// Code panel with syntax highlighting
function CodePanel({ lines, activeLine }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded font-mono text-sm flex-1 overflow-auto">
      <div className="px-3 py-1 text-zinc-600 border-b border-zinc-800 text-[10px] uppercase tracking-wider">
        C++ Code
      </div>
      <div className="p-2">
        {lines.map((line, i) => (
          <div
            key={i}
            className={`px-2 py-1 rounded transition-colors ${
              i === activeLine ? 'bg-zinc-800 text-green-400' : 'text-zinc-400'
            }`}
            style={{ paddingLeft: `${8 + (line.indent || 0) * 16}px` }}
          >
            {line.text || '\u00A0'}
          </div>
        ))}
      </div>
    </div>
  );
}

// Terminal output panel
function TerminalPanel({ output, cerrOutput, waiting, inputValue, typing }) {
  const [displayedTyping, setDisplayedTyping] = useState('');
  const typingRef = useRef(null);

  useEffect(() => {
    if (typing) {
      setDisplayedTyping('');
      let i = 0;
      typingRef.current = setInterval(() => {
        if (i < typing.length) {
          setDisplayedTyping(typing.slice(0, i + 1));
          i++;
        } else {
          clearInterval(typingRef.current);
        }
      }, 30);
    } else {
      setDisplayedTyping('');
    }
    return () => clearInterval(typingRef.current);
  }, [typing]);

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded font-mono text-sm flex-1 overflow-auto">
      <div className="px-3 py-1 text-zinc-600 border-b border-zinc-800 text-[10px] uppercase tracking-wider flex items-center gap-4">
        <span>Terminal</span>
        {cerrOutput && <span className="text-red-500">stderr active</span>}
      </div>
      <div className="p-3 min-h-[200px]">
        <div className="text-zinc-500">$ ./program</div>
        <div className="text-green-400 whitespace-pre-wrap">{output}</div>
        {displayedTyping && <span className="text-green-400">{displayedTyping}</span>}
        {cerrOutput && <div className="text-red-400 whitespace-pre-wrap">{cerrOutput}</div>}
        {waiting && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-blue-400 animate-pulse">&gt; {inputValue}</span>
            <span className="animate-pulse">_</span>
            <span className="ml-4 px-2 py-0.5 bg-blue-900 text-blue-300 text-xs rounded">
              Simulated Input
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// File system panel
function FilePanel({ files, fileError, readPos }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded font-mono text-sm flex-1">
      <div className="px-3 py-1 text-zinc-600 border-b border-zinc-800 text-[10px] uppercase tracking-wider">
        Virtual Filesystem
      </div>
      <div className="p-3">
        <div className="text-zinc-500 mb-2">/home/user/</div>
        {fileError && (
          <div className="flex items-center gap-2 text-red-400 mb-2">
            <span>missing.txt</span>
            <span className="text-red-500">File not found</span>
          </div>
        )}
        {files && Object.entries(files).map(([name, content]) => (
          <div key={name} className="mb-3">
            <div className="flex items-center gap-2 text-blue-400 mb-1">
              <span>{name}</span>
            </div>
            <div className="bg-zinc-950 border border-zinc-700 p-2 rounded text-xs">
              {content.split('').map((char, i) => (
                <span
                  key={i}
                  className={`${
                    readPos !== undefined && i >= readPos && i < readPos + 5
                      ? 'bg-yellow-500/30 text-yellow-300'
                      : 'text-zinc-400'
                  }`}
                >
                  {char === '\n' ? '\u21B5\n' : char}
                </span>
              ))}
              {!content && <span className="text-zinc-600 italic">empty</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// String buffer visualization
function StringBufferPanel({ buffer, cursor, extracting, type, vars, result }) {
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded font-mono text-sm flex-1">
      <div className="px-3 py-1 text-zinc-600 border-b border-zinc-800 text-[10px] uppercase tracking-wider">
        String Buffer
      </div>
      <div className="p-4">
        {buffer !== undefined && (
          <div className="mb-4">
            <div className="flex">
              {buffer.split('').map((char, i) => (
                <div
                  key={i}
                  className={`w-6 h-8 border border-zinc-700 flex items-center justify-center text-xs ${
                    cursor !== undefined && i < cursor
                      ? 'bg-zinc-700 text-zinc-500'
                      : i >= cursor && extracting && i < cursor + extracting.length
                      ? 'bg-blue-500/30 text-blue-300'
                      : 'bg-zinc-800 text-zinc-300'
                  }`}
                >
                  {char}
                </div>
              ))}
            </div>
            {cursor !== undefined && (
              <div className="mt-1 text-yellow-400" style={{ marginLeft: `${cursor * 24}px` }}>
                ^
              </div>
            )}
          </div>
        )}

        {extracting && (
          <div className="bg-zinc-800 border border-zinc-700 p-2 rounded inline-block mb-4">
            <span className="text-zinc-500">{type}: </span>
            <span className="text-green-400">{extracting}</span>
          </div>
        )}

        {vars && Object.keys(vars).length > 0 && (
          <div className="flex gap-3 mb-4">
            {Object.entries(vars).map(([name, value]) => (
              <div key={name} className="bg-zinc-800 border border-zinc-700 px-3 py-1 rounded">
                <span className="text-zinc-500">{name} = </span>
                <span className="text-green-400">{typeof value === 'string' ? `"${value}"` : value}</span>
              </div>
            ))}
          </div>
        )}

        {result && (
          <div className="bg-green-900/30 border border-green-700 p-3 rounded">
            <span className="text-zinc-400">Result: </span>
            <span className="text-green-400">"{result}"</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CppIOVisualizer({ onBack, initialTab = 'cout' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [scenario, setScenario] = useState('basic');
  const [speed, setSpeed] = useState(800);

  const scenarioList = activeTab === 'cout' ? coutScenarios :
                       activeTab === 'file' ? fileScenarios : stringScenarios;

  const getSteps = () => {
    if (activeTab === 'cout') return generateCoutSteps(scenario);
    if (activeTab === 'file') return generateFileSteps(scenario);
    return generateStringSteps(scenario);
  };

  const getCode = () => {
    if (activeTab === 'cout') return coutCode[scenario] || [];
    if (activeTab === 'file') return fileCode[scenario] || [];
    return stringCode[scenario] || [];
  };

  const getCallout = () => {
    if (activeTab === 'cout') return coutCallouts[scenario];
    if (activeTab === 'file') return fileCallouts[scenario];
    return stringCallouts[scenario];
  };

  const steps = getSteps();
  const animator = useAnimator(steps, speed);
  const currentStep = animator.stepIdx >= 0 ? steps[animator.stepIdx] : {};

  useEffect(() => {
    // Reset scenario when tab changes
    if (activeTab === 'cout') setScenario('basic');
    else if (activeTab === 'file') setScenario('write');
    else setScenario('parse');
    animator.reset();
  }, [activeTab]);

  useEffect(() => {
    animator.reset();
  }, [scenario]);

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
        <div className="flex-1 px-4">
          <div className="flex gap-2">
            {tabs.map(tab => (
              <button
                key={tab.value}
                onClick={() => setActiveTab(tab.value)}
                className={`px-4 py-2 text-sm transition-colors ${
                  activeTab === tab.value
                    ? 'bg-zinc-800 text-white border-b-2 border-blue-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
        <div className="px-4 flex items-center gap-2">
          <span className="text-xs text-zinc-500">Speed:</span>
          <input
            type="range"
            min="200"
            max="1500"
            step="100"
            value={1700 - speed}
            onChange={(e) => setSpeed(1700 - parseInt(e.target.value, 10))}
            className="w-20 accent-blue-500"
          />
        </div>
      </div>

      {/* Scenario selector and controls */}
      <div className="flex items-center gap-4 px-4 py-3 bg-zinc-950 border-b border-zinc-800">
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="bg-zinc-800 border border-zinc-700 text-white px-3 py-1 text-sm rounded"
        >
          {scenarioList.map(s => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={() => animator.play()}
          disabled={animator.running}
          className="px-4 py-1 bg-blue-600 hover:bg-blue-500 disabled:bg-zinc-700 text-white text-sm rounded"
        >
          {animator.running ? 'Running...' : 'Play'}
        </button>
        <button
          onClick={() => animator.stepBack()}
          disabled={animator.running || animator.stepIdx <= 0}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-white text-sm rounded"
        >
          Step Back
        </button>
        <button
          onClick={() => animator.stepForward()}
          disabled={animator.running || animator.stepIdx >= steps.length - 1}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 disabled:bg-zinc-900 disabled:text-zinc-600 text-white text-sm rounded"
        >
          Step Forward
        </button>
        <button
          onClick={() => animator.reset()}
          className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-white text-sm rounded"
        >
          Reset
        </button>
        {currentStep.message && (
          <span className="text-zinc-400 text-sm ml-4">{currentStep.message}</span>
        )}
      </div>

      {/* Main content */}
      <div className="flex-1 flex p-4 gap-4">
        {/* Left: Code panel */}
        <div className="w-1/3 flex flex-col gap-4">
          <CodePanel lines={getCode()} activeLine={currentStep.line} />

          {/* Stream diagram for cout tab */}
          {activeTab === 'cout' && (
            <StreamDiagram
              activeStream={
                currentStep.stream ||
                (currentStep.waiting ? 'cin' : null) ||
                (currentStep.cerrOutput ? 'cerr' : null) ||
                (currentStep.typing ? 'cout' : null)
              }
            />
          )}
        </div>

        {/* Right: Output/visualization panel */}
        <div className="flex-1 flex flex-col gap-4">
          {activeTab === 'cout' && (
            <TerminalPanel
              output={currentStep.output || ''}
              cerrOutput={currentStep.cerrOutput}
              waiting={currentStep.waiting}
              inputValue={currentStep.inputValue}
              typing={currentStep.typing}
            />
          )}

          {activeTab === 'file' && (
            <>
              <FilePanel
                files={currentStep.files}
                fileError={currentStep.fileError}
                readPos={currentStep.readPos}
              />
              {currentStep.output && (
                <TerminalPanel output={currentStep.output} cerrOutput={currentStep.cerrOutput} />
              )}
            </>
          )}

          {activeTab === 'string' && (
            <>
              <StringBufferPanel
                buffer={currentStep.buffer}
                cursor={currentStep.cursor}
                extracting={currentStep.extracting}
                type={currentStep.type}
                vars={currentStep.vars}
                result={currentStep.result}
              />
              {currentStep.output && (
                <TerminalPanel output={currentStep.output} />
              )}
              {currentStep.convert && (
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded flex items-center gap-4">
                  <div className="bg-zinc-800 px-4 py-2 rounded">
                    {typeof currentStep.convert.from === 'string' ? currentStep.convert.from : currentStep.convert.from}
                  </div>
                  <span className="text-yellow-400">→</span>
                  <div className="bg-green-900/30 border border-green-700 px-4 py-2 rounded">
                    <span className="text-zinc-400">{currentStep.convert.type}: </span>
                    <span className="text-green-400">
                      {typeof currentStep.convert.to === 'string' ? currentStep.convert.to : currentStep.convert.to}
                    </span>
                  </div>
                </div>
              )}
            </>
          )}

          {/* Callout card */}
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Key Concept</div>
            <div className="text-sm text-zinc-300">{getCallout()}</div>
          </div>

          {/* Variables display */}
          {currentStep.variables && (
            <div className="bg-zinc-900 border border-zinc-800 p-3 rounded">
              <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Variables</div>
              <div className="flex gap-3">
                {Object.entries(currentStep.variables).map(([name, value]) => (
                  <div key={name} className="bg-zinc-800 px-3 py-1 rounded text-sm">
                    <span className="text-zinc-400">{name} = </span>
                    <span className="text-green-400">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* cin fail indicator */}
          {currentStep.cinFail && (
            <div className="bg-red-900/30 border border-red-700 p-3 rounded flex items-center gap-3">
              <span className="text-red-400 font-bold">cin.fail() = true</span>
              <span className="text-zinc-400 text-sm">Stream is in error state</span>
            </div>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1 bg-zinc-800">
        <div
          className="h-full bg-blue-600 transition-all duration-200"
          style={{ width: steps.length > 0 ? `${((animator.stepIdx + 1) / steps.length) * 100}%` : '0%' }}
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
  );
}
