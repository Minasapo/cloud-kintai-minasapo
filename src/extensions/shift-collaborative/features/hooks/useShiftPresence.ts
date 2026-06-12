import { createLogger } from "@shared/lib/logger";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { CollaborativeUser } from "../types/collaborative.types";
import {
  EditingCellsMap,
  EditingCellsStateUpdater,
  PresenceData,
} from "../types/presence.types";
import {
  buildPresenceSnapshot,
  createSessionId,
  generateUserColor,
  parsePresenceData,
  STORAGE_KEY_PREFIX,
} from "../utils/presenceUtils";
import { usePresenceCellOperations } from "./usePresenceCellOperations";
import { usePresenceHeartbeat } from "./usePresenceHeartbeat";
import { usePresencePeriodicEffects } from "./usePresencePeriodicEffects";

const logger = createLogger("ShiftPresence");

/**
 * アクティブユーザーのプレゼンス管理フック
 */
interface UseShiftPresenceProps {
  currentUserId: string;
  currentUserName: string;
  shiftRequestId?: string;
  targetMonth?: string;
}

export const useShiftPresence = ({
  currentUserId,
  currentUserName,
  shiftRequestId,
  targetMonth,
}: UseShiftPresenceProps) => {
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [editingCells, setEditingCells] = useState<EditingCellsMap>(new Map());
  const lastActivityRef = useRef<number>(0);
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
    (updater: EditingCellsStateUpdater) => {
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
      const { nextUsers, nextEditingCells } = buildPresenceSnapshot(records);

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
        if (prevCells.size === nextEditingCells.size) {
          const hasDiff = Array.from(nextEditingCells.entries()).some(
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

        return nextEditingCells;
      });
    },
    [setEditingCellsState],
  );

  const loadPresenceFromStorage = useCallback(() => {
    const records: PresenceData[] = [];
    const invalidKeys: string[] = [];

    try {
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(storageKeyPrefix)) {
          continue;
        }

        const data = window.localStorage.getItem(key);
        if (data === null) {
          continue;
        }

        try {
          const parsed = parsePresenceData(data);
          if (parsed) {
            records.push(parsed);
            continue;
          }

          invalidKeys.push(key);
        } catch {
          invalidKeys.push(key);
        }
      }

      invalidKeys.forEach((key) => {
        try {
          window.localStorage.removeItem(key);
        } catch (error) {
          logger.error(
            "Failed to remove invalid presence from storage:",
            key,
            error,
          );
        }
      });
    } catch (error) {
      logger.error("Failed to load active users from storage:", error);
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
      logger.error("Failed to save presence to storage:", error);
    }
  }, [buildPresenceData, storageKey]);

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
      logger.error("Failed to save presence to storage:", error);
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

  usePresenceHeartbeat({
    storageKey,
    storageKeyPrefix,
    loadPresenceFromStorage,
    updateActiveUsers,
    updateActivity,
  });

  const {
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    forceReleaseCell,
    getAllEditingCells,
  } = usePresenceCellOperations({
    currentUserId,
    currentUserName,
    editingCells,
    setEditingCellsState,
    updateActivity,
    activeUsers,
    currentUserColorRef,
  });

  usePresencePeriodicEffects({
    updateActiveUsers,
    lastActivityRef,
    setActiveUsers,
    setEditingCellsState,
  });

  return {
    activeUsers,
    editingCells,
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    updateActivity,
    forceReleaseCell,
    getAllEditingCells,
  };
};