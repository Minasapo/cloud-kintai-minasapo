---
sidebar_position: 1
---

# ディレクトリ構成

このページは、リポジトリ全体のディレクトリ構成を俯瞰し、各領域の責務を素早く把握するためのガイドです。

## 全体像

主要ディレクトリは次の役割で整理できます。

| ディレクトリ                          | 役割                                                   |
| ------------------------------------- | ------------------------------------------------------ |
| `src/`                                | フロントエンド本体。画面・機能・ドメインロジックを実装 |
| `amplify/`                            | Amplify バックエンド定義と環境情報                     |
| `docs-site/`                          | Docusaurus で構築されたドキュメントサイト              |
| `docs/`                               | 補助資料や運用メモ（docs-site とは別管理）             |
| `playwright/`                         | E2E テストとテスト運用ガイド                           |
| `scripts/`                            | 同期や検証などの補助スクリプト                         |
| `public/`                             | 静的アセット                                           |
| `test-results/`, `playwright-report/` | テスト実行時の出力物                                   |

## `src` 配下の構成

本プロジェクトは FSD ベースで構成されています。依存方向は次の通りです。

`pages` → `processes` → `features` → `entities` → `shared`

補助的に `widgets` を持ち、ページ構成要素の大きな UI ブロックを扱います。

| レイヤー    | 主な配置先       | 役割                                 |
| ----------- | ---------------- | ------------------------------------ |
| `pages`     | `src/pages/`     | ルート単位のページ                   |
| `processes` | `src/processes/` | 複数ページをまたぐ業務フロー         |
| `features`  | `src/features/`  | 1 画面以下の機能単位                 |
| `entities`  | `src/entities/`  | ドメインモデル・型・API クライアント |
| `shared`    | `src/shared/`    | 横断利用する UI・hooks・lib          |
| `widgets`   | `src/widgets/`   | ヘッダー等の大きな UI ブロック       |

### よく参照するエントリーポイント

- `src/router.tsx`: 画面ルーティング
- `src/pages/`: 画面単位の入口
- `src/features/`: ユースケースごとの実装
- `src/entities/`: ドメインの中心ロジック

## 運用・テスト関連の構成

- `playwright/tests/`: E2E テストケース
- `__mocks__/`: テスト用モック
- `src/setupTests.ts`: ユニットテスト共通設定
- `docs-site/docs/developer/getting-started/setup.md`: 開発開始手順

## 自動生成・編集注意

次の領域は自動生成物を含むため、手動編集を避けてください。

- `src/shared/api/graphql/**`
- `src/ui-components/**`
- `src/aws-exports.js`

変更が必要な場合は Amplify 側の設定・スキーマ更新後にコード生成で反映します。

## 参照先

- [セットアップ](../getting-started/setup.md)
- [勤怠管理対象フラグ仕様](../attendance-management-enabled.md)
- リポジトリ直下の `README.md`
- リポジトリ直下の `CLAUDE.md`
