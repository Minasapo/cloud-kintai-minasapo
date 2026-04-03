---
sidebar_position: 1
---

# 開発者向けガイド

このセクションは、本プロジェクトの開発に参加するメンバー向けのガイドです。

## はじめに

- [セットアップ](./getting-started/setup.md)

## アーキテクチャ

- [ディレクトリ構成](./architecture/directory-structure.md)
- [依存ルール](./architecture/dependency-rules.md)
- [配置判断ガイド](./architecture/placement-guide.md)

## 機能仕様

- [勤怠管理対象フラグ仕様](./attendance-management-enabled.md) — `attendanceManagementEnabled` フラグの目的・判定ロジック・影響範囲
- [打刻エラー一覧の表示仕様](./attendance-error-list-display.md) — エラー一覧の表示条件・対象期間・デスクトップ/モバイル差異
- [勤怠ステータス判定ロジック](./attendance-status-determination.md) — `getStatus()` の全優先度テーブルと分岐条件

## 今後追加予定

- 開発フロー
- テスト運用
- デプロイ運用
