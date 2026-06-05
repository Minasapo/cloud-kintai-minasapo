import { formatMonthQueryValue } from "@shared/lib/monthQuery";
import { Dayjs } from "dayjs";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";

import {
  getCurrentMonthFromQuery,
  MONTH_QUERY_KEY,
} from "./attendanceListUtils";

export function useMonthQuery() {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentMonth = useMemo(
    () => getCurrentMonthFromQuery(searchParams.get(MONTH_QUERY_KEY)),
    [searchParams],
  );
  const handleMonthChange = useCallback(
    (nextMonth: Dayjs) => {
      const normalizedMonth = nextMonth.startOf("month");
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set(MONTH_QUERY_KEY, formatMonthQueryValue(normalizedMonth));
      setSearchParams(nextParams, { replace: true });
    },
    [searchParams, setSearchParams],
  );
  return { currentMonth, handleMonthChange };
}
