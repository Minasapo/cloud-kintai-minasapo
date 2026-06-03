import dayjs, { Dayjs } from "dayjs";

import { ShiftState } from "../types/collaborative.types";

export interface PrintShiftStaffInfo {
  id: string;
  familyName?: string;
  givenName?: string;
}

export interface BuildPrintHtmlParams {
  filteredDays: Dayjs[];
  filteredStaffs: PrintShiftStaffInfo[];
  shiftDataMap: Map<
    string,
    Map<string, { state: ShiftState; isLocked: boolean }>
  >;
  targetMonth: string;
  includeLegend: boolean;
  includeTimestamp: boolean;
}

const SHIFT_STATE_CONFIG: Record<ShiftState, { label: string; color: string }> =
  {
    work: { label: "○", color: "rgb(76 175 80)" },
    fixedOff: { label: "固", color: "rgb(244 67 54)" },
    requestedOff: { label: "希", color: "rgb(255 152 0)" },
    auto: { label: "△", color: "rgb(33 150 243)" },
    empty: { label: "-", color: "rgb(158 158 158)" },
  };

const WEEKDAY_LABELS = ["日", "月", "火", "水", "木", "金", "土"];

function buildPrintCss(): string {
  return `
    @page { size: landscape; margin: 0.5in; }
    @media print {
      body { margin: 0; padding: 0; }
      .print-container { page-break-after: always; }
      .no-break { page-break-inside: avoid; }
    }
    /* Print context: Arial for universal compatibility and print readability */
    body { font-family: "Arial", sans-serif; color: #333; background-color: white; }
    .print-container { padding: 20px; page-break-after: auto; }
    .title { text-align: center; font-size: 18px; font-weight: bold; margin-bottom: 10px; }
    .subtitle { text-align: center; font-size: 12px; color: #666; margin-bottom: 20px; }
    table { border-collapse: collapse; border: 1px solid #333; font-size: 12px; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: center; }
    th { background-color: #f5f5f5; font-weight: bold; }
    thead tr { background-color: #f5f5f5; }
    tbody tr:nth-child(even) { background-color: #fafafa; }
    .staff-name { text-align: left; font-weight: 500; width: 120px; white-space: nowrap; }
    .shift-cell { width: 32px; font-weight: bold; font-size: 14px; }
    .weekend { background-color: #ffe0e0; }
    .legend { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 15px; }
    .legend-title { font-weight: bold; margin-bottom: 10px; font-size: 12px; }
    .legend-items { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; font-size: 11px; }
    .legend-item { display: flex; align-items: center; gap: 5px; }
    .legend-badge {
      width: 20px; height: 20px; display: flex; align-items: center;
      justify-content: center; font-weight: bold; border: 1px solid #ccc;
      border-radius: 2px; font-size: 11px;
    }
    .footer { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #999; text-align: right; }
  `;
}

function buildTableHeader(filteredDays: Dayjs[]): string {
  const dayCells = filteredDays
    .map((day) => {
      const weekday = WEEKDAY_LABELS[day.day()];
      const isWeekend = day.day() === 0 || day.day() === 6;
      return `<th class="shift-cell ${isWeekend ? "weekend" : ""}">
        <div>${day.format("D")}</div>
        <div style="font-size: 9px; color: #666;">(${weekday})</div>
      </th>`;
    })
    .join("");
  return `<thead><tr><th class="staff-name">スタッフ名</th>${dayCells}</tr></thead>`;
}

function buildTableBody(
  filteredStaffs: PrintShiftStaffInfo[],
  filteredDays: Dayjs[],
  shiftDataMap: BuildPrintHtmlParams["shiftDataMap"],
): string {
  const rows = filteredStaffs
    .map((staff) => {
      const staffName =
        `${staff.familyName ?? ""}${staff.givenName ?? ""}`.trim() || staff.id;
      const cells = filteredDays
        .map((day) => {
          const dayKey = day.format("DD");
          const state =
            (shiftDataMap.get(staff.id)?.get(dayKey)?.state as ShiftState) ??
            "empty";
          const cfg = SHIFT_STATE_CONFIG[state] ?? SHIFT_STATE_CONFIG.empty;
          return `<td class="shift-cell" style="background-color: ${cfg.color}20; color: ${cfg.color};">${cfg.label}</td>`;
        })
        .join("");
      return `<tr><td class="staff-name">${staffName}</td>${cells}</tr>`;
    })
    .join("");
  return `<tbody>${rows}</tbody>`;
}

function buildLegendHtml(): string {
  const items = (
    Object.entries(SHIFT_STATE_CONFIG) as [
      ShiftState,
      { label: string; color: string },
    ][]
  )
    .map(
      ([, cfg]) =>
        `<div class="legend-item">
          <div class="legend-badge" style="background-color: ${cfg.color}20; color: ${cfg.color}; border-color: ${cfg.color};">${cfg.label}</div>
          <span>${getLegendLabel(cfg.label)}</span>
        </div>`,
    )
    .join("");
  return `<div class="legend"><div class="legend-title">凡例</div><div class="legend-items">${items}</div></div>`;
}

function getLegendLabel(symbol: string): string {
  const map: Record<string, string> = {
    "○": "出勤",
    固: "固定休",
    希: "希望休",
    "△": "自動調整枠",
    "-": "未入力",
  };
  return map[symbol] ?? symbol;
}

/** シフト印刷用 HTML 文字列を生成する純粋関数 */
export function buildPrintHtml({
  filteredDays,
  filteredStaffs,
  shiftDataMap,
  targetMonth,
  includeLegend,
  includeTimestamp,
}: BuildPrintHtmlParams): string {
  const monthLabel = dayjs(targetMonth).format("YYYY年M月");
  const header = buildTableHeader(filteredDays);
  const body = buildTableBody(filteredStaffs, filteredDays, shiftDataMap);
  const legend = includeLegend ? buildLegendHtml() : "";
  const footer = includeTimestamp
    ? `<div class="footer">出力日時: ${dayjs().format("YYYY年M月D日 HH:mm")}</div>`
    : "";

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>シフト調整表 - ${monthLabel}</title>
    <style>${buildPrintCss()}</style>
  </head>
  <body>
    <div class="print-container">
      <div class="title">シフト調整表</div>
      <div class="subtitle">${monthLabel}</div>
      <table>${header}${body}</table>
      ${legend}
      ${footer}
    </div>
  </body>
</html>`;
}
