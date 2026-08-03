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
  getEventsForDay: (day: Dayjs) => Array<{
    label: string;
    start: Dayjs;
    end?: Dayjs;
    color: string;
  }>;
  targetMonth: string;
  includeLegend: boolean;
  includeTimestamp: boolean;
  colorMode: "color" | "monochrome";
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

function buildPrintCss(colorMode: BuildPrintHtmlParams["colorMode"]): string {
  const colorModeCss =
    colorMode === "monochrome"
      ? `
    body.mode-monochrome { color: #111; }
    body.mode-monochrome .mode-chip {
      color: #111;
      border: 1px solid #111;
      background: #f3f3f3;
    }
    body.mode-monochrome .weekend {
      background-color: #ececec;
    }
    body.mode-monochrome .shift-cell {
      color: #111;
    }
    body.mode-monochrome .shift-work { background-color: #dcdcdc; }
    body.mode-monochrome .shift-fixedOff {
      background: repeating-linear-gradient(
        135deg,
        #cfcfcf,
        #cfcfcf 4px,
        #e7e7e7 4px,
        #e7e7e7 8px
      );
    }
    body.mode-monochrome .shift-requestedOff {
      background-color: #efefef;
      box-shadow: inset 0 0 0 1px #9a9a9a;
    }
    body.mode-monochrome .shift-auto {
      background-color: #fff;
      border-style: dashed;
      border-color: #555;
    }
    body.mode-monochrome .shift-empty {
      background-color: #fff;
      color: #777;
    }
    body.mode-monochrome .legend-items {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 6px 12px;
    }
    body.mode-monochrome .legend-badge {
      border: 1px solid #111;
      color: #111;
    }
  `
      : `
    body.mode-color .mode-chip {
      color: #0f172a;
      border: 1px solid #93c5fd;
      background: #dbeafe;
    }
    body.mode-color .weekend {
      background-color: #ffe3e3;
    }
    body.mode-color .shift-work { background-color: rgba(76, 175, 80, 0.16); color: rgb(46, 125, 50); }
    body.mode-color .shift-fixedOff { background-color: rgba(244, 67, 54, 0.16); color: rgb(198, 40, 40); }
    body.mode-color .shift-requestedOff { background-color: rgba(255, 152, 0, 0.18); color: rgb(230, 81, 0); }
    body.mode-color .shift-auto { background-color: rgba(33, 150, 243, 0.16); color: rgb(21, 101, 192); }
    body.mode-color .shift-empty { background-color: rgba(158, 158, 158, 0.12); color: rgb(97, 97, 97); }
  `;

  return `
    @page { size: landscape; margin: 0.5in; }
    @media print {
      * {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      body { margin: 0; padding: 0; }
      .print-container { page-break-after: always; }
      .print-container:last-child { page-break-after: auto; }
      .no-break { page-break-inside: avoid; }
      thead { display: table-header-group; }
      tfoot { display: table-footer-group; }
      tr, td, th { page-break-inside: avoid; break-inside: avoid; }
    }
    /* Print context: Arial for universal compatibility and print readability */
    body { font-family: "Arial", sans-serif; color: #333; background-color: white; }
    .print-container { padding: 20px; page-break-after: auto; }
    .header-line {
      display: flex;
      justify-content: flex-start;
      align-items: baseline;
      gap: 8px;
      margin-bottom: 10px;
      white-space: nowrap;
      line-height: 1.2;
    }
    .title-inline { font-size: 14px; font-weight: bold; }
    .month-inline { font-size: 11px; color: #666; font-weight: 500; }
    .mode-chip {
      margin-left: auto;
      font-size: 10px;
      line-height: 1;
      padding: 3px 8px;
      border-radius: 999px;
      font-weight: 700;
      letter-spacing: 0.04em;
    }
    table { border-collapse: collapse; border: 1px solid #333; font-size: 12px; width: 100%; }
    th, td { border: 1px solid #ccc; padding: 4px 8px; text-align: center; }
    th { background-color: #f5f5f5; font-weight: bold; }
    thead tr { background-color: #f5f5f5; }
    tbody tr:nth-child(even) { background-color: #fafafa; }
    .staff-name { text-align: left; font-weight: 500; width: 120px; white-space: nowrap; }
    .shift-cell { width: 32px; font-weight: bold; font-size: 14px; }
    .weekend { background-color: #f0f0f0; }
    .remarks-label { text-align: left; font-weight: 600; }
    .remarks-cell { text-align: left; vertical-align: top; }
    .remarks-event { font-size: 11px; line-height: 1.4; font-weight: 700; display: block; }
    .legend { margin-top: 12px; border-top: 1px solid #ccc; padding-top: 8px; }
    .legend-title { font-weight: bold; margin-bottom: 6px; font-size: 11px; line-height: 1.2; }
    .legend-items {
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      gap: 8px;
      font-size: 10px;
      overflow: hidden;
    }
    .legend-item {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      line-height: 1.2;
      white-space: nowrap;
      min-width: 0;
    }
    .legend-badge {
      width: 16px; height: 16px; display: flex; align-items: center;
      justify-content: center; font-weight: bold; border: 1px solid #ccc;
      border-radius: 2px; font-size: 10px;
    }
    .footer { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 10px; color: #999; text-align: right; }
    ${colorModeCss}
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
          const className = `shift-cell shift-${state}`;
          return `<td class="${className}">${cfg.label}</td>`;
        })
        .join("");
      return `<tr><td class="staff-name">${staffName}</td>${cells}</tr>`;
    })
    .join("");
  return `<tbody>${rows}</tbody>`;
}

function chunkStaffs(
  filteredStaffs: PrintShiftStaffInfo[],
  chunkSize: number,
): PrintShiftStaffInfo[][] {
  if (chunkSize <= 0) {
    return [filteredStaffs];
  }

  const chunks: PrintShiftStaffInfo[][] = [];
  for (let i = 0; i < filteredStaffs.length; i += chunkSize) {
    chunks.push(filteredStaffs.slice(i, i + chunkSize));
  }
  return chunks;
}

function estimateStaffsPerPage(dayCount: number): number {
  if (dayCount >= 28) return 20;
  if (dayCount >= 21) return 22;
  return 24;
}

function buildRemarksRow(
  filteredDays: Dayjs[],
  getEventsForDay: BuildPrintHtmlParams["getEventsForDay"],
): string {
  const cells = filteredDays
    .map((day) => {
      const events = getEventsForDay(day);
      if (events.length === 0) {
        return '<td class="remarks-cell"></td>';
      }

      const eventLabels = events
        .map((event) => `<span class="remarks-event">${event.label}</span>`)
        .join("");

      return `<td class="remarks-cell">${eventLabels}</td>`;
    })
    .join("");

  return `<tr><td class="remarks-label">備考</td>${cells}</tr>`;
}

function buildLegendHtml(colorMode: BuildPrintHtmlParams["colorMode"]): string {
  const items = (
    Object.entries(SHIFT_STATE_CONFIG) as [
      ShiftState,
      { label: string; color: string },
    ][]
  )
    .map(
      ([state, cfg]) =>
        `<div class="legend-item">
          <div class="legend-badge shift-cell shift-${state}" ${
            colorMode === "color" ? `style="border-color: ${cfg.color};"` : ""
          }>${cfg.label}</div>
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
  getEventsForDay,
  targetMonth,
  includeLegend,
  includeTimestamp,
  colorMode,
}: BuildPrintHtmlParams): string {
  const monthLabel = dayjs(targetMonth).format("YYYY年M月");
  const modeLabel = colorMode === "color" ? "カラー" : "モノクロ";
  const header = buildTableHeader(filteredDays);
  const staffsPerPage = estimateStaffsPerPage(filteredDays.length);
  const staffChunks = chunkStaffs(filteredStaffs, staffsPerPage);
  const remarksRow = buildRemarksRow(filteredDays, getEventsForDay);
  const legend = includeLegend ? buildLegendHtml(colorMode) : "";
  const footer = includeTimestamp
    ? `<div class="footer">出力日時: ${dayjs().format("YYYY年M月D日 HH:mm")}</div>`
    : "";

  const pages = staffChunks
    .map((chunk, index) => {
      const body = buildTableBody(chunk, filteredDays, shiftDataMap);
      const isLastPage = index === staffChunks.length - 1;
      const remarksSection = isLastPage ? `<tbody>${remarksRow}</tbody>` : "";
      const legendSection = isLastPage ? legend : "";
      const footerSection = isLastPage ? footer : "";

      return `<div class="print-container">
      <div class="header-line"><span class="title-inline">シフト調整表</span><span class="month-inline">${monthLabel}</span><span class="mode-chip">${modeLabel}</span></div>
      <table>${header}${body}${remarksSection}</table>
      ${legendSection}
      ${footerSection}
    </div>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>シフト調整表 - ${monthLabel}</title>
    <style>${buildPrintCss(colorMode)}</style>
  </head>
  <body class="mode-${colorMode}">
    ${pages}
  </body>
</html>`;
}
