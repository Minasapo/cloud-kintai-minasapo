import dayjs from "dayjs";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getDefaultRules,
  RuleContext,
  RuleViolation,
  ShiftRule,
} from "../rules/shiftRules";
import { ShiftState } from "../types/collaborative.types";

interface UseShiftSuggestionsProps {
  shiftDataMap: Map<string, Map<string, { state: ShiftState }>>;
  staffIds: string[];
  dateKeys: string[];
  enabled?: boolean;
  shiftPlanCapacities?: number[];
  days?: dayjs.Dayjs[];
}

/**
 * シフト提案生成フック
 */
export const useShiftSuggestions = ({
  shiftDataMap,
  staffIds,
  dateKeys,
  enabled = true,
  shiftPlanCapacities = [],
  days = [],
}: UseShiftSuggestionsProps) => {
  const [violations, setViolations] = useState<RuleViolation[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [rules] = useState<ShiftRule[]>(getDefaultRules());

  /**
   * ルールチェックを実行
   */
  const analyzeShifts = useCallback(() => {
    if (!enabled) return;

    setIsAnalyzing(true);
    const newViolations: RuleViolation[] = [];

    try {
      // 日付ごとのルールチェック
      dateKeys.forEach((date, index) => {
        const context: RuleContext = {
          date,
          shiftDataMap,
          staffIds,
          dateKeys,
        };

        // シフト計画が設定されているかどうかを判定
        let shiftPlanIsSet = false;

        // シフト計画の人数チェック
        if (days.length > 0) {
          const dayIndex = days[index]?.date() - 1;
          const plannedCapacity = shiftPlanCapacities[dayIndex];
          const isUnset =
            shiftPlanCapacities.length === 0 ||
            plannedCapacity === undefined ||
            Number.isNaN(plannedCapacity);

          if (isUnset) {
            newViolations.push({
              ruleId: `capacity-unset-${date}`,
              severity: "warning",
              message: `${days[index]?.format("M/D")} 計画人数が未設定です`,
              affectedCells: [{ staffId: "", date }],
            });
          } else {
            shiftPlanIsSet = true;
            // 出勤予定のスタッフ数をカウント
            let workCount = 0;
            staffIds.forEach((staffId) => {
              const cell = shiftDataMap.get(staffId)?.get(date);
              if (cell?.state === "work") {
                workCount++;
              }
            });

            // 計画人数に応じたエラー判定
            if (plannedCapacity === 0) {
              // 計画人数が0の場合、出勤者がいるとエラー
              if (workCount > 0) {
                const workingStaff = staffIds.filter((staffId) => {
                  const cell = shiftDataMap.get(staffId)?.get(date);
                  return cell?.state === "work";
                });

                newViolations.push({
                  ruleId: `capacity-excess-${date}`,
                  severity: "warning",
                  message: `${days[index]?.format("M/D")} シフト計画人数0名より${workCount}名超過しています`,
                  affectedCells: [{ staffId: "", date }],
                  suggestedActions: workingStaff.map((staffId) => ({
                    id: `remove-worker-${staffId}-${date}`,
                    description: `${staffId}を休日に変更`,
                    changes: [{ staffId, date, newState: "fixedOff" }],
                    impact: `出勤者数: ${workCount} → ${workCount - 1}`,
                  })),
                });
              }
            } else if (workCount < plannedCapacity) {
              const shortage = plannedCapacity - workCount;
              const availableStaff = staffIds.filter((staffId) => {
                const cell = shiftDataMap.get(staffId)?.get(date);
                return (
                  cell?.state === "fixedOff" ||
                  cell?.state === "requestedOff" ||
                  cell?.state === "empty"
                );
              });

              // 人数不足として警告
              newViolations.push({
                ruleId: `capacity-shortage-${date}`,
                severity: "warning",
                message: `${days[index]?.format("M/D")} シフト計画人数${plannedCapacity}名より${shortage}名不足しています`,
                affectedCells: [{ staffId: "", date }],
                suggestedActions: availableStaff
                  .slice(0, shortage)
                  .map((staffId) => ({
                    id: `add-worker-${staffId}-${date}`,
                    description: `${staffId}を出勤に変更`,
                    changes: [{ staffId, date, newState: "work" }],
                    impact: `出勤者数: ${workCount} → ${workCount + 1}`,
                  })),
              });
            } else if (workCount > plannedCapacity) {
              const excess = workCount - plannedCapacity;
              const workingStaff = staffIds.filter((staffId) => {
                const cell = shiftDataMap.get(staffId)?.get(date);
                return cell?.state === "work";
              });

              // 人数超過（参考情報）
              newViolations.push({
                ruleId: `capacity-excess-${date}`,
                severity: "info",
                message: `${days[index]?.format("M/D")} シフト計画人数${plannedCapacity}名より${excess}名超過しています`,
                affectedCells: [{ staffId: "", date }],
                suggestedActions: workingStaff
                  .slice(0, excess)
                  .map((staffId) => ({
                    id: `remove-worker-${staffId}-${date}`,
                    description: `${staffId}を休日に変更`,
                    changes: [{ staffId, date, newState: "fixedOff" }],
                    impact: `出勤者数: ${workCount} → ${workCount - 1}`,
                  })),
              });
            }
          }
        }

        // シフト計画が設定されている日付ではデフォルトルール（最小出勤人数）をスキップ
        rules.forEach((rule) => {
          // シフト計画が設定されている場合、min-workers ルールはスキップ
          if (shiftPlanIsSet && rule.id === "min-workers") {
            return;
          }
          const violation = rule.check(context);
          if (violation) {
            newViolations.push(violation);
          }
        });
      });

      // スタッフごとのルールチェック
      staffIds.forEach((staffId) => {
        const context: RuleContext = {
          date: "",
          staffId,
          shiftDataMap,
          staffIds,
          dateKeys,
        };

        rules.forEach((rule) => {
          const violation = rule.check(context);
          if (violation) {
            newViolations.push(violation);
          }
        });
      });

      setViolations(newViolations);
    } finally {
      setIsAnalyzing(false);
    }
  }, [
    enabled,
    dateKeys,
    staffIds,
    shiftDataMap,
    rules,
    shiftPlanCapacities,
    days,
  ]);

  /**
   * データが変更されたら自動的に再分析
   */
  useEffect(() => {
    if (enabled) {
      const timer = setTimeout(() => {
        analyzeShifts();
      }, 500); // デバウンス: 500ms

      return () => clearTimeout(timer);
    }
  }, [enabled, analyzeShifts]);

  /**
   * 重要度でフィルタリング
   */
  const errorViolations = useMemo(
    () => violations.filter((v) => v.severity === "error"),
    [violations],
  );

  const warningViolations = useMemo(
    () => violations.filter((v) => v.severity === "warning"),
    [violations],
  );

  const infoViolations = useMemo(
    () => violations.filter((v) => v.severity === "info"),
    [violations],
  );

  /**
   * 統計情報
   */
  const stats = useMemo(() => {
    const totalSuggestions = violations.reduce(
      (acc, v) => acc + (v.suggestedActions?.length || 0),
      0,
    );

    return {
      totalViolations: violations.length,
      errorCount: errorViolations.length,
      warningCount: warningViolations.length,
      infoCount: infoViolations.length,
      totalSuggestions,
    };
  }, [violations, errorViolations, warningViolations, infoViolations]);

  /**
   * 違反をクリア
   */
  const clearViolations = useCallback(() => {
    setViolations([]);
  }, []);

  return {
    violations,
    errorViolations,
    warningViolations,
    infoViolations,
    stats,
    isAnalyzing,
    analyzeShifts,
    clearViolations,
  };
};
