import { useCallback, useRef, useState } from "react";

interface FocusPosition {
  staffId: string;
  date: string;
}

interface UseShiftNavigationProps {
  staffIds: string[];
  dates: string[];
  onCellFocus?: (staffId: string, date: string) => void;
}

/**
 * シフト表のフォーカス管理とナビゲーション用フック
 */
export const useShiftNavigation = ({
  staffIds,
  dates,
  onCellFocus,
}: UseShiftNavigationProps) => {
  const [focusedCell, setFocusedCell] = useState<FocusPosition | null>(null);
  const cellRefs = useRef<Map<string, HTMLElement | null>>(new Map());

  const getCellKey = useCallback((staffId: string, date: string) => {
    return `${staffId}-${date}`;
  }, []);

  const registerCell = useCallback(
    (staffId: string, date: string, element: HTMLElement | null) => {
      const key = getCellKey(staffId, date);
      if (element) {
        cellRefs.current.set(key, element);
      } else {
        cellRefs.current.delete(key);
      }
    },
    [getCellKey]
  );

  const focusCell = useCallback(
    (staffId: string, date: string) => {
      const key = getCellKey(staffId, date);
      const element = cellRefs.current.get(key);
      if (element) {
        element.focus();
        setFocusedCell({ staffId, date });
        onCellFocus?.(staffId, date);
      }
    },
    [getCellKey, onCellFocus]
  );

  const navigate = useCallback(
    (direction: "up" | "down" | "left" | "right") => {
      if (!focusedCell) {
        // フォーカスがない場合は最初のセルにフォーカス
        if (staffIds.length > 0 && dates.length > 0) {
          focusCell(staffIds[0], dates[0]);
        }
        return;
      }

      const { staffId, date } = focusedCell;
      const staffIndex = staffIds.indexOf(staffId);
      const dateIndex = dates.indexOf(date);

      let newStaffIndex = staffIndex;
      let newDateIndex = dateIndex;

      switch (direction) {
        case "up":
          newStaffIndex = Math.max(0, staffIndex - 1);
          break;
        case "down":
          newStaffIndex = Math.min(staffIds.length - 1, staffIndex + 1);
          break;
        case "left":
          newDateIndex = Math.max(0, dateIndex - 1);
          break;
        case "right":
          newDateIndex = Math.min(dates.length - 1, dateIndex + 1);
          break;
      }

      if (newStaffIndex !== staffIndex || newDateIndex !== dateIndex) {
        focusCell(staffIds[newStaffIndex], dates[newDateIndex]);
      }
    },
    [focusedCell, staffIds, dates, focusCell]
  );

  const clearFocus = useCallback(() => {
    setFocusedCell(null);
  }, []);

  return {
    focusedCell,
    registerCell,
    focusCell,
    navigate,
    clearFocus,
  };
};
