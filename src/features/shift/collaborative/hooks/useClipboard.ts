import { useCallback, useState } from "react";

import { ShiftState } from "../types/collaborative.types";

interface CellPosition {
  staffId: string;
  date: string;
}

interface ClipboardData {
  cells: Array<{
    position: CellPosition;
    state: ShiftState;
  }>;
  boundingBox: {
    minStaffIndex: number;
    maxStaffIndex: number;
    minDateIndex: number;
    maxDateIndex: number;
  };
}

interface UseClipboardProps {
  staffIds: string[];
  dates: string[];
  getShiftState: (staffId: string, date: string) => ShiftState | undefined;
}

/**
 * コピー＆ペースト機能フック
 */
export const useClipboard = ({
  staffIds,
  dates,
  getShiftState,
}: UseClipboardProps) => {
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);

  /**
   * 選択されたセルをコピー
   */
  const copy = useCallback(
    (selectedCells: CellPosition[]) => {
      if (selectedCells.length === 0) return;

      // セルのデータを取得
      const cellsData = selectedCells
        .map((cell) => {
          const state = getShiftState(cell.staffId, cell.date);
          if (!state) return null;
          return {
            position: cell,
            state,
          };
        })
        .filter((cell) => cell !== null);

      // バウンディングボックスを計算
      const staffIndices = selectedCells.map((cell) =>
        staffIds.indexOf(cell.staffId)
      );
      const dateIndices = selectedCells.map((cell) => dates.indexOf(cell.date));

      const minStaffIndex = Math.min(...staffIndices);
      const maxStaffIndex = Math.max(...staffIndices);
      const minDateIndex = Math.min(...dateIndices);
      const maxDateIndex = Math.max(...dateIndices);

      setClipboard({
        cells: cellsData,
        boundingBox: {
          minStaffIndex,
          maxStaffIndex,
          minDateIndex,
          maxDateIndex,
        },
      });
    },
    [staffIds, dates, getShiftState]
  );

  /**
   * クリップボードの内容を貼り付け
   */
  const paste = useCallback(
    (
      targetCell: CellPosition
    ): Array<{
      staffId: string;
      date: string;
      newState: ShiftState;
    }> => {
      if (!clipboard) return [];

      const targetStaffIndex = staffIds.indexOf(targetCell.staffId);
      const targetDateIndex = dates.indexOf(targetCell.date);

      const { boundingBox } = clipboard;
      const offsetStaff = targetStaffIndex - boundingBox.minStaffIndex;
      const offsetDate = targetDateIndex - boundingBox.minDateIndex;

      const updates: Array<{
        staffId: string;
        date: string;
        newState: ShiftState;
      }> = [];

      clipboard.cells.forEach((cell) => {
        const sourceStaffIndex = staffIds.indexOf(cell.position.staffId);
        const sourceDateIndex = dates.indexOf(cell.position.date);

        const newStaffIndex = sourceStaffIndex + offsetStaff;
        const newDateIndex = sourceDateIndex + offsetDate;

        // 範囲外チェック
        if (
          newStaffIndex < 0 ||
          newStaffIndex >= staffIds.length ||
          newDateIndex < 0 ||
          newDateIndex >= dates.length
        ) {
          return;
        }

        updates.push({
          staffId: staffIds[newStaffIndex],
          date: dates[newDateIndex],
          newState: cell.state,
        });
      });

      return updates;
    },
    [clipboard, staffIds, dates]
  );

  /**
   * クリップボードが空かどうか
   */
  const hasClipboard = useCallback(() => {
    return clipboard !== null && clipboard.cells.length > 0;
  }, [clipboard]);

  /**
   * クリップボードをクリア
   */
  const clearClipboard = useCallback(() => {
    setClipboard(null);
  }, []);

  return {
    copy,
    paste,
    hasClipboard: hasClipboard(),
    clearClipboard,
  };
};
