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

`attendanceManagementEnabled` フラグで制御する。

| 値              | 動作                         |
| --------------- | ---------------------------- |
| `true`          | 表示する                     |
| `null` / 未設定 | 表示する（未設定は有効扱い） |
| `false`         | 表示しない（明示的な無効化） |

このフラグはスタッフ単位で管理者が設定する。`isAttendanceManagementEnabled()` ヘルパー（`src/entities/staff/lib/attendanceManagement.ts`）で判定する。

## エラー判定ロジック

対象期間の**全日付**に対して `getStatus(attendance | undefined, staff, holidayCalendars, companyHolidayCalendars, date)` を呼び出し、返り値が `Error` または `Late` の日をエラーとして収集する。

勤怠レコードがある日もない日も同じ関数で判定しており、`getStatus()` 内部で以下の振り分けを行う。

### 勤怠レコードが存在しない日（丸ごと未打刻）

`getStatus(undefined, ...)` が呼ばれ、以下の条件に該当しない過去の営業日は `Error` を返す。

- 当日および未来日
- `usageStartDate`（利用開始日）より前の日付
- 非シフト勤務スタッフの祝日・会社休日・週末（`isHolidayLike` 判定）
- 有給休暇・振替休日が設定されている日

### 勤怠レコードが存在する日

`getStatus(attendance, ...)` が `AttendanceState.get()` に委譲し、返り値が `Error` または `Late` の場合にエラーとして収集する。

### ステータス一覧

| ステータス   | 意味                                                                   |
| ------------ | ---------------------------------------------------------------------- |
| `Error`      | 出勤時刻または退勤時刻が未入力の平日、またはレコードが存在しない営業日 |
| `Late`       | `Error` と同じ評価ルートで返されるケースあり                           |
| `Requesting` | 未承認の修正申請あり（エラー一覧には含まれない）                       |
| `OK`         | 正常                                                                   |
| `None`       | 判定対象外（当日・休日・未設定期間など）                               |

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
