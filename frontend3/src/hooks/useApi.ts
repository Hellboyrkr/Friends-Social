import { useCallback, useState } from 'react';

export function useApi<T extends (...args: any[]) => Promise<any>>(fn: T) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const call = useCallback(async (...args: Parameters<T>): Promise<Awaited<ReturnType<T>> | undefined> => {
    setLoading(true); setError(undefined);
    try {
      const res = await fn(...args);
      return res;
    } catch (e: any) {
      setError(e?.message || 'Request failed');
      throw e;
    } finally {
      setLoading(false);
    }
  }, [fn]);

  return { call, loading, error };
}
