import { useRef, useCallback } from 'react';

export default function useDebouncedCallback<T extends (...args: any[]) => void>(fn: T, delay = 300) {
  const timer = useRef<number | undefined>(undefined);

  return useCallback((...args: Parameters<T>) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => fn(...args), delay);
  }, [fn, delay]);
}
