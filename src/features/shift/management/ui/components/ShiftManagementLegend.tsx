import { designTokenVar, getDesignTokens } from "@shared/designSystem";

import { statusVisualMap } from "../../lib/shiftStateMapping";

const DEFAULT_THEME_TOKENS = getDesignTokens();
const shiftBoardTokens = DEFAULT_THEME_TOKENS.component.shiftBoard;
const SHIFT_BOARD_BASE_PATH = "component.shiftBoard";
const SHIFT_INDICATOR_RADIUS = designTokenVar(
  `${SHIFT_BOARD_BASE_PATH}.cellRadius`,
  `${shiftBoardTokens.cellRadius}px`
);

const mixWithTransparent = (
  tokenPath: string,
  fallback: string,
  opacity: number
) => {
  const percentage = Math.round(Math.min(Math.max(opacity, 0), 1) * 100);
  return `color-mix(in srgb, ${designTokenVar(
    tokenPath,
    fallback
  )} ${percentage}%, transparent)`;
};

const SHORTAGE_BG = designTokenVar(
  "color.feedback.danger.surface",
  DEFAULT_THEME_TOKENS.color.feedback.danger.surface
);
const SHORTAGE_BORDER = mixWithTransparent(
  "color.feedback.danger.base",
  DEFAULT_THEME_TOKENS.color.feedback.danger.base,
  0.5
);
const EXCESS_BG = designTokenVar(
  "color.feedback.warning.surface",
  DEFAULT_THEME_TOKENS.color.feedback.warning.surface
);
const EXCESS_BORDER = mixWithTransparent(
  "color.feedback.warning.base",
  DEFAULT_THEME_TOKENS.color.feedback.warning.base,
  0.5
);

export default function ShiftManagementLegend() {
  return (
    <div className="flex flex-col gap-1 mb-6">
      <div className="text-sm font-semibold text-gray-900">凡例</div>
      <div className="flex flex-wrap items-center gap-4">
        {[
          { key: "work", label: "出勤" },
          { key: "fixedOff", label: "固定休" },
          { key: "requestedOff", label: "希望休" },
          { key: "auto", label: "自動調整枠" },
        ].map((item) => (
          <div key={item.key} className="flex items-center gap-1.5">
            <span
              className="text-sm font-bold"
              style={{
                color:
                  statusVisualMap[item.key as keyof typeof statusVisualMap]
                    .color,
              }}
            >
              {statusVisualMap[item.key as keyof typeof statusVisualMap].label}
            </span>
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-4 mt-2">
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border"
            style={{
              borderRadius: SHIFT_INDICATOR_RADIUS,
              backgroundColor: SHORTAGE_BG,
              borderColor: SHORTAGE_BORDER,
            }}
          />
          <span className="text-xs text-gray-500">下限未達／固定人数不足</span>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="w-4 h-4 border"
            style={{
              borderRadius: SHIFT_INDICATOR_RADIUS,
              backgroundColor: EXCESS_BG,
              borderColor: EXCESS_BORDER,
            }}
          />
          <span className="text-xs text-gray-500">上限超過／固定人数超過</span>
        </div>
        <span className="text-xs text-gray-500">
          数値は日別の出勤人数を示します。
        </span>
      </div>
    </div>
  );
}
