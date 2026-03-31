import {
  useGetCompanyHolidayCalendarsQuery,
  useGetEventCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import { shiftPlanYearByTargetYear } from "@shared/api/graphql/documents/queries";
import type { ShiftPlanYearByTargetYearQuery } from "@shared/api/graphql/types";
import { type GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { type MouseEvent, useCallback, useEffect, useMemo, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import { useCollaborativeShift } from "../context/CollaborativeShiftContext";
import { SuggestedAction } from "../rules/shiftRules";
import type { ShiftState } from "../types/collaborative.types";
import { useClipboardOps } from "./useClipboardOps";
import { useSelectionState } from "./useSelectionState";
import { useShiftCalendar } from "./useShiftCalendar";
import { buildEditLockConflictMessage } from "./useShiftEditLocks";
import { useShiftMetrics } from "./useShiftMetrics";
import { useShiftSuggestions } from "./useShiftSuggestions";

const NETWORK_EDIT_DISABLED_MESSAGE =
  "通信が切断されています。再接続後に編集を再開してください。";

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
    canUndo,
    canRedo,
    undo,
    redo,
    getLastUndo,
    getLastRedo,
    undoHistory,
    redoHistory,
    showHistory,
    toggleHistory,
    getCellHistory,
    getAllCellHistory,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
  } = useCollaborativeShift();

  const isAdmin = true; // TODO: 認可情報から取得する

  const currentMonth = useMemo(() => dayjs(targetMonth), [targetMonth]);

  const { data: registeredEventCalendars = [] } = useGetEventCalendarsQuery();

  const { data: holidays = [] } = useGetHolidayCalendarsQuery();

  const { data: companyHolidays = [] } = useGetCompanyHolidayCalendarsQuery();

  const { days, dateKeys, eventCalendar } = useShiftCalendar(
    currentMonth,
    registeredEventCalendars,
    holidays,
    companyHolidays,
  );

  const [shiftPlanCapacities, setShiftPlanCapacities] = useState<number[]>([]);
  const [editLockError, setEditLockError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShiftPlan = async () => {
      try {
        const result = (await graphqlClient.graphql({
          query: shiftPlanYearByTargetYear,
          variables: { targetYear: currentMonth.year(), limit: 1 },
          authMode: "userPool",
        })) as GraphQLResult<ShiftPlanYearByTargetYearQuery>;

        if (result.errors?.length) {
          throw new Error(
            result.errors.map((error) => error.message).join(","),
          );
        }

        const shiftPlanYear =
          result.data?.shiftPlanYearByTargetYear?.items?.find(
            (item): item is NonNullable<typeof item> => item !== null,
          ) ?? null;
        const monthPlan = shiftPlanYear?.plans?.find(
          (plan) => plan?.month === currentMonth.month() + 1,
        );

        if (monthPlan?.dailyCapacities) {
          setShiftPlanCapacities(
            monthPlan.dailyCapacities.map((capacity) => capacity ?? Number.NaN),
          );
        } else {
          setShiftPlanCapacities([]);
        }
      } catch (error) {
        console.error("Failed to fetch shift plan:", error);
        setShiftPlanCapacities([]);
      }
    };

    void fetchShiftPlan();
  }, [currentMonth]);

  const staffIds = useMemo(
    () => Array.from(state.shiftDataMap.keys()),
    [state.shiftDataMap],
  );

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

  const getShiftState = useCallback(
    (staffId: string, date: string): ShiftState | undefined => {
      return state.shiftDataMap.get(staffId)?.get(date)?.state;
    },
    [state.shiftDataMap],
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
    (staffId: string, date: string) => {
      return state.shiftDataMap.get(staffId)?.get(date);
    },
    [state.shiftDataMap],
  );

  const isCellLocked = useCallback(
    (staffId: string, date: string) => {
      return getCellData(staffId, date)?.isLocked ?? false;
    },
    [getCellData],
  );

  const { copy, paste, hasClipboard, clearClipboard } = useClipboardOps(
    staffIds,
    dateKeys,
    getShiftState,
  );

  const { violations, isAnalyzing, analyzeShifts } = useShiftSuggestions({
    shiftDataMap: state.shiftDataMap,
    staffIds,
    dateKeys,
    enabled: true,
    shiftPlanCapacities,
    days,
  });

  const isEditingDisabled = !state.isOnline || state.connectionState === "disconnected";

  const changeCellState = useCallback(
    (staffId: string, date: string, newState: ShiftState) => {
      if (isEditingDisabled) {
        setEditLockError(NETWORK_EDIT_DISABLED_MESSAGE);
        return;
      }

      if (isCellLocked(staffId, date)) {
        setEditLockError("確定済みのセルは変更できません。");
        return;
      }

      if (isCellBeingEdited(staffId, date)) {
        const editor = getCellEditor(staffId, date);
        setEditLockError(
          buildEditLockConflictMessage({
            id: "",
            targetMonth,
            staffId,
            date,
            holderUserId: editor?.userId ?? "",
            holderUserName: editor?.userName ?? "他のユーザー",
            acquiredAt: new Date().toISOString(),
            expiresAt: new Date().toISOString(),
            version: 0,
          }),
        );
        return;
      }

      if (!hasEditLock(staffId, date)) {
        setEditLockError("編集前にロックを取得してください。");
        return;
      }

      setEditLockError(null);
      updateUserActivity();
      void updateShift({ staffId, date, newState });
    },
    [
      getCellEditor,
      hasEditLock,
      isCellBeingEdited,
      isCellLocked,
      isEditingDisabled,
      targetMonth,
      updateShift,
      updateUserActivity,
    ],
  );

  const handleChangeState = useCallback(
    (newState: ShiftState) => {
      if (isEditingDisabled) {
        setEditLockError(NETWORK_EDIT_DISABLED_MESSAGE);
        return;
      }

      if (selectionCount > 0) {
        const updates = selectedCells.map(({ staffId, date }) => ({
          staffId,
          date,
          newState,
        }));
        const validUpdates = updates.filter((u) =>
          hasEditLock(u.staffId, u.date),
        );
        if (validUpdates.length > 0) {
          setEditLockError(null);
          void batchUpdateShifts(validUpdates);
        } else {
          setEditLockError("一括編集前に対象セルのロックを取得してください。");
        }
        return;
      }

      if (focusedCell) {
        changeCellState(focusedCell.staffId, focusedCell.date, newState);
      }
    },
    [
      focusedCell,
      selectedCells,
      selectionCount,
      batchUpdateShifts,
      changeCellState,
      hasEditLock,
      isEditingDisabled,
    ],
  );

  const applyLockState = useCallback(
    (locked: boolean) => {
      if (isEditingDisabled) {
        setEditLockError(NETWORK_EDIT_DISABLED_MESSAGE);
        return;
      }

      if (!locked && !isAdmin) {
        return;
      }

      const targets =
        selectionCount > 0
          ? Array.from(selectedCells)
          : focusedCell
            ? [focusedCell]
            : [];

      const updates = targets
        .map(({ staffId, date }) => {
          const cell = getCellData(staffId, date);
          if (!cell || cell.isLocked === locked) return null;
          return { staffId, date, isLocked: locked };
        })
        .filter(
          (
            update,
          ): update is { staffId: string; date: string; isLocked: boolean } =>
            update !== null,
        );

      if (updates.length === 0) return;

      void batchUpdateShifts(updates);
    },
    [
      selectionCount,
      selectedCells,
      focusedCell,
      getCellData,
      isEditingDisabled,
      isAdmin,
      batchUpdateShifts,
    ],
  );

  const handleCopy = useCallback(() => {
    if (selectionCount > 0) {
      copy(selectedCells);
    }
  }, [selectionCount, selectedCells, copy]);

  const handleLockCells = useCallback(() => {
    applyLockState(true);
  }, [applyLockState]);

  const handleUnlockCells = useCallback(() => {
    applyLockState(false);
  }, [applyLockState]);

  const selectionTargets = useMemo(() => {
    if (selectionCount > 0) return Array.from(selectedCells);
    if (focusedCell) return [focusedCell];
    return [];
  }, [selectionCount, selectedCells, focusedCell]);

  const hasLocked = useMemo(
    () =>
      selectionTargets.some((t) => getCellData(t.staffId, t.date)?.isLocked),
    [selectionTargets, getCellData],
  );

  const hasUnlocked = useMemo(
    () =>
      selectionTargets.some((t) => !getCellData(t.staffId, t.date)?.isLocked),
    [selectionTargets, getCellData],
  );

  const hasEditLockForSelected = useMemo(() => {
    return (
      selectionTargets.length > 0 &&
      selectionTargets.every((t) => hasEditLock(t.staffId, t.date))
    );
  }, [selectionTargets, hasEditLock]);

  const isOthersEditingSelected = useMemo(() => {
    return selectionTargets.some((t) => isCellBeingEdited(t.staffId, t.date));
  }, [selectionTargets, isCellBeingEdited]);

  const applyEditLock = useCallback(
    async (acquire: boolean) => {
      if (isEditingDisabled) {
        setEditLockError(NETWORK_EDIT_DISABLED_MESSAGE);
        return;
      }

      if (selectionTargets.length === 0) {
        return;
      }

      if (acquire) {
        await refreshLocks();
      }

      const conflicts: string[] = [];

      for (const { staffId, date } of selectionTargets) {
        if (acquire) {
          if (isCellBeingEdited(staffId, date)) {
            const editor = getCellEditor(staffId, date);
            conflicts.push(
              buildEditLockConflictMessage({
                id: "",
                targetMonth,
                staffId,
                date,
                holderUserId: editor?.userId ?? "",
                holderUserName: editor?.userName ?? "他のユーザー",
                acquiredAt: new Date().toISOString(),
                expiresAt: new Date().toISOString(),
                version: 0,
              }),
            );
            continue;
          }

          if (hasEditLock(staffId, date)) {
            continue;
          }

          const result = await startEditingCell(staffId, date);
          if (!result.acquired) {
            conflicts.push(buildEditLockConflictMessage(result.conflict));
          }
        } else if (hasEditLock(staffId, date)) {
          await stopEditingCell(staffId, date);
        }
      }

      setEditLockError(conflicts.length > 0 ? conflicts[0] : null);
    },
    [
      getCellEditor,
      hasEditLock,
      isEditingDisabled,
      isCellBeingEdited,
      refreshLocks,
      selectionTargets,
      startEditingCell,
      stopEditingCell,
      targetMonth,
    ],
  );

  const handleAcquireEditLock = useCallback(() => {
    void applyEditLock(true);
  }, [applyEditLock]);
  const handleReleaseEditLock = useCallback(() => {
    void applyEditLock(false);
  }, [applyEditLock]);

  const handleForceReleaseLock = useCallback(
    () => {
      if (!isAdmin) return;
      selectionTargets.forEach(({ staffId, date }) => {
        void forceReleaseCell(staffId, date);
      });
    },
    [selectionTargets, isAdmin, forceReleaseCell],
  );

  const handlePaste = useCallback(() => {
    if (!focusedCell) return;

    const updates = paste(focusedCell);
    updates.forEach(({ staffId, date, newState }) => {
      changeCellState(staffId, date, newState);
    });
  }, [focusedCell, paste, changeCellState]);

  const handleSelectAll = useCallback(() => {
    selectAll();
  }, [selectAll]);

  const handleEscape = useCallback(() => {
    if (showHelp) {
      setShowHelp(false);
    } else {
      clearSelection();
      clearFocus();
      clearClipboard();
    }
  }, [showHelp, clearSelection, clearFocus, clearClipboard]);

  const handleApplySuggestion = useCallback(
    (action: SuggestedAction) => {
      action.changes.forEach(({ staffId, date, newState }) => {
        changeCellState(staffId, date, newState);
      });
    },
    [changeCellState],
  );

  const handleCellClick = useCallback(
    (staffId: string, date: string, event: MouseEvent) => {
      if (isBatchUpdating) {
        return;
      }

      updateUserActivity();

      if (event.shiftKey) {
        selectRange(staffId, date);
        return;
      }

      if (event.ctrlKey || event.metaKey) {
        toggleCell(staffId, date);
        focusCell(staffId, date);
        return;
      }

      selectCell(staffId, date);
      focusCell(staffId, date);
    },
    [
      isBatchUpdating,
      updateUserActivity,
      selectRange,
      toggleCell,
      focusCell,
      selectCell,
    ],
  );

  const handleCellMouseDown = useCallback(
    (staffId: string, date: string, event: MouseEvent) => {
      if (isBatchUpdating) {
        return;
      }

      if (event.shiftKey || event.ctrlKey || event.metaKey) {
        return;
      }

      startDragSelect(staffId, date);
    },
    [isBatchUpdating, startDragSelect],
  );

  const handleCellMouseEnter = useCallback(
    (staffId: string, date: string) => {
      if (isDragging) {
        updateDragSelect(staffId, date);
      }
    },
    [isDragging, updateDragSelect],
  );

  const handleMouseUp = useCallback(() => {
    if (isDragging) {
      endDragSelect();
    }
  }, [isDragging, endDragSelect]);

  const handleSync = async () => {
    await triggerSync();
  };

  const clearEditLockError = useCallback(() => {
    setEditLockError(null);
  }, []);

  const { calculateDailyCount, progress } = useShiftMetrics(
    days,
    staffIds,
    state.shiftDataMap,
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
    hasClipboard,
    handleCopy,
    handlePaste,
    clearSelection,
    handleChangeState,
    handleLockCells,
    handleUnlockCells,
    handleApplySuggestion,
    violations,
    isAnalyzing,
    analyzeShifts,
    showHelp,
    setShowHelp,
    getCellEditor,
    isCellBeingEdited,
    isBatchUpdating,
    canUndo,
    canRedo,
    undo,
    redo,
    getLastUndo,
    getLastRedo,
    undoHistory,
    redoHistory,
    showHistory,
    toggleHistory,
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
