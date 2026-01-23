import { useCallback, useEffect, useRef, useState } from "react";

import { CollaborativeUser } from "../types/collaborative.types";

/**
 * アクティブユーザーのプレゼンス管理フック
 */
interface UseShiftPresenceProps {
  currentUserId: string;
  currentUserName: string;
  _shiftRequestId?: string;
  _targetMonth?: string;
}

export const useShiftPresence = ({
  currentUserId,
  currentUserName,
}: UseShiftPresenceProps) => {
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [editingCells, setEditingCells] = useState<
    Map<string, { userId: string; userName: string }>
  >(new Map());

  const heartbeatIntervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastActivityRef = useRef<number>(0);

  /**
   * ユーザーのアクティビティを記録
   */
  const updateActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
  }, []);

  /**
   * セル編集の開始を通知
   */
  const startEditingCell = useCallback(
    (staffId: string, date: string) => {
      const cellKey = `${staffId}_${date}`;
      setEditingCells((prev) => {
        const next = new Map(prev);
        next.set(cellKey, { userId: currentUserId, userName: currentUserName });
        return next;
      });
      updateActivity();

      // TODO: Phase 4でWebSocketを使って他のユーザーに通知
      console.log("Start editing cell:", cellKey);
    },
    [currentUserId, currentUserName, updateActivity]
  );

  /**
   * セル編集の終了を通知
   */
  const stopEditingCell = useCallback((staffId: string, date: string) => {
    const cellKey = `${staffId}_${date}`;
    setEditingCells((prev) => {
      const next = new Map(prev);
      next.delete(cellKey);
      return next;
    });

    // TODO: Phase 4でWebSocketを使って他のユーザーに通知
    console.log("Stop editing cell:", cellKey);
  }, []);

  /**
   * 特定のセルが他のユーザーによって編集中かチェック
   */
  const isCellBeingEdited = useCallback(
    (staffId: string, date: string): boolean => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      return editor !== undefined && editor.userId !== currentUserId;
    },
    [editingCells, currentUserId]
  );

  /**
   * 特定のセルを編集中のユーザーを取得
   */
  const getCellEditor = useCallback(
    (staffId: string, date: string): CollaborativeUser | undefined => {
      const cellKey = `${staffId}_${date}`;
      const editor = editingCells.get(cellKey);
      if (!editor) return undefined;

      return activeUsers.find((user) => user.userId === editor.userId);
    },
    [editingCells, activeUsers]
  );

  /**
   * アクティブユーザーリストの更新
   * Phase 1-3: ローカルのみ
   * Phase 4: WebSocketで同期
   */
  const updateActiveUsers = useCallback(() => {
    // Phase 1-3では現在のユーザーのみ
    setActiveUsers([
      {
        userId: currentUserId,
        userName: currentUserName,
        color: "#2196f3",
        lastActivity: lastActivityRef.current,
      },
    ]);

    // TODO: Phase 4でWebSocketからアクティブユーザーを取得
  }, [currentUserId, currentUserName]);

  /**
   * ハートビート送信
   */
  useEffect(() => {
    // 初回のアクティブユーザー登録
    updateActiveUsers();

    // 定期的にハートビートを送信（30秒ごと）
    heartbeatIntervalRef.current = setInterval(updateActiveUsers, 30000);

    return () => {
      if (heartbeatIntervalRef.current) {
        clearInterval(heartbeatIntervalRef.current);
      }
    };
  }, [updateActiveUsers]);

  /**
   * 非アクティブユーザーの削除
   * Phase 4でWebSocketからの更新に対応
   */
  useEffect(() => {
    const checkInactiveUsers = setInterval(() => {
      const now = Date.now();
      const inactiveThreshold = 60000; // 60秒

      setActiveUsers((prev) =>
        prev.filter((user) => now - user.lastActivity < inactiveThreshold)
      );
    }, 10000); // 10秒ごとにチェック

    return () => clearInterval(checkInactiveUsers);
  }, []);

  return {
    activeUsers,
    editingCells,
    startEditingCell,
    stopEditingCell,
    isCellBeingEdited,
    getCellEditor,
    updateActivity,
  };
};
