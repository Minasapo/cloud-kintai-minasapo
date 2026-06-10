import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  onCreateShiftEditLock,
  onDeleteShiftEditLock,
  onUpdateShiftEditLock,
} from "@shared/api/graphql/documents/shiftEditLock";
import { createLogger } from "@shared/lib/logger";
import { useEffect } from "react";

import type { ShiftEditLockItemResponse } from "../lib/lockApi";
import type { ShiftEditLockMap } from "../lib/lockUtils";
import {
  EDIT_LOCK_CLEANUP_INTERVAL_MS,
  EDIT_LOCK_REFRESH_INTERVAL_MS,
} from "../lib/lockUtils";
import type { ShiftEditLockData } from "../types/collaborative.types";

const logger = createLogger("ShiftEditLocks");

export const useEditLockCleanup = ({
  setEditingCells,
}: {
  setEditingCells: React.Dispatch<React.SetStateAction<ShiftEditLockMap>>;
}) => {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      const now = Date.now();
      setEditingCells((prev) => {
        const next = new Map(prev);
        let changed = false;

        next.forEach((lock, cellKey) => {
          if (lock.expiresAt <= now) {
            next.delete(cellKey);
            changed = true;
          }
        });

        return changed ? next : prev;
      });
    }, EDIT_LOCK_CLEANUP_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [setEditingCells]);
};

export const useEditLockSubscriptions = ({
  targetMonth,
  upsertLock,
  removeLock,
}: {
  targetMonth?: string;
  upsertLock: (lock: ShiftEditLockData) => void;
  removeLock: (staffId: string, date: string) => void;
}) => {
  useEffect(() => {
    if (!targetMonth) {
      return;
    }

    const variables = { filter: { targetMonth: { eq: targetMonth } } };

    const createSubscription = (
      graphqlClient.graphql({
        query: onCreateShiftEditLock,
        variables,
        authMode: "userPool",
      }) as {
        subscribe: (handlers: {
          next: (value: { data?: ShiftEditLockItemResponse }) => void;
          error: (error: unknown) => void;
        }) => { unsubscribe: () => void };
      }
    ).subscribe({
      next: ({ data }: { data?: ShiftEditLockItemResponse }) => {
        const lock = data?.onCreateShiftEditLock;
        if (lock) {
          upsertLock(lock);
        }
      },
      error: (error: unknown) => {
        logger.error("Failed to subscribe create shift edit lock:", error);
      },
    });

    const updateSubscription = (
      graphqlClient.graphql({
        query: onUpdateShiftEditLock,
        variables,
        authMode: "userPool",
      }) as {
        subscribe: (handlers: {
          next: (value: { data?: ShiftEditLockItemResponse }) => void;
          error: (error: unknown) => void;
        }) => { unsubscribe: () => void };
      }
    ).subscribe({
      next: ({ data }: { data?: ShiftEditLockItemResponse }) => {
        const lock = data?.onUpdateShiftEditLock;
        if (lock) {
          upsertLock(lock);
        }
      },
      error: (error: unknown) => {
        logger.error("Failed to subscribe update shift edit lock:", error);
      },
    });

    const deleteSubscription = (
      graphqlClient.graphql({
        query: onDeleteShiftEditLock,
        variables,
        authMode: "userPool",
      }) as {
        subscribe: (handlers: {
          next: (value: { data?: ShiftEditLockItemResponse }) => void;
          error: (error: unknown) => void;
        }) => { unsubscribe: () => void };
      }
    ).subscribe({
      next: ({ data }: { data?: ShiftEditLockItemResponse }) => {
        const lock = data?.onDeleteShiftEditLock;
        if (lock) {
          removeLock(lock.staffId, lock.date);
        }
      },
      error: (error: unknown) => {
        logger.error("Failed to subscribe delete shift edit lock:", error);
      },
    });

    return () => {
      createSubscription.unsubscribe();
      updateSubscription.unsubscribe();
      deleteSubscription.unsubscribe();
    };
  }, [removeLock, targetMonth, upsertLock]);
};

export const useEditLockRenewal = ({
  currentUserId,
  editingCellsRef,
  renewLock,
}: {
  currentUserId: string;
  editingCellsRef: React.MutableRefObject<ShiftEditLockMap>;
  renewLock: (lock: ShiftEditLockData) => Promise<void>;
}) => {
  useEffect(() => {
    const intervalId = window.setInterval(() => {
      Array.from(editingCellsRef.current.values())
        .filter(
          (lock) => lock.userId === currentUserId && lock.expiresAt > Date.now(),
        )
        .forEach((lock) => {
          const [lockTargetMonth, staffId, date] = lock.id.split("#");
          void renewLock({
            id: lock.id,
            targetMonth: lockTargetMonth,
            staffId,
            date,
            holderUserId: lock.userId,
            holderUserName: lock.userName,
            acquiredAt: new Date(lock.startTime).toISOString(),
            expiresAt: new Date(lock.expiresAt).toISOString(),
            version: lock.version,
          }).catch((error) => {
            logger.error("Failed to renew shift edit lock:", error);
          });
        });
    }, EDIT_LOCK_REFRESH_INTERVAL_MS);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [currentUserId, editingCellsRef, renewLock]);
};