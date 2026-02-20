import { useRef, useState } from 'react';

export function useAnimator(steps, speed) {
  const [stepIdx, setStepIdx] = useState(-1);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  function play(stepsOverride) {
    const s = stepsOverride ?? steps;
    if (!s || s.length === 0) return;
    setRunning(true);
    setStepIdx(0);
    let i = 0;
    intervalRef.current = setInterval(() => {
      if (i >= s.length) {
        clearInterval(intervalRef.current);
        setRunning(false);
        return;
      }
      setStepIdx(i);
      i++;
    }, speed);
  }

  function stop() {
    clearInterval(intervalRef.current);
    setRunning(false);
  }

  function stepForward(stepsOverride) {
    const s = stepsOverride ?? steps;
    setStepIdx(i => Math.min(i + 1, s.length - 1));
  }

  function stepBack() {
    setStepIdx(i => Math.max(i - 1, 0));
  }

  function reset() {
    clearInterval(intervalRef.current);
    setRunning(false);
    setStepIdx(-1);
  }

  return { stepIdx, running, play, stop, stepForward, stepBack, reset };
}
