import dayjs from "dayjs";
import { useCallback, useMemo } from "react";

import type { ShiftState } from "../types/collaborative.types";

function normalizePlannedCapacity(raw: number | undefined): number {
  return raw === undefined || Number.isNaN(raw) ? 0 : raw;
}

export function useShiftMetrics<T extends { state: ShiftState }>(
  days: dayjs.Dayjs[],
  staffIds: string[],
  shiftDataMap: Map<string, Map<string, T>>,
  shiftPlanCapacities: number[] = []
) {
  const dailyCountsByKey = useMemo(() => {
    const counts = new Map<
      string,
      { work: number; fixedOff: number; requestedOff: number }
    >();
    days.forEach((day) => {
      const dayKey = day.format("DD");
      counts.set(dayKey, { work: 0, fixedOff: 0, requestedOff: 0 });
    });

    staffIds.forEach((staffId) => {
      const staffMap = shiftDataMap.get(staffId);
      if (!staffMap) return;
      days.forEach((day) => {
        const dayKey = day.format("DD");
        const cell = staffMap.get(dayKey);
        if (!cell) return;
        const count = counts.get(dayKey);
        if (!count) return;
        if (cell.state === "work") count.work += 1;
        else if (cell.state === "fixedOff") count.fixedOff += 1;
        else if (cell.state === "requestedOff") count.requestedOff += 1;
      });
    });

    return counts;
  }, [days, staffIds, shiftDataMap]);

  const calculateDailyCount = useCallback(
    (
      dayKey: string
    ): { work: number; fixedOff: number; requestedOff: number; plannedCapacity: number } => {
      const counts = dailyCountsByKey.get(dayKey) ?? { work: 0, fixedOff: 0, requestedOff: 0 };
      const dayIndex = parseInt(dayKey, 10) - 1;
      const plannedCapacity = normalizePlannedCapacity(shiftPlanCapacities[dayIndex]);
      return { ...counts, plannedCapacity };
    },
    [dailyCountsByKey, shiftPlanCapacities]
  );

  const progress = useMemo(() => {
    let confirmedCount = 0;
    let needsAdjustmentCount = 0;
    let emptyCount = 0;

    days.forEach((day) => {
      const dayKey = day.format("DD");
      const count = dailyCountsByKey.get(dayKey);
      const workCount = count?.work ?? 0;
      const plannedCapacity = normalizePlannedCapacity(shiftPlanCapacities[day.date() - 1]);

      if (workCount === plannedCapacity) {
        confirmedCount++;
      } else if (workCount === 0) {
        emptyCount++;
      } else {
        needsAdjustmentCount++;
      }
    });

    const totalDays = days.length;
    const confirmedPercent = totalDays > 0 ? (confirmedCount / totalDays) * 100 : 0;
    const adjustmentPercent = totalDays > 0 ? (needsAdjustmentCount / totalDays) * 100 : 0;

    return {
      confirmedCount,
      confirmedPercent,
      needsAdjustmentCount,
      adjustmentPercent,
      emptyCount,
    };
  }, [days, dailyCountsByKey, shiftPlanCapacities]);

  return { calculateDailyCount, progress };
}
