import { useGetHolidayCalendarsQuery } from "@entities/calendar/api/calendarApi";
import { Container, Stack } from "@mui/material";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo } from "react";

import { useAppDispatchV2 } from "@/app/hooks";
import * as MESSAGE_CODE from "@/errors";
import { setSnackbarError } from "@/shared/lib/store/snackbarSlice";

import { ShiftPlanFooter, ShiftPlanHeader, ShiftPlanTable } from "./components";
import { useAutoSave, useDayCellFocus, useShiftPlanData } from "./hooks";

export default function ShiftPlanManagement() {
  const dispatch = useAppDispatchV2();
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
      dispatch(setSnackbarError(MESSAGE_CODE.E00001));
    }
  }, [holidayCalendarsError, dispatch]);

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
      const monthCursor = dayjs().year(selectedYear).month(month - 1);
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
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack spacing={3}>
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
      </Stack>
    </Container>
  );
}
