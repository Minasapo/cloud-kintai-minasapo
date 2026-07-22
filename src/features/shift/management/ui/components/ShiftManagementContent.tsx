import type { Dayjs } from "dayjs";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

import type { ShiftState } from "../../lib/generateMockShifts";
import type { useShiftStaffGroups } from "../../model/useShiftStaffGroups";
import ShiftManagementLegend from "./ShiftManagementLegend";
import { ShiftManagementTable } from "./ShiftManagementTable";

type GroupedShiftStaff = ReturnType<
  typeof useShiftStaffGroups
>["groupedShiftStaffs"];

type Props = {
  days: Dayjs[];
  groupedShiftStaffs: GroupedShiftStaff;
  loading: boolean;
  shiftRequestsLoading: boolean;
  error: unknown;
  calendarsError: unknown;
  holidaySet: Set<string>;
  companyHolidaySet: Set<string>;
  holidayNameMap: Map<string, string>;
  companyHolidayNameMap: Map<string, string>;
  selectedStaffIds: Set<string>;
  selectedDayKeys: Set<string>;
  onStaffCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    staffId: string,
  ) => void;
  onDayCheckboxChange: (
    event: React.ChangeEvent<HTMLInputElement>,
    dayKey: string,
  ) => void;
  displayShifts: Map<string, Record<string, ShiftState>>;
  dailyCounts: Map<string, number>;
  plannedDailyCounts: Map<string, number | null>;
  onOpenShiftEditDialog: (
    target: { staffId: string; staffName: string; dateKey: string },
    currentState: ShiftState,
  ) => void;
};

export function ShiftManagementContent({
  days,
  groupedShiftStaffs,
  loading,
  shiftRequestsLoading,
  error,
  calendarsError,
  holidaySet,
  companyHolidaySet,
  holidayNameMap,
  companyHolidayNameMap,
  selectedStaffIds,
  selectedDayKeys,
  onStaffCheckboxChange,
  onDayCheckboxChange,
  displayShifts,
  dailyCounts,
  plannedDailyCounts,
  onOpenShiftEditDialog,
}: Props) {
  const tableGroups = useMemo(
    () =>
      groupedShiftStaffs.map((group) => ({
        groupName: group.groupName,
        staffs: group.members.map((staff) => ({
          id: staff.id,
          name: `${staff.familyName}${staff.givenName}`,
        })),
      })),
    [groupedShiftStaffs],
  );

  return (
    <>
      {(loading || shiftRequestsLoading) && (
        <div className="flex justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
        </div>
      )}

      {error && (
        <div
          className="mb-4 rounded bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          スタッフデータの取得に失敗しました
        </div>
      )}

      {Boolean(calendarsError) && (
        <div
          className="mb-4 rounded bg-red-50 p-4 text-sm text-red-800"
          role="alert"
        >
          カレンダー情報の取得に失敗しました
        </div>
      )}

      {!loading && !shiftRequestsLoading && (
        <ShiftManagementTable
          days={days}
          groupedShiftStaffs={tableGroups}
          holidaySet={holidaySet}
          companyHolidaySet={companyHolidaySet}
          holidayNameMap={holidayNameMap}
          companyHolidayNameMap={companyHolidayNameMap}
          selectedStaffIds={selectedStaffIds}
          selectedDayKeys={selectedDayKeys}
          onStaffCheckboxChange={onStaffCheckboxChange}
          onDayCheckboxChange={onDayCheckboxChange}
          displayShifts={displayShifts}
          dailyCounts={dailyCounts}
          plannedDailyCounts={plannedDailyCounts}
          onOpenShiftEditDialog={onOpenShiftEditDialog}
        />
      )}

      <div className="mt-6">
        <ShiftManagementLegend />
      </div>
    </>
  );
}
