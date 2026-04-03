---
sidebar_position: 3
---

# 打刻エラー一覧の表示仕様

`/attendance/list` のデスクトップ画面に表示される「打刻エラー一覧」と、モバイル画面の警告アラートの表示条件を定義する。

`attendanceManagementEnabled` フラグ自体の仕様は [attendanceManagementEnabled フラグ仕様](./attendance-management-enabled.md) を参照する。

## 対象期間

`effectiveDateRange`（有効集計期間）を基準とする。未来日は除外する。

- 締め日（CloseDate）設定がある場合は、その締め日期間（例: 前月 25 日〜当月 24 日）が有効集計期間となる。
- 締め日設定がない場合は、選択中のカレンダー月（月初〜月末）にフォールバックする。

`effectiveDateRange` の算出ロジックは `attendanceListUtils.ts` の `getEffectiveDateRange()` を参照。

## 表示対象スタッフ

`attendanceManagementEnabled` フラグで制御する。`false` が設定されたスタッフは打刻エラー一覧に表示されない。判定ロジックの詳細は [attendanceManagementEnabled フラグ仕様](./attendance-management-enabled.md) を参照。

## エラー判定ロジック

判定ロジックの詳細（ステータス決定の全優先度・条件一覧）は [勤怠ステータス判定ロジック](./attendance-status-determination.md) を参照。

対象期間の**全日付**に対して `getStatus(attendance | undefined, staff, holidayCalendars, companyHolidayCalendars, date)` を呼び出し、返り値が `Error` または `Late` の日をエラーとして収集する。

## デスクトップとモバイルの差異

| 項目               | デスクトップ（打刻エラー一覧テーブル）             | モバイル（警告アラート）                    |
| ------------------ | -------------------------------------------------- | ------------------------------------------- |
| 表示形式           | 行ごとに勤務日・時刻・編集リンクを表示するテーブル | 「打刻エラーがあります」アラートのみ        |
| レコード欠損の検出 | 全日ループで検出                                   | 全日ループで検出（`hasErrorOrLateInMonth`） |
| 締め日期間の扱い   | `effectiveDateRange` を使用                        | `effectiveDateRange` を使用                 |

## 実装ファイル

| ファイル                                                         | 役割                                                       |
| ---------------------------------------------------------------- | ---------------------------------------------------------- |
| `src/features/attendance/list/ui/DesktopList.tsx`                | デスクトップ版エラーテーブルの算出・表示                   |
| `src/features/attendance/list/ui/MobileList/MobileList.tsx`      | モバイル版警告アラートの表示制御                           |
| `src/features/attendance/list/ui/MobileList/mobileListStatus.ts` | `hasErrorOrLateInMonth()` — 月内エラー有無判定             |
| `src/features/attendance/list/lib/attendanceStatusUtils.ts`      | `getStatus()` — 単日のステータス判定（レコード欠損対応）   |
| `src/entities/attendance/lib/AttendanceState.ts`                 | `AttendanceState.get()` — 勤怠レコードがある場合の詳細判定 |
| `src/entities/staff/lib/attendanceManagement.ts`                 | `isAttendanceManagementEnabled()` — フラグ正規化           |
