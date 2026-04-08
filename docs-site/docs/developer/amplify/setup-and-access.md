---
sidebar_position: 2
title: セットアップとアクセス
description: 初回セットアップ時に必要な Amplify 設定取得と、アクセス前提を整理します。
---

# Amplify セットアップとアクセス

このページは、開発開始時に必要な Amplify 関連の準備だけに絞ってまとめたものです。

## 何が必要か

ローカルでアプリを起動するには、Amplify が生成する設定ファイルが必要です。

- `src/aws-exports.js` は Git 管理対象外
- このファイルは `amplify pull` で生成する
- 実行には AWS 認証情報と対象 Amplify 環境へのアクセス権が必要

`src/index.tsx` は `./aws-exports` を読み込んで `Amplify.configure()` を実行しているため、未生成のままだと起動できません。

## 初回セットアップ手順

前提:

- Node.js と npm の準備が済んでいる
- AWS CLI などで利用する認証情報を用意している
- `appId` と `envName` は管理者から共有された値を使う

実行例:

```bash
npx @aws-amplify/cli pull --appId <your-app-id> --envName <your-env-name>
```

補足:

- 認証プロファイルや SSO を使う場合は、事前に AWS 側のログインを済ませる
- 値が不明な場合は推測せず、管理者に確認する
- 実環境名や識別子は docs に記載しない

## `amplify pull` で得られるもの

`amplify pull` は、ローカルのフロントエンド実装がクラウド側の Amplify 設定と接続できる状態を作るために使います。

主に次のような反映が発生します。

- `src/aws-exports.js` の生成または更新
- Amplify 由来の生成物との差分反映
- ローカルの Amplify メタ情報の同期

## 触ってよいもの・避けるもの

通常の開発で手動編集してよいのは、Amplify を利用するフロントエンドコードです。

- `src/shared/api/amplify/graphqlClient.ts`
- `src/shared/api/amplify/adminQueriesClient.ts`
- 各 feature / entity / page からの利用コード

一方で、次の領域は手動編集を避けます。

- `src/aws-exports.js`
- `src/shared/api/graphql/**`
- `src/ui-components/**`

これらを変える必要がある場合は、Amplify 側の設定変更や再生成を先に検討します。

## よくある詰まりどころ

### `Cannot find module './aws-exports'`

`src/aws-exports.js` が未生成です。`amplify pull` を実行して設定を取得してください。

### AWS 認証エラーで `amplify pull` が失敗する

Amplify 環境へのアクセス権または AWS 認証状態が不足しています。利用中の認証方法を確認し、必要なら管理者へ問い合わせてください。

## 関連ページ

- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify 変更フロー](/docs/developer/amplify/change-workflow)
- [セットアップ](../getting-started/setup.md)
