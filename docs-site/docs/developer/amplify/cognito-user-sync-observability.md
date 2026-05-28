---
title: Cognitoユーザー同期の耐障害性と可観測性
---

## 対象

- `src/entities/staff/model/cognito/fetchCognitoUsers.ts`
- 処理フロー: `listUsers` -> `listGroupsForUser` -> Staff変換

## 目的

Cognitoユーザー取得失敗時に、ユーザー向けエラー表示と運用調査用の詳細情報を分離し、再現と原因切り分けを容易にする。

## エラーハンドリング方針

- ユーザー向け: 既存エラーコード（`E05007` / `E05008`）のみを返す
- 運用向け: ログにフェーズ・試行回数・HTTPステータスを出力する

この方針により、画面表示に内部詳細を漏らさず、運用時の調査性を維持する。

## ログ設計

`createLogger("fetchCognitoUsers")` を使用し、次を出力する。

- フェーズ識別子 (`phase`)
- 試行回数 (`attempt`, `maxAttempts`)
- 待機時間 (`delayMs`)
- HTTPステータス (`status`)
- 対象ユーザー識別子 (`sub`)

主なログイベント:

- `Failed to list Cognito users`（`phase: listUsers`）
- `Retrying listGroupsForUser`（`phase: listGroupsForUser`）
- `Failed to fetch Cognito groups after retries`（`phase: listGroupsForUser`）
- `No Cognito groups found for user`（`phase: validateGroups`）

## メトリクス化方針

監視・アラートは次のメトリクスをベースに定義する。

- `cognito.listGroupsForUser.retry.count`
  - 集計軸: `status`, `phase`
  - 用途: 一時障害の増加検知
- `cognito.listGroupsForUser.failure.count`
  - 集計軸: `status`, `phase`
  - 用途: 恒久障害・権限設定不整合の検知
- `cognito.sync.failure.rate`
  - 分母: 同期実行回数
  - 分子: `E05008` へ変換された失敗回数
  - 用途: ユーザー影響を伴う障害率監視

## アラート例

- 5分間で `cognito.listGroupsForUser.failure.count` が閾値超過
- 15分移動平均で `cognito.sync.failure.rate` が基準値超過
- `status=429` の比率が急増（スロットリング兆候）

## 運用メモ

- 再試行対象はネットワークエラー、`429`、`5xx`
- `4xx`（`429`除く）は再試行対象外
- 再試行は指数バックオフ + ジッターで実行する
