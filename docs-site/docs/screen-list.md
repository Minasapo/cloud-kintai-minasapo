---
title: 画面一覧
description: 本アプリで利用する画面を権限別に横断して確認できる一覧です。
---

# 画面一覧

このページでは、本アプリで利用する画面を権限別にまとめています。
画面名から入口を探したいときの索引として使い、具体的な操作手順は各ガイドページを参照してください。

## 使い分け

- 役割ごとの入口を見たい: [スタッフ向けガイド](./staff/overview)、[管理者向けガイド](./admin/overview)
- 目的から探したい: [画面遷移マップ（スタッフ向け）](./staff/navigation-map)、[画面遷移マップ（管理者向け）](./admin/navigation-map)
- 機能単位で探したい: [機能別ガイド（スタッフ向け）](./staff/features)、[機能別ガイド（管理者向け）](./admin/features)

## 共通

| 権限 | 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- | --- |
| 未認証 | ログイン | 認証の入口 | [はじめに](./intro) | パス: `/login` |
| 未認証 / 認証後共通 | Not Found | 不正な URL を開いたときに表示するエラー画面 | [はじめに](./intro) | パス: `*` |

## スタッフ

### 打刻と勤怠

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| 勤怠打刻 | 出勤、休憩、退勤を記録する入口 | [出退勤を打刻する](./staff/time-recording) | パス: `/`, `/register` |
| 勤怠一覧 | 当日や過去日の勤怠を確認する | [勤怠を確認する](./staff/attendance-check) | パス: `/attendance/list` |
| 稼働統計 | 年間や月別の稼働実績を確認する | [稼働統計を確認する](./staff/attendance-statistics) | パス: `/attendance/stats`。設定により非表示になる場合があります。 |
| 日報 | 自分の日報を記録、更新、提出する | [日報を記録する](./staff/attendance-report) | パス: `/attendance/report` |
| 勤怠編集 | 自分の勤怠修正申請を行う | [勤怠を修正する](./staff/attendance-edit) | パス: `/attendance/:targetWorkDate/edit` |

### 申請

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| ワークフロー一覧 | 申請の一覧と状態を確認する | [ワークフロー申請を操作する](./staff/workflow) | パス: `/workflow` |
| ワークフロー新規作成 | 新しい申請を作成する | [ワークフロー申請を操作する](./staff/workflow) | パス: `/workflow/new` |
| ワークフロー詳細 | 提出済み申請の内容や状態を確認する | [ワークフロー申請を操作する](./staff/workflow) | パス: `/workflow/:id` |
| ワークフロー編集 | 下書きや差し戻し後の申請を編集する | [ワークフロー申請を操作する](./staff/workflow) | パス: `/workflow/:id/edit` |
| 通知 | ワークフロー通知の一覧を確認する | [ワークフロー申請を操作する](./staff/workflow) | パス: `/notifications`。通知機能有効時に利用します。 |

### シフトと個人設定

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| 希望シフト | 自分のシフトを確認、編集する | [シフトを確認・編集する](./staff/shift) | パス: `/shift` |
| 共同編集シフト | 複数人で共有しながらシフトを確認、編集する | [シフトを確認・編集する](./staff/shift) | パス: `/shift/collaborative`。設定によりこちらへ切り替わる場合があります。 |
| 個人設定 | 通知設定、個人リンク、ログイン情報を管理する | [個人設定を管理する](./staff/profile-settings) | パス: `/profile` |

## オペレーター

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| QR 表示 | オフィス端末で QR 打刻の受付画面を表示する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/office/qr`。オフィスモード運用向けです。 |
| QR 打刻登録 | QR 経由の打刻を登録する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/office/qr/register`。専用の操作ガイドは未整備です。 |
| オフィス入口 | オフィスモードの入口として利用する | [設定画面を管理する](./admin/settings-management) | パス: `/office`。実装上は `/office/qr` へ遷移します。 |

## 管理者

### ダッシュボードと勤怠管理

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| 管理ダッシュボード | 申請、勤怠、日報の優先対応を判断する | [ダッシュボードを確認する](./admin/dashboard) | パス: `/admin` |
| 勤怠管理 | 全体の勤怠一覧を確認する | [勤怠一覧を確認する](./admin/attendances) | パス: `/admin/attendances` |
| 日別勤怠管理 | 指定日の勤怠を日単位で確認する | [勤怠一覧を確認する](./admin/attendances) | パス: `/admin/attendances/:targetWorkDate` |
| 勤怠編集 | 管理者として対象スタッフの勤怠を編集する | [勤怠を管理する](./admin/attendance-management) | パス: `/admin/attendances/edit/:targetWorkDate/:staffId` |
| 勤怠履歴 | 対象勤怠の修正履歴を確認する | [勤怠を管理する](./admin/attendance-management) | パス: `/admin/attendances/history/:targetWorkDate/:staffId` |
| 勤怠印刷 | 印刷用の勤怠出力を確認する | [勤怠一覧を確認する](./admin/attendances) | パス: `/admin/attendances/print` |

### スタッフとシフト

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| スタッフ一覧 | 登録済みスタッフを検索、確認する | [スタッフを管理する](./admin/staff-management) | パス: `/admin/staff` |
| スタッフ詳細相当 | 対象スタッフの概要を確認する | [スタッフを管理する](./admin/staff-management) | パス: `/admin/staff/:staffId` |
| スタッフ別勤怠一覧 | 特定スタッフの勤怠を確認する | [スタッフを管理する](./admin/staff-management) | パス: `/admin/staff/:staffId/attendance` |
| スタッフ編集 | スタッフ情報や利用設定を編集する | [スタッフを管理する](./admin/staff-management) | パス: `/admin/staff/:staffId/edit` |
| シフト管理 | シフト全体を確認、調整する | [シフトを管理する](./admin/admin-shift) | パス: `/admin/shift` |
| 日別シフト | 指定日のシフトを日単位で確認する | [シフトを管理する](./admin/admin-shift) | パス: `/admin/shift/day/:date` |
| スタッフ別シフト詳細 | 特定スタッフのシフト詳細を確認する | [シフトを管理する](./admin/admin-shift) | パス: `/admin/shift/:staffId` |
| シフト計画 | 月次や週次のシフト計画を作成する | [シフト計画を作成する](./admin/shift-plan) | パス: `/admin/shift-plan` |

### 申請と監査

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| 日報管理 | 提出済みの日報を確認する | [日報を管理する](./admin/daily-report) | パス: `/admin/daily-report` |
| 日報詳細 | 個別の日報内容を確認する | [日報を管理する](./admin/daily-report) | パス: `/admin/daily-report/:id` |
| ワークフロー管理 | 申請一覧を確認して承認判断へ進む | [ワークフロー申請を管理する](./admin/workflow) | パス: `/admin/workflow` |
| ワークフロー詳細 | 個別申請の内容を確認して承認、却下する | [ワークフロー申請を管理する](./admin/workflow) | パス: `/admin/workflow/:id` |
| ログ | 操作履歴や監査情報を確認する | [操作ログを確認する](./admin/operation-logs) | パス: `/admin/logs` |

### 設定

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| 設定トップ | 設定カテゴリの入口として使う | [設定画面を管理する](./admin/settings-management) | パス: `/admin/master` |
| 集計対象月 | 締め日と集計対象期間を設定する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/job_term` |
| カレンダー設定 | 休日、会社休日、イベント日を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/holiday_calendar` |
| テーマ | ブランドカラーなどの表示設定を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/theme` |
| シフト設定 | シフト表示モードやグループを設定する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/shift` |
| ワークフロー設定 | 申請カテゴリや承認前提を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/workflow` |
| 勤務時間設定 | 標準の勤務時間や休憩前提を設定する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/working_time` |
| 午前 / 午後休設定 | 半休運用の設定を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/am_pm_holiday` |
| 出勤モード設定 | オフィスモードなどの打刻運用を設定する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/office_mode` |
| 稼働統計設定 | 稼働統計機能の表示有無を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/attendance_statistics` |
| 残業確認設定 | 残業確認の運用ルールを設定する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/overtime_confirmation` |
| 打刻画面アナウンス | 打刻画面に表示する案内文を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/time_recorder_announcement` |
| 外部リンク設定 | 打刻画面などから参照するリンクを管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/links` |
| 打刻理由設定 | 修正理由や選択肢を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/reasons` |
| クイック入力設定 | 勤怠編集で使う時刻候補を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/quick_input` |
| 特別休暇設定 | 特別休暇の利用可否と種別を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/special_holiday` |
| 欠勤設定 | 欠勤申請の利用可否を管理する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/feature_management/absent` |
| 開発者向け設定 | 内部向けの開発補助設定を確認する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/developer` |
| エクスポート | スキーマやデータ出力を実行する | [設定項目一覧を確認する](./admin/settings-item-list) | パス: `/admin/master/export` |

## 開発・内部

| 画面 | 何をする画面か | 関連ガイド | 補足 |
| --- | --- | --- | --- |
| デザイントークンプレビュー | デザイントークンの見え方を確認する | [デザインシステム概要](./developer/design-system/overview) | パス: `/preview/design-tokens`。利用者向けではありません。 |
