import type { ShiftState } from "../types/collaborative.types";
import { useClipboard } from "./useClipboard";

export const useClipboardOps = (
  staffIds: string[],
  dateKeys: string[],
  getShiftState: (staffId: string, date: string) => ShiftState | undefined
) =>
  useClipboard({
    staffIds,
    dates: dateKeys,
    getShiftState,
  });
