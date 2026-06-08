import type { ShiftEditLockData } from "../types/collaborative.types";
import { useLockManagement } from "./useLockManagement";

interface UseShiftEditLocksProps {
  currentUserId: string;
  currentUserName: string;
  targetMonth?: string;
}

export const useShiftEditLocks = ({
  currentUserId,
  currentUserName,
  targetMonth,
}: UseShiftEditLocksProps) => {
  const {
    editingCells,
    acquireEditLock,
    releaseEditLock,
    forceReleaseLock,
    refreshLocks,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    getAllEditingCells,
  } = useLockManagement({
    currentUserId,
    currentUserName,
    targetMonth,
  });

  return {
    editingCells,
    acquireEditLock,
    releaseEditLock,
    forceReleaseLock,
    refreshLocks,
    isCellBeingEdited,
    hasEditLock,
    getCellEditor,
    getAllEditingCells,
  };
};

/**
 * エディットロックの競合メッセージを構築する
 */
export function buildEditLockConflictMessage(
  conflict?:
    | Pick<ShiftEditLockData, "holderUserName" | "date">
    | {
        id?: string;
        targetMonth?: string;
        staffId?: string;
        date?: string;
        holderUserId?: string;
        holderUserName?: string;
        acquiredAt?: string;
        expiresAt?: string;
        version?: number;
      }
    | null,
): string {
  if (!conflict) {
    return "編集ロックの取得に失敗しました。最新状態を確認してから再度お試しください。";
  }

  const holderUserName = conflict.holderUserName ?? "他のユーザー";
  const date = conflict.date ?? "対象";
  return `${holderUserName} が ${date} 日セルを編集中です。`;
}
