import { useGetEventCalendarsQuery } from "@entities/calendar/api/calendarApi";
import { useCalendars } from "@entities/calendar/model/useCalendars";
import { StaffRole } from "@entities/staff/model/useStaffs/useStaffs";
import { useAuthSessionSummary } from "@shared/lib/useAuthSessionSummary";
import dayjs from "dayjs";
import { useCallback, useMemo, useState } from "react";

import { useCollaborativeShift } from "../context/CollaborativeShiftContext";
import { SuggestedAction } from "../rules/shiftRules";
import type { ShiftDataMap } from "../types/collaborative.types";
import { useCellStateActions } from "./page-state/useCellStateActions";
import { useLockActions } from "./page-state/useLockActions";
import { useSelectionInteractions } from "./page-state/useSelectionInteractions";
import { useShiftPlanCapacities } from "./page-state/useShiftPlanCapacities";
import { useSelectionState } from "./useSelectionState";
import { useShiftCalendar } from "./useShiftCalendar";
import { useShiftMetrics } from "./useShiftMetrics";
import { useShiftSuggestions } from "./useShiftSuggestions";

const NETWORK_EDIT_DISABLED_MESSAGE =
  "通信が切断されています。再接続後に編集を再開してください。";

const isAdminRole = (isCognitoUserRole: (role: StaffRole) => boolean) =>
  isCognitoUserRole(StaffRole.ADMIN) ||
  isCognitoUserRole(StaffRole.STAFF_ADMIN) ||
  isCognitoUserRole(StaffRole.OWNER);

const useShiftCalendarAndCellState = (
  targetMonth: string,
  shiftDataMap: ShiftDataMap,
) => {
  const { currentMonth, shiftPlanCapacities } = useShiftPlanCapacities(targetMonth);
  const { data: registeredEventCalendars = [] } = useGetEventCalendarsQuery();
  const {
    holidayCalendars: holidays,
    companyHolidayCalendars: companyHolidays,
  } = useCalendars();
  const { days, dateKeys, eventCalendar } = useShiftCalendar(
    currentMonth,
    registeredEventCalendars,
    holidays,
    companyHolidays,
  );
  const staffIds = useMemo(
    () => Array.from(shiftDataMap.keys()),
    [shiftDataMap],
  );
  const getEventsForDay = useCallback(
    (day: dayjs.Dayjs) =>
      eventCalendar.filter((event) => {
        const end = event.end ?? event.start;
        return (
          day.isSame(event.start, "day") ||
          day.isSame(end, "day") ||
          (day.isAfter(event.start, "day") && day.isBefore(end, "day"))
        );
      }),
    [eventCalendar],
  );
  const getCellData = useCallback(
    (staffId: string, date: string) => shiftDataMap.get(staffId)?.get(date),
    [shiftDataMap],
  );
  const isCellLocked = useCallback(
    (staffId: string, date: string) => getCellData(staffId, date)?.isLocked ?? false,
    [getCellData],
  );
  return {
    currentMonth,
    shiftPlanCapacities,
    days,
    dateKeys,
    staffIds,
    getEventsForDay,
    getCellData,
    isCellLocked,
  };
};

export const useCollaborativePageState = (targetMonth: string) => {
  const {
    state,
    updateShift,
    batchUpdateShifts,
    isBatchUpdating,
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    forceReleaseCell,
    refreshLocks,
    triggerSync,
    clearSyncError,
    updateUserActivity,
    getCellHistory,
    getAllCellHistory,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
  } = useCollaborativeShift();

  const { isCognitoUserRole } = useAuthSessionSummary();
  const isAdmin = useMemo(() => isAdminRole(isCognitoUserRole), [isCognitoUserRole]);

  const {
    currentMonth,
    shiftPlanCapacities,
    days,
    dateKeys,
    staffIds,
    getEventsForDay,
    getCellData,
    isCellLocked,
  } = useShiftCalendarAndCellState(targetMonth, state.shiftDataMap);

  const [editLockError, setEditLockError] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);

  const {
    focusedCell,
    registerCell,
    focusCell,
    navigate,
    clearFocus,
    selectedCells,
    selectionCount,
    isCellSelected,
    selectCell,
    toggleCell,
    selectRange,
    startDragSelect,
    updateDragSelect,
    endDragSelect,
    selectAll,
    clearSelection,
    isDragging,
  } = useSelectionState(staffIds, dateKeys);

  const { violations, isAnalyzing, analyzeShifts } = useShiftSuggestions({
    shiftDataMap: state.shiftDataMap,
    staffIds,
    dateKeys,
    enabled: true,
    shiftPlanCapacities,
    days,
  });

  const isEditingDisabled =
    !state.isOnline || state.connectionState === "disconnected";

  const releaseEditLocks = useCallback(
    (targets: Array<{ staffId: string; date: string }>) =>
      Promise.all(targets.map(({ staffId, date }) => stopEditingCell(staffId, date))).then(() => {}),
    [stopEditingCell],
  );

  const { changeCellState, handleChangeState } = useCellStateActions({
    targetMonth,
    isEditingDisabled,
    setEditLockError,
    networkEditDisabledMessage: NETWORK_EDIT_DISABLED_MESSAGE,
    isCellLocked,
    isCellBeingEdited,
    getCellEditor,
    hasEditLock,
    updateUserActivity,
    updateShift,
    batchUpdateShifts,
    releaseEditLocks,
    selectionCount,
    selectedCells,
    focusedCell,
  });

  const {
    hasLocked,
    hasUnlocked,
    hasEditLockForSelected,
    isOthersEditingSelected,
    clearEditLockError,
    handleLockCells,
    handleUnlockCells,
    handleLockStaffRow,
    handleUnlockStaffRow,
    handleLockMonth,
    handleUnlockMonth,
    handleAcquireEditLock,
    handleReleaseEditLock,
    handleForceReleaseLock,
  } = useLockActions({
    selectionCount,
    selectedCells,
    focusedCell,
    getCellData,
    dateKeys,
    shiftDataMap: state.shiftDataMap,
    isEditingDisabled,
    isAdmin,
    targetMonth,
    hasEditLock,
    isCellBeingEdited,
    getCellEditor,
    startEditingCell,
    stopEditingCell,
    refreshLocks,
    batchUpdateShifts,
    forceReleaseCell,
    networkEditDisabledMessage: NETWORK_EDIT_DISABLED_MESSAGE,
    setEditLockError,
  });

  const {
    handleSelectAll,
    handleEscape,
    handleCellClick,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
  } = useSelectionInteractions({
    isBatchUpdating,
    isDragging,
    showHelp,
    setShowHelp,
    updateUserActivity,
    selectRange,
    toggleCell,
    focusCell,
    selectCell,
    startDragSelect,
    updateDragSelect,
    endDragSelect,
    clearSelection,
    clearFocus,
    selectAll,
  });

  const handleApplySuggestion = useCallback(
    ({ changes }: SuggestedAction) => changes.forEach(({ staffId, date, newState }) => changeCellState(staffId, date, newState)),
    [changeCellState],
  );

  const handleSync = triggerSync;

  const { calculateDailyCount, progress } = useShiftMetrics(
    days,
    staffIds,
    state.shiftDataMap,
    shiftPlanCapacities,
  );

  return {
    state,
    isAdmin,
    currentMonth,
    days,
    staffIds,
    focusedCell,
    isCellSelected,
    registerCell,
    handleCellClick,
    handleCellMouseDown,
    handleCellMouseEnter,
    handleMouseUp,
    handleSync,
    clearSyncError,
    progress,
    calculateDailyCount,
    getEventsForDay,
    selectedCells,
    selectionCount,
    hasLocked,
    hasUnlocked,
    clearSelection,
    handleChangeState,
    handleLockCells,
    handleUnlockCells,
    handleLockStaffRow,
    handleUnlockStaffRow,
    handleLockMonth,
    handleUnlockMonth,
    handleApplySuggestion,
    violations,
    isAnalyzing,
    analyzeShifts,
    showHelp,
    setShowHelp,
    getCellEditor,
    isCellBeingEdited,
    isBatchUpdating,
    getCellHistory,
    getAllCellHistory,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
    handleEscape,
    handleSelectAll,
    navigate,
    hasEditLockForSelected,
    isOthersEditingSelected,
    editLockError,
    clearEditLockError,
    handleAcquireEditLock,
    handleReleaseEditLock,
    handleForceReleaseLock,
  };
};
