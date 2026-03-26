import {
  useGetCompanyHolidayCalendarsQuery,
  useGetEventCalendarsQuery,
  useGetHolidayCalendarsQuery,
} from "@entities/calendar/api/calendarApi";
import { shiftPlanYearByTargetYear } from "@shared/api/graphql/documents/queries";
import type { ShiftPlanYearByTargetYearQuery } from "@shared/api/graphql/types";
import { type GraphQLResult } from "aws-amplify/api";
import dayjs from "dayjs";
import { type MouseEvent,useCallback, useEffect, useMemo, useState } from "react";

import { graphqlClient } from "@/shared/api/amplify/graphqlClient";

import { useCollaborativeShift } from "../context/CollaborativeShiftContext";
import { SuggestedAction } from "../rules/shiftRules";
import type { ShiftState } from "../types/collaborative.types";
import { useClipboardOps } from "./useClipboardOps";
import { useSelectionState } from "./useSelectionState";
import { useShiftCalendar } from "./useShiftCalendar";
import { useShiftMetrics } from "./useShiftMetrics";
import { useShiftSuggestions } from "./useShiftSuggestions";

export const useCollaborativePageState = (targetMonth: string) => {
  const {
    state,
    updateShift,
    batchUpdateShifts,
    isBatchUpdating,
    startEditingCell,
    isCellBeingEdited,
    getCellEditor,
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

  const changeCellState = useCallback(
    (staffId: string, date: string, newState: ShiftState) => {
      if (isCellLocked(staffId, date)) {
        return;
      }

      if (isCellBeingEdited(staffId, date)) {
        return;
      }

      updateUserActivity();
      void updateShift({ staffId, date, newState });
    },
    [isCellBeingEdited, updateUserActivity, updateShift, isCellLocked],
  );

  const handleChangeState = useCallback(
    (newState: ShiftState) => {
      if (selectionCount > 0) {
        const updates = selectedCells.map(({ staffId, date }) => ({
          staffId,
          date,
          newState,
        }));
        void batchUpdateShifts(updates);
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
    ],
  );

  const applyLockState = useCallback(
    (locked: boolean) => {
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

      if (isCellBeingEdited(staffId, date)) {
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
      startEditingCell(staffId, date);
    },
    [
      isBatchUpdating,
      isCellBeingEdited,
      updateUserActivity,
      selectRange,
      toggleCell,
      focusCell,
      selectCell,
      startEditingCell,
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
  };
};
