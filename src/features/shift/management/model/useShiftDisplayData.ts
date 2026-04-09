import { StaffType } from "@entities/staff/model/useStaffs/useStaffs";
import { ShiftPlanMonthSetting } from "@shared/api/graphql/types";
import { Dayjs } from "dayjs";
import { useMemo, useState } from "react";

import { ShiftState } from "../lib/generateMockShifts";
import {
  calculateDailyCounts,
  calculateGroupDailyCounts,
  calculatePlannedDailyCounts,
} from "../lib/shiftAggregation";
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
  const scenario = "actual";

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

  const displayShifts = useMemo(() => {
    const next = new Map<string, Record<string, ShiftState>>();
    shiftStaffs.forEach((staff) => {
      const actual = shiftRequestAssignments.get(staff.id);
      const mock = mockShifts.get(staff.id);

      if (scenario === "actual" && actual) {
        next.set(staff.id, actual);
      } else if (scenario !== "actual" && mock) {
        next.set(staff.id, mock);
      } else {
        next.set(staff.id, {});
      }
    });
    return next;
  }, [mockShifts, scenario, shiftRequestAssignments, shiftStaffs]);

  const staffIds = useMemo(() => shiftStaffs.map((s) => s.id), [shiftStaffs]);

  const dailyCounts = useMemo(
    () => calculateDailyCounts(days, staffIds, displayShifts),
    [days, staffIds, displayShifts]
  );

  const groupDailyCounts = useMemo(
    () => calculateGroupDailyCounts(days, groupedShiftStaffs, displayShifts),
    [days, groupedShiftStaffs, displayShifts]
  );

  const plannedDailyCounts = useMemo(
    () => calculatePlannedDailyCounts(days, monthStart, shiftPlanPlans),
    [days, monthStart, shiftPlanPlans]
  );

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
