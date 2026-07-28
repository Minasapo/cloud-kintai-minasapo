import { AuthContext } from "@app/providers/auth/AuthContext";
import { useCalendars } from "@entities/calendar/model/useCalendars";
import useCognitoUser from "@entities/staff/model/useCognitoUser";
import useShiftPlanYear from "@features/shift/management/model/useShiftPlanYear";
import { createLogger } from "@shared/lib/logger";
import { useAppNotification } from "@shared/lib/useAppNotification";
import { useAutoSave } from "@shared/lib/useAutoSave";
import dayjs from "dayjs";
import { Loader2 } from "lucide-react";
import React, { useContext, useMemo, useState } from "react";

import * as MESSAGE_CODE from "@/errors";
import AdminShiftSettingsDialog from "@/features/admin-config-shift/AdminShiftSettingsDialog";

import { ShiftState } from "../lib/generateMockShifts";
import { useShiftDisplayData } from "../model/useShiftDisplayData";
import useShiftManagementDialogs from "../model/useShiftManagementDialogs";
import useShiftSelection from "../model/useShiftSelection";
import { useShiftStaffGroups } from "../model/useShiftStaffGroups";
import ShiftBulkEditDialog from "./components/ShiftBulkEditDialog";
import ShiftEditDialog from "./components/ShiftEditDialog";
import { ShiftManagementHeader } from "./components/ShiftManagementHeader";
import ShiftManagementLegend from "./components/ShiftManagementLegend";
import { ShiftManagementTable } from "./components/ShiftManagementTable";

const logger = createLogger("ShiftManagementBoard");

function useShiftAutoSaveState({
  scenario,
  isAuthenticated,
  pendingChangesRef,
  persistShiftRequestChanges,
  notify,
  setMockShifts,
}: {
  scenario: string;
  isAuthenticated: boolean;
  pendingChangesRef: React.MutableRefObject<
    Map<string, Map<string, ShiftState>>
  >;
  persistShiftRequestChanges: (
    staffId: string,
    dayKeys: string[],
    nextState: ShiftState,
  ) => Promise<void>;
  notify: ReturnType<typeof useAppNotification>["notify"];
  setMockShifts: React.Dispatch<
    React.SetStateAction<Map<string, Record<string, ShiftState>>>
  >;
}) {
  const [autoSaveCounter, setAutoSaveCounter] = React.useState(0);

  const recordShiftChange = React.useCallback(
    (staffId: string, dayKey: string, state: ShiftState) => {
      if (scenario !== "actual") return;

      if (!pendingChangesRef.current.has(staffId)) {
        pendingChangesRef.current.set(staffId, new Map());
      }
      pendingChangesRef.current.get(staffId)!.set(dayKey, state);
      setAutoSaveCounter((prev) => prev + 1);
    },
    [pendingChangesRef, scenario],
  );

  const applyShiftState = React.useCallback(
    async (staffIds: string[], dayKeys: string[], nextState: ShiftState) => {
      if (!staffIds.length || !dayKeys.length) return;

      if (scenario === "actual") {
        staffIds.forEach((staffId) => {
          dayKeys.forEach((dayKey) => {
            recordShiftChange(staffId, dayKey, nextState);
          });
        });
        return;
      }

      setMockShifts((prev) => {
        const next = new Map(prev);
        staffIds.forEach((staffId) => {
          const per = { ...(next.get(staffId) || {}) };
          dayKeys.forEach((key) => {
            per[key] = nextState;
          });
          next.set(staffId, per);
        });
        return next;
      });
    },
    [recordShiftChange, scenario, setMockShifts],
  );

  const { isSaving, isPending, lastSavedAt, lastChangedAt } = useAutoSave({
    saveFn: async () => {
      if (scenario !== "actual") return;

      const changes = pendingChangesRef.current;
      if (changes.size === 0) return;

      const changesToSave = new Map(changes);
      pendingChangesRef.current = new Map();

      const promises: Promise<void>[] = [];
      changesToSave.forEach((dayChanges, staffId) => {
        dayChanges.forEach((state, dayKey) => {
          promises.push(persistShiftRequestChanges(staffId, [dayKey], state));
        });
      });

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    },
    data: autoSaveCounter,
    enabled: scenario === "actual" && isAuthenticated,
    delay: 2000,
    onSaveSuccess: () => {
      notify({
        title: "シフトを自動保存しました",
        tone: "success",
        dedupeKey: "shift-autosave-success",
      });
    },
    onSaveError: (error) => {
      logger.error("Auto-save error:", error);
      notify({
        title: "エラー",
        description: "シフトの自動保存に失敗しました",
        tone: "error",
        dedupeKey: "shift-autosave-error",
      });
    },
  });

  return {
    applyShiftState,
    isSaving,
    isPending,
    lastSavedAt,
    lastChangedAt,
  };
}

function useHolidayCalendarErrorNotification({
  calendarsError,
  notify,
}: {
  calendarsError: unknown;
  notify: ReturnType<typeof useAppNotification>["notify"];
}) {
  React.useEffect(() => {
    if (calendarsError) {
      logger.error(calendarsError);
      notify({
        title: "エラー",
        description: MESSAGE_CODE.E00001,
        tone: "error",
        dedupeKey: "holiday-load-error",
      });
    }
  }, [calendarsError, notify]);
}

function useShiftBulkEditActions({
  hasBulkSelection,
  openBulkEditDialog,
  applyBulkEdit,
  selectedStaffIds,
  selectedDayKeys,
}: {
  hasBulkSelection: boolean;
  openBulkEditDialog: () => void;
  applyBulkEdit: (staffIds: string[], dayKeys: string[]) => Promise<void>;
  selectedStaffIds: Set<string>;
  selectedDayKeys: Set<string>;
}) {
  const handleOpenBulkEditDialog = React.useCallback(() => {
    if (!hasBulkSelection) return;
    openBulkEditDialog();
  }, [hasBulkSelection, openBulkEditDialog]);

  const handleApplyBulkEdit = React.useCallback(() => {
    if (!hasBulkSelection) return;
    const staffIds = Array.from(selectedStaffIds);
    const selectedDayKeyList = Array.from(selectedDayKeys);
    void applyBulkEdit(staffIds, selectedDayKeyList);
  }, [applyBulkEdit, hasBulkSelection, selectedDayKeys, selectedStaffIds]);

  return { handleOpenBulkEditDialog, handleApplyBulkEdit };
}

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

  const pendingChangesRef = React.useRef<Map<string, Map<string, ShiftState>>>(
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
          groupedShiftStaffs={groupedShiftStaffs.map((group) => ({
            groupName: group.groupName,
            staffs: group.members.map((staff) => ({
              id: staff.id,
              name: `${staff.familyName}${staff.givenName}`,
            })),
          }))}
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
      )}

      <div className="mt-6">
        <ShiftManagementLegend />
      </div>

      {/* ダイアログ類 */}
      <ShiftEditDialog
        open={isEditDialogOpen}
        editingCell={editingCell}
        editingState={editingState}
        isSaving={isSavingSingleEdit}
        onClose={closeShiftEditDialog}
        onStateChange={handleEditingStateChange}
        onSubmit={saveShiftEdit}
      />

      <ShiftBulkEditDialog
        open={isBulkDialogOpen}
        selectedStaffCount={selectedStaffIds.size}
        selectedDayCount={selectedDayKeys.size}
        selectedCellCount={selectedCellCount}
        bulkEditState={bulkEditState}
        isSaving={isSavingBulkEdit}
        canSubmit={hasBulkSelection}
        onClose={closeBulkEditDialog}
        onStateChange={handleBulkEditStateChange}
        onSubmit={handleApplyBulkEdit}
      />

      <AdminShiftSettingsDialog
        open={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
