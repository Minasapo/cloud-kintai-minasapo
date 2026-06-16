import type { ShiftEditLockData } from "../types/collaborative.types";

export const EDIT_LOCK_TTL_MS = 90_000;
export const EDIT_LOCK_REFRESH_INTERVAL_MS = 30_000;
export const EDIT_LOCK_CLEANUP_INTERVAL_MS = 15_000;

export type ShiftEditLockMap = Map<
  string,
  {
    id: string;
    userId: string;
    userName: string;
    startTime: number;
    expiresAt: number;
    version: number;
  }
>;

export const toCellKey = (staffId: string, date: string) => `${staffId}_${date}`;
export const toLockId = (targetMonth: string, staffId: string, date: string) =>
  `${targetMonth}#${staffId}#${date}`;
export const toMs = (value: string) => new Date(value).getTime();
export const isActiveLock = (lock: ShiftEditLockData, now = Date.now()) =>
  toMs(lock.expiresAt) > now;

export const toEditingMapEntry = (lock: ShiftEditLockData) => ({
  id: lock.id,
  userId: lock.holderUserId,
  userName: lock.holderUserName,
  startTime: toMs(lock.acquiredAt),
  expiresAt: toMs(lock.expiresAt),
  version: lock.version,
});

export const toEditingCellsMap = (locks: ShiftEditLockData[]): ShiftEditLockMap =>
  new Map(
    locks.map((lock) => [
      toCellKey(lock.staffId, lock.date),
      toEditingMapEntry(lock),
    ]),
  );

export const normalizeErrorMessage = (error: unknown): string => {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray(error.errors)
  ) {
    const messages = (error.errors as unknown[])
      .map((item) =>
        item &&
        typeof item === "object" &&
        "message" in item &&
        typeof (item as { message: unknown }).message === "string"
          ? (item as { message: string }).message
          : null,
      )
      .filter((item): item is string => Boolean(item));

    if (messages.length > 0) {
      return messages.join(", ");
    }
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "編集ロックの処理に失敗しました。";
};