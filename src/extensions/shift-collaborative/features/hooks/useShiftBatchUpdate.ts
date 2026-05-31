import {
  useBatchUpdateShiftCellsMutation,
  useCreateShiftRequestMutation,
} from "@entities/shift/api/shiftApi";
import { createLogger } from "@shared/lib/logger";
import {
  Dispatch,
  MutableRefObject,
  SetStateAction,
  useCallback,
  useState,
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
  ShiftCellData,
  ShiftCellUpdate,
  ShiftDataMap,
  ShiftRequestData,
} from "../types/collaborative.types";

const logger = createLogger("ShiftBatchUpdate");

interface UseShiftBatchUpdateProps {
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

interface UseShiftBatchUpdateResult {
  isBatchUpdating: boolean;
  batchUpdateShifts: (updates: ShiftCellUpdate[]) => Promise<void>;
  retryPendingChanges: () => Promise<void>;
}

function groupUpdatesByStaff(
  updates: ShiftCellUpdate[],
): Map<string, ShiftCellUpdate[]> {
  const byStaff = new Map<string, ShiftCellUpdate[]>();
  updates.forEach((update) => {
    const list = byStaff.get(update.staffId) ?? [];
    list.push(update);
    byStaff.set(update.staffId, list);
  });
  return byStaff;
}

function buildBatchPayloads(
  updatesByStaff: Map<string, ShiftCellUpdate[]>,
  missingStaffIds: string[],
  shiftRequests: Map<string, ShiftRequestData>,
  shiftDataMap: ShiftDataMap,
  targetMonth: string,
  updatedBy: string,
) {
  return Array.from(updatesByStaff.keys())
    .filter((staffId) => !missingStaffIds.includes(staffId))
    .map((staffId) => {
      const shiftRequest = shiftRequests.get(staffId);
      if (!shiftRequest) return null;
      return transformShiftCellUpdateToGraphQLInput({
        shiftRequest,
        shiftDataMap,
        targetMonth,
        updatedBy,
      });
    })
    .filter(
      (payload): payload is NonNullable<typeof payload> => Boolean(payload),
    );
}

/**
 * シフトのバッチ更新・ペンディング変更の再試行を管理するフック。
 */
export const useShiftBatchUpdate = ({
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
}: UseShiftBatchUpdateProps): UseShiftBatchUpdateResult => {
  const [createShiftRequest] = useCreateShiftRequestMutation();
  const [batchUpdateShiftCells] = useBatchUpdateShiftCellsMutation();

  const [isBatchUpdating, setIsBatchUpdating] = useState(false);

  const createShiftRequestForBatch = useCallback(
    async (staffId: string, map: ShiftDataMap) => {
      if (!targetMonth) throw new Error("Target month is required");

      const staffData = map.get(staffId) ?? new Map<string, ShiftCellData>();
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

  const batchUpdateShifts = useCallback(
    async (updates: ShiftCellUpdate[]) => {
      if (!targetMonth || updates.length === 0) return;

      setIsBatchUpdating(true);
      onSaveStartedRef.current?.();

      const prevMap = shiftDataMap;

      try {
        const nextMap = updates.reduce(
          (map, update) =>
            applyShiftCellUpdateToMap({ shiftDataMap: map, update, currentUserId }),
          shiftDataMap,
        );

        setShiftDataMap(nextMap);
        updates.forEach((update) => {
          pendingChangesRef.current.set(`${update.staffId}-${update.date}`, update);
        });

        const updatesByStaff = groupUpdatesByStaff(updates);
        const missingStaffIds = Array.from(updatesByStaff.keys()).filter(
          (staffId) => !shiftRequestsRef.current.get(staffId),
        );

        if (missingStaffIds.length > 0) {
          await Promise.all(
            missingStaffIds.map(async (staffId) => {
              await createShiftRequestForBatch(staffId, nextMap);
              (updatesByStaff.get(staffId) ?? []).forEach((update) => {
                pendingChangesRef.current.delete(`${update.staffId}-${update.date}`);
              });
            }),
          );
        }

        const payloads = buildBatchPayloads(
          updatesByStaff,
          missingStaffIds,
          shiftRequestsRef.current,
          nextMap,
          targetMonth,
          currentUserId,
        );

        if (payloads.length === 0) {
          setIsBatchUpdating(false);
          return;
        }

        const result = await batchUpdateShiftCells({ updates: payloads }).unwrap();

        result.updatedRequests.forEach((request) => {
          const normalized = normalizeShiftRequest(request);
          updateShiftRequestState(normalized);
          onPersistCompletedRef.current?.(normalized);
        });

        updates.forEach((update) => {
          pendingChangesRef.current.delete(`${update.staffId}-${update.date}`);
        });

        if (result.errors.length > 0) {
          onSaveFailedRef.current?.("一部の更新に失敗しました。再試行してください。");
        } else {
          onSaveCompletedRef.current?.();
        }
      } catch (err) {
        logger.error("Batch update failed:", err);
        setShiftDataMap(prevMap);
        updates.forEach((update) => {
          pendingChangesRef.current.delete(`${update.staffId}-${update.date}`);
        });
        const { message, connection } = buildShiftErrorMessage(err);
        setConnectionState(connection);
        onSaveFailedRef.current?.(message);
      } finally {
        setIsBatchUpdating(false);
      }
    },
    [
      targetMonth,
      currentUserId,
      shiftDataMap,
      batchUpdateShiftCells,
      createShiftRequestForBatch,
      shiftRequestsRef,
      pendingChangesRef,
      setShiftDataMap,
      setConnectionState,
      updateShiftRequestState,
      onSaveStartedRef,
      onSaveCompletedRef,
      onSaveFailedRef,
      onPersistCompletedRef,
    ],
  );

  const retryPendingChanges = useCallback(async () => {
    const pendingUpdates = Array.from(pendingChangesRef.current.values());
    await batchUpdateShifts(pendingUpdates);
  }, [batchUpdateShifts, pendingChangesRef]);

  return { isBatchUpdating, batchUpdateShifts, retryPendingChanges };
};
