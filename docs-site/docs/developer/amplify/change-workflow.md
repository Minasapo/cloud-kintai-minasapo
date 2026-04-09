---
sidebar_position: 3
title: 変更フロー
description: Amplify に関わる変更時の基本フロー、生成物の扱い、確認観点を整理します。
---

# Amplify 変更フロー

このページは、Amplify に関わる変更を入れるときの基本フローと確認観点をまとめたものです。

## 基本フロー

Amplify に関わる変更は、次の順で進めるのを基本とします。

1. バックエンド設定やスキーマ変更の有無を判断する
2. 必要なら Amplify 側の変更を反映する
3. `pull` や再生成でローカル生成物を同期する
4. フロントエンドの利用コードを調整する
5. 型、表示、導線、関連ドキュメントを確認する

## 典型パターン

### GraphQL スキーマやデータ構造を変える場合

- Amplify 側の API 定義変更を先に行う
- 生成物を同期し、`src/shared/api/graphql/**` の差分を確認する
- feature / entity / page 側のクエリ利用コードを更新する
- 型エラーと画面崩れがないことを確認する

実際の作業順は [Amplify スキーマ変更手順](/docs/developer/amplify/schema-change-procedure) を参照してください。

### Auth や権限の前提が変わる場合

- 認証フローやアクセス制御の変更が Amplify 側に必要かを確認する
- `fetchAuthSession`、`signIn`、`Authenticator` の利用箇所を確認する
- ログイン後導線、セッション依存処理、管理者向け機能の到達性を見直す

### 管理系 API や Lambda を変える場合

- `AdminQueries` や関連 Lambda の変更有無を確認する
- `src/shared/api/amplify/adminQueriesClient.ts` を入口にしている呼び出し箇所を洗い出す
- リクエスト・レスポンスの前提が変わる場合は、利用側も合わせて更新する

## 手動編集を避ける領域

次の領域は生成物を含むため、直接編集しない前提で扱います。

- `src/aws-exports.js`
- `src/shared/api/graphql/**`
- `src/ui-components/**`

差分が必要になった場合は、まず Amplify 側の設定変更や再生成で反映できるかを確認してください。

## 変更時の確認観点

Amplify 関連の変更では、実装差分だけでなく次も合わせて確認します。

- スキーマ変更が既存クエリや mutation に影響していないか
- 生成物差分に想定外の変更が混ざっていないか
- `graphqlClient` や `adminQueriesClient` の利用箇所が壊れていないか
- 認証前提の画面、loader、hook に影響が出ていないか
- 既存ドキュメントの説明とずれていないか

## 関連ドキュメントも見直す

Amplify 変更の影響はドキュメントサイトにも及ぶことがあります。特に次のページは更新漏れが起きやすい対象です。

- [セットアップ](/docs/developer/getting-started/setup)
- [ディレクトリ構成](/docs/developer/architecture/directory-structure)
- Amplify 変更により仕様説明が変わる個別 developer docs

## 動作確認の最小セット

変更後は少なくとも次を確認します。

- `npm run typecheck`
- `npm run test:unit`
- 変更した画面または導線の手動確認
- docs も更新した場合は `npm run docs:build`

## 関連ページ

- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access)
- [Amplify スキーマ変更手順](/docs/developer/amplify/schema-change-procedure)
