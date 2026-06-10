import { CollaborativeUser } from "../types/collaborative.types";
import {
  PresenceData,
  PresenceEditingCell,
} from "../types/presence.types";

export const STORAGE_KEY_PREFIX = "shift_presence_";
export const INACTIVE_THRESHOLD = 60000; // 60秒
export const HEARTBEAT_INTERVAL = 10000;
export const EDIT_TIMEOUT = 5 * 60 * 1000;

export const createSessionId = () =>
  `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * ユーザーごとにユニークな色を生成
 */
export const generateUserColor = (userId: string): string => {
  const colors = [
    "rgb(33 150 243)", // blue
    "rgb(76 175 80)", // green
    "rgb(255 152 0)", // orange
    "rgb(244 67 54)", // red
    "rgb(156 39 176)", // purple
    "rgb(0 188 212)", // cyan
    "rgb(233 30 99)", // pink
    "rgb(103 58 183)", // deep purple
  ];
  const hash = userId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
};

export const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null;

export const isString = (value: unknown): value is string => typeof value === "string";

export const isFiniteNumber = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value);

export const isPresenceEditingCell = (
  value: unknown,
): value is PresenceEditingCell => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.cellKey) &&
    isString(value.userId) &&
    isString(value.userName) &&
    isFiniteNumber(value.startTime)
  );
};

export const isPresenceData = (value: unknown): value is PresenceData => {
  if (!isRecord(value)) {
    return false;
  }

  return (
    isString(value.sessionId) &&
    isString(value.userId) &&
    isString(value.userName) &&
    isString(value.color) &&
    isFiniteNumber(value.lastActivity) &&
    isFiniteNumber(value.timestamp) &&
    Array.isArray(value.editingCells) &&
    value.editingCells.every(isPresenceEditingCell)
  );
};

export const parsePresenceData = (raw: string): PresenceData | null => {
  try {
    const parsed: unknown = JSON.parse(raw);
    return isPresenceData(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

export const buildPresenceSnapshot = (
  records: PresenceData[],
): {
  nextUsers: CollaborativeUser[];
  nextEditingCells: Map<
    string,
    { userId: string; userName: string; startTime: number }
  >;
} => {
  const now = Date.now();
  const activeUserMap = new Map<string, CollaborativeUser>();
  const editingCellMap = new Map<
    string,
    { userId: string; userName: string; startTime: number }
  >();

  records.forEach((record) => {
    if (now - record.timestamp >= INACTIVE_THRESHOLD) {
      return;
    }

    const existingUser = activeUserMap.get(record.userId);
    if (!existingUser || existingUser.lastActivity < record.lastActivity) {
      activeUserMap.set(record.userId, {
        userId: record.userId,
        userName: record.userName,
        color: record.color,
        lastActivity: record.lastActivity,
      });
    }

    record.editingCells.forEach((cell) => {
      if (now - cell.startTime >= EDIT_TIMEOUT) {
        return;
      }

      const existingCell = editingCellMap.get(cell.cellKey);
      if (!existingCell || existingCell.startTime < cell.startTime) {
        editingCellMap.set(cell.cellKey, {
          userId: cell.userId,
          userName: cell.userName,
          startTime: cell.startTime,
        });
      }
    });
  });

  return {
    nextUsers: Array.from(activeUserMap.values()).toSorted((a, b) =>
      a.userId.localeCompare(b.userId),
    ),
    nextEditingCells: editingCellMap,
  };
};