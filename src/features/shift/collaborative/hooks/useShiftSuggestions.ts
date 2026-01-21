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
}

/**
 * シフト提案生成フック
 */
export const useShiftSuggestions = ({
  shiftDataMap,
  staffIds,
  dateKeys,
  enabled = true,
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
      dateKeys.forEach((date) => {
        const context: RuleContext = {
          date,
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
  }, [enabled, dateKeys, staffIds, shiftDataMap, rules]);

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
    [violations]
  );

  const warningViolations = useMemo(
    () => violations.filter((v) => v.severity === "warning"),
    [violations]
  );

  const infoViolations = useMemo(
    () => violations.filter((v) => v.severity === "info"),
    [violations]
  );

  /**
   * 統計情報
   */
  const stats = useMemo(() => {
    const totalSuggestions = violations.reduce(
      (acc, v) => acc + (v.suggestedActions?.length || 0),
      0
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
