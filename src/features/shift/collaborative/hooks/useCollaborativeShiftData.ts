import {
  useBatchUpdateShiftCellsMutation,
  useCreateShiftRequestMutation,
  useGetShiftRequestsQuery,
  useUpdateShiftCellMutation,
} from "@entities/shift/api/shiftApi";
import type { GraphQLBaseQueryError } from "@shared/api/graphql/graphqlBaseQuery";
import type { ShiftRequestDayPreferenceInput } from "@shared/api/graphql/types";
import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  applyShiftCellUpdateToMap,
  applyShiftRequestToShiftDataMap,
  normalizeShiftRequest,
  transformShiftCellUpdateToGraphQLInput,
  transformShiftRequestToShiftDataMap,
} from "../lib/shiftTransformers";
import {
  PendingChangesMap,
  ShiftCellUpdate,
  ShiftDataMap,
  ShiftRequestData,
  shiftStateToShiftRequestStatus,
} from "../types/collaborative.types";

/**
 * 共同編集シフトデータの取得・更新フック
 */
interface UseCollaborativeShiftDataProps {
  staffIds: string[];
  targetMonth?: string; // "YYYY-MM"
  currentUserId: string;
}

export const useCollaborativeShiftData = ({
  staffIds,
  targetMonth,
  currentUserId,
}: UseCollaborativeShiftDataProps) => {
  const [shiftDataMap, setShiftDataMap] = useState<ShiftDataMap>(new Map());
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<number>(0);
  const [connectionState, setConnectionState] = useState<
    "connected" | "disconnected" | "error"
  >("connected");
  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const [updateShiftCell] = useUpdateShiftCellMutation();
  const [createShiftRequest] = useCreateShiftRequestMutation();
  const [batchUpdateShiftCells] = useBatchUpdateShiftCellsMutation();

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

  const buildShiftErrorMessage = useCallback((err: unknown) => {
    const fallback = "シフトデータの処理に失敗しました";

    if (!err || typeof err !== "object") {
      return { message: fallback, connection: "error" as const };
    }

    const baseMessage =
      "message" in err && typeof err.message === "string"
        ? err.message
        : fallback;

    const details =
      "details" in err && err.details
        ? (err.details as GraphQLBaseQueryError["details"])
        : undefined;

    const normalizedMessage = baseMessage.toLowerCase();
    const isUnauthorized =
      normalizedMessage.includes("unauthorized") ||
      normalizedMessage.includes("not authorized") ||
      normalizedMessage.includes("forbidden");
    const isValidation =
      normalizedMessage.includes("validation") ||
      normalizedMessage.includes("invalid");
    const isNetwork =
      normalizedMessage.includes("network") ||
      normalizedMessage.includes("timeout") ||
      (typeof details === "object" && details && "statusCode" in details);

    if (isUnauthorized) {
      return { message: "権限がありません。", connection: "error" as const };
    }

    if (isValidation) {
      return {
        message: "入力内容に誤りがあります。",
        connection: "error" as const,
      };
    }

    if (isNetwork) {
      return {
        message: "ネットワークエラーが発生しました。",
        connection: "disconnected" as const,
      };
    }

    return { message: baseMessage, connection: "error" as const };
  }, []);

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
  }, [fetchError, buildShiftErrorMessage]);

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
      console.error("Failed to fetch shifts:", err);
      const { message, connection } = buildShiftErrorMessage(err);
      setConnectionState(connection);
      setError(message);
    }
  }, [shouldSkipFetch, buildShiftErrorMessage]);

  const persistShiftUpdate = useCallback(
    async (update: ShiftCellUpdate, currentMap: ShiftDataMap) => {
      if (!targetMonth) {
        throw new Error("Target month is required");
      }

      const shiftRequest = shiftRequestsRef.current.get(update.staffId);
      if (!shiftRequest) {
        const staffData = currentMap.get(update.staffId) ?? new Map();
        const entries = Array.from(staffData.entries())
          .map(([dayKey, cell]): ShiftRequestDayPreferenceInput | null => {
            const status = shiftStateToShiftRequestStatus(cell.state);
            if (!status) return null;
            return {
              date: dayjs(`${targetMonth}-${dayKey}`).format("YYYY-MM-DD"),
              status,
              isLocked: cell.isLocked || undefined,
            };
          })
          .filter(
            (entry): entry is ShiftRequestDayPreferenceInput => entry !== null,
          )
          .toSorted((a, b) => a.date.localeCompare(b.date));

        const created = await createShiftRequest({
          input: {
            staffId: update.staffId,
            targetMonth,
            entries,
            updatedBy: currentUserId,
            updatedAt: new Date().toISOString(),
          },
        }).unwrap();

        updateShiftRequestState(normalizeShiftRequest(created));
        return created;
      }

      const payload = transformShiftCellUpdateToGraphQLInput({
        shiftRequest,
        shiftDataMap: currentMap,
        targetMonth,
        updatedBy: currentUserId,
      });

      const updated = await updateShiftCell(payload).unwrap();
      updateShiftRequestState(normalizeShiftRequest(updated));

      return updated;
    },
    [
      currentUserId,
      targetMonth,
      updateShiftCell,
      createShiftRequest,
      updateShiftRequestState,
    ],
  );

  /**
   * シフトを更新
   */
  const updateShift = useCallback(
    async (update: ShiftCellUpdate) => {
      const key = `${update.staffId}-${update.date}`;

      // 先に nextMap を計算してから State に設定
      setShiftDataMap((prev) => {
        const nextMap = applyShiftCellUpdateToMap({
          shiftDataMap: prev,
          update,
          currentUserId,
        });

        // 保留中の変更として記録
        pendingChangesRef.current.set(key, update);

        // 非同期でデータ永続化を実行
        persistShiftUpdate(update, nextMap)
          .then(() => {
            // 成功時に保留中の変更から削除
            pendingChangesRef.current.delete(key);
            setError(null);
            setConnectionState("connected");
          })
          .catch((err) => {
            console.error("Failed to update shift:", err);
            const { message, connection } = buildShiftErrorMessage(err);
            setError(message);
            setConnectionState(connection);
          });

        return nextMap;
      });
    },
    [currentUserId, persistShiftUpdate, buildShiftErrorMessage],
  );

  /**
   * バッチ更新
   */
  const batchUpdateShifts = useCallback(
    async (updates: ShiftCellUpdate[]) => {
      if (!targetMonth || updates.length === 0) {
        return;
      }

      setIsBatchUpdating(true);

      try {
        const nextMap = updates.reduce(
          (map, update) =>
            applyShiftCellUpdateToMap({
              shiftDataMap: map,
              update,
              currentUserId,
            }),
          shiftDataMap,
        );

        setShiftDataMap(nextMap);
        updates.forEach((update) => {
          const key = `${update.staffId}-${update.date}`;
          pendingChangesRef.current.set(key, update);
        });

        const updatesByStaff = new Map<string, ShiftCellUpdate[]>();
        updates.forEach((update) => {
          const list = updatesByStaff.get(update.staffId) ?? [];
          list.push(update);
          updatesByStaff.set(update.staffId, list);
        });

        const missingStaffIds = Array.from(updatesByStaff.keys()).filter(
          (staffId) => !shiftRequestsRef.current.get(staffId),
        );

        if (missingStaffIds.length > 0) {
          await Promise.all(
            missingStaffIds.map(async (staffId) => {
              const staffData = nextMap.get(staffId) ?? new Map();
              const entries = Array.from(staffData.entries())
                .map(
                  ([dayKey, cell]): ShiftRequestDayPreferenceInput | null => {
                    const status = shiftStateToShiftRequestStatus(cell.state);
                    if (!status) return null;
                    return {
                      date: dayjs(`${targetMonth}-${dayKey}`).format(
                        "YYYY-MM-DD",
                      ),
                      status,
                      isLocked: cell.isLocked || undefined,
                    };
                  },
                )
                .filter(
                  (entry): entry is ShiftRequestDayPreferenceInput =>
                    entry !== null,
                )
                .toSorted((a, b) => a.date.localeCompare(b.date));

              const created = await createShiftRequest({
                input: {
                  staffId,
                  targetMonth,
                  entries,
                  updatedBy: currentUserId,
                  updatedAt: new Date().toISOString(),
                },
              }).unwrap();

              updateShiftRequestState(normalizeShiftRequest(created));

              const staffUpdates = updatesByStaff.get(staffId) ?? [];
              staffUpdates.forEach((update) => {
                const key = `${update.staffId}-${update.date}`;
                pendingChangesRef.current.delete(key);
              });
            }),
          );
        }

        const payloads = Array.from(updatesByStaff.keys())
          .filter((staffId) => !missingStaffIds.includes(staffId))
          .map((staffId) => {
            const shiftRequest = shiftRequestsRef.current.get(staffId);
            if (!shiftRequest) {
              return null;
            }

            return transformShiftCellUpdateToGraphQLInput({
              shiftRequest,
              shiftDataMap: nextMap,
              targetMonth,
              updatedBy: currentUserId,
            });
          })
          .filter((payload): payload is NonNullable<typeof payload> =>
            Boolean(payload),
          );

        if (payloads.length === 0) {
          setIsBatchUpdating(false);
          return;
        }

        const result = await batchUpdateShiftCells({
          updates: payloads,
        }).unwrap();

        result.updatedRequests.forEach((request) => {
          const normalized = normalizeShiftRequest(request);
          updateShiftRequestState(normalized);
        });

        updates.forEach((update) => {
          const key = `${update.staffId}-${update.date}`;
          pendingChangesRef.current.delete(key);
        });

        if (result.errors.length > 0) {
          setError("一部の更新に失敗しました。再試行してください。");
        } else {
          setError(null);
        }
      } catch (err) {
        console.error("Batch update failed:", err);
        const { message, connection } = buildShiftErrorMessage(err);
        setError(message);
        setConnectionState(connection);
      } finally {
        setIsBatchUpdating(false);
      }
    },
    [
      targetMonth,
      shiftDataMap,
      currentUserId,
      batchUpdateShiftCells,
      createShiftRequest,
      updateShiftRequestState,
      buildShiftErrorMessage,
    ],
  );

  const retryPendingChanges = useCallback(async () => {
    const pendingUpdates = Array.from(pendingChangesRef.current.values());
    await batchUpdateShifts(pendingUpdates);
  }, [batchUpdateShifts]);

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
  };
};
