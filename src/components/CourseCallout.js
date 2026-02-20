import { useState } from 'react';

export default function CourseCallout({ title, children, storageKey }) {
  const [dismissed, setDismissed] = useState(() => {
    if (storageKey && typeof window !== 'undefined') {
      return sessionStorage.getItem(`callout-${storageKey}`) === 'dismissed';
    }
    return false;
  });

  const handleDismiss = () => {
    setDismissed(true);
    if (storageKey && typeof window !== 'undefined') {
      sessionStorage.setItem(`callout-${storageKey}`, 'dismissed');
    }
  };

  if (dismissed) return null;

  return (
    <div className="bg-zinc-900 border border-zinc-700 p-4 mb-4 relative">
      <button
        onClick={handleDismiss}
        className="absolute top-2 right-2 text-zinc-500 hover:text-zinc-300 text-sm"
        title="Dismiss"
      >
        &times;
      </button>
      {title && (
        <div className="text-xs text-blue-400 uppercase tracking-wider mb-2 font-semibold">
          {title}
        </div>
      )}
      <div className="text-xs text-zinc-400 font-mono leading-relaxed whitespace-pre-line">
        {children}
      </div>
    </div>
  );
}
