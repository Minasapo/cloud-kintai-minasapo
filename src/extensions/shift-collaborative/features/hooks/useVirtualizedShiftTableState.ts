import { useMemo, useState } from "react";

import { ShiftState } from "../types/collaborative.types";

export type PendingLockAction =
  | { kind: "lockStaff"; staffId: string; staffName: string }
  | { kind: "unlockStaff"; staffId: string; staffName: string }
  | { kind: "lockMonth" }
  | { kind: "unlockMonth" };

interface UseVirtualizedShiftTableStateParams {
  staffs: Array<{
    id: string;
    familyName?: string | null;
    givenName?: string | null;
  }>;
  staffIds: string[];
  shiftDataMap: Map<
    string,
    Map<
      string,
      {
        state: ShiftState;
        isLocked: boolean;
        lastChangedBy?: string;
        lastChangedAt?: string;
      }
    >
  >;
  currentMonth?: string;
  onLockStaffRow?: (staffId: string) => void;
  onUnlockStaffRow?: (staffId: string) => void;
  onLockMonth?: () => void;
  onUnlockMonth?: () => void;
}

const buildConfirmDialogProps = (
  pendingAction: PendingLockAction | null,
  currentMonth?: string,
):
  | {
      title: string;
      message: string;
      confirmLabel: string;
    }
  | null => {
  if (!pendingAction) return null;
  if (pendingAction.kind === "lockStaff") {
    return {
      title: "シフトを確定",
      message: `${pendingAction.staffName} さんの${currentMonth ?? ""}シフトをすべて確定しますか？`,
      confirmLabel: "確定する",
    };
  }
  if (pendingAction.kind === "unlockStaff") {
    return {
      title: "確定を解除",
      message: `${pendingAction.staffName} さんの${currentMonth ?? ""}シフトの確定をすべて解除しますか？`,
      confirmLabel: "解除する",
    };
  }
  if (pendingAction.kind === "lockMonth") {
    return {
      title: "シフトを確定",
      message: `全員の${currentMonth ?? ""}シフトをすべて確定しますか？`,
      confirmLabel: "確定する",
    };
  }
  return {
    title: "確定を解除",
    message: `全員の${currentMonth ?? ""}シフトの確定をすべて解除しますか？`,
    confirmLabel: "解除する",
  };
};

export const useVirtualizedShiftTableState = ({
  staffs,
  staffIds,
  shiftDataMap,
  currentMonth,
  onLockStaffRow,
  onUnlockStaffRow,
  onLockMonth,
  onUnlockMonth,
}: UseVirtualizedShiftTableStateParams) => {
  const staffMap = useMemo(
    () =>
      new Map(
        staffs.map((staff) => [
          staff.id,
          `${staff.familyName || ""}${staff.givenName || ""}`,
        ]),
      ),
    [staffs],
  );

  const [pendingAction, setPendingAction] = useState<PendingLockAction | null>(
    null,
  );

  const confirmDialogProps = useMemo(
    () => buildConfirmDialogProps(pendingAction, currentMonth),
    [pendingAction, currentMonth],
  );

  const handleConfirm = () => {
    if (!pendingAction) return;
    if (pendingAction.kind === "lockStaff" || pendingAction.kind === "unlockStaff") {
      if (pendingAction.kind === "lockStaff") {
        onLockStaffRow?.(pendingAction.staffId);
      } else {
        onUnlockStaffRow?.(pendingAction.staffId);
      }
    } else if (pendingAction.kind === "lockMonth") {
      onLockMonth?.();
    } else {
      onUnlockMonth?.();
    }
    setPendingAction(null);
  };

  const isAllMonthLocked = useMemo(() => {
    if (staffIds.length === 0) return false;
    let hasNonEmpty = false;
    for (const staffId of staffIds) {
      const staffData = shiftDataMap.get(staffId);
      if (!staffData) continue;
      for (const cell of staffData.values()) {
        if (cell.state === "empty") continue;
        hasNonEmpty = true;
        if (!cell.isLocked) return false;
      }
    }
    return hasNonEmpty;
  }, [staffIds, shiftDataMap]);

  return {
    staffMap,
    pendingAction,
    setPendingAction,
    confirmDialogProps,
    handleConfirm,
    isAllMonthLocked,
  };
};
