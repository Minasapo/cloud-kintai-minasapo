---
sidebar_position: 6
title: 機能別データ取得期間
description: 勤怠、シフト、統計など主要機能で利用するデータ取得期間の基準を機能別に整理します。
---

# 機能別データ取得期間

集計や一覧表示で利用する「データ取得期間」の仕様を機能別に整理する。

## 早見表

| 機能                      | 取得期間 / 単位                                       | 主な実装                                                                                                                                 |
| ------------------------- | ----------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| 勤怠一覧 初期プリフェッチ | 当月月初〜月末                                        | `src/router/loaders/attendanceListLoader.ts`                                                                                             |
| 勤怠一覧 実効集計期間     | `CloseDate` 優先、未設定時は月初〜月末                | `src/features/attendance/list/ui/attendanceListUtils.ts`                                                                                 |
| 管理者スタッフ勤怠一覧    | 前月月初〜当月月末（2ヶ月分）                         | `src/features/admin/staffAttendanceList/model/useAdminStaffAttendanceListViewModel.ts`                                                   |
| 管理者ダッシュボード集計  | 当月の `CloseDate`（未設定時は月初〜月末）            | `src/features/admin/dashboard/model/useAdminDashboard.ts`                                                                                |
| 打刻ダッシュボード集計    | 当月の `CloseDate`（未設定時は月初〜月末、当日除外）  | `src/features/attendance/time-recorder/ui/TimeRecorder.tsx` `src/features/attendance/time-recorder/ui/RegisterAttendanceSummaryCard.tsx` |
| 年間稼働統計              | 選択年の 12 ヶ月（各月 `CloseDate` または月初〜月末） | `src/features/attendance/statistics/ui/AttendanceStatistics.tsx`                                                                         |
| 日次管理ビュー            | 表示日付の当月月初〜月末                              | `src/features/attendance/daily-list/model/useAttendanceDailyFetch.ts`                                                                    |
| 勤怠ダウンロード          | 初期値: 本日、プリセット: `CloseDate` 範囲            | `src/features/attendance/download-form/ui/DownloadForm.tsx`                                                                              |
| シフトリクエスト          | 月単位（`YYYY-MM`）                                   | `src/entities/shift/api/shiftApi.ts`                                                                                                     |
| シフト計画                | 年単位で 1〜12 月、各月 `editStart〜editEnd`          | `src/pages/admin/AdminShiftPlan/shiftPlanUtils.ts`                                                                                       |
| 休日カレンダー登録        | 最大 366 日                                           | `src/features/admin/holidayCalendar/lib/buildHolidayDateRange.ts`                                                                        |
| 利用開始日前の除外        | `usageStartDate` より前は打刻エラー判定対象外         | `src/features/attendance/list/lib/attendanceStatusUtils.ts`                                                                              |

## 勤怠一覧 初期プリフェッチ

画面ロード時は当月分を先読みする。

- 開始日: `dayjs().startOf("month")`
- 終了日: `dayjs().endOf("month")`

実装:

- `src/router/loaders/attendanceListLoader.ts`

## 勤怠一覧の実効集計期間

`effectiveDateRange` は `CloseDate` を優先して決定する。詳細ロジックは次を参照。

- [締め日 (CloseDate) システム仕様](./close-date-system.md)

実装:

- `src/features/attendance/list/ui/attendanceListUtils.ts`

## 管理者スタッフ勤怠一覧の取得期間

表示月に対して、次の範囲を取得する。

- 開始日: `表示月 - 1ヶ月` の月初
- 終了日: `表示月` の月末

例:

- 1 月表示時: 12/1 〜 1/31
- 2 月表示時: 1/1 〜 2/28(または 2/29)

実装:

- `src/features/admin/staffAttendanceList/model/useAdminStaffAttendanceListViewModel.ts`

## 管理者ダッシュボードの集計期間

当月基準で `resolveAggregationDateRange()` を使って集計期間を決定する。実体は `getEffectiveDateRange()` と同様の CloseDate 優先ロジック。

実装:

- `src/features/admin/dashboard/model/useAdminDashboard.ts`

## 打刻ダッシュボードの集計期間

`/register` のダッシュボードでは、勤務時間・勤務日数・打刻エラー件数が同じ集計期間を使う。

- 集計期間: 当月基準の `CloseDate`、未設定時は月初〜月末
- 打刻エラー件数: 集計期間内の `AttendanceStatus.Error` 日数
- 当日: 集計途中のため除外

実装:

- `src/features/attendance/time-recorder/ui/TimeRecorder.tsx`
- `src/features/attendance/time-recorder/ui/RegisterAttendanceSummaryCard.tsx`
- `src/entities/attendance/lib/aggregationDateRange.ts`

## 年間稼働統計の期間

`buildMonthlyTerms(year, closeDates)` で選択年 12 ヶ月分の期間を組み立てる。

- `CloseDate` がある月: `startDate〜endDate`
- ない月: `月初〜月末` (fallback)
- 同一月に複数ある場合: `updatedAt` 最新を採用

実装:

- `src/features/attendance/statistics/ui/AttendanceStatistics.tsx`

## 日次管理ビューの期間

表示対象日が属する当月だけを取得する。

- 開始日: `baseDate` の月初
- 終了日: `baseDate` の月末

実装:

- `src/features/attendance/daily-list/model/useAttendanceDailyFetch.ts`

## 勤怠ダウンロードの期間

ダウンロードフォームの日付初期値は開始・終了ともに本日。加えて、集計対象月プリセットで `CloseDate` の `startDate〜endDate` を一括反映できる。

実装:

- `src/features/attendance/download-form/ui/DownloadForm.tsx`
- `src/features/attendance/download-form/ui/DateRangePresetChips.tsx`

## シフト関連の期間

### シフトリクエスト

`targetMonth` を `YYYY-MM` で保持し、`targetMonth: { eq: targetMonth }` で完全一致取得する。

実装:

- `src/entities/shift/api/shiftApi.ts`

### シフト計画

年単位（1〜12月）で各月ごとに申請受付期間 `editStart〜editEnd` を持つ。初期値は月初〜月末。

実装:

- `src/pages/admin/AdminShiftPlan/shiftPlanUtils.ts`

## その他の期間制約

### 休日カレンダー登録上限

- `MAX_HOLIDAY_RANGE_DAYS = 366`

実装:

- `src/features/admin/holidayCalendar/lib/buildHolidayDateRange.ts`

### スタッフ利用開始日前の除外

`usageStartDate` より前の日付は、打刻エラー（欠損）判定の対象外。

実装:

- `src/features/attendance/list/lib/attendanceStatusUtils.ts`
