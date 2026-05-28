import {
  useCreateShiftRequestMutation,
  useUpdateShiftCellMutation,
} from "@entities/shift/api/shiftApi";
import { createLogger } from "@shared/lib/logger";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
} from "react";

import { buildShiftErrorMessage } from "../lib/shiftErrorMessages";
import {
  applyShiftCellUpdateToMap,
  buildShiftRequestEntries,
  normalizeShiftRequest,
  transformShiftCellUpdateToGraphQLInput,
} from "../lib/shiftTransformers";
import {
  PendingChangesMap,
  ShiftCellUpdate,
  ShiftDataMap,
  ShiftRequestData,
} from "../types/collaborative.types";
import { useShiftBatchUpdate } from "./useShiftBatchUpdate";

const logger = createLogger("ShiftPersist");

interface UseShiftPersistProps {
  targetMonth: string | undefined;
  currentUserId: string;
  shiftDataMap: ShiftDataMap;
  setShiftDataMap: Dispatch<SetStateAction<ShiftDataMap>>;
  shiftRequestsRef: MutableRefObject<Map<string, ShiftRequestData>>;
  pendingChangesRef: MutableRefObject<PendingChangesMap>;
  setConnectionState: Dispatch<
    SetStateAction<"connected" | "disconnected" | "error">
  >;
  updateShiftRequestState: (request: ShiftRequestData) => void;
  onSaveStartedRef: MutableRefObject<(() => void) | undefined>;
  onSaveCompletedRef: MutableRefObject<(() => void) | undefined>;
  onSaveFailedRef: MutableRefObject<((error: string) => void) | undefined>;
  onPersistCompletedRef: MutableRefObject<
    ((request: ShiftRequestData) => void) | undefined
  >;
}

interface UseShiftPersistResult {
  isBatchUpdating: boolean;
  updateShift: (update: ShiftCellUpdate) => Promise<void>;
  batchUpdateShifts: (updates: ShiftCellUpdate[]) => Promise<void>;
  retryPendingChanges: () => Promise<void>;
}

/**
 * シフトの単体保存・バッチ保存・ペンディング再試行を管理するフック。
 * 楽観的更新とロールバックを担う。
 */
export const useShiftPersist = ({
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
}: UseShiftPersistProps): UseShiftPersistResult => {
  const [updateShiftCell] = useUpdateShiftCellMutation();
  const [createShiftRequest] = useCreateShiftRequestMutation();

  const createShiftRequestForStaff = useCallback(
    async (staffId: string, map: ShiftDataMap) => {
      if (!targetMonth) throw new Error("Target month is required");

      const staffData = map.get(staffId) ?? new Map();
      const entries = buildShiftRequestEntries(staffData, targetMonth);
      const timestamp = new Date().toISOString();

      const created = await createShiftRequest({
        input: {
          staffId,
          targetMonth,
          entries,
          updatedBy: currentUserId,
          updatedAt: timestamp,
          histories: [
            {
              version: 1,
              entries,
              recordedAt: timestamp,
              recordedByStaffId: currentUserId,
            },
          ],
        },
      }).unwrap();

      const normalized = normalizeShiftRequest(created);
      updateShiftRequestState(normalized);
      onPersistCompletedRef.current?.(normalized);
      return created;
    },
    [
      targetMonth,
      currentUserId,
      createShiftRequest,
      updateShiftRequestState,
      onPersistCompletedRef,
    ],
  );

  const persistShiftUpdate = useCallback(
    async (update: ShiftCellUpdate, currentMap: ShiftDataMap) => {
      if (!targetMonth) throw new Error("Target month is required");

      const shiftRequest = shiftRequestsRef.current.get(update.staffId);
      if (!shiftRequest) {
        return createShiftRequestForStaff(update.staffId, currentMap);
      }

      const payload = transformShiftCellUpdateToGraphQLInput({
        shiftRequest,
        shiftDataMap: currentMap,
        targetMonth,
        updatedBy: currentUserId,
      });

      const updated = await updateShiftCell(payload).unwrap();
      const normalized = normalizeShiftRequest(updated);
      updateShiftRequestState(normalized);
      onPersistCompletedRef.current?.(normalized);
      return updated;
    },
    [
      currentUserId,
      targetMonth,
      updateShiftCell,
      updateShiftRequestState,
      createShiftRequestForStaff,
      shiftRequestsRef,
      onPersistCompletedRef,
    ],
  );

  const updateShift = useCallback(
    async (update: ShiftCellUpdate) => {
      const key = `${update.staffId}-${update.date}`;
      onSaveStartedRef.current?.();

      const prevMap = shiftDataMap;
      const nextMap = applyShiftCellUpdateToMap({
        shiftDataMap: prevMap,
        update,
        currentUserId,
      });

      pendingChangesRef.current.set(key, update);
      setShiftDataMap(nextMap);

      persistShiftUpdate(update, nextMap)
        .then(() => {
          pendingChangesRef.current.delete(key);
          setConnectionState("connected");
          onSaveCompletedRef.current?.();
        })
        .catch((err) => {
          logger.error("Failed to update shift:", err);
          pendingChangesRef.current.delete(key);
          setShiftDataMap(prevMap);
          const { message, connection } = buildShiftErrorMessage(err);
          setConnectionState(connection);
          onSaveFailedRef.current?.(message);
        });
    },
    [
      currentUserId,
      persistShiftUpdate,
      shiftDataMap,
      pendingChangesRef,
      setShiftDataMap,
      setConnectionState,
      onSaveStartedRef,
      onSaveCompletedRef,
      onSaveFailedRef,
    ],
  );

  const { isBatchUpdating, batchUpdateShifts, retryPendingChanges } =
    useShiftBatchUpdate({
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

  return { isBatchUpdating, updateShift, batchUpdateShifts, retryPendingChanges };
};
