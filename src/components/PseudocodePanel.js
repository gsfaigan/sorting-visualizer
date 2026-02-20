import React from 'react';

export default function PseudocodePanel({ lines, activeLine, title }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded text-xs font-mono w-full">
      {title && (
        <div className="px-3 py-1 text-zinc-600 border-b border-zinc-800 text-[10px] tracking-widest uppercase">
          {title}
        </div>
      )}
      {lines.map((line, i) => (
        <div
          key={i}
          className={`px-3 py-[3px] transition-colors duration-100 ${
            i === activeLine
              ? 'bg-zinc-800 text-green-400'
              : 'text-zinc-600'
          }`}
          style={{ paddingLeft: `${12 + (line.indent ?? 0) * 12}px` }}
        >
          {line.text}
        </div>
      ))}
    </div>
  );
}
