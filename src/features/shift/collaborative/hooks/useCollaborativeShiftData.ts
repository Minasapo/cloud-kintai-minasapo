import { useCallback, useRef, useState } from "react";

import {
  PendingChangesMap,
  ShiftCellData,
  ShiftCellUpdate,
  ShiftDataMap,
  ShiftState,
} from "../types/collaborative.types";

/**
 * 共同編集シフトデータの取得・更新フック
 */
interface UseCollaborativeShiftDataProps {
  staffIds: string[];
  _targetMonth?: string; // "YYYY-MM"
  currentUserId: string;
}

export const useCollaborativeShiftData = ({
  staffIds,
  currentUserId,
}: UseCollaborativeShiftDataProps) => {
  const [shiftDataMap, setShiftDataMap] = useState<ShiftDataMap>(new Map());
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);
  const [connectionState, setConnectionState] = useState<
    "connected" | "disconnected" | "error"
  >("connected");

  // 保留中の変更を追跡
  const pendingChangesRef = useRef<PendingChangesMap>(new Map());
  const hasInitializedRef = useRef(false);

  /**
   * シフトデータを取得
   */
  const fetchShifts = useCallback(async () => {
    if (staffIds.length === 0) return;

    try {
      setIsLoading(true);
      setError(null);
      setConnectionState("connected");

      // Phase 1: 初回のみダミーデータを生成、以降は既存データを保持
      // （実際のGraphQL統合時は毎回サーバーから取得）
      if (!hasInitializedRef.current) {
        const newShiftData = new Map<string, Map<string, ShiftCellData>>();
        const now = new Date();
        const daysInMonth = 31;

        staffIds.forEach((staffId) => {
          const dataMap = new Map<string, ShiftCellData>();

          for (let day = 1; day <= daysInMonth; day++) {
            const dayKey = String(day).padStart(2, "0");
            const states: ShiftState[] = [
              "work",
              "fixedOff",
              "requestedOff",
              "auto",
              "empty",
            ];
            const randomState =
              states[Math.floor(Math.random() * states.length)];

            dataMap.set(dayKey, {
              state: randomState,
              isLocked: day <= 10,
              lastChangedBy: day % 3 === 0 ? "admin" : staffId,
              lastChangedAt: new Date(
                now.getTime() - (daysInMonth - day) * 86400000
              ).toLocaleString(),
              version: 1,
            });
          }

          newShiftData.set(staffId, dataMap);
        });

        setShiftDataMap(newShiftData);
        hasInitializedRef.current = true;
      }

      setLastFetchedAt(Date.now());
    } catch (err) {
      console.error("Failed to fetch shifts:", err);
      setConnectionState("error");
      setError(
        err instanceof Error ? err.message : "シフトデータの取得に失敗しました"
      );
    } finally {
      setIsLoading(false);
    }
  }, [staffIds]);

  /**
   * シフトを更新
   */
  const updateShift = useCallback(
    async (update: ShiftCellUpdate) => {
      const key = `${update.staffId}-${update.date}`;

      // 楽観的更新
      setShiftDataMap((prev) => {
        const newMap = new Map(prev);
        const staffData = newMap.get(update.staffId);

        if (staffData) {
          const newStaffData = new Map(staffData);
          const cell = newStaffData.get(update.date) || {
            state: "empty" as ShiftState,
            isLocked: false,
          };

          const nextState = update.newState ?? cell.state;
          const nextLocked =
            update.isLocked !== undefined ? update.isLocked : cell.isLocked;

          newStaffData.set(update.date, {
            ...cell,
            state: nextState,
            isLocked: nextLocked,
            lastChangedBy: currentUserId,
            lastChangedAt: new Date().toLocaleString(),
          });

          newMap.set(update.staffId, newStaffData);
        }

        return newMap;
      });

      // 保留中の変更として記録
      pendingChangesRef.current.set(key, update);

      try {
        // TODO: GraphQL API呼び出しでサーバーに送信
        // const result = await API.graphql({ mutation, variables: {...} });
        // サーバーからの応答で pendingChangesRef から削除

        // Phase 1ではダミーの遅延を追加
        await new Promise((resolve) => setTimeout(resolve, 500));

        // 成功時に保留中の変更から削除
        pendingChangesRef.current.delete(key);
      } catch (err) {
        console.error("Failed to update shift:", err);
        setError(
          err instanceof Error ? err.message : "シフトの更新に失敗しました"
        );

        // エラー時はロールバックせず、次回同期でサーバーデータを取得
        // （無限ループ防止のため、fetchShifts() は呼ばない）
        pendingChangesRef.current.delete(key);
      }
    },
    [currentUserId]
  );

  /**
   * バッチ更新
   */
  const batchUpdateShifts = useCallback(
    async (updates: ShiftCellUpdate[]) => {
      try {
        // 各更新を実行
        for (const update of updates) {
          await updateShift(update);
        }
      } catch (err) {
        console.error("Batch update failed:", err);
        setError("バッチ更新に失敗しました");
      }
    },
    [updateShift]
  );

  return {
    shiftDataMap,
    pendingChanges: pendingChangesRef.current,
    isLoading,
    error,
    connectionState,
    lastFetchedAt,
    fetchShifts,
    updateShift,
    batchUpdateShifts,
  };
};
