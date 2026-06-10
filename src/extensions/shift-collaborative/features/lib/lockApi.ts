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

  const existingLock = await fetchEditLockById(id);
  if (existingLock && existingLock.holderUserId !== currentUserId) {
    upsertLock(existingLock);
    return { acquired: false, conflict: existingLock };
  }

  try {
    if (!existingLock) {
      const result = (await graphqlClient.graphql({
        query: createShiftEditLock,
        variables: { input: { ...baseInput, version: 1 } },
        authMode: "userPool",
      })) as GraphQLResult<ShiftEditLockItemResponse>;
      const created = result.data?.createShiftEditLock ?? null;
      if (created) {
        upsertLock(created);
        return { acquired: true, lock: created };
      }
    } else {
      const result = (await graphqlClient.graphql({
        query: updateShiftEditLock,
        variables: {
          input: { ...baseInput, version: existingLock.version + 1 },
          condition: { version: { eq: existingLock.version } },
        },
        authMode: "userPool",
      })) as GraphQLResult<ShiftEditLockItemResponse>;
      const updated = result.data?.updateShiftEditLock ?? null;
      if (updated) {
        upsertLock(updated);
        return { acquired: true, lock: updated };
      }
    }
  } catch (error) {
    const latestLock = await fetchEditLockById(id);
    if (latestLock?.holderUserId !== currentUserId) {
      if (latestLock) {
        upsertLock(latestLock);
      }
      return { acquired: false, conflict: latestLock ?? undefined };
    }

    throw new Error(normalizeErrorMessage(error));
  }

  const latestLock = await fetchEditLockById(id);
  if (latestLock) {
    upsertLock(latestLock);
  }

  return {
    acquired: latestLock?.holderUserId === currentUserId,
    lock: latestLock?.holderUserId === currentUserId ? latestLock : undefined,
    conflict:
      latestLock?.holderUserId !== currentUserId ? latestLock ?? undefined : undefined,
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
): Promise<void> => {
  if (!targetMonth) {
    return;
  }

  const id = toLockId(targetMonth, staffId, date);
  const existingLock = await fetchEditLockById(id);

  if (
    !existingLock ||
    (ownedByUserId !== null && existingLock.holderUserId !== ownedByUserId)
  ) {
    removeLock(staffId, date);
    return;
  }

  await graphqlClient.graphql({
    query: deleteShiftEditLock,
    variables: {
      input: { id },
      condition: { version: { eq: existingLock.version } },
    },
    authMode: "userPool",
  });

  removeLock(staffId, date);
};