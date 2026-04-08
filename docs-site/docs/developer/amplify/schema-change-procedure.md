---
sidebar_position: 4
title: スキーマ変更手順
description: Amplify の GraphQL スキーマ変更時に、このリポジトリで必要な作業順と確認観点をまとめます。
---

# Amplify スキーマ変更手順

このページは、`amplify/backend/api/garakufrontend/schema.graphql` を変更するときに、このリポジトリで必要になる作業の流れをまとめたものです。

## このページの対象

次のような変更を入れるときは、この手順に沿って進めます。

- model の追加、削除、フィールド変更
- `@auth`、`@index`、custom `Mutation` など GraphQL API 定義の変更
- 型変更に伴うフロントエンドの query / mutation / subscription 利用コードの更新

一方で、既存レスポンスの表示順や UI だけを変える場合は、通常この手順は不要です。

## 変更前に確認すること

着手前に、変更の影響範囲を先に切り分けます。

- 変更対象が `amplify/backend/api/garakufrontend/schema.graphql` だけで済むか
- `@auth` の変更により認証導線や権限前提の画面確認が必要か
- custom `Mutation` や Lambda 連携があり、`amplify/backend/**` の追加変更が必要か
- 型変更により `src/shared/api/graphql/**` と利用側コードの更新が発生するか
- 関連する developer docs や仕様説明も更新対象になるか

判断に迷う場合は、まず `amplify/` 配下のどこに差分が出るかで切り分けます。`amplify/` の変更が必要なら Amplify 変更として扱います。

## 基本手順

### 1. スキーマを修正する

変更の起点は `amplify/backend/api/garakufrontend/schema.graphql` です。

- 追加・変更したい model / field / input / enum / custom `Mutation` をここで更新する
- 命名や nullability を変える場合は、既存の query や UI が壊れないかを意識する
- index や auth rule を変える場合は、利用画面だけでなく取得条件や権限制御も見直す

### 2. Amplify 側へ反映する

スキーマ変更はローカル編集だけでは完了しないため、必要な内容を Amplify に反映します。

代表コマンド:

```bash
npx @aws-amplify/cli push
```

補足:

- 実行には AWS 認証と対象環境へのアクセス権が必要です
- 環境固有の値や権限情報は docs に書かず、管理者共有の値を使います
- `push` 前に変更内容を見直し、意図しない Amplify 差分が混ざっていないか確認します

### 3. ローカル生成物を同期する

クラウド反映後は、ローカル生成物と設定を同期します。

代表コマンド:

```bash
npx @aws-amplify/cli pull --appId <your-app-id> --envName <your-env-name>
```

`pull` により主に次を確認対象にします。

- `src/aws-exports.js`
- `src/shared/api/graphql/**`
- `src/ui-components/**`

環境や CLI の状態によっては `push` だけではローカル生成物が揃わないことがあります。型や document 差分が不足している場合は、`pull` 後の生成物差分を確認してください。

### 4. フロントエンド利用コードを更新する

生成物同期後は、型と API 利用コードの差分をもとにフロントエンドを更新します。

主な確認対象:

- `@shared/api/graphql/types` を参照している型利用箇所
- `@shared/api/graphql/documents/*` を使う query / mutation / subscription 呼び出し
- `graphqlClient` や `graphqlBaseQuery` 経由のデータ取得処理
- loader、hook、feature / entity / page 層の表示ロジック

特に次の変更は見落としやすいため、利用側まで追います。

- 必須項目の追加や nullability の変更
- field 名の変更や enum 値の変更
- index / queryField の変更
- custom `Mutation` の input / return type の変更

### 5. 生成物に手動修正を入れない

次の領域は生成物を含むため、手動編集しない前提で扱います。

- `src/aws-exports.js`
- `src/shared/api/graphql/**`
- `src/ui-components/**`

差分が意図と合わない場合は、まず `schema.graphql` や Amplify 側設定、再同期手順を見直してください。

### 6. 影響範囲を確認する

実装を終えたら、コード変更だけでなく運用上の影響も確認します。

- 既存 query / mutation / subscription が壊れていないか
- 認証前提の画面や管理者機能の到達性に影響がないか
- 想定外の generated 差分が混ざっていないか
- `AdminQueries` や Lambda 連携の前提がずれていないか
- docs-site 上の仕様説明やセットアップ案内も更新が必要か

## レビュー前チェックリスト

- `schema.graphql` の差分が変更意図と一致している
- Amplify 関連差分に不要な環境固有情報を含めていない
- generated ファイルを手作業で直していない
- 利用側コードの型エラーを解消している
- 仕様変更がある場合は対応する docs も更新している

## 動作確認の最小セット

少なくとも次は実施します。

```bash
npm run typecheck
npm run test:unit
npm run docs:build
```

加えて、変更した画面または導線を手動で確認します。権限や表示条件を変えた場合は、影響を受けるロールや画面も合わせて確認してください。

## 関連ページ

- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access)
- [Amplify 変更フロー](/docs/developer/amplify/change-workflow)
