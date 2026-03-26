---
applyTo: "src/pages/Register.tsx,src/pages/register/RegisterContent.tsx,src/features/attendance/time-recorder/ui/RegisterDashboard.tsx,src/features/attendance/time-recorder/ui/RegisterAnnouncementPanel.tsx,src/features/attendance/time-recorder/ui/RegisterAttendanceSummaryCard.tsx,src/features/attendance/time-recorder/ui/TimeRecorder.tsx,src/widgets/layout/header/AdminPendingApprovalSummary.tsx"
---

# 打刻ダッシュボード

この領域は、/register の打刻画面右側に表示されるダッシュボードを扱います。主な入口は src/pages/Register.tsx と src/pages/register/RegisterContent.tsx で、ダッシュボード内の各カードは time-recorder 配下の UI と管理者向け集計ウィジェットで構成されています。

打刻ダッシュボードは単なる補助 UI ではなく、現在の勤務状況、運用アナウンス、未承認申請、最近の勤務集計を 1 か所にまとめて確認するための業務導線です。表示内容を変える場合は、打刻操作中の認知負荷が増えないことを優先してください。

## 実装ガードレール (2026-03)

- /register では、StaffRole.OPERATOR は打刻画面を使わず /office/qr へ遷移する。ダッシュボード前提の UI 追加を OPERATOR に依存させない。
- VITE_STANDARD_REGISTER_DISABLE が true の場合、Register.tsx は利用不可アラートのみを表示し、ダッシュボードは描画しない。このガードを迂回しない。
- ダッシュボードの aside は lg 以上でのみ表示される。モバイルで見せる必要がある情報を追加する場合は、別途モバイル導線を用意する。
- 右カラムの情報源は TimeRecorder からのコールバックと、各カード内での個別データ取得に分かれている。別の状態源を増やす前に既存フローへ統合できるかを検討する。
- テスト用の data-testid は E2E や UI 検証の参照点になりやすいため、変更は慎重に行う。特に register-dashboard-\* と admin-pending-approval-summary 系の命名は維持を優先する。

## 画面構成

### レイアウト

- RegisterContent は左に TimeRecorder、右に RegisterDashboard を置く 2 カラム構成を採用している。
- ダッシュボード領域の並び順は以下を基本とする。
  1. RegisterAnnouncementPanel
  2. AdminPendingApprovalSummary
  3. 経過時間カード 2 枚
  4. RegisterAttendanceSummaryCard
- 背景は打刻体験の補助として淡いグラデーションと radial-gradient を使っている。ダッシュボードの視認性を落とす強い装飾変更は避ける。

### アナウンスカード

- RegisterAnnouncementPanel は AppConfigContext 由来の announcement を表示する。
- 表示条件は announcement.enabled が true、message が空白でない、かつ localStorage 上で未 dismiss の場合のみ。
- dismiss 状態は configId と message から生成したキーで保持する。同一メッセージの再表示制御を壊さないため、キー生成規則を安易に変更しない。
- アナウンスカードは sticky top-4 で固定される。縦に長い右カラムでも見失わないことが目的なので、固定表示を外す場合は代替根拠が必要。
- 常に最上位に表示されること

### 管理者向け未承認申請カード

- AdminPendingApprovalSummary は管理者ロール専用で、一般スタッフには表示しない。
- 表示対象ロールは ADMIN、STAFF_ADMIN、OWNER。
- 勤怠修正申請件数とワークフロー申請件数の 2 カードを表示し、それぞれ /admin/attendances と /admin/workflow へ遷移する。
- 勤怠修正申請件数は直近 30 日の attendance を GraphQL でたどり、未承認 change request がある staffId + workDate の組をユニーク件数として集計する。
- 勤怠件数の更新は onCreateAttendance / onUpdateAttendance / onDeleteAttendance の Subscription を使って再集計する。ポーリングへ置き換えない。

### 経過時間カード

- 経過時間カードは TimeRecorder から受け取る elapsedWorkInfo.visible が true のときだけ表示する。
- 表示条件は、当日の attendance に startTime があり、勤務状態が WORKING または RESTING であること。
- 現在の勤務時間は startTime から現在時刻までの総経過時間から、完了済み休憩と進行中休憩を含む休憩時間を差し引いた正味時間を表示する。
- AppConfig の既定昼休憩終了時刻を過ぎた時点では、実休憩の記録有無にかかわらず、AppConfig の既定昼休憩時間を勤務時間から除外する仕様とする。
- 現在の休憩時間は RESTING 中の最新の未終了休憩のみをカウントする。勤務中は 00:00 でもなくカード自体を TimeRecorder の visible 条件に従って表示する。
- ラベルは HH:mm 固定でゼロ埋めとする。

### 直近の勤務状況カード

- RegisterAttendanceSummaryCard は、最近の勤務集計を 1 枚にまとめるカードである。
- 集計対象期間は単純な当月固定ではなく、AppConfig で設定している集計期間を対象にする。
- 実装上は useCloseDates で取得した締め期間を AppConfig の集計期間設定として扱い、対象月に該当する締め期間を優先する。対象月に締め期間がなければ月初から月末を使う。
- 締め期間が当月境界をまたぐ場合でも、取得クエリは当月内にクランプし、表示集計は effectiveDateRange で再フィルタする。
- 当日は集計途中の値が混在するため、直近の勤務状況カードの計算対象に含めない。
- 合計勤務時間は startTime と endTime が揃った attendance のみ対象とし、休憩時間を差し引いた正味時間を使う。
- 勤務日数は filteredAttendances の件数をそのまま使う。
- 打刻エラー件数は TimeRecorder が算出した値を props で受け取る。attendance の状態判定ロジックをこのカード側で再実装しない。
- エラー件数が 1 件以上のときは強調色を維持し、異常が視覚的に分かる状態を保つ。
- ローディング中または集計失敗時は合計勤務時間と勤務日数を -- 表示にする。

### 勤務状況チャート

- チャートは期間内の日ごとの勤務時間と残業時間を stacked bar で表示する。
- 勤務時間は日単位の正味勤務時間、残業時間は standardWorkHours を超過した分のみを別系列で表す。
- 当日は集計途中の値が混在するため、チャートの計算対象に含めない。
- 残業時間データは負値として描画して上下に分けて見せているため、正負の意味を崩す実装変更を避ける。
- ツールチップ表示は絶対値の時間表記を維持し、見た目の負値をそのまま読ませない。
- startTime または endTime が欠けた attendance はチャート集計から除外する。

## 算出・集計ルール

### 管理者向け未承認申請カード

- 勤怠修正申請件数 = `count(distinct staffId + workDate)` where `workDate >= today - 30 days` and `hasUnapprovedChangeRequest(attendance.changeRequests) === true`
- 同一スタッフが同じ workDate に複数の未承認 change request を持っていても 1 件として数える。
- `staffId` が欠けた attendance は件数対象から除外する。
- ワークフロー申請件数 = `count(workflow)` where `workflow.status in {SUBMITTED, PENDING}`
- どちらのカードも表示ラベルは `N件` 形式とし、勤怠修正申請は再集計中のみ `集計中` を表示する。

### 経過時間カード

- `grossWorkMinutes = diffInMinutes(now, attendance.startTime)`
- `recordedRestMinutes = Σ diffInMinutes(rest.endTime ?? now, rest.startTime)` for each rest with `rest.startTime != null`
- `defaultLunchMinutes = max(diffInMinutes(appConfig.lunchRestEndTime, appConfig.lunchRestStartTime), 0)`
- `shouldDeductDefaultLunch = now >= appConfig.lunchRestEndTime && attendance.startTime <= appConfig.lunchRestEndTime`
- `effectiveRestMinutes = recordedRestMinutes + (shouldDeductDefaultLunch ? defaultLunchMinutes : 0)`
- `netWorkMinutes = max(grossWorkMinutes - effectiveRestMinutes, 0)`
- 現在の勤務時間ラベル = `formatHHmm(netWorkMinutes)`
- 進行中休憩 = `rests` のうち `startTime != null && endTime == null` を満たす要素のうち、`startTime` が最新の 1 件
- `activeRestMinutes = workStatus === RESTING && activeRest.startTime != null ? diffInMinutes(now, activeRest.startTime) : 0`
- 現在の休憩時間ラベル = `formatHHmm(activeRestMinutes)`
- `formatHHmm(x)` は `hours = floor(x / 60)`、`minutes = x % 60` を 2 桁ゼロ埋めした `HH:mm` 文字列
- `diffInMinutes(end, start)` は分単位差分を整数化し、負値は 0 に丸める。
- `appConfig.lunchRestStartTime` と `appConfig.lunchRestEndTime` は AppConfigContext の `getLunchRestStartTime()` と `getLunchRestEndTime()` を基準値とする。
- 明示的に昼休憩が記録されている場合は二重控除を避けること。実装時は、既定昼休憩帯と重複する記録済み休憩時間を控除済みとして扱う。

### 直近の勤務状況カード

#### 集計期間

- `currentMonth = today.startOf("month")`
- `monthStart = currentMonth.startOf("month")`
- `monthEnd = currentMonth.endOf("month")`
- 集計対象期間の基準値は AppConfig で設定されている締め期間であり、UI 側では useCloseDates から取得した closeDates をその投影値として扱う。
- `applicableCloseDates = closeDates` のうち `startDate/endDate` が有効で、かつ `[startDate, endDate]` が `[monthStart, monthEnd]` と重なる要素
- `effectiveDateRange` は次の優先順で 1 つに決める。
  1. `today` を内包する `applicableCloseDates` があればその start/end
  2. なければ `updatedAt ?? closeDate` が最大の要素の start/end
  3. それもなければ `[monthStart, monthEnd]`
- `queryDateRange.start = effectiveDateRange.start < monthStart ? effectiveDateRange.start : monthStart`
- `queryDateRange.end = effectiveDateRange.end > monthEnd ? effectiveDateRange.end : monthEnd`
- 実際の画面集計対象 `filteredAttendances` は、取得済み attendance のうち `effectiveDateRange.start <= workDate <= effectiveDateRange.end` かつ `workDate < today` を満たすものだけ。

#### サマリー値

- 合計勤務時間 = `Σ (calcTotalWorkTime(attendance.startTime, attendance.endTime) - Σ calcTotalRestTime(rest.startTime, rest.endTime))`
- ただし外側の attendance 集計対象は `workDate < today && startTime != null && endTime != null` を満たすものだけ。
- 休憩集計対象は `rest.startTime != null && rest.endTime != null` を満たす rest だけ。
- 表示ラベルは `totalHours.toFixed(1) + "h"`
- 勤務日数 = `filteredAttendances.length`
- 表示ラベルは `workDays + "日"`
- 打刻エラー件数 = `attendanceErrorCount` props をそのまま採用し、表示ラベルは `attendanceErrorCount + "件"`
- `attendanceErrorCount > 0` のときのみエラー件数ラベルを強調色にする。
- `isLoading = closeDatesLoading || attendanceLoading || attendanceFetching || attendanceUninitialized`
- `hasError = Boolean(closeDatesError || attendancesError)`
- `hasError || isLoading` のとき、合計勤務時間と勤務日数は `--` を表示する。
- チャート右上の `対象データ N件` は `count(filteredAttendances where startTime != null && endTime != null)` を使う。

### 勤務状況チャート

- `standardWorkHours = max(getStandardWorkHours(), 0)`
- 各 attendance の日単位正味勤務時間 = `workDate < today ? max(calcTotalWorkTime(startTime, endTime) - Σ calcTotalRestTime(rest.startTime, rest.endTime), 0) : 0`
- `netWorkHoursByDate[workDate] += 日単位正味勤務時間`
- チャートの日付軸は `effectiveDateRange.start` から `effectiveDateRange.end` まで 1 日ずつ欠番なく生成する。
- 各日付の勤務時間 = `Number((netWorkHoursByDate[workDate] ?? 0).toFixed(2))`
- 各日付の残業時間 = `Number(max(勤務時間 - standardWorkHours, 0).toFixed(2))`
- 描画データは以下の 2 系列固定を基本とする。
  - 勤務時間系列: `data = workHours`
  - 残業時間系列: `data = -overtimeHours`
- 表示対象の日が 1 件もなくても、期間日数分のラベルは生成される。空表示は `chartSummary.length === 0` ではなく、実質的には期間計算の成立可否に依存している点に注意する。

## データフロー

### Register.tsx

- AppConfigContext から configId と time recorder announcement を取得し、RegisterContent へ渡す。
- 入口レベルで利用可否判定とロール別遷移を処理するため、ダッシュボード側で同じ判定を重複実装しない。

### RegisterContent.tsx

- attendanceErrorCount は TimeRecorder から受け取って RegisterDashboard に渡す。
- elapsedWorkInfo も TimeRecorder から受け取り、RegisterDashboard に渡す。

### RegisterDashboard.tsx

- 右カラム全体の並び順と存在条件は RegisterDashboard を基準に管理する。
- ダッシュボードの各カードは疎結合に保ちつつ、RegisterDashboard でまとめて描画する。

### TimeRecorder.tsx

- ダッシュボード向けの派生値として attendanceErrorCount と elapsedWorkInfo を公開している。
- attendanceErrorCount は recent attendances を AttendanceState で判定し、AttendanceStatus.Error の件数を数える。
- 1 週間以上経過した打刻エラー判定も TimeRecorder 側の責務であり、ダッシュボード側で独自判定を追加しない。
- elapsedWorkInfo は attendance と workStatus に依存し、一定間隔の tick で再計算される。右カラム側で独自タイマーを持たない。

## TimeRecorder の派生値ルール

- `attendanceErrorCount = count(attendances where new AttendanceState(staff, attendance, holidayCalendars, companyHolidayCalendars).get() === AttendanceStatus.Error)`
- `isTimeElapsedError = exists(attendance)` where `today > workDate + 1 week` and `AttendanceState(...).get() === AttendanceStatus.Error`
- `elapsedWorkInfo.visible = attendance.startTime != null && workStatus in {WORKING, RESTING}`
- visible が false のときは `workDurationLabel = "00:00"`、`restDurationLabel = "00:00"`、ただしカード自体は非表示とする。

## 変更時の着眼点

- カード追加時は desktop only の aside に閉じ込めてよい情報かを先に判断する。
- 勤怠件数や勤務時間の定義は給与計算や申請導線に影響するため、表示名だけでなく算出根拠も維持する。
- 管理者向け情報を追加する場合は、ロール制御を RegisterContent ではなくカード内部または明示的な条件分岐で扱う。
- AppConfig 依存のアナウンス文言は運用変更で頻繁に差し替わる可能性がある。文言内容に依存した条件分岐を UI 側へ増やさない。
- 集計カードや申請カードの変更時は、少なくともローディング中、件数ゼロ、エラー発生、管理者以外、勤務中、休憩中の表示差分を確認する。
