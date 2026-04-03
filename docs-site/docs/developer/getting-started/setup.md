---
sidebar_position: 1
title: セットアップ
description: 開発開始時に必要な Node.js、依存パッケージ、Playwright 初期設定と主要コマンドをまとめます。
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

| コマンド                      | 内容                           |
| ----------------------------- | ------------------------------ |
| `npm start`                   | 開発サーバー起動（Vite）       |
| `npm run build`               | 本番ビルド                     |
| `npm run lint`                | ESLint                         |
| `npm run typecheck`           | TypeScript 型チェック          |
| `npm run test:unit`           | Jest ユニットテスト            |
| `npm run test:watch`          | Jest ウォッチモード            |
| `npm run docs:start`          | ドキュメント開発サーバー       |
| `npm run docs:build`          | ドキュメント本番ビルド         |
| `npm run docs:serve`          | ビルド済み docs の配信         |
| `npm run docs:search-preview` | 検索インデックス付き docs 確認 |

> push 前に `npm run typecheck && npm run test:unit` が自動実行される（`.githooks`）。

## ドキュメント検索の確認方法

`npm run docs:start` は編集向けの開発モードで、検索プラグインの仕様上、検索インデックスは無効です。検索時に警告が表示されるのは正常です。

検索結果まで含めて確認する場合は、次を実行します。

```bash
npm run docs:search-preview
```

`docs:search-preview` は `docs:build` 後に `docs:serve` を起動するため、検索インデックスを含む状態で確認できます。

## Amplify 設定

`src/aws-exports.js` は `amplify pull` で生成されるため、初回セットアップ時は別途 Amplify 環境へのアクセス権が必要です。詳細はリポジトリルートの `README` を参照してください。
