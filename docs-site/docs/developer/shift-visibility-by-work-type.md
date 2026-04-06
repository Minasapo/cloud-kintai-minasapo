---
sidebar_position: 4
title: シフト可視性の勤務形態ルール
description: スタッフ向けシフト機能を勤務形態で制御する仕様と実装位置を整理します。
---

# シフト可視性の勤務形態ルール

このページを、スタッフ向けシフト機能を `workType` で制御する際の基準仕様とします。

## 基準仕様

- スタッフ向けシフト機能は、現在ログインしている利用者の `workType === "shift"` のときだけ利用対象です。
- 対象範囲は、スタッフ向けヘッダーの `シフト`、`/shift`、`/shift/collaborative` です。
- 管理者向け `/admin/shift` と `/admin/shift-plan` は今回の制御対象に含めません。

## 非対象時の挙動

- `workType !== "shift"` の場合、スタッフ向けヘッダーの `シフト` は表示しません。
- 非対象ユーザーが `/shift` や `/shift/collaborative` に直接アクセスした場合は、リダイレクトせず専用メッセージを表示します。
- 専用メッセージでは、シフト機能はシフト勤務のスタッフのみ利用できることと、必要なら管理者へ確認することを案内します。

## 実装の参照先

- 勤務形態判定 helper: `src/entities/staff/lib/workTypeOptions.ts`
- ヘッダー表示制御: `src/widgets/layout/header/NavigationMenu.tsx`
- スタッフ向けシフト route ガード: `src/pages/shift/ShiftAccessGuard.tsx`
- スタッフ向けシフト route: `src/pages/shift/request/index.tsx` `src/pages/shift/collaborative/index.tsx`

## 実装時の注意

- 新規実装でスタッフ向けシフト導線を追加する場合は、`workType === "shift"` の条件を必ず同じ方針で適用します。
- 文字列の直接比較を増やさず、既存の勤務形態判定 helper を利用してください。
- 管理者向けシフト導線は、勤務形態ではなく管理業務導線として扱います。
