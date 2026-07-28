import { useAppDispatchV2 } from "@app/hooks";
import { pushNotification } from "@shared/lib/store/notificationSlice";
import React, { useCallback, useMemo, useRef, useState } from "react";

import {
  CollaborativeShiftContext,
  CollaborativeShiftContextType,
} from "../context/CollaborativeShiftContext";
import { useCellChangeHistory } from "../hooks/useCellChangeHistory";
import { useCollaborativeShiftData } from "../hooks/useCollaborativeShiftData";
import { useCommentOperations } from "../hooks/useCommentOperations";
import { useOnlineStatus } from "../hooks/useOnlineStatus";
import { useShiftComments } from "../hooks/useShiftComments";
import { useShiftEditLocks } from "../hooks/useShiftEditLocks";
import { useShiftOperations } from "../hooks/useShiftOperations";
import { useShiftPresence } from "../hooks/useShiftPresence";
import {
  usePersistHandlers,
  useProviderEffects,
  useRemoteUpdateHandler,
} from "../hooks/useShiftProviderOrchestration";
import { useShiftSync } from "../hooks/useShiftSync";
import {
  CollaborativeShiftState,
  ShiftState,
} from "../types/collaborative.types";

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
  const isOnline = useOnlineStatus();
  const dispatch = useAppDispatchV2();

  const notifyCommentPersistError = useCallback(
    (message: string) => {
      dispatch(
        pushNotification({
          message: "コメントの保存に失敗しました",
          description: message,
          tone: "error",
          source: "global",
          dedupeKey: "shift-comment-persist-error",
        }),
      );
    },
    [dispatch],
  );

  const {
    commentsMap,
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

  const fetchShiftsRef = useRef<() => Promise<void>>(() => Promise.resolve());
  const shiftDataMapRef = useRef<
    Map<string, Map<string, { state: ShiftState; isLocked: boolean }>>
  >(new Map());

  const { handlePersistCompleted, handleCommentsReceived } = usePersistHandlers(
    {
      staffNameMap,
      mergeHistoryRecords,
      mergeRemoteComments,
    },
  );

  const {
    isSyncing,
    syncError,
    triggerSync,
    lastAutoSyncedAt,
    lastSyncedAt,
    dataStatus,
    notifyAutoSyncReceived,
    notifySaveStarted,
    notifySaveCompleted,
    notifySaveFailed,
    clearSyncError,
  } = useShiftSync({
    onManualSync: async () => {
      await fetchShiftsRef.current();
    },
  });

  const {
    shiftDataMap,
    pendingChanges,
    isLoading,
    isBatchUpdating,
    error,
    connectionState,
    lastFetchedAt,
    fetchShifts,
    updateShift,
    batchUpdateShifts,
    retryPendingChanges,
    getShiftRequest,
    getAllShiftRequests,
    upsertShiftRequest,
  } = useCollaborativeShiftData({
    staffIds,
    targetMonth,
    currentUserId,
    onAutoSyncReceived: notifyAutoSyncReceived,
    onSaveStarted: notifySaveStarted,
    onSaveCompleted: notifySaveCompleted,
    onSaveFailed: notifySaveFailed,
    onRemoteUpdate: (staffId, request) => {
      handleRemoteUpdate(staffId, request);
    },
    onCommentsReceived: handleCommentsReceived,
    onPersistCompleted: handlePersistCompleted,
  });

  useProviderEffects({
    isLoading,
    lastFetchedAt,
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
  });

  const { handleRemoteUpdate } = useRemoteUpdateHandler({
    recordRemoteChange,
    shiftDataMapRef,
  });

  const { activeUsers, updateActivity } = useShiftPresence({
    currentUserId,
    currentUserName,
    shiftRequestId,
    targetMonth,
  });
  const currentUserColor = useMemo(
    () =>
      activeUsers.find((u) => u.userId === currentUserId)?.color ||
      "rgb(25 118 210)",
    [activeUsers, currentUserId],
  );

  const {
    editingCells,
    acquireEditLock,
    releaseEditLock,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    forceReleaseLock,
    getAllEditingCells,
    refreshLocks,
  } = useShiftEditLocks({ currentUserId, currentUserName, targetMonth });

  const operationHandlers = useShiftOperations({
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
  });

  const commentHandlers = useCommentOperations({
    targetMonth,
    currentUserId,
    currentUserName,
    currentUserColor,
    getShiftRequest,
    upsertShiftRequest,
    getCommentsInputForStaff,
    addComment,
    updateComment,
    deleteComment,
    getCommentsByCell,
    replyToComment,
    deleteCommentReply,
    callbacks: {
      onCommentPersistFailed: notifyCommentPersistError,
    },
  });

  const state: CollaborativeShiftState = useMemo(
    () => ({
      shiftDataMap,
      activeUsers,
      editingCells,
      pendingChanges,
      selectedCells,
      isLoading,
      isSyncing,
      lastSyncedAt,
      lastAutoSyncedAt,
      dataStatus,
      error: error || syncError || null,
      connectionState,
      isOnline,
      lastRemoteUpdate: null,
    }),
    [
      shiftDataMap,
      activeUsers,
      editingCells,
      pendingChanges,
      selectedCells,
      isLoading,
      isSyncing,
      lastSyncedAt,
      lastAutoSyncedAt,
      dataStatus,
      error,
      syncError,
      connectionState,
      isOnline,
    ],
  );

  const contextValue: CollaborativeShiftContextType = useMemo(
    () => ({
      state,
      isBatchUpdating,
      isCellBeingEdited,
      hasEditLock,
      getCellEditor,
      getAllEditingCells,
      refreshLocks,
      clearSyncError,
      retryPendingChanges,
      getCellHistory,
      getAllCellHistory,
      getStaffCellHistory,
      commentsMap,
      ...operationHandlers,
      ...commentHandlers,
    }),
    [
      state,
      isBatchUpdating,
      isCellBeingEdited,
      hasEditLock,
      getCellEditor,
      getAllEditingCells,
      refreshLocks,
      clearSyncError,
      retryPendingChanges,
      getCellHistory,
      getAllCellHistory,
      getStaffCellHistory,
      commentsMap,
      operationHandlers,
      commentHandlers,
    ],
  );

  return (
    <CollaborativeShiftContext.Provider value={contextValue}>
      {children}
    </CollaborativeShiftContext.Provider>
  );
};
