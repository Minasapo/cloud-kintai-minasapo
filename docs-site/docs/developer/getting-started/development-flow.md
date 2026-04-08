---
sidebar_position: 1
title: 開発フロー
description: 開発開始前の確認から初回セットアップ、最初の動作確認、PR 前チェックまでの流れを整理します。
---

# 開発フロー

このページは、本プロジェクトに参加した開発者が、開発開始前の確認から最初の PR 前チェックまでを迷わず進めるための入口です。

詳細なセットアップ手順や Amplify 固有の作業は個別ページに分け、このページでは全体の流れを整理します。

## 全体の流れ

1. 開発に必要な前提を確認する
2. ローカル環境をセットアップする
3. アプリを起動し、最低限のチェックを通す
4. 実装時に見るべきコードの入口を把握する
5. PR 前に静的チェック、テスト、画面確認、docs 更新を確認する

## 1. 開発開始前に確認すること

- Node.js 22 以上、npm 10 以上を使う
- Amplify 環境へアクセスできることを確認する
- `.env.example` をもとに `.env.local` を作成できる状態にする
- E2E を使う場合は Playwright 用の認証情報も準備する

環境構築の詳細は [セットアップ](./setup) を参照してください。  
Amplify まわりの前提確認は [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access) にまとめています。

## 2. 初回セットアップ

まずは依存関係を入れ、必要なら E2E 実行準備まで整えます。

```bash
nvm use
npm ci
npx playwright install --with-deps
npm run test:e2e:setup
```

続いて Amplify 設定を取得し、`.env.local` を準備します。`src/aws-exports.js` は Git 管理対象外なので、初回セットアップ時に `amplify pull` が必要です。

Amplify の準備手順は次を参照してください。

- [セットアップ](./setup)
- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access)

## 3. 最初の動作確認

初回セットアップ後は、まずローカル起動と最低限の静的チェックを通します。

```bash
npm start
npm run lint
npm run typecheck
npm run test:unit
```

次の状態になれば、ローカル開発の基本導線は確認できています。

- ログイン画面までアプリが起動する
- `lint` と `typecheck` がエラーなく完了する
- `test:unit` が失敗なく完了する

ドキュメントを編集した場合は、追加で `npm run docs:build` を実行して docs-site のビルドも確認してください。

## 4. 最初に読むコード

最初の作業チケットでは、次の順に見ると画面構成と責務分割を把握しやすくなります。

- `src/router.tsx` - 画面遷移とルート定義の入口
- `src/pages/admin/AdminShiftSettings/AdminShiftSettings.tsx` - 管理画面の実装例
- `src/features/README.md` - 機能単位の責務
- `src/entities/README.md` - ドメイン層の責務
- `src/shared/README.md` - 共通部品の責務
- `src/widgets/README.md` - ページ構成要素の責務
- `src/processes/README.md` - 複数ページをまたぐ業務フローの責務

配置判断に迷う場合は、次のアーキテクチャ資料も参照してください。

- [ディレクトリ構成](../architecture/directory-structure)
- [依存ルール](../architecture/dependency-rules)
- [配置判断ガイド](../architecture/placement-guide)

## 5. 実装中の判断ポイント

- フロントエンドだけの変更で完結するか、Amplify 側の変更が必要かを先に切り分ける
- GraphQL スキーマ、認証、Lambda、管理系 API に触れる場合は [Amplify 変更フロー](/docs/developer/amplify/change-workflow) を先に確認する
- docs-site で仕様説明している機能を変える場合は、関連 developer docs の更新要否も合わせて確認する

## 6. PR 前チェック

PR 作成前は少なくとも次を確認します。

- `npm run lint`
- `npm run typecheck`
- `npm run test:unit`
- 変更した画面の表示崩れがないこと
- 既存機能への影響がないこと
- docs を更新した場合は `npm run docs:build`

## 関連ページ

- [セットアップ](./setup)
- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access)
- [Amplify 変更フロー](/docs/developer/amplify/change-workflow)
