import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { CollaborativeUser } from "../types/collaborative.types";

/**
 * アクティブユーザーのプレゼンス管理フック
 */
interface UseShiftPresenceProps {
  currentUserId: string;
  currentUserName: string;
  shiftRequestId?: string;
  targetMonth?: string;
}

interface PresenceData {
  sessionId: string;
  userId: string;
  userName: string;
  color: string;
  lastActivity: number;
  timestamp: number;
  editingCells: Array<{
    cellKey: string;
    userId: string;
    userName: string;
    startTime: number;
  }>;
}

const STORAGE_KEY_PREFIX = "shift_presence_";
const INACTIVE_THRESHOLD = 60000; // 60秒
const HEARTBEAT_INTERVAL = 10000;
const EDIT_TIMEOUT = 5 * 60 * 1000;

const createSessionId = () =>
  `session-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;

/**
 * ユーザーごとにユニークな色を生成
 */
const generateUserColor = (userId: string): string => {
  const colors = [
    "#2196f3", // blue
    "#4caf50", // green
    "#ff9800", // orange
    "#f44336", // red
    "#9c27b0", // purple
    "#00bcd4", // cyan
    "#e91e63", // pink
    "#673ab7", // deep purple
  ];
  const hash = userId.split("").reduce((acc, char) => {
    return acc + char.charCodeAt(0);
  }, 0);
  return colors[hash % colors.length];
};

export const useShiftPresence = ({
  currentUserId,
  currentUserName,
  shiftRequestId,
  targetMonth,
}: UseShiftPresenceProps) => {
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [editingCells, setEditingCells] = useState<
    Map<string, { userId: string; userName: string; startTime: number }>
  >(new Map());

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastActivityRef = useRef<number>(0);
  const editTimeoutCheckIntervalRef = useRef<NodeJS.Timeout | undefined>(
    undefined,
  );
  const currentUserColorRef = useRef<string>(generateUserColor(currentUserId));
  const [sessionId] = useState<string>(() => createSessionId());
  const editingCellsRef = useRef(editingCells);

  const scopeKey = useMemo(() => {
    const normalizedShiftRequestId = shiftRequestId?.trim();
    const normalizedTargetMonth = targetMonth?.trim();
    return (
      [normalizedShiftRequestId, normalizedTargetMonth]
        .filter(Boolean)
        .join("_") || "global"
    );
  }, [shiftRequestId, targetMonth]);

  const storageKeyPrefix = useMemo(
    () => `${STORAGE_KEY_PREFIX}${scopeKey}_`,
    [scopeKey],
  );

  const storageKey = useMemo(
    () => `${storageKeyPrefix}${currentUserId}_${sessionId}`,
    [storageKeyPrefix, currentUserId, sessionId],
  );

  useEffect(() => {
    editingCellsRef.current = editingCells;
  }, [editingCells]);

  const setEditingCellsState = useCallback(
    (
      updater:
        | Map<string, { userId: string; userName: string; startTime: number }>
        | ((
            prev: Map<
              string,
              { userId: string; userName: string; startTime: number }
            >,
          ) => Map<
            string,
            { userId: string; userName: string; startTime: number }
          >),
    ) => {
      setEditingCells((prev) => {
        const next = updater instanceof Map ? updater : updater(prev);
        editingCellsRef.current = next;
        return next;
      });
    },
    [],
  );

  const buildPresenceData = useCallback((): PresenceData => {
    return {
      sessionId,
      userId: currentUserId,
      userName: currentUserName,
      color: currentUserColorRef.current,
      lastActivity: lastActivityRef.current,
      timestamp: Date.now(),
      editingCells: Array.from(editingCellsRef.current.entries()).map(
        ([cellKey, editor]) => ({
          cellKey,
          userId: editor.userId,
          userName: editor.userName,
          startTime: editor.startTime,
        }),
      ),
    };
  }, [currentUserId, currentUserName, sessionId]);

  const applyPresenceSnapshot = useCallback(
    (records: PresenceData[]) => {
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

      const nextUsers = Array.from(activeUserMap.values()).toSorted((a, b) =>
        a.userId.localeCompare(b.userId),
      );

      setActiveUsers((prevUsers) => {
        if (
          prevUsers.length === nextUsers.length &&
          prevUsers.every((prevUser, index) => {
            const nextUser = nextUsers[index];
            return (
              prevUser?.userId === nextUser?.userId &&
              prevUser?.lastActivity === nextUser?.lastActivity &&
              prevUser?.userName === nextUser?.userName &&
              prevUser?.color === nextUser?.color
            );
          })
        ) {
          return prevUsers;
        }
        return nextUsers;
      });

      setEditingCellsState((prevCells) => {
        if (prevCells.size === editingCellMap.size) {
          const hasDiff = Array.from(editingCellMap.entries()).some(
            ([cellKey, nextEditor]) => {
              const prevEditor = prevCells.get(cellKey);
              return (
                !prevEditor ||
                prevEditor.userId !== nextEditor.userId ||
                prevEditor.userName !== nextEditor.userName ||
                prevEditor.startTime !== nextEditor.startTime
              );
            },
          );
          if (!hasDiff) {
            return prevCells;
          }
        }

        return editingCellMap;
      });
    },
    [setEditingCellsState],
  );

  const loadPresenceFromStorage = useCallback(() => {
    const records: PresenceData[] = [];

    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(storageKeyPrefix)) {
          continue;
        }

        const data = window.localStorage.getItem(key);
        if (!data) {
          continue;
        }

        try {
          records.push(JSON.parse(data) as PresenceData);
        } catch (error) {
          console.warn("Failed to parse presence data:", key, error);
        }
      }
    } catch (error) {
      console.error("Failed to load active users from storage:", error);
    }

    applyPresenceSnapshot(records);
  }, [applyPresenceSnapshot, storageKeyPrefix]);

  /**
   * ユーザーのアクティビティを記録
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(buildPresenceData()),
      );
    } catch (error) {
      console.error("Failed to save presence to storage:", error);
    }
  }, [buildPresenceData, storageKey]);

  /**
   * セル編集の開始を通知
   */
  const startEditingCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        next.set(cellKey, {
          userId: currentUserId,
          userName: currentUserName,
          startTime: Date.now(),
        });
        return next;
      });
      updateActivity();
    },
    [currentUserId, currentUserName, setEditingCellsState, updateActivity],
  );

  /**
   * セル編集の終了を通知
   */
  const stopEditingCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        next.delete(cellKey);
        return next;
      });
      updateActivity();
    },
    [setEditingCellsState, updateActivity],
  );

  /**
   * 特定のセルが他のユーザーによって編集中かチェック
   */
  const isCellBeingEdited = useCallback(
    (staffId: string, date: string): boolean => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      return editor !== undefined && editor.userId !== currentUserId;
    },
    [editingCells, currentUserId],
  );

  /**
   * 特定のセルを編集中のユーザーを取得
   */
  const getCellEditor = useCallback(
    (staffId: string, date: string): CollaborativeUser | undefined => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      if (!editor) return undefined;

      return (
        activeUsers.find((user) => user.userId === editor.userId) ?? {
          userId: editor.userId,
          userName: editor.userName,
          color:
            editor.userId === currentUserId
              ? currentUserColorRef.current
              : generateUserColor(editor.userId),
          lastActivity: editor.startTime,
        }
      );
    },
    [editingCells, activeUsers, currentUserId],
  );

  /**
   * ローカルストレージにプレゼンス情報を保存
   */
  const savePresenceToStorage = useCallback(() => {
    try {
      window.localStorage.setItem(
        storageKey,
        JSON.stringify(buildPresenceData()),
      );
    } catch (error) {
      console.error("Failed to save presence to storage:", error);
    }
  }, [buildPresenceData, storageKey]);

  /**
   * アクティブユーザーリストの更新
   * ローカルストレージとポーリングで複数ユーザーに対応
   */
  const updateActiveUsers = useCallback(() => {
    savePresenceToStorage();
    loadPresenceFromStorage();
  }, [savePresenceToStorage, loadPresenceFromStorage]);

  /**
   * ハートビート送信
   */
  useEffect(() => {
    lastActivityRef.current = Date.now();
    const initialSyncTimeout = window.setTimeout(() => {
      updateActiveUsers();
    }, 0);

    heartbeatIntervalRef.current = setInterval(() => {
      updateActiveUsers();
    }, HEARTBEAT_INTERVAL);

    const handleStorage = (event: StorageEvent) => {
      if (!event.key || !event.key.startsWith(storageKeyPrefix)) {
        return;
      }
      loadPresenceFromStorage();
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        updateActivity();
        loadPresenceFromStorage();
      }
    };

    const removeOwnPresence = () => {
      try {
        window.localStorage.removeItem(storageKey);
      } catch (error) {
        console.error("Failed to remove presence from storage:", error);
      }
    };

    window.addEventListener("storage", handleStorage);
    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", removeOwnPresence);

    return () => {
      window.clearTimeout(initialSyncTimeout);
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
      window.removeEventListener("storage", handleStorage);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", removeOwnPresence);
      removeOwnPresence();
    };
  }, [
    loadPresenceFromStorage,
    storageKey,
    storageKeyPrefix,
    updateActiveUsers,
    updateActivity,
  ]);

  /**
   * 非アクティブユーザーの削除
   * Phase 4でWebSocketからの更新に対応
   */
  useEffect(() => {
    const checkInactiveUsers = setInterval(() => {
      const now = Date.now();

      setActiveUsers((prev) =>
        prev.filter((user) => now - user.lastActivity < INACTIVE_THRESHOLD),
      );
    }, 10000); // 10秒ごとにチェック

    return () => clearInterval(checkInactiveUsers);
  }, []);

  /**
   * 編集タイムアウトのチェック
   * 5分間無操作で自動解除
   */
  useEffect(() => {
    editTimeoutCheckIntervalRef.current = setInterval(() => {
      const now = Date.now();
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        let hasChanges = false;

        next.forEach((editor, cellKey) => {
          if (now - editor.startTime > EDIT_TIMEOUT) {
            next.delete(cellKey);
            hasChanges = true;
          }
        });

        return hasChanges ? next : prev;
      });
    }, 30000); // 30秒ごとにチェック

    return () => {
      if (editTimeoutCheckIntervalRef.current) {
        clearInterval(editTimeoutCheckIntervalRef.current);
      }
    };
  }, [setEditingCellsState]);

  /**
   * 管理者による強制解除
   */
  const forceReleaseCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCellsState((prev) => {
        const next = new Map(prev);
        next.delete(cellKey);
        return next;
      });
      updateActivity();
    },
    [setEditingCellsState, updateActivity],
  );

  /**
   * すべての編集ロックを取得（管理者用）
   */
  const getAllEditingCells = useCallback(() => {
    return Array.from(editingCells.entries()).map(([cellKey, editor]) => {
      const [staffId, date] = cellKey.split("_");
      return {
        cellKey,
        staffId,
        date,
        ...editor,
      };
    });
  }, [editingCells]);

  return {
    activeUsers,
    editingCells,
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    getCellEditor,
    updateActivity,
    forceReleaseCell,
    getAllEditingCells,
  };
};
