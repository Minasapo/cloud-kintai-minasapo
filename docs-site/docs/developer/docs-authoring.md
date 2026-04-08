---
sidebar_position: 4
title: docs-site 更新ルール
description: docs-site を更新するときのリンク記法、導線整理、ビルド確認の基準をまとめます。
---

# docs-site 更新ルール

このページは、`docs-site` を継続的に更新するための最小ルールをまとめたものです。

## 基本方針

- `overview` は入口、`use-cases` は目的別導線、`features` は機能別導線として役割を固定する
- 同じリンク一覧を複数ページに手書きで重複させず、共通化できるものは component / data に寄せる
- 恒久的に参照する仕様は `docs-site` を正本とし、補助資料は必要に応じてリンクで補完する

## リンク記法

- docs 内リンクは `.md` や `.mdx` を付けずに書く
- 同一 docs 配下のページ参照は相対リンクを優先する
- セクション共通の導線や React component からのリンクは `/docs/...` を使ってよい

## 執筆ルール

- 用語を本文中で補足する場合は、`<GlossaryTerm description="短い補足">用語</GlossaryTerm>` を利用する
- `GlossaryTerm` の `description` には短い補足だけを書き、定義の本文は [用語集](../terminology) を正本にする
- overview 系ページでは詳細説明よりも、次に読むページへ進める導線を優先する

## 確認項目

- docs を更新したら `npm run docs:build` を実行してリンク切れと build エラーを確認する
- サイドバーを触ったら、カテゴリ順と前後導線が意図どおりかを確認する
- 仕様変更に伴う更新では、関連する利用者向けページと開発者向けページの両方を見直す
