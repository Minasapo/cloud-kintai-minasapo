---
sidebar_position: 2
title: 基礎ルール
description: token、primitive、標準の視覚言語、レイアウト方針を整理した基礎ガイドです。
---

# 基礎ルール

## Token

見た目の最小単位は token です。色や寸法を JSX に直接書き足す前に、既存 token で表現できるかを確認します。

- 色は `brand / neutral / feedback` を優先する
- 余白は `xs / sm / md / lg / xl / xxl` に揃える
- 画面固有の値が必要な場合は `component.<feature>.<part>` の token として追加する
- utility class だけで表現しづらい値は CSS variable 経由で参照する

現行実装:

- `src/shared/designSystem/tokens.ts`
- `src/shared/designSystem/cssVariables.ts`

## Primitive

新規画面を作るときは、まず既存 primitive の拡張で吸収できるかを確認します。

- `Button`
- `Card / Surface`
- `Alert`
- `Section`
- `Input / Textarea`
- `Dialog`
- `Status badge`

ルール:

- feature 配下で似た見た目のコンポーネントを量産しない
- 差分がサイズ、トーン、状態の範囲なら variant で吸収する
- レイアウトの標準面は `PageSection` を起点にそろえる

## 標準の視覚言語

迷った場合は、次の見た目を標準とします。

- 主ブランドはグリーン系
- エラーや危険操作はレッド系
- 情報や補助操作はブルー系または情報色
- ベース面は白を中心に、必要に応じてごく薄い色面を使う
- 強い色は主操作か重要状態に限定し、1 画面で目立つ色を増やしすぎない

要素ごとの基準:

- ページヒーロー: 淡いグリーン寄りの面、ライン装飾なしの大きい見出し、補助説明は 1 段まで
- 通常カード: 白背景、薄い境界線、控えめな影
- カード内見出し: `Heading level="section" appearance="quiet"` または `Heading level="subsection" appearance="quiet"` を優先する
- 主ボタン: 単色グリーン、白文字、`rounded-full`
- 危険ボタン: 赤系で主ボタンと同じ形とサイズ
- 入力欄: 白背景、薄い枠線、大きめ角丸、強い影は使わない

## レイアウト方針

- 1 画面の主役は 1 つに絞る
- 補助情報は主操作や主情報の後ろに置く
- デスクトップでも中央寄せと最大幅を維持する
- モバイルで 1 行に押し込まず、必要なら段を分ける

共通の順序:

1. 戻る導線
2. ページヒーロー
3. 主操作または主情報
4. 補助情報
5. コメント、履歴、注意事項

## オーバーフローと幅の安全策

- 親レイアウトは子要素の横幅に引っ張られない前提で組む
- `min-width: 0` と `overflow-x: hidden` を優先する
- `w-full` の要素は、padding と border を含めて親幅内に収まる前提で扱う
- モバイルでは 390px 前後を基準に、右欠けと横スクロールの有無を確認する

## 避けること

- 装飾目的で新しい色相を増やす
- 画面ごとに別のカードデザインを作る
- 戻る導線を主ボタン化する
- 白背景の上に淡い文字を置く
- `flex-nowrap` で無理に押し込む
- MUI のデフォルト感と Tailwind の独自トーンを無秩序に混在させる
