---
sidebar_position: 1
---

# セットアップ

このページは、本プロジェクトの開発を始めるための最小セットアップ手順です。

## 前提

- Node.js 22 以上（`.nvmrc` に記載のバージョン）
- npm 10 以上

## 手順

### 1. 依存パッケージのインストール

```bash
nvm use
npm ci
```

### 2. E2E テスト用ブラウザのインストール（初回のみ）

```bash
npx playwright install --with-deps
```

### 3. E2E テストの認証状態を生成（初回のみ）

```bash
npm run test:e2e:setup
```

認証状態は `playwright/.auth/` に保存される。

## 主要コマンド

| コマンド             | 内容                     |
| -------------------- | ------------------------ |
| `npm start`          | 開発サーバー起動（Vite） |
| `npm run build`      | 本番ビルド               |
| `npm run lint`       | ESLint                   |
| `npm run typecheck`  | TypeScript 型チェック    |
| `npm run test:unit`  | Jest ユニットテスト      |
| `npm run test:watch` | Jest ウォッチモード      |

> push 前に `npm run typecheck && npm run test:unit` が自動実行される（`.githooks`）。

## Amplify 設定

`src/aws-exports.js` は `amplify pull` で生成されるため、初回セットアップ時は別途 Amplify 環境へのアクセス権が必要です。詳細はリポジトリルートの `README` を参照してください。
