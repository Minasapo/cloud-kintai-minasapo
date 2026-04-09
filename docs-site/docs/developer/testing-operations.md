---
title: テスト運用
description: ユニットテストと E2E テストの使い分け、日常的な実行フロー、確認ポイントをまとめます。
---

# テスト運用

このページは、本プロジェクトで日常的に行うテストの進め方をまとめたガイドです。

初回セットアップは [セットアップ](./getting-started/setup) を参照してください。このページでは、セットアップ完了後の実行運用と判断基準を扱います。

## テストの種類

本プロジェクトでは、主に次のテストを使い分けます。

| 種類 | コマンド | 主な用途 |
| --- | --- | --- |
| ユニットテスト | `npm run test:unit` | ロジックやコンポーネント単位の確認 |
| ユニットテスト（watch） | `npm run test:watch` | 実装中に繰り返し確認したいとき |
| E2E テスト | `npm run test:e2e` | 実ブラウザで画面導線や認証込みの挙動を確認 |
| E2E 認証状態生成 | `npm run test:e2e:setup` | Playwright の認証状態を作り直す |
| 一括確認 | `npm run test:all` | ユニットテストと E2E をまとめて実行 |

## 使い分けの目安

- ドメインロジック、表示条件、変換処理の変更は `npm run test:unit` を優先する
- 画面遷移、ログイン後導線、フォーム操作、権限差分は `npm run test:e2e` で確認する
- 実装中に細かく回す場合は `npm run test:watch` を使う
- 影響範囲が広い変更やリリース前の確認では `npm run test:all` を使う

## 日常運用フロー

### 実装中

- ロジック変更時は、まず `npm run test:unit` で素早く確認する
- 継続的に確認したい箇所は `npm run test:watch` を使う
- UI 導線や認証が絡む変更は、必要な範囲で E2E を追加実行する

### PR 前

- 最低限 `npm run typecheck` と `npm run test:unit` を通す
- 画面フローに影響がある変更では、対象の E2E を実行して結果を確認する
- ドキュメントサイトも更新した場合は `npm run docs:build` でリンク切れや build エラーがないことを確認する

### push 前

- `.githooks/pre-push` により、push 前に `npm run prepush:verify` が走る
- `npm run prepush:verify` の実体は `npm run typecheck && npm run test:unit` で、E2E は自動実行されない
- E2E が必要な変更かどうかは、変更内容に応じて手動で判断する

## E2E テスト運用

### 前提

- Playwright は `.env.local` を読み込む
- 認証用の `PLAYWRIGHT_*` 環境変数は `.env.local` に設定する
- 認証状態は `playwright/.auth/` に保存される

### 実行単位

`playwright.config.ts` では、主に次の project を使います。

| project | 用途 |
| --- | --- |
| `setup` | ログインして認証状態を生成する |
| `chromium-staff` | スタッフ権限の認証状態で実行する |
| `chromium-admin` | 管理者権限の認証状態で実行する |

最短の smoke-test 実行例は次のとおりです。

```bash
npm run test:e2e:setup
npm run test:e2e -- smoke-test --project=chromium-staff
npm run test:e2e -- smoke-test --project=chromium-admin
```

### 実行先 URL の扱い

- `PLAYWRIGHT_BASE_URL` を指定しない場合、Playwright は `http://localhost:5173` を対象にする
- この場合、必要なら `npm start -- --port 5173` を起動し、既存サーバーがあれば再利用する
- `PLAYWRIGHT_BASE_URL` を指定した場合は、その URL に対して実行し、ローカル `webServer` は起動しない

## よくある失敗と確認ポイント

### ブラウザが見つからない

`browserType.launch: Executable doesn't exist` が出る場合は、次を再実行します。

```bash
npx playwright install --with-deps
```

### `setup` でログイン失敗する

- `.env.local` の `PLAYWRIGHT_*` の値を確認する
- 認証情報が更新された場合は `npm run test:e2e:setup` を再実行する

### 接続できない

- `net::ERR_CONNECTION_REFUSED` などが出る場合は、`VITE_BASE_PATH` や `PLAYWRIGHT_BASE_URL` が実行先と一致しているか確認する
- ローカル実行なら `npm start` でアプリが起動できるか確認する

## 関連資料

- [開発フロー](./getting-started/development-flow)
- [セットアップ](./getting-started/setup)
- [ディレクトリ構成](./architecture/directory-structure)
- `playwright/README.md`
- `playwright/tests/README.md`
