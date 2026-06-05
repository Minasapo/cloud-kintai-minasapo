import { ShiftState } from "../types/collaborative.types";

/**
 * シフトルール定義
 */
export interface ShiftRule {
  id: string;
  name: string;
  description: string;
  priority: "high" | "medium" | "low";
  check: (context: RuleContext) => RuleViolation | null;
}

/**
 * ルールチェックのコンテキスト
 */
export interface RuleContext {
  date: string;
  staffId?: string;
  shiftDataMap: Map<string, Map<string, { state: ShiftState }>>;
  staffIds: string[];
  dateKeys: string[];
}

/**
 * ルール違反
 */
export interface RuleViolation {
  ruleId: string;
  severity: "error" | "warning" | "info";
  message: string;
  affectedCells: Array<{ staffId: string; date: string }>;
  suggestedActions?: SuggestedAction[];
}

/**
 * 推奨アクション
 */
export interface SuggestedAction {
  id: string;
  description: string;
  changes: Array<{
    staffId: string;
    date: string;
    newState: ShiftState;
  }>;
  impact: string;
}

/**
 * 基本ルール: 1日あたりの最小出勤人数
 */
export const createMinWorkersRule = (minWorkers: number): ShiftRule => ({
  id: "min-workers",
  name: "最小出勤人数",
  description: `各日に最低${minWorkers}名の出勤が必要`,
  priority: "high",
  check: (context: RuleContext) => {
    const { date, shiftDataMap, staffIds } = context;

    let workCount = 0;
    const availableStaff: string[] = [];

    staffIds.forEach((staffId) => {
      const cell = shiftDataMap.get(staffId)?.get(date);
      if (cell?.state === "work") {
        workCount++;
      } else if (cell?.state === "empty" || cell?.state === "auto") {
        availableStaff.push(staffId);
      }
    });

    if (workCount < minWorkers) {
      const shortage = minWorkers - workCount;
      return {
        ruleId: "min-workers",
        severity: "error",
        message: `${date}日は出勤が${workCount}名で、あと${shortage}名不足しています`,
        affectedCells: [{ staffId: "", date }],
        suggestedActions: availableStaff.slice(0, shortage).map((staffId) => ({
          id: `assign-${staffId}-${date}`,
          description: `${staffId}を出勤にする`,
          changes: [{ staffId, date, newState: "work" }],
          impact: `出勤者数: ${workCount} → ${workCount + 1}`,
        })),
      };
    }

    return null;
  },
});

/**
 * ルール: 1日あたりの最大出勤人数
 */
export const createMaxWorkersRule = (maxWorkers: number): ShiftRule => ({
  id: "max-workers",
  name: "最大出勤人数",
  description: `各日に最大${maxWorkers}名までの出勤`,
  priority: "medium",
  check: (context: RuleContext) => {
    const { date, shiftDataMap, staffIds } = context;

    let workCount = 0;
    const workingStaff: string[] = [];

    staffIds.forEach((staffId) => {
      const cell = shiftDataMap.get(staffId)?.get(date);
      if (cell?.state === "work") {
        workCount++;
        workingStaff.push(staffId);
      }
    });

    if (workCount > maxWorkers) {
      const excess = workCount - maxWorkers;
      return {
        ruleId: "max-workers",
        severity: "warning",
        message: `${date}日は出勤が${workCount}名で、${excess}名過剰です`,
        affectedCells: [{ staffId: "", date }],
        suggestedActions: workingStaff.slice(0, excess).map((staffId) => ({
          id: `remove-${staffId}-${date}`,
          description: `${staffId}を自動調整枠にする`,
          changes: [{ staffId, date, newState: "auto" }],
          impact: `出勤者数: ${workCount} → ${workCount - 1}`,
        })),
      };
    }

    return null;
  },
});

/**
 * ルール: 連続出勤日数の制限
 */
export const createConsecutiveWorkDaysRule = (maxDays: number): ShiftRule => ({
  id: "consecutive-work-days",
  name: "連続出勤日数",
  description: `${maxDays}日以上の連続出勤を避ける`,
  priority: "medium",
  check: (context: RuleContext) => {
    const { staffId, shiftDataMap, dateKeys } = context;

    if (!staffId) return null;

    const staffData = shiftDataMap.get(staffId);
    if (!staffData) return null;

    let consecutiveCount = 0;
    let consecutiveDates: string[] = [];

    for (const date of dateKeys) {
      const cell = staffData.get(date);
      if (cell?.state === "work") {
        consecutiveCount++;
        consecutiveDates.push(date);
      } else {
        if (consecutiveCount > maxDays) {
          return {
            ruleId: "consecutive-work-days",
            severity: "warning",
            message: `${staffId}が${consecutiveCount}日連続で出勤しています`,
            affectedCells: consecutiveDates.map((date) => ({ staffId, date })),
            suggestedActions: [
              {
                id: `rest-${staffId}-${
                  consecutiveDates[consecutiveDates.length - 1]
                }`,
                description: `${
                  consecutiveDates[consecutiveDates.length - 1]
                }日を休みにする`,
                changes: [
                  {
                    staffId,
                    date: consecutiveDates[consecutiveDates.length - 1],
                    newState: "auto",
                  },
                ],
                impact: `連続出勤: ${consecutiveCount}日 → ${
                  consecutiveCount - 1
                }日`,
              },
            ],
          };
        }
        consecutiveCount = 0;
        consecutiveDates = [];
      }
    }

    // 最後までチェック
    if (consecutiveCount > maxDays) {
      return {
        ruleId: "consecutive-work-days",
        severity: "warning",
        message: `${staffId}が${consecutiveCount}日連続で出勤しています`,
        affectedCells: consecutiveDates.map((date) => ({ staffId, date })),
        suggestedActions: [
          {
            id: `rest-${staffId}-${
              consecutiveDates[consecutiveDates.length - 1]
            }`,
            description: `${
              consecutiveDates[consecutiveDates.length - 1]
            }日を休みにする`,
            changes: [
              {
                staffId,
                date: consecutiveDates[consecutiveDates.length - 1],
                newState: "auto",
              },
            ],
            impact: `連続出勤: ${consecutiveCount}日 → ${
              consecutiveCount - 1
            }日`,
          },
        ],
      };
    }

    return null;
  },
});

/**
 * デフォルトルールセット
 */
export const getDefaultRules = (): ShiftRule[] => [
  createMinWorkersRule(2),
  createMaxWorkersRule(5),
  createConsecutiveWorkDaysRule(5),
];
