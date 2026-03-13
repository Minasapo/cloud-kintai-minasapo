---
applyTo: "src/pages/attendance/list/AttendanceListPage.tsx,src/pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList.tsx"
---

# 勤怠一覧ページ

このファイルは、勤怠一覧ページの実装を担当しています。ユーザーが自身の勤怠記録を確認・管理するためのインターフェースを提供します。

勤怠一覧ページは、スタッフ向けにデスクトップおよびモバイルの両方にビューを提供します。また、管理者向けには各スタッフの勤怠状況を一覧で確認できる管理者ビューも提供します。

スタッフ向けは、`src/pages/attendance/list/AttendanceListPage.tsx` に実装されています。管理者向けは、`src/pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList.tsx` に実装されています。

## 勤怠ステータス

勤怠一覧では、各勤怠記録のステータスが表示されます。ステータスは以下の 3 種類があります。

- **OK**: 勤怠が正常に記録されており、確認や対応が不要な状態です。
- **要確認**: 勤怠に不明点や確認が必要な項目がある状態です。スタッフまたは管理者による確認・修正が必要です。
- **申請中**: 勤怠の申請が行われているが、まだ承認されていない状態です。管理者による承認待ちを示します。

### チェック対象

勤怠ステータスは、過去日付の勤怠記録に対してチェックが行われます。当日の勤怠は確定前のため、ステータス判定から除外されます。

### チェック内容

勤怠ステータスは `src/lib/AttendanceState.ts` の `AttendanceState` クラスで判定されます。以下のチェックが順次行われます。

- **当日チェック**: 当日の勤怠は確定前のため、ステータスは「なし」として判定
- **利用開始日チェック**: スタッフの `usageStartDate`（利用開始日）よりも前の日付の勤怠記録は、ステータスが「なし」として扱われる
- **有給休暇・振替休日チェック**:
  - 有給休暇（`paidHolidayFlag` が true）の場合: **OK**
  - 振替休日（`substituteHolidayFlag` が true）の場合: **OK**
- **休日チェック**: 以下の条件に該当する場合、ステータスは「なし」として扱われます。
  - シフト制スタッフ（`workType === "shift"`）かつ `isDeemedHoliday` が true の場合
  - 通常勤務スタッフで、祝日または会社休日の場合
- **申請中チェック**: 勤怠の変更申請（`changeRequests`）が存在し、かつ未完了（`completed` が false）の申請がある場合: **申請中**
- 平日勤務チェック: 平日（シフト制の場合は常に平日扱い）の場合、以下の条件で判定されます。
  - 出勤時刻（`startTime`）が未入力の場合: **要確認**
  - 退勤時刻（`endTime`）が未入力の場合: **要確認**
  - 上記以外: **OK**
- **休日出勤チェック**: 休日（土日）に勤怠記録がある場合:
  - 出勤時刻・退勤時刻が両方未入力の場合: 「なし」
  - それ以外の場合: **OK**

## 管理者画面の「申請中のスタッフ」表示条件

管理者向け勤怠画面（`src/pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList.tsx`）では、申請中のスタッフ表示は次の条件で制御されます。

### 1. 「申請中」とみなす勤怠データの条件

- 対象データ: `attendances`（対象スタッフの勤怠一覧）
- 判定ロジック: `new ChangeRequest(attendance.changeRequests).getUnapprovedCount() > 0`
  - 実装箇所: `src/features/admin/staffAttendanceList/model/useAdminStaffAttendanceListViewModel.ts`
  - `ChangeRequest` クラスは `null` の申請要素を除外してから判定する
  - `completed === false` の申請を「未承認」としてカウントする

### 2. 画面に「申請中のスタッフ」セクションを表示する条件

- `pendingAttendances.length > 0` のときのみ表示する
  - 実装箇所: `src/features/admin/staffAttendanceList/ui/AdminStaffAttendanceList.tsx`
  - 0 件の場合はセクション自体を描画しない

### 3. セクション内の各行で表示される内容

- `pendingAttendances` の各勤怠を 1 行として表示する
- 行ごとの「申請確認」ボタンは `getBadgeContent(attendance) > 0` のときのみ表示する
- ここでの `getBadgeContent` も `ChangeRequest.getUnapprovedCount()` を利用するため、判定基準はセクション表示と同一
