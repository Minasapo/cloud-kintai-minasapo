import { createLogger } from "@shared/lib/logger";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  executeAcquireEditLock,
  executeDeleteLock,
  executeRenewLock,
  fetchCurrentEditLocks,
} from "../lib/lockApi";
import type { ShiftEditLockMap } from "../lib/lockUtils";
import {
  isActiveLock,
  toCellKey,
  toEditingCellsMap,
  toEditingMapEntry,
} from "../lib/lockUtils";
import type {
  CollaborativeUser,
  EditLockAcquireResult,
  ShiftEditLockData,
} from "../types/collaborative.types";
import {
  useEditLockCleanup,
  useEditLockRenewal,
  useEditLockSubscriptions,
} from "./useEditLockInternals";

export type { ShiftEditLockMap };

const logger = createLogger("ShiftEditLocks");

export interface UseLockManagementProps {
  currentUserId: string;
  currentUserName: string;
  targetMonth?: string;
}

export const useLockManagement = ({
  currentUserId,
  currentUserName,
  targetMonth,
}: UseLockManagementProps) => {
  const [editingCells, setEditingCells] = useState<ShiftEditLockMap>(new Map());
  const editingCellsRef = useRef(editingCells);

  useEffect(() => {
    editingCellsRef.current = editingCells;
  }, [editingCells]);

  const upsertLock = useCallback(
    (lock: ShiftEditLockData) => {
      if (!targetMonth || lock.targetMonth !== targetMonth) {
        return;
      }

      setEditingCells((prev) => {
        const next = new Map(prev);
        if (!isActiveLock(lock)) {
          next.delete(toCellKey(lock.staffId, lock.date));
          return next;
        }

        next.set(toCellKey(lock.staffId, lock.date), toEditingMapEntry(lock));
        return next;
      });
    },
    [targetMonth],
  );

  const removeLock = useCallback((staffId: string, date: string) => {
    setEditingCells((prev) => {
      const cellKey = toCellKey(staffId, date);
      if (!prev.has(cellKey)) {
        return prev;
      }

      const next = new Map(prev);
      next.delete(cellKey);
      return next;
    });
  }, []);

  const refreshLocks = useCallback(async () => {
    if (!targetMonth) {
      return [];
    }

    const collected = await fetchCurrentEditLocks(targetMonth);
    setEditingCells(toEditingCellsMap(collected));
    return collected;
  }, [targetMonth]);

  useEffect(() => {
    if (!targetMonth) {
      return;
    }

    let active = true;

    void fetchCurrentEditLocks(targetMonth)
      .then((collected) => {
        if (active) {
          setEditingCells(toEditingCellsMap(collected));
        }
      })
      .catch((error) => {
        logger.error("Failed to refresh shift edit locks:", error);
      });

    return () => {
      active = false;
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setEditingCells(new Map());
    };
  }, [targetMonth]);

  useEditLockCleanup({ setEditingCells });
  useEditLockSubscriptions({ targetMonth, upsertLock, removeLock });

  const renewLock = useCallback(
    (lock: ShiftEditLockData) =>
      executeRenewLock({ lock, currentUserId, currentUserName, upsertLock }),
    [currentUserId, currentUserName, upsertLock],
  );

  useEditLockRenewal({ currentUserId, editingCellsRef, renewLock });

  const acquireEditLock = useCallback(
    async (staffId: string, date: string): Promise<EditLockAcquireResult> => {
      if (!targetMonth) {
        return { acquired: false };
      }

      return executeAcquireEditLock({
        targetMonth,
        staffId,
        date,
        currentUserId,
        currentUserName,
        upsertLock,
      });
    },
    [currentUserId, currentUserName, targetMonth, upsertLock],
  );

  const releaseEditLock = useCallback(
    (staffId: string, date: string) =>
      executeDeleteLock(targetMonth, staffId, date, currentUserId, removeLock),
    [currentUserId, removeLock, targetMonth],
  );

  const forceReleaseLock = useCallback(
    (staffId: string, date: string) =>
      executeDeleteLock(targetMonth, staffId, date, null, removeLock, {
        skipFetch: true,
      }),
    [removeLock, targetMonth],
  );

  const isCellBeingEdited = useCallback(
    (staffId: string, date: string) => {
      const editor = editingCells.get(toCellKey(staffId, date));
      return Boolean(
        editor &&
        editor.userId !== currentUserId &&
        editor.expiresAt > Date.now(),
      );
    },
    [currentUserId, editingCells],
  );

  const hasEditLock = useCallback(
    (staffId: string, date: string) => {
      const editor = editingCells.get(toCellKey(staffId, date));
      return Boolean(
        editor &&
        editor.userId === currentUserId &&
        editor.expiresAt > Date.now(),
      );
    },
    [currentUserId, editingCells],
  );

  const getCellEditor = useCallback(
    (staffId: string, date: string): CollaborativeUser | undefined => {
      const editor = editingCells.get(toCellKey(staffId, date));
      if (!editor || editor.expiresAt <= Date.now()) {
        return undefined;
      }

      return {
        userId: editor.userId,
        userName: editor.userName,
        color:
          editor.userId === currentUserId
            ? "rgb(33 150 243)"
            : "rgb(76 175 80)",
        lastActivity: editor.startTime,
      };
    },
    [currentUserId, editingCells],
  );

  const getAllEditingCells = useCallback(
    () =>
      Array.from(editingCells.entries())
        .filter(([, editor]) => editor.expiresAt > Date.now())
        .map(([cellKey, editor]) => {
          const [staffId, date] = cellKey.split("_");
          return {
            cellKey,
            staffId,
            date,
            userId: editor.userId,
            userName: editor.userName,
            startTime: editor.startTime,
          };
        }),
    [editingCells],
  );

  return {
    editingCells,
    acquireEditLock,
    releaseEditLock,
    forceReleaseLock,
    refreshLocks,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    getAllEditingCells,
  };
};
