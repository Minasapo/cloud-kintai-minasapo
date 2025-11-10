import { useCallback, useState } from "react";

import { OperationLog } from "@/API";

import fetchOperationLogs from "./fetchOperationLogs";

export default function useAdminOperationLogs(initialLimit = 30) {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [nextToken, setNextToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadInitial = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOperationLogs(null, initialLimit);
      setLogs(res.items);
      setNextToken(res.nextToken ?? null);
      return res.items;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [initialLimit]);

  const loadMore = useCallback(async () => {
    if (!nextToken) return [] as OperationLog[];
    setLoading(true);
    setError(null);
    try {
      const res = await fetchOperationLogs(nextToken, initialLimit);
      setLogs((prev) => [...prev, ...res.items]);
      setNextToken(res.nextToken ?? null);
      return res.items;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, [nextToken, initialLimit]);

  return {
    logs,
    loading,
    error,
    nextToken,
    loadInitial,
    loadMore,
  };
}
