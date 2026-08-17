import { createLogger } from "@shared/lib/logger";
import { useAppNotification } from "@shared/lib/useAppNotification";
import { useAutoSave } from "@shared/lib/useAutoSave";
import React from "react";

import type { ShiftState } from "../lib/generateMockShifts";

const logger = createLogger("ShiftManagementBoard");

type NotifyFn = ReturnType<typeof useAppNotification>["notify"];

type UseShiftAutoSaveStateParams = {
  scenario: string;
  isAuthenticated: boolean;
  pendingChangesRef: React.MutableRefObject<
    Map<string, Map<string, ShiftState>>
  >;
  persistShiftRequestChanges: (
    staffId: string,
    dayKeys: string[],
    nextState: ShiftState,
  ) => Promise<void>;
  notify: NotifyFn;
  setMockShifts: React.Dispatch<
    React.SetStateAction<Map<string, Record<string, ShiftState>>>
  >;
};

export function useShiftAutoSaveState({
  scenario,
  isAuthenticated,
  pendingChangesRef,
  persistShiftRequestChanges,
  notify,
  setMockShifts,
}: UseShiftAutoSaveStateParams) {
  const [autoSaveCounter, setAutoSaveCounter] = React.useState(0);

  const recordShiftChange = React.useCallback(
    (staffId: string, dayKey: string, state: ShiftState) => {
      if (scenario !== "actual") return;

      if (!pendingChangesRef.current.has(staffId)) {
        pendingChangesRef.current.set(staffId, new Map());
      }
      pendingChangesRef.current.get(staffId)!.set(dayKey, state);
      setAutoSaveCounter((prev) => prev + 1);
    },
    [pendingChangesRef, scenario],
  );

  const applyShiftState = React.useCallback(
    async (staffIds: string[], dayKeys: string[], nextState: ShiftState) => {
      if (!staffIds.length || !dayKeys.length) return;

      if (scenario === "actual") {
        staffIds.forEach((staffId) => {
          dayKeys.forEach((dayKey) => {
            recordShiftChange(staffId, dayKey, nextState);
          });
        });
        return;
      }

      setMockShifts((prev) => {
        const next = new Map(prev);
        staffIds.forEach((staffId) => {
          const per = { ...(next.get(staffId) || {}) };
          dayKeys.forEach((key) => {
            per[key] = nextState;
          });
          next.set(staffId, per);
        });
        return next;
      });
    },
    [recordShiftChange, scenario, setMockShifts],
  );

  const { isSaving, isPending, lastSavedAt, lastChangedAt } = useAutoSave({
    saveFn: async () => {
      if (scenario !== "actual") return;

      const changes = pendingChangesRef.current;
      if (changes.size === 0) return;

      const changesToSave = new Map(changes);
      pendingChangesRef.current = new Map();

      const promises: Promise<void>[] = [];
      changesToSave.forEach((dayChanges, staffId) => {
        dayChanges.forEach((state, dayKey) => {
          promises.push(persistShiftRequestChanges(staffId, [dayKey], state));
        });
      });

      if (promises.length > 0) {
        await Promise.all(promises);
      }
    },
    data: autoSaveCounter,
    enabled: scenario === "actual" && isAuthenticated,
    delay: 2000,
    onSaveSuccess: () => {
      notify({
        title: "シフトを自動保存しました",
        tone: "success",
        dedupeKey: "shift-autosave-success",
      });
    },
    onSaveError: (error) => {
      logger.error("Auto-save error:", error);
      notify({
        title: "エラー",
        description: "シフトの自動保存に失敗しました",
        tone: "error",
        dedupeKey: "shift-autosave-error",
      });
    },
  });

  return {
    applyShiftState,
    isSaving,
    isPending,
    lastSavedAt,
    lastChangedAt,
  };
}
