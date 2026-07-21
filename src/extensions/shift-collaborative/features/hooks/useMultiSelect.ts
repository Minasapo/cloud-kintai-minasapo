import { useCallback, useState } from "react";

interface CellPosition {
  staffId: string;
  date: string;
}

interface UseMultiSelectProps {
  staffIds: string[];
  dates: string[];
}

/**
 * 複数セル選択管理フック
 */
export const useMultiSelect = ({
  staffIds: _staffIds,
  dates: _dates,
}: UseMultiSelectProps) => {
  const [selectedCellKey, setSelectedCellKey] = useState<string | null>(null);

  const cellKeySeparator = "::";

  const getCellKey = useCallback(
    (staffId: string, date: string) => {
      return `${staffId}${cellKeySeparator}${date}`;
    },
    [cellKeySeparator],
  );

  const parseCellKey = useCallback(
    (key: string): CellPosition => {
      const separatorIndex = key.lastIndexOf(cellKeySeparator);
      if (separatorIndex === -1) {
        return { staffId: key, date: "" };
      }

      const staffId = key.slice(0, separatorIndex);
      const date = key.slice(separatorIndex + cellKeySeparator.length);
      return { staffId, date };
    },
    [cellKeySeparator],
  );

  /**
   * セルが選択されているか確認
   */
  const isCellSelected = useCallback(
    (staffId: string, date: string): boolean => {
      return selectedCellKey === getCellKey(staffId, date);
    },
    [selectedCellKey, getCellKey],
  );

  /**
   * 単一セルを選択（既存の選択をクリア）
   */
  const selectCell = useCallback(
    (staffId: string, date: string) => {
      const key = getCellKey(staffId, date);
      setSelectedCellKey(key);
    },
    [getCellKey],
  );

  /**
   * セルを選択に追加（Ctrl/Cmd+クリック）
   */
  const toggleCell = useCallback(
    (staffId: string, date: string) => {
      const key = getCellKey(staffId, date);
      setSelectedCellKey((prev) => (prev === key ? null : key));
    },
    [getCellKey],
  );

  /**
   * 範囲選択（Shift+クリック）
   */
  const selectRange = useCallback(
    (staffId: string, date: string) => {
      selectCell(staffId, date);
    },
    [selectCell],
  );

  /**
   * ドラッグ選択開始
   */
  const startDragSelect = useCallback(
    (staffId: string, date: string) => {
      selectCell(staffId, date);
    },
    [selectCell],
  );

  /**
   * ドラッグ中の選択更新
   */
  const updateDragSelect = useCallback((_staffId: string, _date: string) => {
    return;
  }, []);

  /**
   * ドラッグ選択終了
   */
  const endDragSelect = useCallback(() => {
    return;
  }, []);

  /**
   * 全セルを選択
   */
  const selectAll = useCallback(() => {
    return;
  }, []);

  /**
   * 選択をクリア
   */
  const clearSelection = useCallback(() => {
    setSelectedCellKey(null);
  }, []);

  /**
   * 選択されたセルの位置を取得
   */
  const getSelectedCells = useCallback((): CellPosition[] => {
    if (!selectedCellKey) {
      return [];
    }
    return [parseCellKey(selectedCellKey)];
  }, [selectedCellKey, parseCellKey]);

  /**
   * 選択数を取得
   */
  const getSelectionCount = useCallback((): number => {
    return selectedCellKey ? 1 : 0;
  }, [selectedCellKey]);

  return {
    selectedCells: getSelectedCells(),
    selectionCount: getSelectionCount(),
    isCellSelected,
    selectCell,
    toggleCell,
    selectRange,
    startDragSelect,
    updateDragSelect,
    endDragSelect,
    selectAll,
    clearSelection,
    isDragging: false,
  };
};
