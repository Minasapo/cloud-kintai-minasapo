import { ShiftPlanMonthSetting } from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";

import { ShiftState } from "./generateMockShifts";

/**
 * 全体の出勤人数を集計
 */
export function calculateDailyCounts(
  days: Dayjs[],
  staffIds: string[],
  displayShifts: Map<string, Record<string, ShiftState>>
): Map<string, number> {
  const m = new Map<string, number>();
  days.forEach((d) => {
    const key = d.format("YYYY-MM-DD");
    let cnt = 0;
    staffIds.forEach((id) => {
      if (displayShifts.get(id)?.[key] === "work") cnt += 1;
    });
    m.set(key, cnt);
  });
  return m;
}

/**
 * グループごとの出勤人数を集計
 */
export function calculateGroupDailyCounts(
  days: Dayjs[],
  groups: { groupName: string; members: { id: string }[] }[],
  displayShifts: Map<string, Record<string, ShiftState>>
): Map<string, Map<string, number>> {
  const result = new Map<string, Map<string, number>>();
  groups.forEach(({ groupName, members }) => {
    const groupCounts = new Map<string, number>();
    days.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      let cnt = 0;
      members.forEach((member) => {
        if (displayShifts.get(member.id)?.[key] === "work") cnt += 1;
      });
      groupCounts.set(key, cnt);
    });
    result.set(groupName, groupCounts);
  });
  return result;
}

/**
 * 計画（充足数）の集計
 */
export function calculatePlannedDailyCounts(
  days: Dayjs[],
  monthStart: Dayjs,
  shiftPlanPlans: ShiftPlanMonthSetting[] | null
): Map<string, number | null> {
  const targetMonth = monthStart.month() + 1;
  const map = new Map<string, number | null>();
  days.forEach((d) => {
    map.set(d.format("YYYY-MM-DD"), null);
  });

  if (!shiftPlanPlans) {
    return map;
  }

  const monthPlan = shiftPlanPlans.find(
    (plan) => typeof plan.month === "number" && plan.month === targetMonth
  );

  if (!monthPlan) {
    return map;
  }

  const capacities = monthPlan.dailyCapacities ?? [];
  days.forEach((d, index) => {
    const value = capacities[index];
    map.set(
      d.format("YYYY-MM-DD"),
      typeof value === "number" && !Number.isNaN(value) ? value : null
    );
  });

  return map;
}
