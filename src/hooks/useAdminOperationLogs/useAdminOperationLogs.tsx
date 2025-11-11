import dayjs from "dayjs";
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
      // ensure newest-first order by timestamp
      const sorted = res.items.slice().sort((a, b) => {
        // Use timestamp when available, otherwise fall back to createdAt.
        const ta = dayjs(a.timestamp ?? a.createdAt).valueOf() || 0;
        const tb = dayjs(b.timestamp ?? b.createdAt).valueOf() || 0;
        return tb - ta;
      });
      setLogs(sorted);
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
      setLogs((prev) => {
        const merged = [...prev, ...res.items];
        // sort merged list newest-first; prefer timestamp, then createdAt
        return merged.slice().sort((a, b) => {
          const ta = dayjs(a.timestamp ?? a.createdAt).valueOf() || 0;
          const tb = dayjs(b.timestamp ?? b.createdAt).valueOf() || 0;
          return tb - ta;
        });
      });
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
