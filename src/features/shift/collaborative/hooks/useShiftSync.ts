import { useCallback, useEffect, useRef, useState } from "react";

/**
 * ポーリングベース同期のフック
 */
interface UseShiftSyncProps {
  enabled: boolean;
  interval?: number; // ミリ秒（デフォルト: 5000）
  onSync: () => Promise<void>;
}

export const useShiftSync = ({
  enabled,
  interval = 5000,
  onSync,
}: UseShiftSyncProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number>(0);
  const [syncError, setSyncError] = useState<string | null>(null);

  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isMountedRef = useRef(true);
  const onSyncRef = useRef(onSync);

  // onSyncの最新版を保持
  useEffect(() => {
    onSyncRef.current = onSync;
  }, [onSync]);

  /**
   * 同期を実行
   */
  const sync = useCallback(async () => {
    if (!enabled || isPaused || isSyncing) return;

    setIsSyncing(true);
    setSyncError(null);

    try {
      await onSyncRef.current();
      if (isMountedRef.current) {
        setLastSyncedAt(Date.now());
      }
    } catch (error) {
      console.error("Sync error:", error);
      if (isMountedRef.current) {
        setSyncError(
          error instanceof Error ? error.message : "同期に失敗しました",
        );
      }
    } finally {
      if (isMountedRef.current) {
        setIsSyncing(false);
      }
    }
  }, [enabled, isPaused, isSyncing]);

  /**
   * 同期を一時停止
   */
  const pause = useCallback(() => {
    setIsPaused(true);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  /**
   * 同期を再開
   */
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);

  /**
   * 手動で同期をトリガー
   */
  const triggerSync = useCallback(async () => {
    await sync();
  }, [sync]);

  /**
   * ポーリングのセットアップ
   */
  useEffect(() => {
    isMountedRef.current = true;

    if (enabled && !isPaused) {
      // 初回同期
      void sync();

      // 定期同期
      intervalRef.current = setInterval(() => {
        void sync();
      }, interval);
    }

    return () => {
      isMountedRef.current = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, isPaused, interval, sync]);

  return {
    isSyncing,
    isPaused,
    lastSyncedAt,
    syncError,
    triggerSync,
    pause,
    resume,
  };
};
