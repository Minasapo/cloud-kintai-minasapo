import { shiftRequestStatusToShiftStateWithEmpty } from "@entities/shift/lib/statusMapping";
import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import { updateShiftRequest } from "@shared/api/graphql/documents/mutations";
import type { ShiftRequestCommentInput } from "@shared/api/graphql/types";
import { createLogger } from "@shared/lib/logger";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  CollaborativeShiftContext,
  CollaborativeShiftContextType,
} from "../context/CollaborativeShiftContext";
import { useCellChangeHistory } from "../hooks/useCellChangeHistory";
import { useCollaborativeShiftData } from "../hooks/useCollaborativeShiftData";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useShiftComments } from "../hooks/useShiftComments";
import { useShiftEditLocks } from "../hooks/useShiftEditLocks";
import { useShiftPresence } from "../hooks/useShiftPresence";
import { useShiftSync } from "../hooks/useShiftSync";
import { deriveHistoryCellChanges } from "../lib/shiftTransformers";
import {
  CellChangeRecord,
  CellChangeSource,
  CellComment,
  CollaborativeShiftState,
  EditLockAcquireResult,
  Mention,
  ShiftCellUpdate,
  ShiftRequestCommentData,
  ShiftRequestData,
  ShiftState,
} from "../types/collaborative.types";

const logger = createLogger("CollaborativeShiftProvider");

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

const useShiftPersistHandlers = ({
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

const useShiftProviderEffects = ({
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

const useShiftOperationHandlers = ({
  currentUserId,
  currentUserName,
  shiftDataMapRef,
  updateActivity,
  recordCellChange,
  recordBatchCellChanges,
  updateShift,
  batchUpdateShifts,
  acquireEditLock,
  releaseEditLock,
  forceReleaseLock,
  triggerSync,
  setSelectedCells,
}: {
  currentUserId: string;
  currentUserName: string;
  shiftDataMapRef: React.MutableRefObject<Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>>;
  updateActivity: () => void;
  recordCellChange: (update: ShiftCellUpdate, userId: string, userName: string, source: CellChangeSource) => CellChangeRecord;
  recordBatchCellChanges: (updates: ShiftCellUpdate[], userId: string, userName: string, source: CellChangeSource) => { operationId: string; records: CellChangeRecord[] };
  updateShift: (update: ShiftCellUpdate) => Promise<void>;
  batchUpdateShifts: (updates: ShiftCellUpdate[]) => Promise<void>;
  acquireEditLock: (staffId: string, date: string) => Promise<EditLockAcquireResult>;
  releaseEditLock: (staffId: string, date: string) => Promise<void>;
  forceReleaseLock: (staffId: string, date: string) => Promise<void>;
  triggerSync: () => Promise<void>;
  setSelectedCells: React.Dispatch<React.SetStateAction<Set<string>>>;
}) => {
  const enrichShiftUpdate = useCallback((update: ShiftCellUpdate): ShiftCellUpdate => {
    const currentCellData = shiftDataMapRef.current.get(update.staffId)?.get(update.date);
    return {
      ...update,
      previousState: update.previousState ?? currentCellData?.state,
      previousLocked: update.previousLocked ?? currentCellData?.isLocked,
    };
  }, [shiftDataMapRef]); // shiftDataMapRef is a stable ref, listing it to satisfy React Compiler

  const updateShiftHandler = useCallback(
    async (update: ShiftCellUpdate) => {
      updateActivity();
      recordCellChange(enrichShiftUpdate(update), currentUserId, currentUserName, "manual");
      await updateShift(update);
    },
    [updateActivity, recordCellChange, updateShift, currentUserId, currentUserName, enrichShiftUpdate],
  );

  const batchUpdateShiftsHandler = useCallback(
    async (updates: ShiftCellUpdate[]) => {
      updateActivity();
      recordBatchCellChanges(updates.map(enrichShiftUpdate), currentUserId, currentUserName, "batch");
      await batchUpdateShifts(updates);
    },
    [updateActivity, recordBatchCellChanges, batchUpdateShifts, currentUserId, currentUserName, enrichShiftUpdate],
  );

  const toggleCellSelection = useCallback(
    (cellKey: string, selected: boolean) => {
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (selected) { next.add(cellKey); } else { next.delete(cellKey); }
        return next;
      });
    },
    [setSelectedCells],
  );

  const startEditingCell = useCallback(
    async (staffId: string, date: string) => { updateActivity(); return acquireEditLock(staffId, date); },
    [updateActivity, acquireEditLock],
  );

  const stopEditingCell = useCallback(
    async (staffId: string, date: string) => releaseEditLock(staffId, date),
    [releaseEditLock],
  );

  const forceReleaseCell = useCallback(
    async (staffId: string, date: string) => forceReleaseLock(staffId, date),
    [forceReleaseLock],
  );

  const updateUserActivity = useCallback(() => updateActivity(), [updateActivity]);

  const triggerSyncHandler = useCallback(async () => triggerSync(), [triggerSync]);

  return useMemo(
    () => ({
      updateShift: updateShiftHandler,
      batchUpdateShifts: batchUpdateShiftsHandler,
      toggleCellSelection,
      startEditingCell,
      stopEditingCell,
      forceReleaseCell,
      updateUserActivity,
      triggerSync: triggerSyncHandler,
    }),
    [
      updateShiftHandler, batchUpdateShiftsHandler, toggleCellSelection,
      startEditingCell, stopEditingCell, forceReleaseCell,
      updateUserActivity, triggerSyncHandler,
    ],
  );
};

const useCommentHandlers = ({
  currentUserId,
  currentUserName,
  currentUserColor,
  getShiftRequest,
  getCommentsInputForStaff,
  addComment,
  updateComment,
  deleteComment,
  getCommentsByCell,
  replyToComment,
  deleteCommentReply,
}: {
  currentUserId: string;
  currentUserName: string;
  currentUserColor: string;
  getShiftRequest: (staffId: string) => ShiftRequestData | undefined;
  getCommentsInputForStaff: (staffId: string) => ShiftRequestCommentInput[];
  addComment: (cellKey: string, userId: string, userName: string, color: string, content: string, mentions: Mention[]) => CellComment;
  updateComment: (commentId: string, content: string, mentions?: Mention[]) => CellComment | null;
  deleteComment: (commentId: string) => { deleted: boolean; cellKey?: string };
  getCommentsByCell: (cellKey: string) => CellComment[];
  replyToComment: (parentCommentId: string, userId: string, userName: string, userColor: string, content: string, mentions?: Mention[]) => CellComment | null;
  deleteCommentReply: (parentCommentId: string, replyCommentId: string) => boolean;
}) => {
  const persistComments = useCallback(
    async (staffId: string) => {
      const shiftRequest = getShiftRequest(staffId);
      if (!shiftRequest) return;
      try {
        await graphqlClient.graphql({
          query: updateShiftRequest,
          variables: {
            input: {
              id: shiftRequest.id,
              comments: getCommentsInputForStaff(staffId),
              updatedBy: currentUserId,
              updatedAt: new Date().toISOString(),
            },
          },
          authMode: "userPool",
        });
      } catch (err) {
        logger.error("Failed to persist comments:", err);
      }
    },
    [getShiftRequest, getCommentsInputForStaff, currentUserId],
  );

  const getStaffIdFromCellKey = useCallback(
    (cellKey: string) => cellKey.split("#")[0] ?? "",
    [],
  );

  const persistCommentsByCellKey = useCallback(
    async (cellKey: string) => {
      const staffId = getStaffIdFromCellKey(cellKey);
      if (staffId) await persistComments(staffId);
    },
    [getStaffIdFromCellKey, persistComments],
  );

  const addCommentHandler = useCallback(
    async (cellKey: string, content: string, mentions: Mention[]): Promise<CellComment> => {
      const comment = addComment(cellKey, currentUserId, currentUserName, currentUserColor, content, mentions);
      await persistCommentsByCellKey(cellKey);
      return comment;
    },
    [addComment, currentUserId, currentUserName, currentUserColor, persistCommentsByCellKey],
  );

  const updateCommentHandler = useCallback(
    async (commentId: string, content: string, mentions: Mention[]): Promise<CellComment> => {
      const updated = updateComment(commentId, content, mentions);
      if (!updated) throw new Error(`Comment ${commentId} not found`);
      await persistCommentsByCellKey(updated.cellKey);
      return updated;
    },
    [updateComment, persistCommentsByCellKey],
  );

  const deleteCommentHandler = useCallback(
    async (commentId: string): Promise<void> => {
      const { cellKey } = deleteComment(commentId);
      if (cellKey) await persistCommentsByCellKey(cellKey);
    },
    [deleteComment, persistCommentsByCellKey],
  );

  const getCommentsByCellHandler = useCallback(
    (cellKey: string): CellComment[] => getCommentsByCell(cellKey),
    [getCommentsByCell],
  );

  const replyToCommentHandler = useCallback(
    async (parentCommentId: string, content: string, mentions: Mention[]): Promise<CellComment> => {
      const reply = replyToComment(
        parentCommentId, currentUserId, currentUserName, currentUserColor, content, mentions,
      );
      if (!reply) throw new Error(`Parent comment ${parentCommentId} not found`);
      await persistCommentsByCellKey(reply.cellKey);
      return reply;
    },
    [replyToComment, currentUserId, currentUserName, currentUserColor, persistCommentsByCellKey],
  );

  const deleteCommentReplyHandler = useCallback(
    async (parentCommentId: string, replyCommentId: string): Promise<void> => {
      deleteCommentReply(parentCommentId, replyCommentId);
    },
    [deleteCommentReply],
  );

  return useMemo(
    () => ({
      addComment: addCommentHandler,
      updateComment: updateCommentHandler,
      deleteComment: deleteCommentHandler,
      getCommentsByCell: getCommentsByCellHandler,
      replyToComment: replyToCommentHandler,
      deleteCommentReply: deleteCommentReplyHandler,
    }),
    [
      addCommentHandler, updateCommentHandler, deleteCommentHandler,
      getCommentsByCellHandler, replyToCommentHandler, deleteCommentReplyHandler,
    ],
  );
};

interface CollaborativeShiftProviderProps {
  children: React.ReactNode;
  staffIds: string[];
  targetMonth: string;
  currentUserId: string;
  currentUserName: string;
  shiftRequestId: string;
  staffNameMap?: Map<string, string>;
}

export const CollaborativeShiftProvider: React.FC<
  CollaborativeShiftProviderProps
> = ({
  children,
  staffIds,
  targetMonth,
  currentUserId,
  currentUserName,
  shiftRequestId,
  staffNameMap,
}) => {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [lastRemoteUpdate, setLastRemoteUpdate] = useState<{
    staffId: string;
    timestamp: number;
  } | null>(null);
  const isOnline = useOnlineStatus();

  // コメント管理フック
  const {
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
    loadCommentsFromShiftRequests,
    mergeRemoteComments,
    getCommentsInputForStaff,
  } = useShiftComments();

  // fetchShifts への参照ブリッジ（同期フックをデータフックより先に初期化するため）
  const fetchShiftsRef = useRef<() => Promise<void>>(() => Promise.resolve());

  // セル単位変更履歴フック
  const {
    recordCellChange,
    recordBatchCellChanges,
    recordRemoteChange,
    seedHistory,
    mergeHistoryRecords,
    getCellHistory,
    getAllCellHistory,
    getStaffCellHistory,
    clearCellHistory,
  } = useCellChangeHistory();

  // shiftDataMap への参照（リモート差分計算用）
  const shiftDataMapRef = useRef<
    Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>
  >(new Map());

  const handleRemoteUpdate = useCallback(
    (staffId: string, request: ShiftRequestData) => {
      setLastRemoteUpdate({ staffId, timestamp: Date.now() });
      applyRemoteChangesToHistory(staffId, request, shiftDataMapRef.current.get(staffId), recordRemoteChange);
    },
    [recordRemoteChange],
  );

  const { handlePersistCompleted, handleCommentsReceived } = useShiftPersistHandlers({
    staffNameMap,
    mergeHistoryRecords,
    mergeRemoteComments,
  });

  // 同期コーディネータフック（Subscription ファースト）
  const {
    isSyncing, syncError, triggerSync, lastAutoSyncedAt, lastSyncedAt,
    dataStatus, notifyAutoSyncReceived, notifySaveStarted, notifySaveCompleted,
    notifySaveFailed, clearSyncError,
  } = useShiftSync({
    onManualSync: async () => {
      await fetchShiftsRef.current();
    },
  });

  // データ管理フック
  const {
    shiftDataMap, pendingChanges, isLoading, isBatchUpdating, error,
    connectionState, fetchShifts, updateShift, batchUpdateShifts,
    retryPendingChanges, getShiftRequest, getAllShiftRequests,
  } = useCollaborativeShiftData({
    staffIds, targetMonth, currentUserId,
    onAutoSyncReceived: notifyAutoSyncReceived,
    onSaveStarted: notifySaveStarted,
    onSaveCompleted: notifySaveCompleted,
    onSaveFailed: notifySaveFailed,
    onRemoteUpdate: handleRemoteUpdate,
    onCommentsReceived: handleCommentsReceived,
    onPersistCompleted: handlePersistCompleted,
  });

  useShiftProviderEffects({
    isLoading, targetMonth, getAllShiftRequests, loadCommentsFromShiftRequests,
    staffNameMap, seedHistory, clearCellHistory, fetchShifts, fetchShiftsRef,
    shiftDataMap, shiftDataMapRef,
  });

  // プレゼンス管理フック
  const { activeUsers, updateActivity } = useShiftPresence({
    currentUserId, currentUserName, shiftRequestId, targetMonth,
  });
  const currentUserColor = useMemo(
    () => activeUsers.find((u) => u.userId === currentUserId)?.color || "#1976d2",
    [activeUsers, currentUserId],
  );

  const {
    editingCells, acquireEditLock, releaseEditLock,
    isCellBeingEdited, hasEditLock, getCellEditor,
    forceReleaseLock, getAllEditingCells, refreshLocks,
  } = useShiftEditLocks({ currentUserId, currentUserName, targetMonth });

  const operationHandlers = useShiftOperationHandlers({
    currentUserId, currentUserName, shiftDataMapRef, updateActivity,
    recordCellChange, recordBatchCellChanges, updateShift, batchUpdateShifts,
    acquireEditLock, releaseEditLock, forceReleaseLock, triggerSync, setSelectedCells,
  });

  const commentHandlers = useCommentHandlers({
    currentUserId, currentUserName, currentUserColor,
    getShiftRequest, getCommentsInputForStaff,
    addComment, updateComment, deleteComment,
    getCommentsByCell, replyToComment, deleteCommentReply,
  });

  const state: CollaborativeShiftState = useMemo(
    () => ({
      shiftDataMap, activeUsers, editingCells, pendingChanges, selectedCells,
      isLoading, isSyncing, lastSyncedAt, lastAutoSyncedAt, dataStatus,
      error: error || syncError || null, connectionState, isOnline, lastRemoteUpdate,
    }),
    [
      shiftDataMap, activeUsers, editingCells, pendingChanges, selectedCells,
      isLoading, isSyncing, lastSyncedAt, lastAutoSyncedAt, dataStatus,
      error, syncError, connectionState, isOnline, lastRemoteUpdate,
    ],
  );

  const contextValue: CollaborativeShiftContextType = useMemo(
    () => ({
      state, isBatchUpdating,
      isCellBeingEdited, hasEditLock, getCellEditor, getAllEditingCells,
      refreshLocks, clearSyncError, retryPendingChanges,
      getCellHistory, getAllCellHistory, getStaffCellHistory,
      ...operationHandlers,
      ...commentHandlers,
    }),
    [
      state, isBatchUpdating,
      isCellBeingEdited, hasEditLock, getCellEditor, getAllEditingCells,
      refreshLocks, clearSyncError, retryPendingChanges,
      getCellHistory, getAllCellHistory, getStaffCellHistory,
      operationHandlers, commentHandlers,
    ],
  );

  return (
    <CollaborativeShiftContext.Provider value={contextValue}>
      {children}
    </CollaborativeShiftContext.Provider>
  );
};
