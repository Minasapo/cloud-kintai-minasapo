---
sidebar_position: 3
title: 見出しルール
description: ページタイトル、セクション見出し、補助見出しの役割と表示ルールを定義したガイドです。
---

# 見出しルール

見出しは、画面内の情報構造と視線誘導をそろえるための基準です。文言だけでなく、役割ごとに意味階層を固定し、見た目は `appearance` で調整します。

## 基本方針

- 見出しは `Page Title / Section Heading / Subsection Heading / Dialog Title` の 4 種類で運用する
- 画面の主題は 1 つに絞り、ページタイトルを乱立させない
- 同格の見出しは同じ見た目を使い、画面ごとの独自デザインを足さない
- 強い装飾付き見出しはページタイトルだけに限定し、主要セクションも必要最小限のアクセントに留める
- テーブル列名、フォームラベル、チップ、アラートタイトルは見出しルールの対象外とする

## Primitive の考え方

共有見出しは `Heading` を基本にし、次の 2 軸で扱います。

- `level`: 意味上の階層。`page / section / subsection`
- `appearance`: 見た目の強さ。`hero / standard / quiet`

既定の組み合わせ:

- `page` → `hero`
- `section` → `standard`
- `subsection` → `quiet`

使い分け:

- ページ先頭の主題: `Heading level="page" appearance="hero"`
- ページ内の主要ブロック: `Heading level="section" appearance="standard"`
- カード内、補助情報、一覧アイテム: `Heading level="section" appearance="quiet"` または `Heading level="subsection" appearance="quiet"`

互換ラッパー:

- `PageTitle` → `page + hero`
- `SectionTitle` → `section + standard`
- `SubsectionTitle` → `subsection + quiet`

## 役割ごとのルール

### Page Title

画面全体の主題を示す見出しです。

- 1 画面につき 1 つ
- 原則 `h1`
- グリーン系アクセントを持つ最上位の見た目を使う
- パンくずや戻る導線の直後に置く
- 画面説明がある場合は 1 段まで補助文を置いてよい

実装:

- `Heading level="page" appearance="hero"`
- `PageTitle`
- `Page` のデフォルトヘッダー

### Section Heading

ページ内の主要ブロックを分ける見出しです。

- 原則 `h2`
- `Page Title` より一段弱いサイズと、ごく弱いアクセントを使う
- カード群、主要情報、主要操作ブロックの先頭に置く
- 同じ役割のブロックでは同じ見た目を維持する

実装:

- `Heading level="section" appearance="standard"`
- `SectionTitle`

### Subsection Heading

カード内や補助ブロックの小区分を示す見出しです。

- 原則 `h3`
- 装飾は増やさず、文字サイズと太さで差を付ける
- セクション内の小分類、補助情報、詳細項目の見出しに使う
- 強いアクセントや独立したヒーロー表現を持たせない

実装:

- `Heading level="subsection" appearance="quiet"`
- `SubsectionTitle`

### Dialog Title

ダイアログ専用の見出しです。

- ページ階層には数えない
- `DialogTitle` を使う
- ページタイトル用のアクセントは持ち込まない

## HTML レベルのルール

- ページ主題は原則 `h1`
- 主要セクションは `h2`
- セクション内の小区分は `h3`
- 見た目だけ見出しにしたい場合は `div` や `span` に `Heading` を使い、`level` は文脈に合わせる
- ダイアログ内では文脈に応じて `DialogTitle` を優先し、ページの階層とは切り分ける

## 禁止事項

- 生の `<h1>`, `<h2>`, `<h3>` に画面ごとの Tailwind サイズ指定を都度書く
- MUI `Typography` の見出し variant をページタイトル代わりに場当たり的に使う
- 同格の見出しで文字サイズ、太さ、色、罫線表現を混在させる
- `hero` や強い装飾付き見出しをカードの小見出しや一覧の補助ラベルに流用する
- 意味上の見出しではない要素に `h1` から `h3` を付ける

## レビュー時の確認

- ページタイトルが 1 画面 1 つに収まっているか
- 主役の見出しと補助見出しの強弱が明確か
- 同格のセクション見出しで見た目がずれていないか
- ダイアログがページ見出しのルールを混在させていないか
- 共有見出しコンポーネントを使わずに手書き実装していないか

## 実装の使い分け

- 画面先頭: `Heading level="page" appearance="hero"` または `PageTitle`
- ページ内の主要ブロック: `Heading level="section" appearance="standard"` または `SectionTitle`
- カード内や補助ブロック: `Heading ... appearance="quiet"` または `SubsectionTitle`
- ダイアログ: `DialogTitle`

## 関連ページ

- [基礎ルール](./foundations.md)
- [画面レシピ](./screen-recipes.md)
- [実装ルールとレビュー観点](./implementation-rules.md)
