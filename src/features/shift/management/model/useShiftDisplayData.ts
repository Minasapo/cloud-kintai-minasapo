import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { ShiftPlanMonthSetting } from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";
import { useEffect, useMemo, useState } from "react";

import generateMockShifts, { ShiftState } from "../lib/generateMockShifts";
import useShiftRequestAssignments from "./useShiftRequestAssignments";

type ShiftGroup = {
  groupName: string;
  members: StaffType[];
};

type UseShiftDisplayDataParams = {
  shiftStaffs: StaffType[];
  groupedShiftStaffs: ShiftGroup[];
  monthStart: Dayjs;
  days: Dayjs[];
  cognitoUserId: string | undefined;
  isAuthenticated: boolean;
  shiftPlanPlans: ShiftPlanMonthSetting[] | null;
};

type UseShiftDisplayDataResult = {
  scenario: string;
  mockShifts: Map<string, Record<string, ShiftState>>;
  setMockShifts: React.Dispatch<
    React.SetStateAction<Map<string, Record<string, ShiftState>>>
  >;
  shiftRequestAssignments: ReturnType<
    typeof useShiftRequestAssignments
  >["shiftRequestAssignments"];
  shiftRequestHistoryMeta: ReturnType<
    typeof useShiftRequestAssignments
  >["shiftRequestHistoryMeta"];
  shiftRequestsLoading: boolean;
  shiftRequestsError: ReturnType<
    typeof useShiftRequestAssignments
  >["shiftRequestsError"];
  persistShiftRequestChanges: ReturnType<
    typeof useShiftRequestAssignments
  >["persistShiftRequestChanges"];
  displayShifts: Map<string, Record<string, ShiftState>>;
  dailyCounts: Map<string, number>;
  groupDailyCounts: Map<string, Map<string, number>>;
  plannedDailyCounts: Map<string, number | null>;
};

export function useShiftDisplayData({
  shiftStaffs,
  groupedShiftStaffs,
  monthStart,
  days,
  cognitoUserId,
  isAuthenticated,
  shiftPlanPlans,
}: UseShiftDisplayDataParams): UseShiftDisplayDataResult {
  // シミュレーションシナリオを選べるようにする（デフォルトは実際の希望シフト）
  const [scenario] = useState<string>("actual");

  // mockShifts を state 化し、scenario/shiftStaffs/days に応じて生成する
  const [mockShifts, setMockShifts] = useState<
    Map<string, Record<string, ShiftState>>
  >(new Map());

  const {
    shiftRequestAssignments,
    shiftRequestHistoryMeta,
    shiftRequestsLoading,
    shiftRequestsError,
    persistShiftRequestChanges,
  } = useShiftRequestAssignments({
    shiftStaffs,
    monthStart,
    cognitoUserId,
    enabled: isAuthenticated,
  });

  useEffect(() => {
    // 実績表示モードではモック生成は不要
    if (scenario === "actual") {
      setMockShifts(new Map());
      return;
    }
    // shiftStaffs が未ロードのときは空のマップを設定
    if (!shiftStaffs || shiftStaffs.length === 0) {
      setMockShifts(new Map());
      return;
    }
    const map = generateMockShifts(
      shiftStaffs.map((s) => ({ id: s.id })),
      days,
      scenario,
    );
    setMockShifts(map);
  }, [shiftStaffs, days, scenario]);

  const displayShifts = useMemo(() => {
    const next = new Map<string, Record<string, ShiftState>>();
    shiftStaffs.forEach((staff) => {
      if (scenario === "actual" && shiftRequestAssignments.has(staff.id)) {
        next.set(staff.id, shiftRequestAssignments.get(staff.id)!);
      } else if (scenario !== "actual" && mockShifts.has(staff.id)) {
        next.set(staff.id, mockShifts.get(staff.id)!);
      } else {
        next.set(staff.id, {});
      }
    });
    return next;
  }, [mockShifts, scenario, shiftRequestAssignments, shiftStaffs]);

  const dailyCounts = useMemo(() => {
    const m = new Map<string, number>();
    days.forEach((d) => {
      const key = d.format("YYYY-MM-DD");
      let cnt = 0;
      shiftStaffs.forEach((s) => {
        if (displayShifts.get(s.id)?.[key] === "work") cnt += 1;
      });
      m.set(key, cnt);
    });
    return m;
  }, [days, shiftStaffs, displayShifts]);

  const groupDailyCounts = useMemo(() => {
    const result = new Map<string, Map<string, number>>();
    groupedShiftStaffs.forEach(({ groupName, members }) => {
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
  }, [displayShifts, groupedShiftStaffs, days]);

  const plannedDailyCounts = useMemo(() => {
    const targetMonth = monthStart.month() + 1;
    const map = new Map<string, number | null>();
    days.forEach((d) => {
      map.set(d.format("YYYY-MM-DD"), null);
    });
    if (!shiftPlanPlans) {
      return map;
    }
    const monthPlan =
      shiftPlanPlans.find(
        (plan) => typeof plan.month === "number" && plan.month === targetMonth,
      ) ?? null;
    if (!monthPlan) {
      return map;
    }
    const capacities = monthPlan.dailyCapacities ?? [];
    days.forEach((d, index) => {
      const value = capacities[index];
      map.set(
        d.format("YYYY-MM-DD"),
        typeof value === "number" && !Number.isNaN(value) ? value : null,
      );
    });
    return map;
  }, [days, monthStart, shiftPlanPlans]);

  return {
    scenario,
    mockShifts,
    setMockShifts,
    shiftRequestAssignments,
    shiftRequestHistoryMeta,
    shiftRequestsLoading,
    shiftRequestsError,
    persistShiftRequestChanges,
    displayShifts,
    dailyCounts,
    groupDailyCounts,
    plannedDailyCounts,
  };
}
