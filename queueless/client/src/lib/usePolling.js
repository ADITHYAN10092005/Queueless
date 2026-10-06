import { useEffect, useRef, useState, useCallback } from 'react';

/**
 * Hook for polling an async function at regular intervals.
 * Automatically tracks reconnection / network error status.
 */
export function usePolling(pollingFn, intervalMs = 3000, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const savedFnRef = useRef(pollingFn);

  useEffect(() => {
    savedFnRef.current = pollingFn;
  }, [pollingFn]);

  const execute = useCallback(async (isInitial = false) => {
    try {
      if (isInitial) setLoading(true);
      const result = await savedFnRef.current();
      setData(result);
      setError(null);
      setIsReconnecting(false);
    } catch (err) {
      console.warn('Polling fetch error:', err.message);
      setError(err);
      // Mark as reconnecting if network or server issue occurs
      setIsReconnecting(true);
    } finally {
      if (isInitial) setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let timerId = null;

    const run = async (initial = false) => {
      if (!isMounted) return;
      await execute(initial);
      if (isMounted) {
        timerId = setTimeout(() => run(false), intervalMs);
      }
    };

    run(true);

    return () => {
      isMounted = false;
      if (timerId) clearTimeout(timerId);
    };
  }, [intervalMs, execute, ...dependencies]);

  return { data, setData, loading, error, isReconnecting, refetch: () => execute(false) };
}
