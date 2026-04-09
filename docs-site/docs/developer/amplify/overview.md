---
sidebar_position: 1
title: 概要
description: このリポジトリで Amplify が担う役割と、フロントエンドとの接点を整理した入口ページです。
---

# Amplify 概要

このページは、このリポジトリで Amplify が担う責務と、フロントエンド実装との接点を素早く把握するための入口です。

## このリポジトリで Amplify が担うもの

このリポジトリでは、Amplify をバックエンド構成の土台として利用しています。

- `Auth (Cognito)`: ログイン、セッション取得、ユーザー認証
- `GraphQL API (AppSync)`: 業務データの参照・更新・購読
- `AdminQueries REST API`: 管理系 API の呼び出し
- `Lambda`: 管理系 API や通知処理などのバックエンド処理
- `Storage`: ファイル保存先
- `Hosting`: ビルド済みフロントエンドの配信設定

Amplify のバックエンド定義は `amplify/` 配下にあります。

## フロントエンドとの主な接点

Amplify は主に次の入口からフロントエンドに接続されています。

- `src/index.tsx`: `Amplify.configure(config)` でアプリ全体を初期化する
- `src/pages/Login/Login.tsx`: `Authenticator` と `signIn` で認証 UI とログインを扱う
- `src/shared/api/amplify/graphqlClient.ts`: AppSync 向け GraphQL クライアントの入口
- `src/shared/api/amplify/adminQueriesClient.ts`: `AdminQueries` REST API の入口

また、次の領域には Amplify 由来の自動生成物が含まれます。

- `src/aws-exports.js`
- `src/shared/api/graphql/**`
- `src/ui-components/**`

## どの変更が Amplify に触れるか

次のような変更は、フロントエンドだけで完結せず Amplify 側の確認が必要です。

- 認証方式や認可ルールを変える
- GraphQL スキーマや API の入出力を変える
- Lambda や管理系 API の仕様を変える
- Storage や Hosting の設定を変える

一方、次のような変更は通常フロントエンドだけで完結します。

- 既存 API の呼び出し結果を使った UI 改修
- 既存クエリ結果の表示順やレイアウトの変更
- 既存認証状態を前提にした画面導線の調整

判断に迷う場合は、まず `amplify/` 配下の更新が必要かを確認してください。必要なら Amplify 変更、不要ならフロントエンド変更として扱うのが基本です。

## 次に読むページ

- [セットアップとアクセス](/docs/developer/amplify/setup-and-access)
- [変更フロー](/docs/developer/amplify/change-workflow)
- [セットアップ](/docs/developer/getting-started/setup)
