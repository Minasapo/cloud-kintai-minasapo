import { DailyReportStatus } from "@shared/api/graphql/types";
import dayjs from "dayjs";

import {
  buildDailyReportCsv,
  formatDailyReportFileName,
} from "../AdminDailyReportManagement";
import type { AdminDailyReport } from "../data";

const createReport = (
  overrides: Partial<AdminDailyReport> = {}
): AdminDailyReport => ({
  id: "report-1",
  staffId: "staff-1",
  date: "2024-01-01",
  author: "山田 太郎",
  title: "タイトル1",
  content: "本文1",
  status: DailyReportStatus.SUBMITTED,
  updatedAt: "2024-01-01T12:00:00Z",
  createdAt: "2024-01-01T09:00:00Z",
  reactions: [],
  comments: [],
  ...overrides,
});

describe("buildDailyReportCsv", () => {
  test("ソート順とエスケープを適用してCSVを生成する", () => {
    const reports: AdminDailyReport[] = [
      createReport({
        id: "older",
        content: '本文1, "改行"\nあり',
        title: 'タイトル1 "引用"',
        updatedAt: "2024-01-02T10:00:00Z",
      }),
      createReport({
        id: "newer",
        date: "2024-01-02",
        staffId: "staff-2",
        author: "佐藤 次郎",
        title: "二件目",
        content: "二件目の本文",
        updatedAt: "2024-01-02T09:00:00Z",
        createdAt: "2024-01-02T08:00:00Z",
      }),
    ];

    const csv = buildDailyReportCsv(reports);

    expect(csv).toBe(
      [
        "日付,スタッフID,スタッフ名,タイトル,内容,作成日時,更新日時",
        "2024-01-02,staff-2,佐藤 次郎,二件目,二件目の本文,2024-01-02T08:00:00Z,2024-01-02T09:00:00Z",
        '2024-01-01,staff-1,山田 太郎,"タイトル1 ""引用""","本文1, ""改行"" あり",2024-01-01T09:00:00Z,2024-01-02T10:00:00Z',
      ].join("\n")
    );
  });
});

describe("formatDailyReportFileName", () => {
  test("指定日時をフォーマットしてファイル名を作成する", () => {
    expect(formatDailyReportFileName(dayjs("2026-01-19T14:30:25"))).toBe(
      "daily_reports_20260119_143025.csv"
    );
  });
});
