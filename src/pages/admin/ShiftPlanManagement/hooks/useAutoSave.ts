import { useEffect, useRef, useState } from "react";

import { AUTO_SAVE_DELAY, ShiftPlanRow } from "../shiftPlanUtils";

type AutoSaveParams = {
  isDirty: boolean;
  currentRows: ShiftPlanRow[];
  selectedYear: number;
  yearRecordIds: Record<number, string>;
  performSave: (
    rows: ShiftPlanRow[],
    year: number,
    recordIds: Record<number, string>,
    showNotification?: boolean,
  ) => Promise<boolean>;
};

export const useAutoSave = ({
  isDirty,
  currentRows,
  selectedYear,
  yearRecordIds,
  performSave,
}: AutoSaveParams) => {
  const [isAutoSaving, setIsAutoSaving] = useState(false);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * 自動保存
   * - 入力停止後AUTO_SAVE_DELAY（1秒）経過後に自動保存を実行
   * - デバウンス処理により、連続入力中は保存しない
   */
  useEffect(() => {
    // 既存のタイマーをクリア（デバウンス処理）
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }

    // 保存条件: 内容が変更されている、バリデーションに合格している
    if (isDirty && currentRows.length > 0) {
      // バリデーション: enabled な行の日付が入力されているか確認
      const isValid = currentRows.every((row) => {
        if (!row.enabled) return true;
        return row.editStart && row.editEnd;
      });

      if (isValid) {
        autoSaveTimerRef.current = setTimeout(() => {
          setIsAutoSaving(true);
          void performSave(currentRows, selectedYear, yearRecordIds, false)
            .then(() => {
              setIsAutoSaving(false);
            })
            .catch(() => {
              setIsAutoSaving(false);
            });
        }, AUTO_SAVE_DELAY);
      }
    }

    // クリーンアップ: コンポーネントのアンマウント時やdependenciesの変更時
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [isDirty, currentRows, selectedYear, yearRecordIds, performSave]);

  return { isAutoSaving };
};
