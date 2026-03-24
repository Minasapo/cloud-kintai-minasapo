# 権限別画面一覧

このドキュメントは、勤怠システム内で確認できる画面を権限別に整理したものです。
ルーティング定義、メニュー定義、画面コンポーネントの実装をもとに作成しています。

主な参照元:
- `src/router.tsx`
- `src/router/adminChildRoutes.tsx`
- `src/shared/config/menuItems.ts`
- `src/features/admin/layout/model/useHeaderMenu.ts`
- `src/pages/admin/AdminMasterLayout.tsx`

## 一覧

| 権限 | 画面 | パス | 補足 |
| --- | --- | --- | --- |
| 未認証 | ログイン | `/login` | 認証入口 |
| 未認証/認証後共通 | Not Found | `*` | 不正URL時 |
| スタッフ | 勤怠打刻 | `/` `/register` | 通常のトップ画面 |
| スタッフ | 勤怠一覧 | `/attendance/list` | 月次/日次の勤怠確認 |
| スタッフ | 稼働統計 | `/attendance/stats` | 機能フラグ有効時のみメニュー表示 |
| スタッフ | 日報 | `/attendance/report` | 自分の日報作成・閲覧 |
| スタッフ | 勤怠編集 | `/attendance/:targetWorkDate/edit` | 自分の勤怠修正 |
| スタッフ | ワークフロー一覧 | `/workflow` | 申請一覧 |
| スタッフ | ワークフロー新規作成 | `/workflow/new` | 新規申請 |
| スタッフ | ワークフロー詳細 | `/workflow/:id` | 申請内容確認 |
| スタッフ | ワークフロー編集 | `/workflow/:id/edit` | 状態次第で編集 |
| スタッフ | 希望シフト | `/shift` | 設定次第で共同編集画面に切替 |
| スタッフ | 共同編集シフト | `/shift/collaborative` | collaborative モード時 |
| スタッフ | 個人設定 | `/profile` | プロフィール/個人設定 |
| スタッフ | 通知 | `/notifications` | ワークフロー通知一覧 |
| オペレーター | QR表示 | `/office/qr` | オフィスモード用メイン画面 |
| オペレーター | QR打刻登録 | `/office/qr/register` | QR経由の打刻 |
| オペレーター | オフィス入口 | `/office` | 実装上は `/office/qr` に遷移 |
| 管理者 | 管理ダッシュボード | `/admin` | 管理画面の入口 |
| 管理者 | 勤怠管理 | `/admin/attendances` | 全体勤怠の確認 |
| 管理者 | 日別勤怠管理 | `/admin/attendances/:targetWorkDate` | 指定日の一覧 |
| 管理者 | 勤怠編集 | `/admin/attendances/edit/:targetWorkDate/:staffId` | 管理者編集 |
| 管理者 | 勤怠履歴 | `/admin/attendances/history/:targetWorkDate/:staffId` | 修正履歴 |
| 管理者 | 勤怠印刷 | `/admin/attendances/print` | 印刷用 |
| 管理者 | スタッフ一覧 | `/admin/staff` | スタッフ管理トップ |
| 管理者 | スタッフ詳細相当 | `/admin/staff/:staffId` | 同系統画面で表示 |
| 管理者 | スタッフ別勤怠一覧 | `/admin/staff/:staffId/attendance` | 個別スタッフの勤怠 |
| 管理者 | スタッフ編集 | `/admin/staff/:staffId/edit` | スタッフ情報編集 |
| 管理者 | シフト管理 | `/admin/shift` | 管理者向けシフト調整 |
| 管理者 | 日別シフト | `/admin/shift/day/:date` | 日単位ビュー |
| 管理者 | スタッフ別シフト詳細 | `/admin/shift/:staffId` | 個人別表示 |
| 管理者 | シフト計画 | `/admin/shift-plan` | 月次/週次計画 |
| 管理者 | 日報管理 | `/admin/daily-report` | 提出日報の確認 |
| 管理者 | 日報詳細 | `/admin/daily-report/:id` | 個別日報 |
| 管理者 | ワークフロー管理 | `/admin/workflow` | 管理者向け申請一覧 |
| 管理者 | ワークフロー詳細 | `/admin/workflow/:id` | 管理者向け申請詳細 |
| 管理者 | ログ | `/admin/logs` | 操作ログ/監査 |
| 管理者 | 設定トップ | `/admin/master` | 各種マスタ設定入口 |
| 管理者 | 集計対象月 | `/admin/master/job_term` | 締め日/集計対象月設定 |
| 管理者 | カレンダー設定 | `/admin/master/holiday_calendar` | 休日カレンダー管理 |
| 管理者 | テーマ | `/admin/master/theme` | UIテーマ設定 |
| 管理者 | シフト設定 | `/admin/master/shift` | シフト表示やグループ設定 |
| 管理者 | ワークフロー設定 | `/admin/master/workflow` | 申請カテゴリ設定 |
| 管理者 | 勤務時間設定 | `/admin/master/feature_management/working_time` | 勤怠機能設定 |
| 管理者 | 午前/午後休設定 | `/admin/master/feature_management/am_pm_holiday` | 半休設定 |
| 管理者 | 出勤モード設定 | `/admin/master/feature_management/office_mode` | オフィスモード設定 |
| 管理者 | 稼働統計設定 | `/admin/master/feature_management/attendance_statistics` | 統計機能ON/OFF系 |
| 管理者 | 残業確認設定 | `/admin/master/feature_management/overtime_confirmation` | 残業関連設定 |
| 管理者 | 外部リンク設定 | `/admin/master/feature_management/links` | リンク集管理 |
| 管理者 | 打刻理由設定 | `/admin/master/feature_management/reasons` | 修正理由候補管理 |
| 管理者 | クイック入力設定 | `/admin/master/feature_management/quick_input` | 簡単入力設定 |
| 管理者 | 特別休暇設定 | `/admin/master/feature_management/special_holiday` | 特休設定 |
| 管理者 | 欠勤設定 | `/admin/master/feature_management/absent` | 欠勤設定 |
| 管理者 | 開発者向け設定 | `/admin/master/developer` | 内部向け機能 |
| 管理者 | エクスポート | `/admin/master/export` | スキーマ/データ出力 |
| 開発/内部 | デザイントークンプレビュー | `/preview/design-tokens` | 利用者向けではない |

## 補足

- スタッフ向けの `勤怠打刻` は環境変数により無効化される場合があります。
- スタッフ向けの `稼働統計` は設定によりメニューから非表示になる場合があります。
- スタッフ向けの `シフト` は設定によって通常の希望シフト画面ではなく共同編集画面を表示します。
- オペレーター権限のユーザーは `register` から `office/qr` へ誘導されます。
- 管理ダッシュボードは分割ビュー対応で、一部画面を右ペインに表示できます。
