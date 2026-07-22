import { AuthContext } from "@app/providers/auth/AuthContext";
import { useCalendars } from "@entities/calendar/model/useCalendars";
import useCognitoUser from "@entities/staff/model/useCognitoUser";
import useShiftPlanYear from "@features/shift/management/model/useShiftPlanYear";
import { useAppNotification } from "@shared/lib/useAppNotification";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import { useContext, useMemo, useRef, useState } from "react";

import type { ShiftState } from "../lib/generateMockShifts";
import { useHolidayCalendarErrorNotification } from "../model/useHolidayCalendarErrorNotification";
import { useShiftAutoSaveState } from "../model/useShiftAutoSaveState";
import { useShiftBulkEditActions } from "../model/useShiftBulkEditActions";
import { useShiftDisplayData } from "../model/useShiftDisplayData";
import useShiftManagementDialogs from "../model/useShiftManagementDialogs";
import useShiftSelection from "../model/useShiftSelection";
import { useShiftStaffGroups } from "../model/useShiftStaffGroups";
import { ShiftManagementContent } from "./components/ShiftManagementContent";
import { ShiftManagementDialogs } from "./components/ShiftManagementDialogs";
import { ShiftManagementHeader } from "./components/ShiftManagementHeader";

// ShiftManagement: シフト管理テーブル。左固定列を前面に出し、各日ごとの出勤人数を集計して表示する。
export default function ShiftManagementBoard() {
  const { notify } = useAppNotification();
  const { cognitoUser } = useCognitoUser();
  const { authStatus } = useContext(AuthContext);
  const isAuthenticated = authStatus === "authenticated";
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    shiftStaffs,
    loading,
    error,
    groupedShiftStaffs,
    displayedStaffOrder,
    staffIdToIndex,
  } = useShiftStaffGroups();

  const currentMonth = useMemo(() => dayjs().startOf("month"), []);
  const monthStart = useMemo(
    () => currentMonth.startOf("month"),
    [currentMonth],
  );
  const days = useMemo(
    () =>
      Array.from({ length: monthStart.daysInMonth() }).map((_, i) =>
        monthStart.add(i, "day"),
      ),
    [monthStart],
  );

  const dayKeyList = useMemo(
    () => days.map((day) => day.format("YYYY-MM-DD")),
    [days],
  );

  const {
    selectedStaffIds,
    selectedDayKeys,
    hasBulkSelection,
    selectedCellCount,
    handleStaffCheckboxChange,
    handleDayCheckboxChange,
  } = useShiftSelection({
    displayedStaffOrder,
    dayKeyList,
    staffIdToIndex,
  });

  const {
    holidayCalendars,
    companyHolidayCalendars,
    error: calendarsError,
  } = useCalendars({ skip: !isAuthenticated });

  useHolidayCalendarErrorNotification({ calendarsError, notify });

  const holidaySet = useMemo(
    () => new Set(holidayCalendars.map((h) => h.holidayDate)),
    [holidayCalendars],
  );
  const companyHolidaySet = useMemo(
    () => new Set(companyHolidayCalendars.map((h) => h.holidayDate)),
    [companyHolidayCalendars],
  );

  const holidayNameMap = useMemo(
    () => new Map(holidayCalendars.map((h) => [h.holidayDate, h.name])),
    [holidayCalendars],
  );
  const companyHolidayNameMap = useMemo(
    () => new Map(companyHolidayCalendars.map((h) => [h.holidayDate, h.name])),
    [companyHolidayCalendars],
  );

  const { plans: shiftPlanPlans } = useShiftPlanYear(monthStart.year(), {
    enabled: isAuthenticated,
  });

  const {
    scenario,
    setMockShifts,
    shiftRequestsLoading,
    persistShiftRequestChanges,
    displayShifts,
    dailyCounts,
    plannedDailyCounts,
  } = useShiftDisplayData({
    shiftStaffs,
    groupedShiftStaffs,
    monthStart,
    days,
    cognitoUserId: cognitoUser?.id,
    isAuthenticated,
    shiftPlanPlans,
  });

  const pendingChangesRef = useRef<Map<string, Map<string, ShiftState>>>(
    new Map(),
  );
  const {
    isSaving: isAutoSaving,
    isPending: isAutoSavePending,
    lastSavedAt,
    lastChangedAt,
    applyShiftState,
  } = useShiftAutoSaveState({
    scenario,
    isAuthenticated,
    pendingChangesRef,
    persistShiftRequestChanges,
    notify,
    setMockShifts,
  });

  const {
    editingCell,
    editingState,
    isEditDialogOpen,
    isSavingSingleEdit,
    openShiftEditDialog,
    closeShiftEditDialog,
    handleEditingStateChange,
    saveShiftEdit,
    isBulkDialogOpen,
    openBulkEditDialog,
    closeBulkEditDialog,
    bulkEditState,
    handleBulkEditStateChange,
    isSavingBulkEdit,
    applyBulkEdit,
  } = useShiftManagementDialogs(applyShiftState);

  const { handleOpenBulkEditDialog, handleApplyBulkEdit } =
    useShiftBulkEditActions({
      hasBulkSelection,
      openBulkEditDialog,
      applyBulkEdit,
      selectedStaffIds,
      selectedDayKeys,
    });

  if (!isAuthenticated) {
    return (
      <div className="py-6 px-2 md:px-8 flex justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="py-6 px-2 md:px-8">
      <ShiftManagementHeader
        monthStart={monthStart}
        scenario={scenario}
        isAutoSaving={isAutoSaving}
        isAutoSavePending={isAutoSavePending}
        lastChangedAt={lastChangedAt}
        lastSavedAt={lastSavedAt}
        hasBulkSelection={hasBulkSelection}
        selectedCellCount={selectedCellCount}
        onOpenBulkEditDialog={handleOpenBulkEditDialog}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <ShiftManagementContent
        days={days}
        groupedShiftStaffs={groupedShiftStaffs}
        loading={loading}
        shiftRequestsLoading={shiftRequestsLoading}
        error={error}
        calendarsError={calendarsError}
        holidaySet={holidaySet}
        companyHolidaySet={companyHolidaySet}
        holidayNameMap={holidayNameMap}
        companyHolidayNameMap={companyHolidayNameMap}
        selectedStaffIds={selectedStaffIds}
        selectedDayKeys={selectedDayKeys}
        onStaffCheckboxChange={handleStaffCheckboxChange}
        onDayCheckboxChange={handleDayCheckboxChange}
        displayShifts={displayShifts}
        dailyCounts={dailyCounts}
        plannedDailyCounts={plannedDailyCounts}
        onOpenShiftEditDialog={openShiftEditDialog}
      />

      <ShiftManagementDialogs
        isEditDialogOpen={isEditDialogOpen}
        editingCell={editingCell}
        editingState={editingState}
        isSavingSingleEdit={isSavingSingleEdit}
        closeShiftEditDialog={closeShiftEditDialog}
        handleEditingStateChange={handleEditingStateChange}
        saveShiftEdit={saveShiftEdit}
        isBulkDialogOpen={isBulkDialogOpen}
        selectedStaffCount={selectedStaffIds.size}
        selectedDayCount={selectedDayKeys.size}
        selectedCellCount={selectedCellCount}
        bulkEditState={bulkEditState}
        isSavingBulkEdit={isSavingBulkEdit}
        hasBulkSelection={hasBulkSelection}
        closeBulkEditDialog={closeBulkEditDialog}
        handleBulkEditStateChange={handleBulkEditStateChange}
        handleApplyBulkEdit={handleApplyBulkEdit}
        isSettingsOpen={isSettingsOpen}
        onCloseSettings={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
