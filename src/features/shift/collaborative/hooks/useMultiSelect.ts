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
export const useMultiSelect = ({ staffIds, dates }: UseMultiSelectProps) => {
  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set());
  const [lastClickedCell, setLastClickedCell] = useState<CellPosition | null>(
    null
  );
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<CellPosition | null>(null);

  const getCellKey = useCallback((staffId: string, date: string) => {
    return `${staffId}-${date}`;
  }, []);

  const parseCellKey = useCallback((key: string): CellPosition => {
    const [staffId, date] = key.split("-");
    return { staffId, date };
  }, []);

  /**
   * セルが選択されているか確認
   */
  const isCellSelected = useCallback(
    (staffId: string, date: string): boolean => {
      return selectedCells.has(getCellKey(staffId, date));
    },
    [selectedCells, getCellKey]
  );

  /**
   * 単一セルを選択（既存の選択をクリア）
   */
  const selectCell = useCallback(
    (staffId: string, date: string) => {
      const key = getCellKey(staffId, date);
      setSelectedCells(new Set([key]));
      setLastClickedCell({ staffId, date });
    },
    [getCellKey]
  );

  /**
   * セルを選択に追加（Ctrl/Cmd+クリック）
   */
  const toggleCell = useCallback(
    (staffId: string, date: string) => {
      const key = getCellKey(staffId, date);
      setSelectedCells((prev) => {
        const next = new Set(prev);
        if (next.has(key)) {
          next.delete(key);
        } else {
          next.add(key);
        }
        return next;
      });
      setLastClickedCell({ staffId, date });
    },
    [getCellKey]
  );

  /**
   * 範囲選択（Shift+クリック）
   */
  const selectRange = useCallback(
    (staffId: string, date: string) => {
      if (!lastClickedCell) {
        selectCell(staffId, date);
        return;
      }

      const startStaffIndex = staffIds.indexOf(lastClickedCell.staffId);
      const endStaffIndex = staffIds.indexOf(staffId);
      const startDateIndex = dates.indexOf(lastClickedCell.date);
      const endDateIndex = dates.indexOf(date);

      const minStaffIndex = Math.min(startStaffIndex, endStaffIndex);
      const maxStaffIndex = Math.max(startStaffIndex, endStaffIndex);
      const minDateIndex = Math.min(startDateIndex, endDateIndex);
      const maxDateIndex = Math.max(startDateIndex, endDateIndex);

      const newSelection = new Set<string>();
      for (let i = minStaffIndex; i <= maxStaffIndex; i++) {
        for (let j = minDateIndex; j <= maxDateIndex; j++) {
          newSelection.add(getCellKey(staffIds[i], dates[j]));
        }
      }

      setSelectedCells(newSelection);
    },
    [lastClickedCell, staffIds, dates, getCellKey, selectCell]
  );

  /**
   * ドラッグ選択開始
   */
  const startDragSelect = useCallback(
    (staffId: string, date: string) => {
      setIsDragging(true);
      setDragStart({ staffId, date });
      selectCell(staffId, date);
    },
    [selectCell]
  );

  /**
   * ドラッグ中の選択更新
   */
  const updateDragSelect = useCallback(
    (staffId: string, date: string) => {
      if (!isDragging || !dragStart) return;

      const startStaffIndex = staffIds.indexOf(dragStart.staffId);
      const endStaffIndex = staffIds.indexOf(staffId);
      const startDateIndex = dates.indexOf(dragStart.date);
      const endDateIndex = dates.indexOf(date);

      const minStaffIndex = Math.min(startStaffIndex, endStaffIndex);
      const maxStaffIndex = Math.max(startStaffIndex, endStaffIndex);
      const minDateIndex = Math.min(startDateIndex, endDateIndex);
      const maxDateIndex = Math.max(startDateIndex, endDateIndex);

      const newSelection = new Set<string>();
      for (let i = minStaffIndex; i <= maxStaffIndex; i++) {
        for (let j = minDateIndex; j <= maxDateIndex; j++) {
          newSelection.add(getCellKey(staffIds[i], dates[j]));
        }
      }

      setSelectedCells(newSelection);
    },
    [isDragging, dragStart, staffIds, dates, getCellKey]
  );

  /**
   * ドラッグ選択終了
   */
  const endDragSelect = useCallback(() => {
    setIsDragging(false);
    setDragStart(null);
  }, []);

  /**
   * 全セルを選択
   */
  const selectAll = useCallback(() => {
    const allKeys = new Set<string>();
    staffIds.forEach((staffId) => {
      dates.forEach((date) => {
        allKeys.add(getCellKey(staffId, date));
      });
    });
    setSelectedCells(allKeys);
  }, [staffIds, dates, getCellKey]);

  /**
   * 選択をクリア
   */
  const clearSelection = useCallback(() => {
    setSelectedCells(new Set());
    setLastClickedCell(null);
  }, []);

  /**
   * 選択されたセルの位置を取得
   */
  const getSelectedCells = useCallback((): CellPosition[] => {
    return Array.from(selectedCells).map(parseCellKey);
  }, [selectedCells, parseCellKey]);

  /**
   * 選択数を取得
   */
  const getSelectionCount = useCallback((): number => {
    return selectedCells.size;
  }, [selectedCells]);

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
    isDragging,
  };
};
