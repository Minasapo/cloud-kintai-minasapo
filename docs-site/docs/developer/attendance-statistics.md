---
sidebar_position: 6
title: 稼働統計ページ仕様
description: スタッフ向け稼働統計ページの表示条件、集計ロジック、取得データ範囲を整理します。
---

# 稼働統計ページ仕様

このページは、スタッフ向け `稼働統計` ページ（`/attendance/stats`）の仕様をまとめる。

## 目的

スタッフ本人が、年単位で稼働実績を確認できるようにする。

- 年間合計の稼働時間、稼働日数を確認できる
- 月ごとの実績差分を確認できる
- 有給、特別休暇、欠勤の記録数を年単位で俯瞰できる

## 表示条件

ページ表示はアプリ設定 `attendanceStatisticsEnabled` によって制御する。

- `true`: メニューに表示し、`/attendance/stats` を開ける
- `false`: メニューから非表示にし、直接アクセス時は `/attendance/list` へリダイレクトする

主な実装:

- `src/pages/attendance/statistics/AttendanceStatisticsPage.tsx`
- `src/widgets/layout/header/NavigationMenu.tsx`
- `src/features/admin/configManagement/ui/AttendanceStatisticsSection.tsx`

## 集計対象の取得

表示対象はログイン中スタッフ本人の勤怠データのみ。

- スタッフ ID: `AuthContext.cognitoUser.id`
- 勤怠取得 API: `useListAttendancesByDateRangeQuery()`
- 締め日取得: `useCloseDates()`

`useListAttendancesByDateRangeQuery()` はプレースホルダーを補完せず、実在する勤怠レコードだけを返す。このため、稼働日数は「期間内の日数」ではなく「開始時刻と終了時刻を持つ勤怠レコード数」として計上される。

主な実装:

- `src/features/attendance/statistics/ui/AttendanceStatistics.tsx`
- `src/entities/attendance/api/attendanceApi.ts`
- `src/entities/attendance/model/useCloseDates.ts`

## 年間の期間決定

`buildMonthlyTerms(year, closeDates)` で選択年 12 か月分の集計期間を構築する。

### ルール

1. まず 1 月から 12 月まで、各月の `月初〜月末` を fallback として用意する
1. `closeDate.year() === 選択年` の `CloseDate` だけを対象にする
1. 同じ月に複数 `CloseDate` がある場合は、`updatedAt` が最新のものを採用する
1. 採用された `CloseDate` がある月は、その `startDate〜endDate` で上書きする

結果として、年全体の API 取得範囲は次になる。

- 開始日: 12 か月分の `start` の最小値
- 終了日: 12 か月分の `end` の最大値

## 集計ロジック

`buildMonthlyStats(attendances, monthlyTerms)` で月別サマリーを算出する。

### 月の割り当て

- まず `workDate` がどの `MonthlyTerm` に含まれるかを探す
- どの期間にも含まれない場合は `workDate.month()` の暦月へ入れる

### 指標の算出

- `paidHolidayFlag === true`: `paidDays` を `+1`
- `specialHolidayFlag === true`: `specialHolidayDays` を `+1`
- `absentFlag === true`: `absentDays` を `+1`
- `startTime` と `endTime` の両方がある: `workDays` を `+1`

稼働時間 `workHours` は次で計算する。

1. `calcTotalWorkTime(startTime, endTime)` で総勤務時間を求める
1. `rests` のうち開始時刻と終了時刻が両方ある休憩だけを合算する
1. `gross - totalRest` を実稼働時間として加算する
1. 負値は `0` に丸め、月累計は小数 1 桁で保持する

## 画面表示

ページは次の 2 ブロックで構成する。

- 年間サマリー: `稼働日数` `稼働時間` `有給取得` `特別休暇` `欠勤`
- 月別サマリー: 月ごとの対象期間、稼働時間、稼働日、有給、特別休暇、欠勤

補助表示:

- fallback 月がある場合: `集計対象月が未登録の期間は、暫定で月初〜月末を集計期間として使用しています。`
- 締め日取得失敗時: `集計対象月の取得に失敗したため、暫定の集計期間で表示しています。`
- 勤怠取得失敗時: API エラー文言、または `稼働統計の取得に失敗しました`

## 実装時の注意

- 表示可否はページ側とナビゲーション側の両方で制御する
- 月別集計は `workDate` ベースなので、締め期間が暦月をまたいでも対象期間優先で再配置される
- `paidHolidayFlag` などの休暇系フラグと `workDays` は独立集計なので、同一日に複数指標が同時加算されうる
- fallback 月の存在は異常ではなく、未設定月を暫定表示する仕様

## 関連仕様

- [機能別データ取得期間](./data-fetch-periods.md)
- [締め日 CloseDate システム仕様](./close-date-system.md)
