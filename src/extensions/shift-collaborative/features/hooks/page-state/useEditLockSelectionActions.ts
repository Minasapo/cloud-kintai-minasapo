import { useCallback, useMemo } from "react";

import {
  normalizeErrorMessage,
  normalizeLockDateKey,
} from "../../lib/lockUtils";
import { buildEditLockConflictMessage } from "../useShiftEditLocks";

type CellPosition = {
  staffId: string;
  date: string;
};

type EditLockAcquireResult = {
  acquired: boolean;
  conflict?: {
    id: string;
    targetMonth: string;
    staffId: string;
    date: string;
    holderUserId: string;
    holderUserName: string;
    acquiredAt: string;
    expiresAt: string;
    version: number;
  };
  reason?: string;
};

type RefreshLockSnapshot = {
  id: string;
  targetMonth: string;
  staffId: string;
  date: string;
  holderUserId: string;
  holderUserName: string;
  acquiredAt: string;
  expiresAt: string;
  version: number;
};

type UseEditLockSelectionActionsParams = {
  selectionTargets: CellPosition[];
  isEditingDisabled: boolean;
  targetMonth: string;
  isAdmin: boolean;
  hasEditLock: (staffId: string, date: string) => boolean;
  isCellBeingEdited: (staffId: string, date: string) => boolean;
  getCellEditor: (
    staffId: string,
    date: string,
  ) => { userId?: string; userName?: string } | undefined;
  startEditingCell: (
    staffId: string,
    date: string,
  ) => Promise<EditLockAcquireResult>;
  stopEditingCell: (staffId: string, date: string) => Promise<void>;
  refreshLocks: () => Promise<unknown>;
  forceReleaseCell: (staffId: string, date: string) => Promise<void>;
  networkEditDisabledMessage: string;
  setEditLockError: (error: string | null) => void;
};

const buildAdminLockFailureDetails = ({
  targetMonth,
  staffId,
  date,
  reason,
}: {
  targetMonth: string;
  staffId: string;
  date: string;
  reason: string;
}) => {
  return [
    "編集ロックの取得に失敗しました。",
    `対象: スタッフID=${staffId}, 日付=${targetMonth}-${date}`,
    `詳細: ${reason}`,
    "対処: 最新状態を同期し、既存ロックの有無を確認してから再実行してください。",
  ].join(" ");
};

export const useEditLockSelectionActions = ({
  selectionTargets,
  isEditingDisabled,
  targetMonth,
  isAdmin,
  hasEditLock,
  isCellBeingEdited,
  getCellEditor,
  startEditingCell,
  stopEditingCell,
  refreshLocks,
  forceReleaseCell,
  networkEditDisabledMessage,
  setEditLockError,
}: UseEditLockSelectionActionsParams) => {
  const hasEditLockForSelected = useMemo(
    () =>
      selectionTargets.length > 0 &&
      selectionTargets.every((t) => hasEditLock(t.staffId, t.date)),
    [selectionTargets, hasEditLock],
  );

  const isOthersEditingSelected = useMemo(
    () => selectionTargets.some((t) => isCellBeingEdited(t.staffId, t.date)),
    [selectionTargets, isCellBeingEdited],
  );

  const applyEditLock = useCallback(
    async (acquire: boolean) => {
      try {
        if (isEditingDisabled) {
          setEditLockError(networkEditDisabledMessage);
          return false;
        }

        if (selectionTargets.length === 0) {
          return false;
        }

        if (acquire) {
          await refreshLocks();
        }

        const conflicts: string[] = [];
        const unresolvedTargets: Array<{
          staffId: string;
          date: string;
          fallbackMessage: string;
        }> = [];
        for (const { staffId, date } of selectionTargets) {
          if (acquire) {
            if (isCellBeingEdited(staffId, date)) {
              const editor = getCellEditor(staffId, date);
              conflicts.push(
                buildEditLockConflictMessage({
                  id: "",
                  targetMonth,
                  staffId,
                  date,
                  holderUserId: editor?.userId ?? "",
                  holderUserName: editor?.userName ?? "他のユーザー",
                  acquiredAt: new Date().toISOString(),
                  expiresAt: new Date().toISOString(),
                  version: 0,
                }),
              );
              continue;
            }

            if (hasEditLock(staffId, date)) {
              continue;
            }

            const result = await startEditingCell(staffId, date);
            if (!result.acquired) {
              if (result.conflict) {
                const baseMessage = buildEditLockConflictMessage(
                  result.conflict,
                );
                if (!isAdmin) {
                  conflicts.push(baseMessage);
                } else {
                  conflicts.push(
                    `${baseMessage} (lockId=${result.conflict.id}, holderUserId=${result.conflict.holderUserId}, expiresAt=${result.conflict.expiresAt})`,
                  );
                }
              } else if (isAdmin) {
                unresolvedTargets.push({
                  staffId,
                  date,
                  fallbackMessage: buildAdminLockFailureDetails({
                    targetMonth,
                    staffId,
                    date,
                    reason:
                      result.reason ??
                      "競合ロック情報を取得できませんでした（競合データなしで取得失敗）。",
                  }),
                });
              } else {
                unresolvedTargets.push({
                  staffId,
                  date,
                  fallbackMessage: buildEditLockConflictMessage(undefined),
                });
              }
            }
          } else if (hasEditLock(staffId, date)) {
            await stopEditingCell(staffId, date);
          }
        }

        // サブスクリプション遅延があっても、ボタン表示判定を即時に更新する。
        const refreshedLocksResult = await refreshLocks();
        const refreshedLocks = Array.isArray(refreshedLocksResult)
          ? (refreshedLocksResult as RefreshLockSnapshot[])
          : [];

        if (unresolvedTargets.length > 0) {
          unresolvedTargets.forEach(({ staffId, date, fallbackMessage }) => {
            const conflictLock = refreshedLocks.find(
              (lock) =>
                lock.staffId === staffId &&
                normalizeLockDateKey(lock.date) ===
                  normalizeLockDateKey(date) &&
                lock.holderUserId !== "",
            );

            if (!conflictLock) {
              conflicts.push(fallbackMessage);
              return;
            }

            const conflictMessage = buildEditLockConflictMessage(conflictLock);
            conflicts.push(
              isAdmin
                ? `${conflictMessage} (lockId=${conflictLock.id}, holderUserId=${conflictLock.holderUserId}, expiresAt=${conflictLock.expiresAt})`
                : conflictMessage,
            );
          });
        }

        setEditLockError(conflicts.length > 0 ? conflicts[0] : null);
        return conflicts.length === 0;
      } catch (error) {
        setEditLockError(normalizeErrorMessage(error));
        return false;
      }
    },
    [
      getCellEditor,
      hasEditLock,
      isCellBeingEdited,
      isEditingDisabled,
      networkEditDisabledMessage,
      refreshLocks,
      selectionTargets,
      setEditLockError,
      startEditingCell,
      stopEditingCell,
      targetMonth,
      isAdmin,
    ],
  );

  const handleAcquireEditLock = useCallback(async () => {
    return applyEditLock(true);
  }, [applyEditLock]);

  const handleReleaseEditLock = useCallback(async () => {
    return applyEditLock(false);
  }, [applyEditLock]);

  const handleForceReleaseLock = useCallback(async () => {
    if (!isAdmin) return;
    await Promise.all(
      selectionTargets.map(({ staffId, date }) =>
        forceReleaseCell(staffId, date),
      ),
    );
  }, [forceReleaseCell, isAdmin, selectionTargets]);

  return {
    hasEditLockForSelected,
    isOthersEditingSelected,
    handleAcquireEditLock,
    handleReleaseEditLock,
    handleForceReleaseLock,
  };
};
