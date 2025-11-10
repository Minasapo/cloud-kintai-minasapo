import { useCallback, useState } from "react";

import { CreateOperationLogInput, OperationLog } from "@/API";

import createOperationLogData from "./createOperationLogData";
import fetchOperationLogsByStaffId from "./fetchOperationLogsByStaffId";

export default function useOperationLog() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchByStaffId = useCallback(
    async (staffId: string, limit = 50) => {
      setLoading(true);
      setError(null);
      try {
        const items = await fetchOperationLogsByStaffId(staffId, limit);
        setLogs(items);
        return items;
      } catch (err) {
        setError(err instanceof Error ? err : new Error(String(err)));
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const create = useCallback(async (input: CreateOperationLogInput) => {
    setLoading(true);
    setError(null);
    try {
      const created = await createOperationLogData(input);
      setLogs((prev) => (prev ? [created, ...prev] : [created]));
      return created;
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    logs,
    loading,
    error,
    fetchByStaffId,
    create,
  };
}
