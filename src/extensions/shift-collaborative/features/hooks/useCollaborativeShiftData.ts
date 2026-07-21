import { useGetShiftRequestsQuery } from "@entities/shift/api/shiftApi";
import { createLogger } from "@shared/lib/logger";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { buildShiftErrorMessage } from "../lib/shiftErrorMessages";
import {
  applyShiftRequestToShiftDataMap,
  normalizeShiftRequest,
  transformShiftRequestToShiftDataMap,
} from "../lib/shiftTransformers";
import {
  PendingChangesMap,
  ShiftDataMap,
  ShiftRequestCommentData,
  ShiftRequestData,
} from "../types/collaborative.types";
import { useShiftDataSubscriptions } from "./useShiftDataSubscriptions";
import { useShiftPersist } from "./useShiftPersist";

const logger = createLogger("CollaborativeShiftData");

/**
 * 共同編集シフトデータの取得・更新フック
 */
interface UseCollaborativeShiftDataProps {
  staffIds: string[];
  targetMonth?: string; // "YYYY-MM"
  currentUserId: string;
  onAutoSyncReceived?: () => void;
  onSaveStarted?: () => void;
  onSaveCompleted?: () => void;
  onSaveFailed?: (error: string) => void;
  onRemoteUpdate?: (staffId: string, request: ShiftRequestData) => void;
  onCommentsReceived?: (
    staffId: string,
    comments: ShiftRequestCommentData[],
  ) => void;
  onPersistCompleted?: (request: ShiftRequestData) => void;
}

export const useCollaborativeShiftData = ({
  staffIds,
  targetMonth,
  currentUserId,
  onAutoSyncReceived,
  onSaveStarted,
  onSaveCompleted,
  onSaveFailed,
  onRemoteUpdate,
  onCommentsReceived,
  onPersistCompleted,
}: UseCollaborativeShiftDataProps) => {
  const [shiftDataMap, setShiftDataMap] = useState<ShiftDataMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);
  const [connectionState, setConnectionState] = useState<
    "connected" | "disconnected" | "error"
  >("connected");

  const onAutoSyncReceivedRef = useRef(onAutoSyncReceived);
  const onSaveStartedRef = useRef(onSaveStarted);
  const onSaveCompletedRef = useRef(onSaveCompleted);
  const onSaveFailedRef = useRef(onSaveFailed);
  const onRemoteUpdateRef = useRef(onRemoteUpdate);
  const onCommentsReceivedRef = useRef(onCommentsReceived);
  const onPersistCompletedRef = useRef(onPersistCompleted);

  useEffect(() => {
    onAutoSyncReceivedRef.current = onAutoSyncReceived;
    onSaveStartedRef.current = onSaveStarted;
    onSaveCompletedRef.current = onSaveCompleted;
    onSaveFailedRef.current = onSaveFailed;
    onRemoteUpdateRef.current = onRemoteUpdate;
    onCommentsReceivedRef.current = onCommentsReceived;
    onPersistCompletedRef.current = onPersistCompleted;
  }, [
    onAutoSyncReceived,
    onSaveStarted,
    onSaveCompleted,
    onSaveFailed,
    onRemoteUpdate,
    onCommentsReceived,
    onPersistCompleted,
  ]);

  // 保留中の変更を追跡
  const pendingChangesRef = useRef<PendingChangesMap>(new Map());
  const shiftRequestsRef = useRef<Map<string, ShiftRequestData>>(new Map());

  // staffIds参照を安定化（毎回新しい配列参照による不要なrefetchを防ぐ）
  const staffIdsKey = useMemo(() => staffIds.toSorted().join(","), [staffIds]);

  const shouldSkipFetch = staffIds.length === 0 || !targetMonth;
  const {
    data: shiftRequests = [],
    isLoading: isLoadingQuery,
    error: fetchError,
    refetch,
  } = useGetShiftRequestsQuery(
    {
      staffIds,
      targetMonth: targetMonth ?? "",
    },
    {
      skip: shouldSkipFetch,
      // ウィンドウフォーカス時の自動refetchを無効化
      refetchOnFocus: false,
      // ネットワーク接続復帰時の自動refetchを無効化
      refetchOnReconnect: false,
      // 再フェッチ中もキャッシュを表示し続ける（ユーザーが表の再描画を感じないようにする）
      selectFromResult: (result) => ({
        ...result,
        // 初期ロード中のみisLoadingをtrue、再フェッチ時はfalseに
        isLoading: result.isLoading && !result.data,
      }),
    },
  );

  const isLoading = isLoadingQuery;

  const normalizedShiftRequests = useMemo(
    () => shiftRequests.map(normalizeShiftRequest),
    [shiftRequests],
  );

  const updateShiftRequestState = useCallback(
    (request: ShiftRequestData) => {
      shiftRequestsRef.current.set(request.staffId, request);
      setShiftDataMap((prev) =>
        targetMonth
          ? applyShiftRequestToShiftDataMap({
              shiftDataMap: prev,
              shiftRequest: request,
              targetMonth,
            })
          : prev,
      );
    },
    [targetMonth],
  );

  useEffect(() => {
    if (!targetMonth) {
      return;
    }

    const nextMap = new Map<string, ShiftRequestData>();
    normalizedShiftRequests.forEach((request) => {
      nextMap.set(request.staffId, request);
    });
    shiftRequestsRef.current = nextMap;

    setShiftDataMap(
      transformShiftRequestToShiftDataMap({
        shiftRequests: normalizedShiftRequests,
        staffIds,
        targetMonth,
      }),
    );
    setLastFetchedAt(Date.now());
  }, [normalizedShiftRequests, staffIdsKey, targetMonth]);

  useEffect(() => {
    if (!fetchError) {
      return;
    }
    const { message, connection } = buildShiftErrorMessage(fetchError);
    setError(message);
    setConnectionState(connection);
  }, [fetchError]);

  /**
   * シフトデータを取得
   */
  const fetchShifts = useCallback(async () => {
    if (shouldSkipFetch) return;

    try {
      setError(null);
      setConnectionState("connected");

      const result = await refetch();
      if ("error" in result && result.error) {
        throw result.error;
      }

      setLastFetchedAt(Date.now());
    } catch (err) {
      logger.error("Failed to fetch shifts:", err);
      const { message, connection } = buildShiftErrorMessage(err);
      setConnectionState(connection);
      setError(message);
      throw err;
    }
  }, [shouldSkipFetch, refetch]);

  const {
    isBatchUpdating,
    updateShift,
    batchUpdateShifts,
    retryPendingChanges,
  } = useShiftPersist({
    targetMonth,
    currentUserId,
    shiftDataMap,
    setShiftDataMap,
    shiftRequestsRef,
    pendingChangesRef,
    setConnectionState,
    updateShiftRequestState,
    onSaveStartedRef,
    onSaveCompletedRef,
    onSaveFailedRef,
    onPersistCompletedRef,
  });

  useShiftDataSubscriptions({
    staffIds,
    staffIdsKey,
    targetMonth,
    currentUserId,
    updateShiftRequestState,
    onAutoSyncReceivedRef,
    onRemoteUpdateRef,
    onCommentsReceivedRef,
  });

  const getShiftRequest = useCallback(
    (staffId: string) => shiftRequestsRef.current.get(staffId),
    [],
  );

  const getAllShiftRequests = useCallback(
    () => Array.from(shiftRequestsRef.current.values()),
    [],
  );

  const upsertShiftRequest = useCallback(
    (request: ShiftRequestData) => {
      updateShiftRequestState(request);
    },
    [updateShiftRequestState],
  );

  return {
    shiftDataMap,
    pendingChanges: pendingChangesRef.current,
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
  };
};
