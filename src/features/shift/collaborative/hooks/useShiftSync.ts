import { useCallback, useEffect, useRef, useState } from "react";

import type { DataSyncStatus } from "../types/collaborative.types";

/**
 * Subscription ファーストの同期コーディネータ
 *
 * リアルタイム同期（GraphQL Subscription）を主軸とし、
 * 手動同期をフォールバック手段として提供する。
 * データ保存・同期の状態を一元管理し、UI へステータスを公開する。
 */
interface UseShiftSyncProps {
  onManualSync: () => Promise<void>;
}

export const useShiftSync = ({ onManualSync }: UseShiftSyncProps) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastAutoSyncedAt, setLastAutoSyncedAt] = useState<number>(0);
  const [lastManualSyncedAt, setLastManualSyncedAt] = useState<number>(0);
  const [dataStatus, setDataStatus] = useState<DataSyncStatus>("idle");

  const isSyncingRef = useRef(false);
  const statusTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const onManualSyncRef = useRef(onManualSync);

  useEffect(() => {
    onManualSyncRef.current = onManualSync;
  }, [onManualSync]);

  /**
   * 成功ステータス（saved / synced）を一定時間後に idle へ戻す
   */
  const scheduleStatusClear = useCallback(() => {
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
    statusTimerRef.current = setTimeout(() => {
      setDataStatus((prev) =>
        prev === "saved" || prev === "synced" ? "idle" : prev,
      );
    }, 3000);
  }, []);

  /**
   * 手動同期を実行（二重実行防止付き）
   */
  const triggerSync = useCallback(async () => {
    if (isSyncingRef.current) return;
    isSyncingRef.current = true;
    setIsSyncing(true);
    setSyncError(null);
    setDataStatus("syncing");

    try {
      await onManualSyncRef.current();
      setLastManualSyncedAt(Date.now());
      setDataStatus("synced");
      scheduleStatusClear();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "同期に失敗しました";
      setSyncError(message);
      setDataStatus("error");
    } finally {
      isSyncingRef.current = false;
      setIsSyncing(false);
    }
  }, [scheduleStatusClear]);

  /**
   * Subscription 経由の自動同期を受信した際の通知
   */
  const notifyAutoSyncReceived = useCallback(() => {
    setLastAutoSyncedAt(Date.now());
    setSyncError(null);
    setDataStatus((prev) =>
      prev === "saving" || prev === "syncing" ? prev : "synced",
    );
    scheduleStatusClear();
  }, [scheduleStatusClear]);

  /**
   * データ保存開始の通知
   */
  const notifySaveStarted = useCallback(() => {
    setDataStatus("saving");
    if (statusTimerRef.current) {
      clearTimeout(statusTimerRef.current);
    }
  }, []);

  /**
   * データ保存完了の通知
   */
  const notifySaveCompleted = useCallback(() => {
    setSyncError(null);
    setDataStatus("saved");
    scheduleStatusClear();
  }, [scheduleStatusClear]);

  /**
   * データ保存失敗の通知
   */
  const notifySaveFailed = useCallback((error: string) => {
    setSyncError(error);
    setDataStatus("error");
  }, []);

  /**
   * エラーをクリア
   */
  const clearSyncError = useCallback(() => {
    setSyncError(null);
    setDataStatus("idle");
  }, []);

  const lastSyncedAt = Math.max(lastAutoSyncedAt, lastManualSyncedAt);

  useEffect(() => {
    return () => {
      if (statusTimerRef.current) {
        clearTimeout(statusTimerRef.current);
      }
    };
  }, []);

  return {
    isSyncing,
    syncError,
    triggerSync,
    lastAutoSyncedAt,
    lastSyncedAt,
    dataStatus,
    notifyAutoSyncReceived,
    notifySaveStarted,
    notifySaveCompleted,
    notifySaveFailed,
    clearSyncError,
  };
};
