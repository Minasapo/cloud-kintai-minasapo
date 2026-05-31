import dayjs, { type Dayjs } from "dayjs";

import type { AdminDailyReport } from "../data";

const CSV_HEADER = [
  "日付",
  "スタッフID",
  "スタッフ名",
  "タイトル",
  "内容",
  "作成日時",
  "更新日時",
];

export const compareReportByDateDesc = (
  a: AdminDailyReport,
  b: AdminDailyReport,
) => {
  if (a.date === b.date) {
    return (b.updatedAt ?? "").localeCompare(a.updatedAt ?? "");
  }
  return b.date.localeCompare(a.date);
};

const sanitizeCsvValue = (value: string): string => {
  const normalized = value.replace(/\r?\n/g, " ");
  const escaped = normalized.replace(/"/g, '""');
  if (/[",]/.test(escaped)) return `"${escaped}"`;
  return escaped;
};

export const buildDailyReportCsv = (reports: AdminDailyReport[]): string => {
  const sortedReports = reports.toSorted(compareReportByDateDesc);
  const lines = sortedReports.map((report) =>
    [
      report.date,
      report.staffId,
      report.author,
      report.title,
      report.content,
      report.createdAt ?? "",
      report.updatedAt ?? "",
    ]
      .map((value) => sanitizeCsvValue(value ?? ""))
      .join(","),
  );
  return [CSV_HEADER.join(","), ...lines].join("\n");
};

export const formatDailyReportFileName = (
  timestamp: Dayjs = dayjs(),
): string => `daily_reports_${timestamp.format("YYYYMMDD_HHmmss")}.csv`;
