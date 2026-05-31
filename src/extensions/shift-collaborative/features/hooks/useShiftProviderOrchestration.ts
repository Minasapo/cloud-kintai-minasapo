import { shiftRequestStatusToShiftStateWithEmpty } from "@entities/shift/lib/statusMapping";
import { useCallback, useEffect, useRef } from "react";

import { deriveHistoryCellChanges } from "../lib/shiftTransformers";
import {
  CellChangeRecord,
  ShiftRequestCommentData,
  ShiftRequestData,
  ShiftState,
} from "../types/collaborative.types";

/**
 * リモート変更を履歴に適用する
 */
const applyRemoteChangesToHistory = (
  staffId: string,
  request: ShiftRequestData,
  currentStaffData: Map<string, { state: ShiftState; isLocked: boolean }> | undefined,
  recordRemoteChange: (
    staffId: string,
    dayKey: string,
    previousState: ShiftState | undefined,
    newState: ShiftState | undefined,
    updatedBy: string,
    updatedByName: string,
  ) => void,
): void => {
  for (const entry of request.entries ?? []) {
    const dayKey = entry.date.slice(-2);
    const previousState = currentStaffData?.get(dayKey)?.state;
    const newState = shiftRequestStatusToShiftStateWithEmpty(entry.status);
    if (previousState !== newState) {
      recordRemoteChange(
        staffId, dayKey, previousState, newState,
        request.updatedBy ?? "unknown", request.updatedBy ?? "不明",
      );
    }
  }
};

/**
 * 永続化完了・コメント受信時の履歴・状態マージを扱う
 */
export const usePersistHandlers = ({
  staffNameMap,
  mergeHistoryRecords,
  mergeRemoteComments,
}: {
  staffNameMap: Map<string, string> | undefined;
  mergeHistoryRecords: (records: CellChangeRecord[]) => void;
  mergeRemoteComments: (staffId: string, comments: ShiftRequestCommentData[]) => void;
}) => {
  const handlePersistCompleted = useCallback(
    (request: ShiftRequestData) => {
      if (!request.histories || request.histories.length === 0) return;
      const sorted = [...request.histories].toSorted(
        (a, b) => Date.parse(a.recordedAt) - Date.parse(b.recordedAt),
      );
      const recentHistories = sorted.slice(-2);
      if (recentHistories.length === 0) return;
      const getStaffName = (id: string) => staffNameMap?.get(id) ?? id;
      mergeHistoryRecords(deriveHistoryCellChanges(request.staffId, recentHistories, getStaffName));
    },
    [staffNameMap, mergeHistoryRecords],
  );

  const handleCommentsReceived = useCallback(
    (staffId: string, comments: ShiftRequestCommentData[]) =>
      mergeRemoteComments(staffId, comments),
    [mergeRemoteComments],
  );

  return { handlePersistCompleted, handleCommentsReceived };
};

/**
 * Provider 全体の副作用管理（初期化・月切り替え・同期トリガー）
 */
export const useProviderEffects = ({
  isLoading,
  targetMonth,
  getAllShiftRequests,
  loadCommentsFromShiftRequests,
  staffNameMap,
  seedHistory,
  clearCellHistory,
  fetchShifts,
  fetchShiftsRef,
  shiftDataMap,
  shiftDataMapRef,
}: {
  isLoading: boolean;
  targetMonth: string;
  getAllShiftRequests: () => ShiftRequestData[];
  loadCommentsFromShiftRequests: (requests: ShiftRequestData[]) => void;
  staffNameMap: Map<string, string> | undefined;
  seedHistory: (records: CellChangeRecord[]) => void;
  clearCellHistory: () => void;
  fetchShifts: () => Promise<void>;
  fetchShiftsRef: React.MutableRefObject<() => Promise<void>>;
  shiftDataMap: Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>;
  shiftDataMapRef: React.MutableRefObject<Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>>;
}) => {
  useEffect(() => {
    fetchShiftsRef.current = fetchShifts;
  }, [fetchShifts, fetchShiftsRef]);

  useEffect(() => {
    shiftDataMapRef.current = shiftDataMap;
  }, [shiftDataMap, shiftDataMapRef]);

  const commentsInitializedRef = useRef(false);
  useEffect(() => {
    if (isLoading || commentsInitializedRef.current) return;
    const allRequests = getAllShiftRequests();
    if (allRequests.length > 0) {
      loadCommentsFromShiftRequests(allRequests);
      commentsInitializedRef.current = true;
    }
  }, [isLoading, getAllShiftRequests, loadCommentsFromShiftRequests]);

  const seededMonthRef = useRef<string | null>(null);
  useEffect(() => {
    if (seededMonthRef.current !== null && seededMonthRef.current !== targetMonth) {
      clearCellHistory();
      seededMonthRef.current = null;
    }
    if (isLoading || seededMonthRef.current === targetMonth) return;
    const allRequests = getAllShiftRequests();
    if (allRequests.length === 0) return;
    const getStaffName = (id: string) => staffNameMap?.get(id) ?? id;
    seedHistory(
      allRequests.flatMap((r) =>
        deriveHistoryCellChanges(r.staffId, r.histories ?? [], getStaffName),
      ),
    );
    seededMonthRef.current = targetMonth;
  }, [targetMonth, isLoading, getAllShiftRequests, staffNameMap, seedHistory, clearCellHistory]);
};

/**
 * リモート更新ハンドラの統合管理
 */
export const useRemoteUpdateHandler = ({
  recordRemoteChange,
  shiftDataMapRef,
}: {
  recordRemoteChange: (
    staffId: string,
    dayKey: string,
    previousState: ShiftState | undefined,
    newState: ShiftState | undefined,
    updatedBy: string,
    updatedByName: string,
  ) => void;
  shiftDataMapRef: React.MutableRefObject<Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>>;
}) => {
  const handleRemoteUpdate = useCallback(
    (staffId: string, request: ShiftRequestData) => {
      applyRemoteChangesToHistory(staffId, request, shiftDataMapRef.current.get(staffId), recordRemoteChange);
    },
    [recordRemoteChange, shiftDataMapRef],
  );

  return { handleRemoteUpdate };
};
