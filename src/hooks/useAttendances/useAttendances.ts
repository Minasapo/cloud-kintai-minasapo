import { useCallback, useState } from "react";

import { Attendance } from "@/API";
import { useLazyListRecentAttendancesQuery } from "@/lib/api/attendanceApi";

export default function useAttendances() {
  const [attendances, setAttendances] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const [triggerListAttendances] = useLazyListRecentAttendancesQuery();

  const getAttendances = useCallback(
    async (staffId: string) => {
      setLoading(true);
      setAttendances([]);
      setError(null);

      try {
        const result = await triggerListAttendances({ staffId }).unwrap();
        setAttendances(result);
        return result;
      } catch (err) {
        const errorInstance =
          err instanceof Error ? err : new Error("Failed to fetch attendances");
        setError(errorInstance);
        throw errorInstance;
      } finally {
        setLoading(false);
      }
    },
    [triggerListAttendances]
  );

  return {
    attendances,
    getAttendances,
    loading,
    error,
  };
}
