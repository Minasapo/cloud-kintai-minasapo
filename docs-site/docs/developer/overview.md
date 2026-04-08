---
sidebar_position: 1
title: 開発者向けガイド
description: 本プロジェクトの開発に必要な開発フロー、セットアップ、アーキテクチャ、主要機能仕様の入口ページです。
---

# 開発者向けガイド

このセクションは、本プロジェクトの開発に参加するメンバー向けのガイドです。

## はじめに

- [開発フロー](./getting-started/development-flow.md)
- [セットアップ](./getting-started/setup.md)
- [テスト運用](./testing-operations.md)
- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access)
- [Amplify 変更フロー](/docs/developer/amplify/change-workflow)
- [Amplify スキーマ変更手順](/docs/developer/amplify/schema-change-procedure)

最初に全体の流れを把握したい場合は [開発フロー](./getting-started/development-flow.md) から読み始めてください。個別の環境構築手順は [セットアップ](./getting-started/setup.md) に分離しています。

## Amplify

- [概要](/docs/developer/amplify/overview) — Auth、API、Lambda、Storage、Hosting とフロントエンドの接点
- [セットアップとアクセス](/docs/developer/amplify/setup-and-access) — `amplify pull`、`aws-exports`、初回アクセス前提
- [変更フロー](/docs/developer/amplify/change-workflow) — 生成物の扱い、変更時の確認観点、基本フロー
- [スキーマ変更手順](/docs/developer/amplify/schema-change-procedure) — `schema.graphql` 修正から `push`、生成物同期、利用コード更新までの実務手順

## デザインシステム

- [概要](./design-system/overview.md) — 目的、適用範囲、source of truth、参照先
- [基礎ルール](./design-system/foundations.md) — token、primitive、視覚言語、レイアウトの基本方針
- [画面レシピ](./design-system/screen-recipes.md) — 編集・一覧・詳細画面の標準構成
- [実装ルールとレビュー観点](./design-system/implementation-rules.md) — 実装判断順、禁止事項、レビュー時の確認項目

## アーキテクチャ

- [ディレクトリ構成](./architecture/directory-structure.md)
- [依存ルール](./architecture/dependency-rules.md)
- [配置判断ガイド](./architecture/placement-guide.md)
- [サイドバーカテゴリ運用ルール](./architecture/sidebar-category-rules.md)

## 機能仕様

- [勤怠管理対象フラグ仕様](./attendance-management-enabled.md) — `attendanceManagementEnabled` フラグの目的・判定ロジック・影響範囲
- [打刻エラー一覧の表示仕様](./attendance-error-list-display.md) — エラー一覧の表示条件・対象期間・デスクトップ/モバイル差異
- [勤怠ステータス判定ロジック](./attendance-status-determination.md) — `getStatus()` の全優先度テーブルと分岐条件
- [稼働統計ページ仕様](./attendance-statistics.md) — 表示条件、年間集計ロジック、締め日 fallback の扱い
- [シフト可視性の勤務形態ルール](./shift-visibility-by-work-type.md) — スタッフ向けシフト導線を `workType` で制御する仕様

## ドキュメント運用

- [用語集](../terminology.md)
- 用語を本文中で補足する場合は、`<GlossaryTerm description="定義">用語</GlossaryTerm>` を利用してください。
- `GlossaryTerm` はデスクトップでホバー/キーボードフォーカス、モバイルでタップ時に補足を表示します。
- 用語の定義本文は用語集ページを参照先とし、本文中の `description` は短い補足に留めて重複を避けてください。

## 今後追加予定

- デプロイ運用
