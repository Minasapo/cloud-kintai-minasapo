import { graphqlClient } from "@shared/api/amplify/graphqlClient";
import {
  createShiftEditLock,
  deleteShiftEditLock,
  getShiftEditLock,
  listShiftEditLocks,
  updateShiftEditLock,
} from "@shared/api/graphql/documents/shiftEditLock";
import { GraphQLResult } from "aws-amplify/api";

import type {
  EditLockAcquireResult,
  ShiftEditLockData,
} from "../types/collaborative.types";
import {
  EDIT_LOCK_TTL_MS,
  isActiveLock,
  normalizeErrorMessage,
  normalizeLockDateKey,
  toLockId,
} from "./lockUtils";

type ShiftEditLockListResponse = {
  listShiftEditLocks?: {
    items?: Array<ShiftEditLockData | null> | null;
    nextToken?: string | null;
  } | null;
};

/**
 * GraphQL レスポンス型（サブスクリプション含む）
 * useEditLockInternals.ts でも参照する
 */
export type ShiftEditLockItemResponse = {
  getShiftEditLock?: ShiftEditLockData | null;
  createShiftEditLock?: ShiftEditLockData | null;
  updateShiftEditLock?: ShiftEditLockData | null;
  deleteShiftEditLock?: ShiftEditLockData | null;
  onCreateShiftEditLock?: ShiftEditLockData | null;
  onUpdateShiftEditLock?: ShiftEditLockData | null;
  onDeleteShiftEditLock?: ShiftEditLockData | null;
};

export const fetchEditLockById = async (
  id: string,
): Promise<ShiftEditLockData | null> => {
  const result = (await graphqlClient.graphql({
    query: getShiftEditLock,
    variables: { id },
    authMode: "userPool",
  })) as GraphQLResult<ShiftEditLockItemResponse>;

  const lock = result.data?.getShiftEditLock ?? null;
  return lock && isActiveLock(lock) ? lock : null;
};

export const fetchCurrentEditLocks = async (
  targetMonthValue: string,
): Promise<ShiftEditLockData[]> => {
  const collected: ShiftEditLockData[] = [];
  let nextToken: string | null | undefined = null;

  do {
    const result = (await graphqlClient.graphql({
      query: listShiftEditLocks,
      variables: {
        filter: { targetMonth: { eq: targetMonthValue } },
        limit: 200,
        nextToken,
      },
      authMode: "userPool",
    })) as GraphQLResult<ShiftEditLockListResponse>;

    const connection = result.data?.listShiftEditLocks;
    connection?.items
      ?.filter((item): item is ShiftEditLockData => Boolean(item))
      .filter((item) => isActiveLock(item))
      .forEach((item) => {
        collected.push(item);
      });

    nextToken = connection?.nextToken;
  } while (nextToken);

  return collected;
};

const buildEditLockInput = ({
  id,
  targetMonth,
  staffId,
  date,
  holderUserId,
  holderUserName,
  acquiredAt,
  expiresAt,
}: {
  id: string;
  targetMonth: string;
  staffId: string;
  date: string;
  holderUserId: string;
  holderUserName: string;
  acquiredAt: string;
  expiresAt: string;
}) => ({
  id,
  targetMonth,
  staffId,
  date,
  holderUserId,
  holderUserName,
  acquiredAt,
  expiresAt,
});

export const executeAcquireEditLock = async ({
  targetMonth,
  staffId,
  date,
  currentUserId,
  currentUserName,
  upsertLock,
}: {
  targetMonth: string;
  staffId: string;
  date: string;
  currentUserId: string;
  currentUserName: string;
  upsertLock: (lock: ShiftEditLockData) => void;
}): Promise<EditLockAcquireResult> => {
  const id = toLockId(targetMonth, staffId, date);
  const now = new Date();
  const baseInput = buildEditLockInput({
    id,
    targetMonth,
    staffId,
    date,
    holderUserId: currentUserId,
    holderUserName: currentUserName,
    acquiredAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + EDIT_LOCK_TTL_MS).toISOString(),
  });

  const findConflictFromMonthLocks =
    async (): Promise<ShiftEditLockData | null> => {
      try {
        const monthLocks = await fetchCurrentEditLocks(targetMonth);
        return (
          monthLocks.find(
            (lock) =>
              lock.staffId === staffId &&
              normalizeLockDateKey(lock.date) === normalizeLockDateKey(date) &&
              lock.holderUserId !== currentUserId,
          ) ?? null
        );
      } catch {
        return null;
      }
    };

  const buildFailureReason = (phase: string, detail: string) =>
    `phase=${phase}; lockId=${id}; detail=${detail}`;

  const tryPersistLock = async (currentLock: ShiftEditLockData | null) => {
    if (!currentLock) {
      const result = (await graphqlClient.graphql({
        query: createShiftEditLock,
        variables: { input: { ...baseInput, version: 1 } },
        authMode: "userPool",
      })) as GraphQLResult<ShiftEditLockItemResponse>;
      return result.data?.createShiftEditLock ?? null;
    }

    const result = (await graphqlClient.graphql({
      query: updateShiftEditLock,
      variables: {
        input: { ...baseInput, version: currentLock.version + 1 },
        condition: { version: { eq: currentLock.version } },
      },
      authMode: "userPool",
    })) as GraphQLResult<ShiftEditLockItemResponse>;

    return result.data?.updateShiftEditLock ?? null;
  };

  let existingLock: ShiftEditLockData | null = null;
  try {
    existingLock = await fetchEditLockById(id);
  } catch (error) {
    return {
      acquired: false,
      reason: buildFailureReason("precheck", normalizeErrorMessage(error)),
    };
  }

  if (existingLock && existingLock.holderUserId !== currentUserId) {
    upsertLock(existingLock);
    return { acquired: false, conflict: existingLock };
  }

  // 旧形式IDや日付形式の揺れを考慮し、月内ロック一覧でも同一セル競合を確認する。
  const monthConflictBeforeMutation = await findConflictFromMonthLocks();
  if (monthConflictBeforeMutation) {
    upsertLock(monthConflictBeforeMutation);
    return { acquired: false, conflict: monthConflictBeforeMutation };
  }

  try {
    const persisted = await tryPersistLock(existingLock);
    if (persisted) {
      upsertLock(persisted);
      return { acquired: true, lock: persisted };
    }
  } catch (error) {
    let latestLock: ShiftEditLockData | null = null;
    try {
      latestLock = await fetchEditLockById(id);
    } catch {
      latestLock = null;
    }

    if (latestLock?.holderUserId !== currentUserId) {
      if (latestLock) {
        upsertLock(latestLock);
      }
      return { acquired: false, conflict: latestLock ?? undefined };
    }

    const monthConflictLock = await findConflictFromMonthLocks();
    if (monthConflictLock) {
      upsertLock(monthConflictLock);
      return { acquired: false, conflict: monthConflictLock };
    }

    return {
      acquired: false,
      reason: buildFailureReason("mutation", normalizeErrorMessage(error)),
    };
  }

  let latestLock: ShiftEditLockData | null = null;
  try {
    latestLock = await fetchEditLockById(id);
  } catch (error) {
    return {
      acquired: false,
      reason: buildFailureReason("postcheck", normalizeErrorMessage(error)),
    };
  }

  if (latestLock) {
    upsertLock(latestLock);
  }

  if (!latestLock) {
    const monthConflictLock = await findConflictFromMonthLocks();
    if (monthConflictLock) {
      upsertLock(monthConflictLock);
      return { acquired: false, conflict: monthConflictLock };
    }

    try {
      const retriedPersisted = await tryPersistLock(existingLock);
      if (retriedPersisted) {
        upsertLock(retriedPersisted);
        return { acquired: true, lock: retriedPersisted };
      }
    } catch (error) {
      return {
        acquired: false,
        reason: buildFailureReason(
          "retry-mutation",
          normalizeErrorMessage(error),
        ),
      };
    }

    let retriedLatestLock: ShiftEditLockData | null = null;
    try {
      retriedLatestLock = await fetchEditLockById(id);
    } catch (error) {
      return {
        acquired: false,
        reason: buildFailureReason(
          "retry-postcheck",
          normalizeErrorMessage(error),
        ),
      };
    }

    if (retriedLatestLock) {
      upsertLock(retriedLatestLock);
      return {
        acquired: retriedLatestLock.holderUserId === currentUserId,
        lock:
          retriedLatestLock.holderUserId === currentUserId
            ? retriedLatestLock
            : undefined,
        conflict:
          retriedLatestLock.holderUserId !== currentUserId
            ? retriedLatestLock
            : undefined,
      };
    }

    const retryMonthConflictLock = await findConflictFromMonthLocks();
    if (retryMonthConflictLock) {
      upsertLock(retryMonthConflictLock);
      return { acquired: false, conflict: retryMonthConflictLock };
    }

    return {
      acquired: false,
      reason: buildFailureReason(
        "retry-postcheck",
        "lock record not found after retry acquire mutation",
      ),
    };
  }

  return {
    acquired: latestLock?.holderUserId === currentUserId,
    lock: latestLock?.holderUserId === currentUserId ? latestLock : undefined,
    conflict:
      latestLock?.holderUserId !== currentUserId
        ? (latestLock ?? undefined)
        : undefined,
  };
};

export const executeRenewLock = async ({
  lock,
  currentUserId,
  currentUserName,
  upsertLock,
}: {
  lock: ShiftEditLockData;
  currentUserId: string;
  currentUserName: string;
  upsertLock: (lock: ShiftEditLockData) => void;
}): Promise<void> => {
  const now = new Date();
  const result = (await graphqlClient.graphql({
    query: updateShiftEditLock,
    variables: {
      input: {
        id: lock.id,
        targetMonth: lock.targetMonth,
        staffId: lock.staffId,
        date: lock.date,
        holderUserId: currentUserId,
        holderUserName: currentUserName,
        acquiredAt: now.toISOString(),
        expiresAt: new Date(now.getTime() + EDIT_LOCK_TTL_MS).toISOString(),
        version: lock.version + 1,
      },
      condition: {
        version: { eq: lock.version },
      },
    },
    authMode: "userPool",
  })) as GraphQLResult<ShiftEditLockItemResponse>;

  const updatedLock = result.data?.updateShiftEditLock ?? null;
  if (updatedLock) {
    upsertLock(updatedLock);
  }
};

export const executeDeleteLock = async (
  targetMonth: string | undefined,
  staffId: string,
  date: string,
  ownedByUserId: string | null,
  removeLock: (staffId: string, date: string) => void,
  options?: { skipFetch?: boolean },
): Promise<void> => {
  if (!targetMonth) {
    return;
  }

  const id = toLockId(targetMonth, staffId, date);
  const existingLock = options?.skipFetch ? null : await fetchEditLockById(id);

  if (
    !existingLock ||
    (ownedByUserId !== null && existingLock.holderUserId !== ownedByUserId)
  ) {
    if (options?.skipFetch) {
      await graphqlClient.graphql({
        query: deleteShiftEditLock,
        variables: {
          input: { id },
        },
        authMode: "userPool",
      });
    }

    removeLock(staffId, date);
    return;
  }

  const variables =
    ownedByUserId === null
      ? {
          input: { id },
        }
      : {
          input: { id },
          condition: { version: { eq: existingLock.version } },
        };

  await graphqlClient.graphql({
    query: deleteShiftEditLock,
    variables,
    authMode: "userPool",
  });

  removeLock(staffId, date);
};
