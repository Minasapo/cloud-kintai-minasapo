import { useGetHolidayCalendarsQuery } from "@entities/calendar/api/calendarApi";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo } from "react";

import * as MESSAGE_CODE from "@/errors";
import { useLocalNotification } from "@/hooks/useLocalNotification";
import { designTokenVar } from "@/shared/designSystem";

import { ShiftPlanFooter, ShiftPlanHeader, ShiftPlanTable } from "./components";
import { useAutoSave, useDayCellFocus, useShiftPlanData } from "./hooks";

const PAGE_PADDING_X_XS = designTokenVar("spacing.sm", "8px");
const PAGE_PADDING_X_MD = designTokenVar("spacing.xxl", "32px");
const PAGE_PADDING_Y = designTokenVar("spacing.xxl", "32px");
const PAGE_SECTION_GAP = designTokenVar("spacing.lg", "16px");

export default function ShiftPlanManagement() {
  const { notify } = useLocalNotification();
  const {
    selectedYear,
    currentRows,
    isDirty,
    isPending,
    isFetchingYear,
    isSaving,
    yearRecordIds,
    lastAutoSaveTime,
    handleYearChange,
    handleFieldChange,
    handleToggleEnabled,
    handleDailyCapacityChange,
    handleSaveAll,
    performSave,
  } = useShiftPlanData();
  const { registerCellRef, focusCell } = useDayCellFocus();
  const { data: holidayCalendars = [], error: holidayCalendarsError } =
    useGetHolidayCalendarsQuery();

  useEffect(() => {
    if (holidayCalendarsError) {
      console.error(holidayCalendarsError);
      void notify("エラー", {
        body: MESSAGE_CODE.E00001,
        mode: "await-interaction",
        priority: "high",
        tag: "holiday-calendar-error",
      });
    }
  }, [holidayCalendarsError, notify]);

  const holidayNameMap = useMemo(() => {
    if (!holidayCalendars.length) return new Map<string, string>();
    return new Map(
      holidayCalendars.map((calendar) => [
        dayjs(calendar.holidayDate).format("YYYY-MM-DD"),
        calendar.name,
      ]),
    );
  }, [holidayCalendars]);

  const handleTabNextDay = useCallback(
    (month: number, dayIndex: number) => {
      // 次の日のインデックスを計算
      const monthCursor = dayjs()
        .year(selectedYear)
        .month(month - 1);
      const daysInMonth = monthCursor.daysInMonth();

      let nextMonth = month;
      let nextDayIndex = dayIndex + 1;

      // 月を超える場合
      if (nextDayIndex >= daysInMonth) {
        nextMonth = month === 12 ? 1 : month + 1;
        nextDayIndex = 0;
      }

      // 次のセルへフォーカスを移す
      const nextCellId = `cell-${selectedYear}-${nextMonth}-${nextDayIndex}`;
      focusCell(nextCellId);
    },
    [selectedYear, focusCell],
  );

  const { isAutoSaving } = useAutoSave({
    isDirty,
    currentRows,
    selectedYear,
    yearRecordIds,
    performSave,
  });
  const isBusy = isPending || isFetchingYear || isSaving || isAutoSaving;

  return (
    <section
      className="flex flex-col flex-1 w-full box-border"
      style={{
        "--page-px-xs": PAGE_PADDING_X_XS,
        "--page-px-md": PAGE_PADDING_X_MD,
        paddingTop: PAGE_PADDING_Y,
        paddingBottom: PAGE_PADDING_Y,
        gap: PAGE_SECTION_GAP,
      } as React.CSSProperties}
    >
      <div className="px-[var(--page-px-xs)] md:px-[var(--page-px-md)] flex flex-col gap-[inherit]">
        <ShiftPlanHeader
          selectedYear={selectedYear}
          isBusy={isBusy}
          onYearChange={handleYearChange}
        />

        <ShiftPlanTable
          selectedYear={selectedYear}
          rows={currentRows}
          isBusy={isBusy}
          holidayNameMap={holidayNameMap}
          onFieldChange={handleFieldChange}
          onToggleEnabled={handleToggleEnabled}
          onDailyCapacityChange={handleDailyCapacityChange}
          onTabNextDay={handleTabNextDay}
          onRegisterCellRef={registerCellRef}
        />

        <ShiftPlanFooter
          isAutoSaving={isAutoSaving}
          lastAutoSaveTime={lastAutoSaveTime}
          isBusy={isBusy}
          onSaveAll={handleSaveAll}
        />
      </div>
    </section>
  );
}
