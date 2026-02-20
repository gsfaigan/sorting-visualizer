// Call Stack Panel for recursive algorithm visualization

export default function CallStackPanel({ frames = [] }) {
  const displayFrames = [...frames].reverse().slice(0, 12);

  return (
    <div className="w-48 bg-zinc-950 border-l border-zinc-800 font-mono text-xs flex flex-col h-full">
      <div className="px-3 py-2 text-zinc-500 border-b border-zinc-800 text-[10px] tracking-widest uppercase shrink-0">
        Call Stack
      </div>
      <div className="flex-1 overflow-y-auto">
        {displayFrames.length === 0 ? (
          <div className="px-3 py-2 text-zinc-600 italic">Empty</div>
        ) : (
          displayFrames.map((frame, i) => {
            const isTop = i === 0;
            const isReturning = frame.returning;

            let bgClass = '';
            let textClass = 'text-zinc-600';

            if (isTop && !isReturning) {
              bgClass = 'bg-zinc-800';
              textClass = 'text-green-400';
            } else if (isReturning) {
              bgClass = 'bg-zinc-900';
              textClass = 'text-yellow-400';
            }

            return (
              <div
                key={frame.id || i}
                className={`px-3 py-[4px] border-b border-zinc-900 ${bgClass} ${textClass} transition-all`}
              >
                <span className="text-zinc-500">{frame.func}</span>
                <span>(</span>
                <span className={isTop ? 'text-blue-400' : 'text-zinc-500'}>
                  {frame.args}
                </span>
                <span>)</span>
                {isReturning && (
                  <span className="text-yellow-400 ml-1 animate-pulse">
                    → {frame.returnVal}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
      {frames.length > 12 && (
        <div className="px-3 py-1 text-zinc-600 text-[10px] border-t border-zinc-800 shrink-0">
          +{frames.length - 12} more...
        </div>
      )}
    </div>
  );
}
