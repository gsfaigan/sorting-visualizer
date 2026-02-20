import React, { useState, useEffect, useRef, useCallback } from 'react';

// Shared simulated filesystem
const createInitialFS = () => ({
  '/': {
    type: 'dir',
    children: {
      'home': {
        type: 'dir',
        children: {
          'user': {
            type: 'dir',
            children: {
              'projects': {
                type: 'dir',
                children: {
                  'main.cpp': { type: 'file', content: '#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello World" << endl;\n  return 0;\n}', perms: 'rw-r--r--', size: 98 },
                  'test.cpp': { type: 'file', content: '#include <cassert>\n\nint main() {\n  assert(1 + 1 == 2);\n  return 0;\n}', perms: 'rw-r--r--', size: 67 },
                  'utils.cpp': { type: 'file', content: '#include "utils.h"\n\nvoid helper() {\n  // utility function\n}', perms: 'rw-r--r--', size: 55 },
                  'build': { type: 'dir', children: { 'main.o': { type: 'file', content: '', perms: 'rw-r--r--', size: 1024 } }, perms: 'rwxr-xr-x' },
                },
                perms: 'rwxr-xr-x',
              },
              'notes.txt': { type: 'file', content: 'Remember to study for the exam!\nTopics: trees, graphs, sorting', perms: 'rw-r--r--', size: 64 },
              'data.csv': { type: 'file', content: 'name,age,city\nAlice,25,NYC\nBob,30,LA', perms: 'rw-r--r--', size: 42 },
              'readme.txt': { type: 'file', content: 'Welcome to my home directory!', perms: 'rw-r--r--', size: 30 },
              'image.png': { type: 'file', content: '[binary image data]', perms: 'rw-r--r--', size: 4096 },
              'photo.jpg': { type: 'file', content: '[binary image data]', perms: 'rw-r--r--', size: 8192 },
              'backup.tar': { type: 'file', content: '[archive data]', perms: 'rw-r--r--', size: 16384 },
              '.bashrc': { type: 'file', content: 'export PATH=$PATH:/usr/local/bin\nalias ll="ls -l"', perms: 'rw-r--r--', size: 52, hidden: true },
              '.gitignore': { type: 'file', content: '*.o\nbuild/\n.DS_Store', perms: 'rw-r--r--', size: 22, hidden: true },
              'docs': { type: 'dir', children: { 'guide.md': { type: 'file', content: '# User Guide\n\nWelcome!', perms: 'rw-r--r--', size: 24 } }, perms: 'rwxr-xr-x' },
              'src': { type: 'dir', children: { 'app.js': { type: 'file', content: 'console.log("Hello");', perms: 'rw-r--r--', size: 22 } }, perms: 'rwxr-xr-x' },
            },
            perms: 'rwxr-xr-x',
          },
        },
        perms: 'rwxr-xr-x',
      },
      'usr': {
        type: 'dir',
        children: {
          'bin': { type: 'dir', children: { 'ls': { type: 'file', content: '', perms: 'rwxr-xr-x', size: 51200 }, 'grep': { type: 'file', content: '', perms: 'rwxr-xr-x', size: 40960 } }, perms: 'rwxr-xr-x' },
          'local': { type: 'dir', children: { 'bin': { type: 'dir', children: {}, perms: 'rwxr-xr-x' } }, perms: 'rwxr-xr-x' },
        },
        perms: 'rwxr-xr-x',
      },
      'etc': { type: 'dir', children: { 'passwd': { type: 'file', content: 'root:x:0:0::/root:/bin/bash\nuser:x:1000:1000::/home/user:/bin/bash', perms: 'rw-r--r--', size: 68 } }, perms: 'rwxr-xr-x' },
      'tmp': { type: 'dir', children: {}, perms: 'rwxrwxrwx' },
      'bin': { type: 'dir', children: { 'bash': { type: 'file', content: '', perms: 'rwxr-xr-x', size: 102400 } }, perms: 'rwxr-xr-x' },
    },
    perms: 'rwxr-xr-x',
  },
});

// Tab definitions
const tabs = [
  { key: 'filesystem', label: 'Filesystem' },
  { key: 'permissions', label: 'Permissions' },
  { key: 'terminal', label: 'Terminal Sim' },
  { key: 'redirection', label: 'I/O & Pipes' },
  { key: 'globbing', label: 'Globbing' },
  { key: 'grep', label: 'grep & find' },
];

export default function BashVisualizer({ onBack, initialTab = 'terminal' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [fs, setFs] = useState(createInitialFS);
  const [cwd, setCwd] = useState('/home/user');

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
        <div className="flex-1 flex">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-xs uppercase tracking-wider transition-colors ${
                activeTab === tab.key
                  ? 'bg-zinc-800 text-white border-b-2 border-green-500'
                  : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {activeTab === 'filesystem' && <FilesystemTab fs={fs} setFs={setFs} cwd={cwd} setCwd={setCwd} />}
        {activeTab === 'permissions' && <PermissionsTab />}
        {activeTab === 'terminal' && <TerminalTab fs={fs} setFs={setFs} cwd={cwd} setCwd={setCwd} />}
        {activeTab === 'redirection' && <RedirectionTab />}
        {activeTab === 'globbing' && <GlobbingTab />}
        {activeTab === 'grep' && <GrepFindTab fs={fs} cwd={cwd} />}
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

// ============================================================
// Tab 1: Filesystem & Navigation
// ============================================================
function FilesystemTab({ fs, setFs, cwd, setCwd }) {
  const [output, setOutput] = useState([]);
  const [commandInput, setCommandInput] = useState('');
  const [selectedNode, setSelectedNode] = useState(cwd);
  const [animatingNodes, setAnimatingNodes] = useState(new Set());

  const getNode = useCallback((path) => {
    if (path === '/') return fs['/'];
    const parts = path.split('/').filter(Boolean);
    let node = fs['/'];
    for (const part of parts) {
      if (!node.children || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }, [fs]);

  const resolvePath = useCallback((path) => {
    if (path === '~') return '/home/user';
    if (path.startsWith('~/')) return '/home/user/' + path.slice(2);
    if (path.startsWith('/')) return path;
    // Relative path
    let resolved = cwd === '/' ? '' : cwd;
    const parts = path.split('/');
    for (const part of parts) {
      if (part === '..') {
        resolved = resolved.split('/').slice(0, -1).join('/') || '/';
      } else if (part === '.' || part === '') {
        // stay same
      } else {
        resolved = resolved === '/' ? '/' + part : resolved + '/' + part;
      }
    }
    return resolved || '/';
  }, [cwd]);

  const executeCommand = (cmd) => {
    const parts = cmd.trim().split(/\s+/);
    const command = parts[0];
    const args = parts.slice(1);
    const promptLine = `user@host:${cwd === '/home/user' ? '~' : cwd}$ ${cmd}`;

    let result = [];

    switch (command) {
      case 'pwd':
        result = [cwd];
        setAnimatingNodes(new Set([cwd]));
        setTimeout(() => setAnimatingNodes(new Set()), 500);
        break;

      case 'cd': {
        const target = args[0] || '~';
        const newPath = resolvePath(target);
        const node = getNode(newPath);
        if (!node) {
          result = [`cd: ${target}: No such file or directory`];
        } else if (node.type !== 'dir') {
          result = [`cd: ${target}: Not a directory`];
        } else {
          setCwd(newPath);
          setSelectedNode(newPath);
        }
        break;
      }

      case 'ls': {
        const showAll = args.includes('-a');
        const showLong = args.includes('-l');
        const targetPath = args.find(a => !a.startsWith('-')) || cwd;
        const resolved = resolvePath(targetPath);
        const node = getNode(resolved);

        if (!node) {
          result = [`ls: ${targetPath}: No such file or directory`];
        } else if (node.type !== 'dir') {
          result = [targetPath];
        } else {
          const entries = Object.entries(node.children || {});
          const filtered = showAll ? entries : entries.filter(([name]) => !name.startsWith('.'));

          if (showLong) {
            filtered.forEach(([name, item]) => {
              const typeChar = item.type === 'dir' ? 'd' : '-';
              const perms = item.perms || 'rw-r--r--';
              const size = (item.size || 0).toString().padStart(6);
              result.push(`${typeChar}${perms}  1 user user ${size} Jan 15 10:23 ${name}${item.type === 'dir' ? '/' : ''}`);
            });
          } else {
            result = [filtered.map(([name, item]) => name + (item.type === 'dir' ? '/' : '')).join('  ')];
          }

          // Animate children
          const childPaths = filtered.map(([name]) => resolved === '/' ? '/' + name : resolved + '/' + name);
          setAnimatingNodes(new Set(childPaths));
          setTimeout(() => setAnimatingNodes(new Set()), 500);
        }
        break;
      }

      case 'mkdir': {
        const dirName = args[0];
        if (!dirName) {
          result = ['mkdir: missing operand'];
        } else {
          const parentPath = cwd;
          const node = getNode(parentPath);
          if (node && node.type === 'dir') {
            if (node.children[dirName]) {
              result = [`mkdir: ${dirName}: File exists`];
            } else {
              setFs(prev => {
                const newFs = JSON.parse(JSON.stringify(prev));
                const parts = parentPath.split('/').filter(Boolean);
                let target = newFs['/'];
                for (const p of parts) target = target.children[p];
                target.children[dirName] = { type: 'dir', children: {}, perms: 'rwxr-xr-x' };
                return newFs;
              });
              const newPath = parentPath === '/' ? '/' + dirName : parentPath + '/' + dirName;
              setAnimatingNodes(new Set([newPath]));
              setTimeout(() => setAnimatingNodes(new Set()), 1000);
            }
          }
        }
        break;
      }

      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
          result = ['touch: missing operand'];
        } else {
          const parentPath = cwd;
          const node = getNode(parentPath);
          if (node && node.type === 'dir' && !node.children[fileName]) {
            setFs(prev => {
              const newFs = JSON.parse(JSON.stringify(prev));
              const parts = parentPath.split('/').filter(Boolean);
              let target = newFs['/'];
              for (const p of parts) target = target.children[p];
              target.children[fileName] = { type: 'file', content: '', perms: 'rw-r--r--', size: 0 };
              return newFs;
            });
            const newPath = parentPath === '/' ? '/' + fileName : parentPath + '/' + fileName;
            setAnimatingNodes(new Set([newPath]));
            setTimeout(() => setAnimatingNodes(new Set()), 1000);
          }
        }
        break;
      }

      case 'rm': {
        const fileName = args[0];
        if (!fileName) {
          result = ['rm: missing operand'];
        } else {
          const targetPath = resolvePath(fileName);
          const parts = targetPath.split('/').filter(Boolean);
          const nodeName = parts.pop();
          const parentPath = '/' + parts.join('/');
          const parent = getNode(parentPath || '/');

          if (!parent || !parent.children[nodeName]) {
            result = [`rm: ${fileName}: No such file or directory`];
          } else {
            setAnimatingNodes(new Set([targetPath]));
            setTimeout(() => {
              setFs(prev => {
                const newFs = JSON.parse(JSON.stringify(prev));
                let target = newFs['/'];
                for (const p of parts) target = target.children[p];
                delete target.children[nodeName];
                return newFs;
              });
              setAnimatingNodes(new Set());
            }, 500);
          }
        }
        break;
      }

      case 'cat': {
        const fileName = args[0];
        if (!fileName) {
          result = ['cat: missing operand'];
        } else {
          const targetPath = resolvePath(fileName);
          const node = getNode(targetPath);
          if (!node) {
            result = [`cat: ${fileName}: No such file or directory`];
          } else if (node.type === 'dir') {
            result = [`cat: ${fileName}: Is a directory`];
          } else {
            result = (node.content || '').split('\n');
          }
        }
        break;
      }

      case 'cp': {
        const [src, dest] = args;
        if (!src || !dest) {
          result = ['cp: missing operand'];
        } else {
          const srcPath = resolvePath(src);
          const srcNode = getNode(srcPath);
          if (!srcNode) {
            result = [`cp: ${src}: No such file or directory`];
          } else {
            const destPath = resolvePath(dest);
            const destParts = destPath.split('/').filter(Boolean);
            const destName = destParts.pop();

            setFs(prev => {
              const newFs = JSON.parse(JSON.stringify(prev));
              let target = newFs['/'];
              for (const p of destParts) {
                if (!target.children[p]) return prev;
                target = target.children[p];
              }
              target.children[destName] = JSON.parse(JSON.stringify(srcNode));
              return newFs;
            });
            setAnimatingNodes(new Set([destPath]));
            setTimeout(() => setAnimatingNodes(new Set()), 1000);
          }
        }
        break;
      }

      case 'mv': {
        const [src, dest] = args;
        if (!src || !dest) {
          result = ['mv: missing operand'];
        } else {
          const srcPath = resolvePath(src);
          const srcParts = srcPath.split('/').filter(Boolean);
          const srcName = srcParts.pop();
          const srcNode = getNode(srcPath);

          if (!srcNode) {
            result = [`mv: ${src}: No such file or directory`];
          } else {
            const destPath = resolvePath(dest);
            const destParts = destPath.split('/').filter(Boolean);
            const destName = destParts.pop();

            setFs(prev => {
              const newFs = JSON.parse(JSON.stringify(prev));
              // Remove from source
              let srcTarget = newFs['/'];
              for (const p of srcParts) srcTarget = srcTarget.children[p];
              const movedNode = srcTarget.children[srcName];
              delete srcTarget.children[srcName];
              // Add to dest
              let destTarget = newFs['/'];
              for (const p of destParts) destTarget = destTarget.children[p];
              destTarget.children[destName] = movedNode;
              return newFs;
            });
          }
        }
        break;
      }

      default:
        result = [`bash: ${command}: command not found`];
    }

    setOutput(prev => [...prev, { prompt: promptLine, lines: result }]);
    setCommandInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      executeCommand(commandInput);
    }
  };

  return (
    <div className="flex h-full p-4 gap-4">
      {/* Directory Tree */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded p-4 overflow-auto">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Directory Tree</div>
        <DirectoryTree
          fs={fs}
          path="/"
          selectedNode={selectedNode}
          animatingNodes={animatingNodes}
          onSelect={setSelectedNode}
          cwd={cwd}
        />

        {/* Command Input */}
        <div className="mt-4 pt-4 border-t border-zinc-800">
          <div className="flex gap-2 mb-2">
            {['ls', 'ls -l', 'pwd', 'cd ..', 'cd ~'].map(cmd => (
              <button
                key={cmd}
                onClick={() => executeCommand(cmd)}
                className="px-2 py-1 text-xs bg-zinc-800 hover:bg-zinc-700 text-green-400 font-mono rounded"
              >
                {cmd}
              </button>
            ))}
          </div>
          <div className="flex items-center bg-zinc-900 rounded">
            <span className="px-2 text-green-400 font-mono text-sm">
              user@host:{cwd === '/home/user' ? '~' : cwd}$
            </span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent px-2 py-2 text-green-400 font-mono text-sm outline-none"
              placeholder="Type a command..."
            />
          </div>
        </div>

        {/* Output */}
        <div className="mt-4 bg-zinc-900 rounded p-3 max-h-48 overflow-auto font-mono text-xs text-green-400">
          {output.map((entry, i) => (
            <div key={i} className="mb-2">
              <div className="text-zinc-500">{entry.prompt}</div>
              {entry.lines.map((line, j) => (
                <div key={j}>{line}</div>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Concept Cards */}
      <div className="w-80 space-y-4">
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Absolute vs Relative Paths</div>
          <div className="text-xs text-zinc-300 font-mono space-y-2">
            <div><span className="text-green-400">Absolute:</span> starts with /</div>
            <div className="text-zinc-500 pl-2">/home/user/projects/main.cpp</div>
            <div><span className="text-green-400">Relative:</span> from current directory</div>
            <div className="text-zinc-500 pl-2">./projects/main.cpp</div>
            <div className="text-zinc-500 pl-2">../notes.txt (up one, then file)</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Special Directories</div>
          <div className="text-xs text-zinc-300 font-mono space-y-1">
            <div><span className="text-yellow-400">/</span> = root (top of everything)</div>
            <div><span className="text-yellow-400">~</span> = home (/home/user)</div>
            <div><span className="text-yellow-400">.</span> = current directory</div>
            <div><span className="text-yellow-400">..</span> = parent directory</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Hidden Files</div>
          <div className="text-xs text-zinc-300">
            Files starting with <span className="text-yellow-400 font-mono">.</span> are hidden (dotfiles).
            Use <span className="text-green-400 font-mono">ls -a</span> to show them.
          </div>
          <div className="text-xs text-zinc-500 mt-2 font-mono">.bashrc, .gitignore</div>
        </div>
      </div>
    </div>
  );
}

function DirectoryTree({ fs, path, selectedNode, animatingNodes, onSelect, cwd }) {
  // For root, start with the root object
  if (path === '/') {
    return (
      <div>
        <DirectoryNode
          name="/"
          path="/"
          node={fs['/']}
          selectedNode={selectedNode}
          animatingNodes={animatingNodes}
          onSelect={onSelect}
          cwd={cwd}
          depth={0}
          fs={fs}
        />
      </div>
    );
  }
  return null;
}

function DirectoryNode({ name, path, node, selectedNode, animatingNodes, onSelect, cwd, depth, fs }) {
  const [expanded, setExpanded] = useState(depth < 3);
  const isDir = node.type === 'dir';
  const isSelected = selectedNode === path;
  const isCwd = cwd === path;
  const isAnimating = animatingNodes.has(path);
  const isHome = path === '/home/user';

  return (
    <div style={{ marginLeft: depth * 16 }}>
      <div
        onClick={() => {
          onSelect(path);
          if (isDir) setExpanded(!expanded);
        }}
        className={`flex items-center gap-2 px-2 py-1 cursor-pointer rounded transition-all ${
          isSelected ? 'bg-zinc-800 border border-blue-500' : 'hover:bg-zinc-900'
        } ${isAnimating ? 'animate-pulse bg-green-900/30' : ''}`}
      >
        <span className={isDir ? 'text-blue-400' : 'text-zinc-400'}>
          {isDir ? (expanded ? '📂' : '📁') : '📄'}
        </span>
        <span className={`font-mono text-sm ${isDir ? 'text-blue-400' : 'text-zinc-400'} ${isCwd ? 'font-bold' : ''}`}>
          {name}{isDir && name !== '/' ? '/' : ''}
        </span>
        {isHome && <span className="text-yellow-400 text-xs">~</span>}
        {isCwd && <span className="text-green-400 text-xs ml-1">(cwd)</span>}
      </div>

      {isDir && expanded && node.children && (
        <div>
          {Object.entries(node.children)
            .sort(([a, av], [b, bv]) => {
              if (av.type === 'dir' && bv.type !== 'dir') return -1;
              if (av.type !== 'dir' && bv.type === 'dir') return 1;
              return a.localeCompare(b);
            })
            .map(([childName, childNode]) => (
              <DirectoryNode
                key={childName}
                name={childName}
                path={path === '/' ? '/' + childName : path + '/' + childName}
                node={childNode}
                selectedNode={selectedNode}
                animatingNodes={animatingNodes}
                onSelect={onSelect}
                cwd={cwd}
                depth={depth + 1}
                fs={fs}
              />
            ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Tab 2: Permissions (chmod)
// ============================================================
function PermissionsTab() {
  const [perms, setPerms] = useState({
    user: { r: true, w: true, x: true },
    group: { r: true, w: false, x: true },
    other: { r: true, w: false, x: true },
  });
  const [fileType] = useState('d');
  const [animating, setAnimating] = useState(false);

  const togglePerm = (who, perm) => {
    setAnimating(true);
    setPerms(prev => ({
      ...prev,
      [who]: { ...prev[who], [perm]: !prev[who][perm] }
    }));
    setTimeout(() => setAnimating(false), 300);
  };

  const getOctal = (p) => (p.r ? 4 : 0) + (p.w ? 2 : 0) + (p.x ? 1 : 0);
  const getOctalString = () => `${getOctal(perms.user)}${getOctal(perms.group)}${getOctal(perms.other)}`;
  const getPermString = (p) => (p.r ? 'r' : '-') + (p.w ? 'w' : '-') + (p.x ? 'x' : '-');

  const setPreset = (octal) => {
    setAnimating(true);
    const digits = octal.split('').map(Number);
    setPerms({
      user: { r: !!(digits[0] & 4), w: !!(digits[0] & 2), x: !!(digits[0] & 1) },
      group: { r: !!(digits[1] & 4), w: !!(digits[1] & 2), x: !!(digits[1] & 1) },
      other: { r: !!(digits[2] & 4), w: !!(digits[2] & 2), x: !!(digits[2] & 1) },
    });
    setTimeout(() => setAnimating(false), 300);
  };

  return (
    <div className="p-4 space-y-6">
      {/* Permission Display */}
      <div className="bg-zinc-950 border border-zinc-800 rounded p-6">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">ls -l Permission Breakdown</div>

        <div className={`font-mono text-2xl flex items-center gap-1 transition-all ${animating ? 'scale-105' : ''}`}>
          <span className="text-yellow-400" title="File type">{fileType}</span>
          <span className="text-blue-400" title="Owner permissions">{getPermString(perms.user)}</span>
          <span className="text-green-400" title="Group permissions">{getPermString(perms.group)}</span>
          <span className="text-orange-400" title="Other permissions">{getPermString(perms.other)}</span>
          <span className="text-zinc-500 ml-4">2</span>
          <span className="text-zinc-400 ml-2">user</span>
          <span className="text-zinc-400 ml-2">group</span>
          <span className="text-zinc-500 ml-2">4096</span>
          <span className="text-zinc-500 ml-2">Jan 15 10:23</span>
          <span className="text-blue-400 ml-2">projects/</span>
        </div>

        <div className="mt-4 flex gap-8 text-xs">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-400/20 border border-yellow-400"></span>
            <span className="text-zinc-400">Type: {fileType === 'd' ? 'directory' : fileType === '-' ? 'file' : 'symlink'}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-400/20 border border-blue-400"></span>
            <span className="text-zinc-400">Owner: {getOctal(perms.user)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-400/20 border border-green-400"></span>
            <span className="text-zinc-400">Group: {getOctal(perms.group)}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-orange-400/20 border border-orange-400"></span>
            <span className="text-zinc-400">Other: {getOctal(perms.other)}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Interactive chmod */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Interactive chmod</div>

          {/* Toggle Grid */}
          <div className="mb-4">
            <div className="grid grid-cols-4 gap-2 font-mono text-sm">
              <div></div>
              <div className="text-center text-zinc-500">r (4)</div>
              <div className="text-center text-zinc-500">w (2)</div>
              <div className="text-center text-zinc-500">x (1)</div>

              {['user', 'group', 'other'].map(who => (
                <React.Fragment key={who}>
                  <div className={`${who === 'user' ? 'text-blue-400' : who === 'group' ? 'text-green-400' : 'text-orange-400'}`}>
                    {who}
                  </div>
                  {['r', 'w', 'x'].map(p => (
                    <button
                      key={p}
                      onClick={() => togglePerm(who, p)}
                      className={`w-10 h-10 rounded font-bold transition-all ${
                        perms[who][p]
                          ? 'bg-zinc-700 text-white'
                          : 'bg-zinc-900 text-zinc-600'
                      }`}
                    >
                      {perms[who][p] ? p : '-'}
                    </button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Live Command */}
          <div className="bg-zinc-900 rounded p-3 font-mono text-green-400">
            chmod {getOctalString()} filename
          </div>

          {/* Presets */}
          <div className="mt-4 flex flex-wrap gap-2">
            {[
              { octal: '755', label: 'executable' },
              { octal: '644', label: 'readable' },
              { octal: '600', label: 'private' },
              { octal: '777', label: 'dangerous!' },
            ].map(preset => (
              <button
                key={preset.octal}
                onClick={() => setPreset(preset.octal)}
                className={`px-3 py-1 text-xs rounded ${
                  preset.octal === '777' ? 'bg-red-900/50 text-red-400 hover:bg-red-900' : 'bg-zinc-800 hover:bg-zinc-700'
                }`}
              >
                {preset.octal} — {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* Callout Cards */}
        <div className="space-y-4">
          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Permission Values</div>
            <div className="font-mono text-sm space-y-1">
              <div><span className="text-green-400">r</span> = 4 (read)</div>
              <div><span className="text-green-400">w</span> = 2 (write)</div>
              <div><span className="text-green-400">x</span> = 1 (execute)</div>
              <div className="text-zinc-500 mt-2">Sum them: rwx = 7, r-x = 5, rw- = 6</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Common Permissions</div>
            <div className="text-sm space-y-2">
              <div><span className="text-yellow-400 font-mono">755</span>: owner=rwx, group/other=r-x (executables)</div>
              <div><span className="text-yellow-400 font-mono">644</span>: owner=rw-, group/other=r-- (data files)</div>
              <div><span className="text-yellow-400 font-mono">600</span>: owner=rw-, others=--- (private, SSH keys)</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Symbolic Mode</div>
            <div className="text-sm text-zinc-300">
              <span className="text-green-400 font-mono">chmod u+x file</span> — add execute for user
              <br />
              <span className="text-green-400 font-mono">chmod go-w file</span> — remove write for group/other
              <br />
              <span className="text-green-400 font-mono">chmod a=r file</span> — set all to read-only
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 3: Terminal Simulator
// ============================================================
function TerminalTab({ fs, setFs, cwd, setCwd }) {
  const [history, setHistory] = useState([
    { type: 'output', text: 'Welcome to the terminal simulator!' },
    { type: 'output', text: 'Type commands to interact with the simulated filesystem.' },
  ]);
  const [input, setInput] = useState('');
  const [commandHistory, setCommandHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [aliases, setAliases] = useState({ ll: 'ls -l' });
  const terminalRef = useRef(null);

  const envVars = {
    HOME: '/home/user',
    PATH: '/usr/local/bin:/usr/bin:/bin',
    USER: 'user',
    PWD: cwd,
  };

  const getNode = useCallback((path) => {
    if (path === '/') return fs['/'];
    const parts = path.split('/').filter(Boolean);
    let node = fs['/'];
    for (const part of parts) {
      if (!node.children || !node.children[part]) return null;
      node = node.children[part];
    }
    return node;
  }, [fs]);

  const resolvePath = useCallback((path) => {
    if (path === '~') return '/home/user';
    if (path.startsWith('~/')) return '/home/user/' + path.slice(2);
    if (path.startsWith('/')) return path;
    let resolved = cwd === '/' ? '' : cwd;
    const parts = path.split('/');
    for (const part of parts) {
      if (part === '..') {
        resolved = resolved.split('/').slice(0, -1).join('/') || '/';
      } else if (part === '.' || part === '') {
        // stay same
      } else {
        resolved = resolved === '/' ? '/' + part : resolved + '/' + part;
      }
    }
    return resolved || '/';
  }, [cwd]);

  const expandVars = (str, quoteType) => {
    if (quoteType === "'") return str; // Single quotes: no expansion
    return str.replace(/\$([A-Za-z_][A-Za-z0-9_]*)/g, (_, name) => envVars[name] || '');
  };

  const parseCommand = (input) => {
    const tokens = [];
    let current = '';
    let inQuote = null;

    for (let i = 0; i < input.length; i++) {
      const char = input[i];
      if (inQuote) {
        if (char === inQuote) {
          tokens.push({ text: current, quote: inQuote });
          current = '';
          inQuote = null;
        } else {
          current += char;
        }
      } else if (char === '"' || char === "'") {
        if (current) tokens.push({ text: current, quote: null });
        current = '';
        inQuote = char;
      } else if (char === ' ') {
        if (current) tokens.push({ text: current, quote: null });
        current = '';
      } else {
        current += char;
      }
    }
    if (current) tokens.push({ text: current, quote: inQuote || null });

    return tokens.map(t => expandVars(t.text, t.quote));
  };

  const execute = (cmdLine) => {
    const prompt = `user@host:${cwd === '/home/user' ? '~' : cwd}$ `;
    setHistory(prev => [...prev, { type: 'command', text: prompt + cmdLine }]);
    setCommandHistory(prev => [...prev, cmdLine]);
    setHistoryIndex(-1);

    // Handle aliases
    let resolvedCmd = cmdLine;
    const firstWord = cmdLine.split(' ')[0];
    if (aliases[firstWord]) {
      resolvedCmd = aliases[firstWord] + cmdLine.slice(firstWord.length);
    }

    const parts = parseCommand(resolvedCmd);
    if (parts.length === 0) return;

    const cmd = parts[0];
    const args = parts.slice(1);
    let output = [];

    switch (cmd) {
      case 'echo':
        output = [args.join(' ')];
        break;

      case 'pwd':
        output = [cwd];
        break;

      case 'cd': {
        const target = args[0] || '~';
        const newPath = resolvePath(target);
        const node = getNode(newPath);
        if (!node) {
          output = [`cd: ${target}: No such file or directory`];
        } else if (node.type !== 'dir') {
          output = [`cd: ${target}: Not a directory`];
        } else {
          setCwd(newPath);
        }
        break;
      }

      case 'ls': {
        const showAll = args.includes('-a');
        const showLong = args.includes('-l');
        const targetPath = args.find(a => !a.startsWith('-')) || cwd;
        const resolved = resolvePath(targetPath);
        const node = getNode(resolved);

        if (!node) {
          output = [`ls: ${targetPath}: No such file or directory`];
        } else if (node.type !== 'dir') {
          output = [targetPath];
        } else {
          const entries = Object.entries(node.children || {});
          const filtered = showAll ? entries : entries.filter(([name]) => !name.startsWith('.'));

          if (showLong) {
            filtered.forEach(([name, item]) => {
              const typeChar = item.type === 'dir' ? 'd' : '-';
              const perms = item.perms || 'rw-r--r--';
              const size = (item.size || 0).toString().padStart(6);
              output.push(`${typeChar}${perms}  1 user user ${size} Jan 15 10:23 ${name}${item.type === 'dir' ? '/' : ''}`);
            });
          } else {
            output = [filtered.map(([name, item]) => name + (item.type === 'dir' ? '/' : '')).join('  ')];
          }
        }
        break;
      }

      case 'cat': {
        const fileName = args[0];
        if (!fileName) {
          output = ['cat: missing operand'];
        } else {
          const targetPath = resolvePath(fileName);
          const node = getNode(targetPath);
          if (!node) {
            output = [`cat: ${fileName}: No such file or directory`];
          } else if (node.type === 'dir') {
            output = [`cat: ${fileName}: Is a directory`];
          } else {
            output = (node.content || '').split('\n');
          }
        }
        break;
      }

      case 'mkdir': {
        const dirName = args[0];
        if (!dirName) {
          output = ['mkdir: missing operand'];
        } else {
          setFs(prev => {
            const newFs = JSON.parse(JSON.stringify(prev));
            const parts = cwd.split('/').filter(Boolean);
            let target = newFs['/'];
            for (const p of parts) target = target.children[p];
            if (!target.children[dirName]) {
              target.children[dirName] = { type: 'dir', children: {}, perms: 'rwxr-xr-x' };
            }
            return newFs;
          });
        }
        break;
      }

      case 'touch': {
        const fileName = args[0];
        if (!fileName) {
          output = ['touch: missing operand'];
        } else {
          setFs(prev => {
            const newFs = JSON.parse(JSON.stringify(prev));
            const parts = cwd.split('/').filter(Boolean);
            let target = newFs['/'];
            for (const p of parts) target = target.children[p];
            if (!target.children[fileName]) {
              target.children[fileName] = { type: 'file', content: '', perms: 'rw-r--r--', size: 0 };
            }
            return newFs;
          });
        }
        break;
      }

      case 'type': {
        const name = args[0];
        if (!name) {
          output = ['type: missing operand'];
        } else if (['cd', 'echo', 'alias', 'type', 'export'].includes(name)) {
          output = [`${name} is a shell builtin`];
        } else if (['ls', 'grep', 'find', 'cat', 'mkdir'].includes(name)) {
          output = [`${name} is /bin/${name}`];
        } else if (aliases[name]) {
          output = [`${name} is aliased to '${aliases[name]}'`];
        } else {
          output = [`bash: type: ${name}: not found`];
        }
        break;
      }

      case 'which': {
        const name = args[0];
        if (!name) {
          output = ['which: missing operand'];
        } else if (['ls', 'grep', 'find', 'cat', 'mkdir'].includes(name)) {
          output = [`/bin/${name}`];
        } else {
          output = [`${name} not found`];
        }
        break;
      }

      case 'alias':
        if (args.length === 0) {
          output = Object.entries(aliases).map(([k, v]) => `alias ${k}='${v}'`);
        } else {
          const match = args[0].match(/^([^=]+)='?([^']*)'?$/);
          if (match) {
            setAliases(prev => ({ ...prev, [match[1]]: match[2] }));
          }
        }
        break;

      case 'history':
        output = commandHistory.map((cmd, i) => `  ${i + 1}  ${cmd}`);
        break;

      case 'clear':
        setHistory([]);
        return;

      default:
        output = [`bash: ${cmd}: command not found`];
    }

    if (output.length > 0) {
      setHistory(prev => [...prev, ...output.map(line => ({ type: 'output', text: line }))]);
    }
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      execute(input);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (commandHistory.length > 0) {
        const newIndex = historyIndex === -1 ? commandHistory.length - 1 : Math.max(0, historyIndex - 1);
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex !== -1) {
        const newIndex = historyIndex + 1;
        if (newIndex >= commandHistory.length) {
          setHistoryIndex(-1);
          setInput('');
        } else {
          setHistoryIndex(newIndex);
          setInput(commandHistory[newIndex]);
        }
      }
    }
  };

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [history]);

  return (
    <div className="flex h-full p-4 gap-4">
      {/* Terminal */}
      <div className="flex-1 bg-zinc-950 border border-zinc-800 rounded flex flex-col">
        <div className="flex items-center gap-2 px-4 py-2 border-b border-zinc-800">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="ml-4 text-xs text-zinc-500">bash — terminal</span>
        </div>

        <div ref={terminalRef} className="flex-1 p-4 overflow-auto font-mono text-sm">
          {history.map((entry, i) => (
            <div
              key={i}
              className={entry.type === 'command' ? 'text-green-400' : 'text-zinc-300'}
            >
              {entry.text}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-zinc-800">
          <div className="flex items-center">
            <span className="text-green-400 font-mono text-sm">
              user@host:{cwd === '/home/user' ? '~' : cwd}$&nbsp;
            </span>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1 bg-transparent text-green-400 font-mono text-sm outline-none"
              autoFocus
            />
          </div>
        </div>
      </div>

      {/* Reference */}
      <div className="w-80 space-y-4 overflow-auto">
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Shell Concepts</div>
          <div className="text-xs text-zinc-300 space-y-2">
            <div><span className="text-green-400 font-mono">type</span> / <span className="text-green-400 font-mono">which</span> — find where a command lives</div>
            <div className="text-zinc-500">Built-ins (cd, echo, alias) run inside the shell</div>
            <div className="text-zinc-500">External programs (ls, grep) fork a new process</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Quoting</div>
          <div className="text-xs text-zinc-300 space-y-2 font-mono">
            <div>'$HOME' → $HOME <span className="text-zinc-500">(no expansion)</span></div>
            <div>"$HOME" → /home/user <span className="text-zinc-500">(expand vars)</span></div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Environment Variables</div>
          <div className="text-xs text-zinc-300 space-y-1 font-mono">
            <div>$HOME = /home/user</div>
            <div>$PATH = /usr/local/bin:...</div>
            <div>$USER = user</div>
            <div>$PWD = {cwd}</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Try These</div>
          <div className="text-xs space-y-1">
            {['echo "Hello $USER"', "echo 'Hello $USER'", 'type cd', 'which ls', 'alias ll="ls -l"', 'll'].map(cmd => (
              <button
                key={cmd}
                onClick={() => { setInput(cmd); }}
                className="block w-full text-left px-2 py-1 font-mono text-green-400 hover:bg-zinc-800 rounded"
              >
                {cmd}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 4: I/O Redirection & Pipes
// ============================================================
function RedirectionTab() {
  const [scenario, setScenario] = useState('stdout');
  const [animating, setAnimating] = useState(false);
  const [dotPositions, setDotPositions] = useState([]);

  const scenarios = {
    stdout: {
      label: 'ls > files.txt',
      description: 'Redirect stdout to file (overwrite)',
      diagram: [
        { type: 'process', label: 'ls', x: 50, y: 100 },
        { type: 'arrow', from: { x: 120, y: 100 }, to: { x: 280, y: 100 }, label: 'stdout' },
        { type: 'file', label: 'files.txt', x: 300, y: 80 },
      ],
      note: 'stdin: keyboard (unused)\nstderr: terminal (unchanged)',
    },
    append: {
      label: 'ls >> files.txt',
      description: 'Redirect stdout to file (append)',
      diagram: [
        { type: 'process', label: 'ls', x: 50, y: 100 },
        { type: 'arrow', from: { x: 120, y: 100 }, to: { x: 280, y: 100 }, label: 'stdout (append)' },
        { type: 'file', label: 'files.txt', x: 300, y: 80, append: true },
      ],
      note: 'New content appended to existing file content',
    },
    stdin: {
      label: 'sort < names.txt',
      description: 'Redirect file to stdin',
      diagram: [
        { type: 'file', label: 'names.txt', x: 30, y: 80 },
        { type: 'arrow', from: { x: 130, y: 100 }, to: { x: 200, y: 100 }, label: 'stdin' },
        { type: 'process', label: 'sort', x: 220, y: 100 },
        { type: 'arrow', from: { x: 290, y: 100 }, to: { x: 380, y: 100 }, label: 'stdout' },
        { type: 'terminal', label: 'terminal', x: 400, y: 80 },
      ],
      note: 'File contents become the input to the command',
    },
    stderr: {
      label: 'ls 2> errors.txt',
      description: 'Redirect stderr to file',
      diagram: [
        { type: 'process', label: 'ls', x: 100, y: 100 },
        { type: 'arrow', from: { x: 170, y: 85 }, to: { x: 300, y: 50 }, label: 'stdout' },
        { type: 'terminal', label: 'terminal', x: 320, y: 30 },
        { type: 'arrow', from: { x: 170, y: 115 }, to: { x: 300, y: 150 }, label: 'stderr' },
        { type: 'file', label: 'errors.txt', x: 320, y: 130 },
      ],
      note: 'stdout goes to terminal, stderr goes to file',
    },
    pipe: {
      label: 'cmd1 | cmd2 | cmd3',
      description: 'Pipeline (concurrent processes)',
      diagram: [
        { type: 'process', label: 'ls -l', x: 30, y: 100 },
        { type: 'arrow', from: { x: 100, y: 100 }, to: { x: 150, y: 100 }, label: 'pipe' },
        { type: 'process', label: 'grep .txt', x: 160, y: 100 },
        { type: 'arrow', from: { x: 250, y: 100 }, to: { x: 300, y: 100 }, label: 'pipe' },
        { type: 'process', label: 'wc -l', x: 310, y: 100 },
        { type: 'arrow', from: { x: 380, y: 100 }, to: { x: 430, y: 100 }, label: 'stdout' },
        { type: 'terminal', label: 'terminal', x: 450, y: 80 },
      ],
      note: 'Each process runs CONCURRENTLY!\nNo temp file created — efficient for large data.',
    },
    merge: {
      label: '2>&1',
      description: 'Merge stderr into stdout',
      diagram: [
        { type: 'process', label: 'cmd', x: 80, y: 100 },
        { type: 'arrow', from: { x: 150, y: 90 }, to: { x: 280, y: 70 }, label: 'stdout' },
        { type: 'arrow', from: { x: 150, y: 110 }, to: { x: 220, y: 130 }, label: 'stderr' },
        { type: 'arrow', from: { x: 220, y: 130 }, to: { x: 280, y: 90 }, label: '→ fd1', dashed: true },
        { type: 'file', label: 'merged output', x: 300, y: 50 },
      ],
      note: 'stderr (fd 2) is redirected to stdout (fd 1)\nBoth streams end up in the same place.',
    },
  };

  const playAnimation = () => {
    setAnimating(true);
    setDotPositions([]);

    let pos = 0;
    const interval = setInterval(() => {
      pos += 5;
      setDotPositions([pos % 100]);
      if (pos > 300) {
        clearInterval(interval);
        setAnimating(false);
      }
    }, 50);
  };

  const current = scenarios[scenario];

  return (
    <div className="p-4 space-y-4">
      {/* Scenario Selector */}
      <div className="flex items-center gap-4 bg-zinc-950 border border-zinc-800 rounded p-4">
        <span className="text-xs text-zinc-500 uppercase">Scenario:</span>
        <select
          value={scenario}
          onChange={(e) => setScenario(e.target.value)}
          className="bg-zinc-800 text-white px-3 py-1 rounded text-sm"
        >
          {Object.entries(scenarios).map(([key, s]) => (
            <option key={key} value={key}>{s.label}</option>
          ))}
        </select>
        <button
          onClick={playAnimation}
          disabled={animating}
          className="px-4 py-1 bg-green-600 hover:bg-green-500 disabled:opacity-50 rounded text-sm"
        >
          {animating ? 'Playing...' : 'Play Animation'}
        </button>
      </div>

      {/* Diagram */}
      <div className="bg-zinc-950 border border-zinc-800 rounded p-6">
        <div className="text-lg font-mono text-green-400 mb-2">{current.label}</div>
        <div className="text-sm text-zinc-400 mb-4">{current.description}</div>

        <svg width="100%" height="200" viewBox="0 0 500 200" className="mx-auto">
          {current.diagram.map((item, i) => {
            if (item.type === 'process') {
              return (
                <g key={i}>
                  <rect x={item.x} y={item.y - 20} width="70" height="40" fill="#1e3a5f" stroke="#3b82f6" strokeWidth="2" rx="4" />
                  <text x={item.x + 35} y={item.y + 5} textAnchor="middle" fill="#93c5fd" fontSize="12" fontFamily="monospace">{item.label}</text>
                </g>
              );
            }
            if (item.type === 'file') {
              return (
                <g key={i}>
                  <rect x={item.x} y={item.y} width="80" height="40" fill="#1f2937" stroke="#6b7280" strokeWidth="2" rx="4" />
                  <text x={item.x + 40} y={item.y + 25} textAnchor="middle" fill="#9ca3af" fontSize="11" fontFamily="monospace">{item.label}</text>
                  {item.append && <text x={item.x + 40} y={item.y + 55} textAnchor="middle" fill="#f59e0b" fontSize="10">(append)</text>}
                </g>
              );
            }
            if (item.type === 'terminal') {
              return (
                <g key={i}>
                  <rect x={item.x} y={item.y} width="70" height="40" fill="#064e3b" stroke="#10b981" strokeWidth="2" rx="4" />
                  <text x={item.x + 35} y={item.y + 25} textAnchor="middle" fill="#6ee7b7" fontSize="11" fontFamily="monospace">{item.label}</text>
                </g>
              );
            }
            if (item.type === 'arrow') {
              const dx = item.to.x - item.from.x;
              const dy = item.to.y - item.from.y;
              return (
                <g key={i}>
                  <defs>
                    <marker id={`arrow-${i}`} markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto">
                      <path d="M0,0 L0,6 L9,3 z" fill="#4ade80" />
                    </marker>
                  </defs>
                  <line
                    x1={item.from.x}
                    y1={item.from.y}
                    x2={item.to.x}
                    y2={item.to.y}
                    stroke="#4ade80"
                    strokeWidth="2"
                    strokeDasharray={item.dashed ? '5,5' : 'none'}
                    markerEnd={`url(#arrow-${i})`}
                  />
                  <text
                    x={(item.from.x + item.to.x) / 2}
                    y={(item.from.y + item.to.y) / 2 - 10}
                    textAnchor="middle"
                    fill="#86efac"
                    fontSize="10"
                  >
                    {item.label}
                  </text>
                  {animating && dotPositions.map((pos, di) => (
                    <circle
                      key={di}
                      cx={item.from.x + (dx * pos / 100)}
                      cy={item.from.y + (dy * pos / 100)}
                      r="4"
                      fill="#22c55e"
                    />
                  ))}
                </g>
              );
            }
            return null;
          })}
        </svg>

        <div className="mt-4 bg-zinc-900 rounded p-3 font-mono text-xs text-zinc-400 whitespace-pre-line">
          {current.note}
        </div>
      </div>

      {/* Reference Cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Redirection Operators</div>
          <div className="font-mono text-sm space-y-1">
            <div><span className="text-green-400">&gt;</span> overwrite stdout to file</div>
            <div><span className="text-green-400">&gt;&gt;</span> append stdout to file</div>
            <div><span className="text-green-400">&lt;</span> redirect file to stdin</div>
            <div><span className="text-green-400">2&gt;</span> redirect stderr to file</div>
            <div><span className="text-green-400">&amp;&gt;</span> redirect both stdout and stderr</div>
            <div><span className="text-green-400">2&gt;&amp;1</span> merge stderr into stdout</div>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
          <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Pipes</div>
          <div className="text-sm text-zinc-300 space-y-2">
            <div><span className="text-green-400 font-mono">|</span> pipe: stdout of left → stdin of right</div>
            <div className="text-zinc-500">Processes run CONCURRENTLY (in parallel!)</div>
            <div className="text-zinc-500">No temp file created — efficient for large data</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 5: Globbing & Patterns
// ============================================================
function GlobbingTab() {
  const [pattern, setPattern] = useState('*.cpp');
  const [debouncedPattern, setDebouncedPattern] = useState(pattern);

  const files = [
    'main.cpp', 'test.cpp', 'utils.cpp', 'readme.txt',
    'data.csv', 'notes.txt', '.bashrc', '.gitignore',
    'image.png', 'photo.jpg', 'backup.tar', 'main.o',
    'build/', 'src/', 'docs/',
  ];

  // Debounce pattern
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedPattern(pattern), 200);
    return () => clearTimeout(timer);
  }, [pattern]);

  const globToRegex = (glob) => {
    let regex = '^';
    let i = 0;
    while (i < glob.length) {
      const c = glob[i];
      if (c === '*') {
        regex += '.*';
      } else if (c === '?') {
        regex += '.';
      } else if (c === '[') {
        let j = i + 1;
        let negated = false;
        if (glob[j] === '!' || glob[j] === '^') {
          negated = true;
          j++;
        }
        let chars = '';
        while (j < glob.length && glob[j] !== ']') {
          chars += glob[j];
          j++;
        }
        regex += negated ? `[^${chars}]` : `[${chars}]`;
        i = j;
      } else if (c === '{') {
        let j = i + 1;
        let options = [];
        let current = '';
        while (j < glob.length && glob[j] !== '}') {
          if (glob[j] === ',') {
            options.push(current);
            current = '';
          } else {
            current += glob[j];
          }
          j++;
        }
        options.push(current);
        regex += `(${options.join('|')})`;
        i = j;
      } else if ('.+^${}()|[]\\'.includes(c)) {
        regex += '\\' + c;
      } else {
        regex += c;
      }
      i++;
    }
    regex += '$';
    return regex;
  };

  const matchesGlob = (filename, glob) => {
    try {
      const regex = new RegExp(globToRegex(glob));
      return regex.test(filename);
    } catch {
      return false;
    }
  };

  const matches = files.filter(f => matchesGlob(f.replace('/', ''), debouncedPattern));

  const comparisons = [
    { glob: '*', regex: '.*', desc: 'any string' },
    { glob: '?', regex: '.', desc: 'single char' },
    { glob: '[abc]', regex: '[abc]', desc: 'char class' },
    { glob: '[a-z]', regex: '[a-z]', desc: 'range' },
    { glob: '[!abc]', regex: '[^abc]', desc: 'negated class' },
    { glob: '{a,b}', regex: '(a|b)', desc: 'alternatives' },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Pattern Input */}
      <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Pattern Matcher</div>
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 font-mono">ls</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-3 py-2 font-mono text-green-400 text-lg outline-none focus:border-green-500"
            placeholder="*.cpp"
          />
          <span className="text-xs text-zinc-500">{matches.length} matches</span>
        </div>

        {/* Quick Patterns */}
        <div className="flex gap-2 mt-3">
          {['*.cpp', '*.txt', '?ain.cpp', '[mt]*.cpp', '.*', '{main,test}.cpp'].map(p => (
            <button
              key={p}
              onClick={() => setPattern(p)}
              className={`px-2 py-1 text-xs font-mono rounded ${
                pattern === p ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* File List */}
        <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
          <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Virtual Directory</div>
          <div className="grid grid-cols-3 gap-2 font-mono text-sm">
            {files.map(file => {
              const isDir = file.endsWith('/');
              const isMatch = matches.includes(file);
              const isHidden = file.startsWith('.');
              return (
                <div
                  key={file}
                  className={`px-2 py-1 rounded transition-all ${
                    isMatch
                      ? 'bg-green-900/50 text-green-400 border border-green-500'
                      : 'text-zinc-700'
                  } ${isDir ? 'text-blue-400' : ''} ${isHidden && !isMatch ? 'text-zinc-600' : ''}`}
                >
                  {isDir ? '📁 ' : '📄 '}{file}
                </div>
              );
            })}
          </div>
        </div>

        {/* Comparison Table */}
        <div className="space-y-4">
          <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Glob vs Regex</div>
            <table className="w-full text-sm font-mono">
              <thead>
                <tr className="text-zinc-500">
                  <th className="text-left pb-2">Glob</th>
                  <th className="text-left pb-2">Regex</th>
                  <th className="text-left pb-2">Meaning</th>
                </tr>
              </thead>
              <tbody>
                {comparisons.map(row => (
                  <tr key={row.glob} className="border-t border-zinc-800">
                    <td className="py-1 text-green-400">{row.glob}</td>
                    <td className="py-1 text-orange-400">{row.regex}</td>
                    <td className="py-1 text-zinc-400">{row.desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">How Globbing Works</div>
            <div className="text-sm text-zinc-300 space-y-2">
              <div>Globbing is done by the <span className="text-yellow-400">SHELL</span> before the command runs.</div>
              <div className="font-mono text-xs bg-zinc-950 p-2 rounded">
                ls *.cpp → shell expands to → ls main.cpp test.cpp utils.cpp
              </div>
              <div className="text-zinc-500">The ls command never sees *.cpp</div>
            </div>
          </div>

          <div className="bg-zinc-900 border border-zinc-700 p-4 rounded">
            <div className="text-xs text-blue-400 uppercase tracking-wider mb-2">Quotes Disable Globbing</div>
            <div className="text-sm text-zinc-300 font-mono space-y-1">
              <div>ls "*.cpp" → looks for literal file named *.cpp</div>
              <div>ls '*.cpp' → same (both quote styles prevent globbing)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// Tab 6: grep & find
// ============================================================
function GrepFindTab({ fs, cwd }) {
  const [activePanel, setActivePanel] = useState('both'); // 'both', 'grep', 'find'

  return (
    <div className="p-4 h-full">
      <div className="flex gap-2 mb-4">
        {[
          { key: 'both', label: 'Both Panels' },
          { key: 'grep', label: 'grep Full' },
          { key: 'find', label: 'find Full' },
        ].map(opt => (
          <button
            key={opt.key}
            onClick={() => setActivePanel(opt.key)}
            className={`px-3 py-1 text-xs rounded ${
              activePanel === opt.key ? 'bg-zinc-700 text-white' : 'bg-zinc-900 text-zinc-400'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      <div className={`grid gap-4 ${activePanel === 'both' ? 'grid-cols-2' : 'grid-cols-1'}`}>
        {(activePanel === 'both' || activePanel === 'grep') && <GrepPanel />}
        {(activePanel === 'both' || activePanel === 'find') && <FindPanel fs={fs} cwd={cwd} />}
      </div>
    </div>
  );
}

function GrepPanel() {
  const [pattern, setPattern] = useState('cout');
  const [flags, setFlags] = useState({ i: false, n: true, v: false });

  const fileContent = [
    '#include <iostream>',
    'using namespace std;',
    '',
    'int main() {',
    '  cout << "Hello World" << endl;',
    '  return 0;',
    '}',
  ];

  const matchLine = (line, pat, caseInsensitive) => {
    if (!pat) return { matches: false, indices: [] };
    try {
      const regex = new RegExp(pat, caseInsensitive ? 'gi' : 'g');
      const matches = [...line.matchAll(regex)];
      if (matches.length === 0) return { matches: false, indices: [] };
      return {
        matches: true,
        indices: matches.map(m => ({ start: m.index, end: m.index + m[0].length })),
      };
    } catch {
      return { matches: false, indices: [] };
    }
  };

  const highlightLine = (line, indices) => {
    if (indices.length === 0) return line;
    const parts = [];
    let lastEnd = 0;
    indices.forEach(({ start, end }, i) => {
      if (start > lastEnd) {
        parts.push(<span key={`t${i}`}>{line.slice(lastEnd, start)}</span>);
      }
      parts.push(
        <span key={`m${i}`} className="bg-green-900 text-green-300">{line.slice(start, end)}</span>
      );
      lastEnd = end;
    });
    if (lastEnd < line.length) {
      parts.push(<span key="end">{line.slice(lastEnd)}</span>);
    }
    return parts;
  };

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">grep</div>

      {/* Input */}
      <div className="flex items-center gap-2 mb-3">
        <span className="font-mono text-green-400">grep</span>
        <div className="flex gap-1">
          {Object.entries(flags).map(([flag, enabled]) => (
            <button
              key={flag}
              onClick={() => setFlags(f => ({ ...f, [flag]: !f[flag] }))}
              className={`px-2 py-0.5 text-xs font-mono rounded ${
                enabled ? 'bg-green-600 text-white' : 'bg-zinc-800 text-zinc-500'
              }`}
            >
              -{flag}
            </button>
          ))}
        </div>
        <input
          type="text"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 font-mono text-green-400 text-sm outline-none"
          placeholder="pattern"
        />
        <span className="text-zinc-500 font-mono text-sm">main.cpp</span>
      </div>

      {/* Quick patterns */}
      <div className="flex gap-2 mb-3">
        {['cout', 'int', '#include', 'main', 'return'].map(p => (
          <button
            key={p}
            onClick={() => setPattern(p)}
            className="px-2 py-0.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded font-mono"
          >
            {p}
          </button>
        ))}
      </div>

      {/* File Content */}
      <div className="bg-zinc-900 rounded p-3 font-mono text-sm overflow-auto max-h-64">
        {fileContent.map((line, i) => {
          const result = matchLine(line, pattern, flags.i);
          const isMatch = flags.v ? !result.matches : result.matches;
          const showLine = pattern ? isMatch : true;

          if (!showLine && pattern) return null;

          return (
            <div
              key={i}
              className={`flex ${isMatch && pattern ? 'bg-zinc-800 border-l-2 border-green-500' : ''}`}
            >
              {flags.n && (
                <span className="w-8 text-right pr-2 text-zinc-600 select-none">{i + 1}:</span>
              )}
              <span className={isMatch && pattern ? 'text-green-400' : 'text-zinc-400'}>
                {isMatch && !flags.v ? highlightLine(line, result.indices) : line}
              </span>
            </div>
          );
        })}
      </div>

      {/* Reference */}
      <div className="mt-3 text-xs text-zinc-500 grid grid-cols-2 gap-2">
        <div><span className="text-green-400">.</span> any character</div>
        <div><span className="text-green-400">*</span> zero or more</div>
        <div><span className="text-green-400">^</span> start of line</div>
        <div><span className="text-green-400">$</span> end of line</div>
        <div><span className="text-green-400">[abc]</span> char class</div>
        <div><span className="text-green-400">[^ab]</span> negated</div>
      </div>
    </div>
  );
}

function FindPanel({ fs, cwd }) {
  const [namePattern, setNamePattern] = useState('*.cpp');
  const [fileType, setFileType] = useState('');
  const [maxDepth, setMaxDepth] = useState('');

  const collectPaths = (node, path, depth, results, opts) => {
    if (opts.maxDepth && depth > opts.maxDepth) return;

    Object.entries(node.children || {}).forEach(([name, child]) => {
      const fullPath = path === '/' ? '/' + name : path + '/' + name;

      // Type filter
      if (opts.type === 'f' && child.type !== 'file') return;
      if (opts.type === 'd' && child.type !== 'dir') return;

      // Name filter (glob)
      if (opts.name) {
        const regex = new RegExp('^' + opts.name.replace(/\*/g, '.*').replace(/\?/g, '.') + '$');
        if (!regex.test(name)) {
          // Still recurse into directories
          if (child.type === 'dir') {
            collectPaths(child, fullPath, depth + 1, results, opts);
          }
          return;
        }
      }

      results.push({ path: fullPath, type: child.type });

      if (child.type === 'dir') {
        collectPaths(child, fullPath, depth + 1, results, opts);
      }
    });
  };

  const results = [];
  const opts = {
    name: namePattern,
    type: fileType,
    maxDepth: maxDepth ? parseInt(maxDepth) : null,
  };
  collectPaths(fs['/'], '', 0, results, opts);

  const command = `find . ${namePattern ? `-name "${namePattern}"` : ''} ${fileType ? `-type ${fileType}` : ''} ${maxDepth ? `-maxdepth ${maxDepth}` : ''}`.replace(/\s+/g, ' ').trim();

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded p-4">
      <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">find</div>

      {/* Query Builder */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm w-20">-name</span>
          <input
            type="text"
            value={namePattern}
            onChange={(e) => setNamePattern(e.target.value)}
            className="flex-1 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 font-mono text-sm outline-none"
            placeholder="*.cpp"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm w-20">-type</span>
          <select
            value={fileType}
            onChange={(e) => setFileType(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded px-2 py-1 text-sm"
          >
            <option value="">any</option>
            <option value="f">f (file)</option>
            <option value="d">d (directory)</option>
          </select>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-zinc-500 text-sm w-20">-maxdepth</span>
          <input
            type="number"
            value={maxDepth}
            onChange={(e) => setMaxDepth(e.target.value)}
            className="w-20 bg-zinc-900 border border-zinc-700 rounded px-2 py-1 font-mono text-sm outline-none"
            placeholder="∞"
            min="1"
          />
        </div>
      </div>

      {/* Live Command */}
      <div className="bg-zinc-900 rounded p-2 font-mono text-green-400 text-sm mb-3">
        {command}
      </div>

      {/* Results */}
      <div className="bg-zinc-900 rounded p-3 font-mono text-sm max-h-48 overflow-auto">
        {results.length === 0 ? (
          <div className="text-zinc-500">No matches</div>
        ) : (
          results.map((r, i) => (
            <div key={i} className={r.type === 'dir' ? 'text-blue-400' : 'text-zinc-300'}>
              .{r.path}{r.type === 'dir' ? '/' : ''}
            </div>
          ))
        )}
      </div>

      {/* Presets */}
      <div className="mt-3 flex flex-wrap gap-2">
        {[
          { name: '*.cpp', type: '', label: 'C++ files' },
          { name: '', type: 'd', label: 'All dirs' },
          { name: '*.txt', type: 'f', label: 'Text files' },
        ].map((preset, i) => (
          <button
            key={i}
            onClick={() => { setNamePattern(preset.name); setFileType(preset.type); }}
            className="px-2 py-0.5 text-xs bg-zinc-800 hover:bg-zinc-700 rounded"
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Reference */}
      <div className="mt-3 bg-zinc-800 rounded p-2 text-xs text-zinc-400">
        <span className="text-green-400">grep</span>: searches <strong>inside</strong> files (content)
        <br />
        <span className="text-green-400">find</span>: searches <strong>for</strong> files (names, types)
      </div>
    </div>
  );
}
