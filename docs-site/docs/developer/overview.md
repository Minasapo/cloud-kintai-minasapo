---
sidebar_position: 1
title: 開発者向けガイド
description: garaku-frontend の開発に必要なセットアップ、アーキテクチャ、主要機能仕様の入口ページです。
---

# 開発者向けガイド

このセクションは、本プロジェクトの開発に参加するメンバー向けのガイドです。

## はじめに

- [セットアップ](./getting-started/setup.md)

## アーキテクチャ

- [ディレクトリ構成](./architecture/directory-structure.md)
- [依存ルール](./architecture/dependency-rules.md)
- [配置判断ガイド](./architecture/placement-guide.md)
- [サイドバーカテゴリ運用ルール](./architecture/sidebar-category-rules.md)

## 機能仕様

- [勤怠管理対象フラグ仕様](./attendance-management-enabled.md) — `attendanceManagementEnabled` フラグの目的・判定ロジック・影響範囲
- [打刻エラー一覧の表示仕様](./attendance-error-list-display.md) — エラー一覧の表示条件・対象期間・デスクトップ/モバイル差異
- [勤怠ステータス判定ロジック](./attendance-status-determination.md) — `getStatus()` の全優先度テーブルと分岐条件

## ドキュメント運用

- [用語集](../terminology.md)
- 用語を本文中で補足する場合は、`<GlossaryTerm description="定義">用語</GlossaryTerm>` を利用してください。
- 定義本文は用語集ページを正本とし、本文中の `description` は短い補足に留めて重複を避けてください。

## 今後追加予定

- 開発フロー
- テスト運用
- デプロイ運用
