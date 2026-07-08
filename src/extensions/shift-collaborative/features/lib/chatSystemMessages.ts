import type { ShiftState } from "../types/collaborative.types";

export const CHAT_SYSTEM_MESSAGE_PREFIX = "__SHIFT_SYSTEM__::";

const SHIFT_STATE_LABELS: Record<ShiftState, string> = {
  work: "出勤",
  fixedOff: "固定休",
  requestedOff: "希望休",
  auto: "自動調整",
  empty: "未入力",
};

export const formatShiftStateLabel = (state?: ShiftState) =>
  state ? SHIFT_STATE_LABELS[state] : "未設定";

export const buildShiftStateChangedSystemMessage = (
  userName: string,
  previousState: ShiftState | undefined,
  nextState: ShiftState,
) =>
  `${CHAT_SYSTEM_MESSAGE_PREFIX}${userName}が${formatShiftStateLabel(previousState)}から${formatShiftStateLabel(nextState)}に変更しました`;

export const buildShiftLockChangedSystemMessage = (
  userName: string,
  locked: boolean,
) =>
  `${CHAT_SYSTEM_MESSAGE_PREFIX}${userName}が${locked ? "確定" : "確定解除"}しました`;
