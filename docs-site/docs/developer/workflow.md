---
sidebar_position: 7
title: ワークフロー機能仕様
description: ワークフロー機能の画面構成、データ更新経路、通知、設定依存、変更時の確認観点を整理します。
---

# ワークフロー機能仕様

このページは、ワークフロー機能のフロントエンド実装を理解し、変更影響を把握するための開発者向けガイドです。

## 目的

ワークフロー機能は、スタッフの申請作成から管理者の確認、コメント通知、設定反映までを扱います。

- スタッフが申請を作成、確認、編集、取り下げできる
- 管理者が申請を一覧確認し、承認、却下、コメント対応できる
- コメント追加時にアプリ内通知とメール通知を連携する
- AppConfig によってカテゴリ表示順や通知利用可否を切り替える

## 対象画面とルート

| 区分 | ルート | 主な役割 |
| --- | --- | --- |
| スタッフ | `/workflow` | 申請一覧、サマリー、フィルタ表示 |
| スタッフ | `/workflow/new` | 新規申請作成 |
| スタッフ | `/workflow/:id` | 申請詳細、コメント確認、編集、取り下げ |
| スタッフ | `/workflow/:id/edit` | 下書きまたは却下済み申請の更新 |
| 管理者 | `/admin/workflow` | 全体一覧、絞り込み、まとめて確認 |
| 管理者 | `/admin/workflow/:id` | 個別申請の詳細確認、承認、却下 |
| 管理者設定 | `/admin/workflow` | 一覧右上の設定ダイアログからカテゴリ順序、有効無効、テンプレート管理 |

## 実装の責務分割

### `entities/workflow`

- `api/workflowApi.ts`
  - `listWorkflows` / `getWorkflow` / `createWorkflow` / `updateWorkflow` / `deleteWorkflow` の RTK Query 入口
  - 一覧取得は `nextToken` をたどって全件取得する
- `model/useWorkflows.ts`
  - 一覧取得、作成、更新、削除の統一 hook
  - `onCreateWorkflow` / `onUpdateWorkflow` / `onDeleteWorkflow` を購読して一覧再取得する
  - 更新時は `version` と `updatedAt` を使った競合制御を付与する
- `model/loader.ts`
  - 詳細、編集画面向けに単体取得を行う loader 入口

### `features/workflow`

- `application-form`
  - カテゴリ別入力 UI、バリデーション、GraphQL input への変換を担当する
- `detail-panel`
  - 詳細表示、編集可否、取り下げ可否、メタ情報表示を担当する
- `approval-flow`
  - 承認ステップ表示用の view model を組み立てる
- `comment-thread`
  - コメント送信、競合リトライ、表示整形を担当する
- `notification` / `notifications`
  - アプリ内通知イベントとメール通知を担当する

### `pages`

- `src/pages/workflow/**`
  - スタッフ向けページ構成
- `src/pages/admin/AdminWorkflow/**`
  - 管理者向け一覧、詳細、承認導線

## データ取得と更新の流れ

### 一覧画面

- `/workflow` の loader は `workflowApi.endpoints.getWorkflows.initiate()` で事前取得する
- 画面表示中は `useWorkflows()` が一覧データを参照する
- 作成、更新、削除の mutation 後は RTK Query キャッシュを更新する
- GraphQL subscription を購読し、他端末の更新も一定遅延後に再取得する

### 詳細、編集画面

- `/workflow/:id` と `/workflow/:id/edit` は `resolveWorkflowLoaderData()` から単体取得する
- loader 取得結果は `workflowApi.util.upsertQueryData()` でキャッシュにも反映する
- 詳細画面は申請情報、承認フロー、コメント履歴を統合表示する

### 更新時の競合制御

- ワークフロー更新は `version` のインクリメントを前提に行う
- condition には `version` または `updatedAt` ベースの条件を付与する
- コメント更新は競合が起きやすいため、最新データ再取得のうえ最大 3 回まで再試行する

## フォームとカテゴリの扱い

申請フォームは `WorkflowFormState` を内部状態として持ち、送信時に GraphQL input へ変換します。

| カテゴリ | 主な入力項目 | 格納先の中心 |
| --- | --- | --- |
| 有給休暇申請 | 開始日、終了日、理由 | `overTimeDetails.startTime/endTime/reason` |
| 欠勤申請 | 欠勤日、理由 | `overTimeDetails.date/reason` |
| 残業申請 | 日付、開始時刻、終了時刻、理由 | `overTimeDetails.date/startTime/endTime/reason` |
| 打刻修正 | 対象日、修正時刻 | `overTimeDetails.date/startTime` または `endTime` |
| その他 | テンプレート、タイトル、詳細 | `customWorkflowTitle` / `customWorkflowContent` |

補足:

- フォーム上のカテゴリ表示名は `workflowLabels.ts` で管理する
- `その他` はテンプレート適用でタイトル、詳細を初期化できる
- 却下済み申請のみ再編集を許可し、提出済み以降は基本的に編集不可とする

## 承認フローとステータス

- 表示用ステータス名は `STATUS_LABELS` に集約する
- 承認フロー表示は `approvalSteps` が存在すればそれを優先する
- `approvalSteps` がない場合は、申請者の承認者設定から fallback の承認フローを組み立てる
- 承認者設定は `ADMINS`、単独承認、複数承認、順次承認を想定する

## コメントと通知

### コメント更新

- コメント追加は `submitWorkflowComment()` が担当する
- 最新ワークフロー取得後、コメント配列へ追加して `updateWorkflow` を実行する
- 条件付き更新が競合した場合は再取得して再試行する

### 通知

- アプリ内通知イベントは `workflowNotificationEventService.ts` で作成、購読する
- 管理者がコメントした場合は申請者へ通知する
- スタッフがコメントした場合は `ADMINS` 宛て通知を発行する
- メール通知は別送し、失敗してもコメント更新自体は成功扱いとする

## AppConfig と管理画面依存

- `workflowCategoryOrder`
  - 新規作成画面と一覧フィルタのカテゴリ順序、有効無効に反映する
- `absentEnabled`
  - 欠勤カテゴリ表示可否に影響する
- `workflowNotificationEnabled`
  - ワークフロー通知購読の有効化に使う
- 管理画面 `/admin/workflow` の設定ダイアログ
  - カテゴリ順序変更
  - カテゴリ有効無効切り替え
  - `その他` 用テンプレート作成、更新、削除

## 変更時の確認観点

- カテゴリを追加、削除、改名する場合
  - `workflowLabels.ts`
  - フォーム変換
  - 管理画面設定
  - docs-site の利用者向け説明
- ステータスや承認ロジックを変える場合
  - 一覧、詳細、承認フロー表示
  - 編集可否、取り下げ可否
  - 管理者承認 UI
- コメントや通知を変える場合
  - 競合リトライ
  - recipient 判定
  - メール送信失敗時の扱い
- AppConfig 依存を変える場合
  - `AppConfigContext`
  - 管理画面保存 payload
  - 表示側の fallback

## 関連ページ

- [Amplify 変更フロー](/docs/developer/amplify/change-workflow)
- [ディレクトリ構成](./architecture/directory-structure)
- [スタッフ向けワークフロー操作ガイド](/docs/staff/workflow)
- [管理者向けワークフロー管理ガイド](/docs/admin/workflow)
