---
sidebar_position: 1
title: 開発者向けガイド
description: 本プロジェクトの開発に必要な開発フロー、セットアップ、アーキテクチャ、主要機能仕様の入口ページです。
---

# 開発者向けガイド

このセクションは、本プロジェクトの開発に参加するメンバー向けのガイドです。

## はじめに

- [開発フロー](./getting-started/development-flow)
- [セットアップ](./getting-started/setup)
- [テスト運用](./testing-operations)
- [Amplify 概要](/docs/developer/amplify/overview)
- [Amplify セットアップとアクセス](/docs/developer/amplify/setup-and-access)
- [Amplify 変更フロー](/docs/developer/amplify/change-workflow)
- [Amplify スキーマ変更手順](/docs/developer/amplify/schema-change-procedure)

最初に全体の流れを把握したい場合は [開発フロー](./getting-started/development-flow) から読み始めてください。個別の環境構築手順は [セットアップ](./getting-started/setup) に分離しています。

## Amplify

- [概要](/docs/developer/amplify/overview) — Auth、API、Lambda、Storage、Hosting とフロントエンドの接点
- [セットアップとアクセス](/docs/developer/amplify/setup-and-access) — `amplify pull`、`aws-exports`、初回アクセス前提
- [変更フロー](/docs/developer/amplify/change-workflow) — 生成物の扱い、変更時の確認観点、基本フロー
- [スキーマ変更手順](/docs/developer/amplify/schema-change-procedure) — `schema.graphql` 修正から `push`、生成物同期、利用コード更新までの実務手順

## デザインシステム

- [概要](./design-system/overview) — 目的、適用範囲、source of truth、参照先
- [基礎ルール](./design-system/foundations) — token、primitive、視覚言語、レイアウトの基本方針
- [画面レシピ](./design-system/screen-recipes) — 編集・一覧・詳細画面の標準構成
- [実装ルールとレビュー観点](./design-system/implementation-rules) — 実装判断順、禁止事項、レビュー時の確認項目

## アーキテクチャ

- [ディレクトリ構成](./architecture/directory-structure)
- [依存ルール](./architecture/dependency-rules)
- [配置判断ガイド](./architecture/placement-guide)
- [サイドバーカテゴリ運用ルール](./architecture/sidebar-category-rules)

## 機能仕様

- [ワークフロー機能仕様](./workflow) — 画面構成、データ更新経路、通知、設定依存、変更時の確認観点
- [勤怠管理対象フラグ仕様](./attendance-management-enabled) — `attendanceManagementEnabled` フラグの目的・判定ロジック・影響範囲
- [打刻エラー一覧の表示仕様](./attendance-error-list-display) — エラー一覧の表示条件・対象期間・デスクトップ/モバイル差異
- [勤怠ステータス判定ロジック](./attendance-status-determination) — `getStatus()` の全優先度テーブルと分岐条件
- [稼働統計ページ仕様](./attendance-statistics) — 表示条件、年間集計ロジック、締め日 fallback の扱い
- [シフト可視性の勤務形態ルール](./shift-visibility-by-work-type) — スタッフ向けシフト導線を `workType` で制御する仕様

## ドキュメント運用

- [用語集](../terminology)
- `GlossaryTerm` はデスクトップでホバー/キーボードフォーカス、モバイルでタップ時に補足を表示します。

## 今後追加予定

- デプロイ運用
