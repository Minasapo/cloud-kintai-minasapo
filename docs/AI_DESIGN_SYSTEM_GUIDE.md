# AI Implementation Design System Guide

## 目的

このガイドは、AI による UI 実装を前提に、画面ごとの見た目のばらつきを抑え、統一感を維持するための最低限の設計ルールを定義する。

目的は次の 3 点に絞る。

1. AI が毎回独自のデザイン判断をしなくてよい状態を作る
2. 実装のたびに色、余白、角丸、情報密度がぶれないようにする
3. 新しい画面を追加しても既存 UI と自然につながるようにする

## 基本方針

- デザインは「都度作る」のではなく、「既存ルールから選ぶ」で進める
- AI は新しい見た目を発明するのではなく、既存 token と primitive を組み合わせる
- 画面単位の見た目より、システム全体の一貫性を優先する
- モバイルを基準に密度を決め、デスクトップでは横幅だけを広げる
- デスクトップでも無制限に広げず、最大幅を必ず持つ

## レイヤー構成

### 1. Tokens

見た目の最小単位。直接値を埋め込まず、まず token に落とす。

管理対象:

- color
- spacing
- radius
- typography
- shadow
- motion
- component-specific token

現状の基盤:

- [`src/shared/designSystem/tokens.ts`](/Users/ishimototatsuya/Documents/works/inhouse/garaku-frontend.worktrees/still-quokka/ideal-cuckoo/src/shared/designSystem/tokens.ts)
- [`src/shared/designSystem/cssVariables.ts`](/Users/ishimototatsuya/Documents/works/inhouse/garaku-frontend.worktrees/still-quokka/ideal-cuckoo/src/shared/designSystem/cssVariables.ts)
- [`tailwind.config.cjs`](/Users/ishimototatsuya/Documents/works/inhouse/garaku-frontend.worktrees/still-quokka/ideal-cuckoo/tailwind.config.cjs)

ルール:

- 新しい色を導入する前に、既存の `brand / neutral / feedback` で表現できないか確認する
- 画面固有の値が必要な場合は `component.<feature>.<part>` の token を追加する
- 単発の `#xxxxxx`, `12px`, `28px` を JSX に直書きしない
- Tailwind utility だけで完結できない値は CSS variable 経由で参照する

### 2. Primitives

全画面で再利用する土台コンポーネント。AI はまずここから選ぶ。

対象例:

- Button
- Card / Surface
- Alert
- Section
- Input / Textarea
- Dialog
- Toggle / Switch
- Status badge

ルール:

- 新規画面でも、まず既存 primitive の拡張で吸収する
- 似た見た目のコンポーネントを feature 配下で量産しない
- 見た目の差分が「サイズ」「トーン」「状態」の範囲なら variant で表現する

### 3. Recipes

画面パターン単位の構成ルール。AI にとっての実装テンプレート。

対象例:

- 打刻画面
- 一覧画面
- 編集フォーム
- 詳細パネル
- ダイアログ内フォーム

レシピで決めるもの:

- 情報の優先順位
- 主操作の位置
- 警告やエラーの置き場所
- モバイル時の圧縮ルール
- デスクトップ時の最大幅

### 4. AI Execution Rules

AI に毎回渡す共通制約。これがないと統一感は崩れやすい。

## このリポジトリで固定すべき見た目の基準

### 色

- 主ブランドはグリーン系
- 退勤やエラーはレッド系
- 休憩や補助操作はブルー系または情報色
- 警告はアンバー系
- 装飾目的だけで新しい色相を増やさない

### 余白

- 基本余白は `xs/sm/md/lg/xl/xxl` の token に合わせる
- 画面単位では `p-3`, `p-4`, `p-5` 相当を中心に使う
- 新しい余白ルールを作るより、既存スケールに寄せる

### 角丸

- 小要素は `sm/md`
- カードは `lg`
- 強い UI には `pill` か component 専用 radius
- 同一画面内で角丸の種類を増やしすぎない

### タイポグラフィ

- 見出しは多段構造にしない
- 装飾ラベルは原則使わない
- 情報の強弱は、色より先にサイズ・太さ・余白で作る
- モバイルでの可読性を優先し、本文は小さくしすぎない

### 影

- 影は強い UI の階層表現だけに使う
- 目立たせたいカードにのみ使い、全カードに同強度で入れない
- 「全部浮いている」状態を避ける

## レイアウトルール

### 共通

- 1 画面に主役は 1 つだけ置く
- 補助情報は主操作の後ろに置く
- 画面の第一目的をファーストビュー内で完結させる
- デスクトップでも中央寄せ + 最大幅を持つ

### モバイル

- 主操作は最初の画面内に収める
- 長い説明は避け、必要ならツールチップまたは詳細画面へ逃がす
- 情報カードは縦に素直に積む

### デスクトップ

- モバイルの密度を保ったまま、余白と読みやすさだけを増やす
- 要素を横に広げすぎない
- 画面を埋めるためにカードを巨大化しない

### オーバーフロー安全策

- 親レイアウトは、子要素の横幅に引っ張られない前提で組む
- `AppShell` やページルートでは、少なくとも `width: 100%`, `max-width: 100%`, `min-width: 0`, `overflow-x: hidden` を基準にする
- `main` 領域は `overflow-y: auto` と `overflow-x: hidden` を分離し、横方向のはみ出しをページスクロールに変換しない
- `flex` と `grid` の子要素には、必要に応じて `min-width: 0` を明示して、長いテキストや内部要素が親幅を押し広げないようにする
- `w-full` を使う要素は、padding と border を含めて親幅内に収まる前提で扱う

### グローバル CSS 前提

- 全要素に `box-sizing: border-box` を適用する
- `html`, `body`, `#root` には `width: 100%`, `max-width: 100%`, `overflow-x: hidden` を入れる
- Tailwind preflight を使わない場合でも、最低限この 2 点は global CSS で保証する

### モバイル密度ルール

- モバイル時は、複数の役割を 1 行に詰め込みすぎない
- ヘッダーのような複合 UI は、必要なら 2 段構成に分ける
- `flex-nowrap` はモバイルでは原則避ける。使う場合は、その要素群が最小画面幅でも確実に収まることを確認する
- タブ、ナビ、ボタンのラベルが長い場合は、次のいずれかで対応する
  - 短縮ラベルに切り替える
  - 折り返しを許可する
  - グリッド化する
  - 段分けする
- モバイルで横スクロールを許容するのは、明示的なカルーセルや表など、横スクロールが UX 上正当化できるものに限る

### 最大幅の運用

- `max-width` は class だけでなく、必要なら `style.maxWidth` で明示してよい
- 特に「効いているはずだが見た目で分かりにくい」ケースでは、運用上は `style.maxWidth` を優先してよい
- 最大幅を指定するときは、内側要素だけでなく、その要素を包む面やセクション自体にも効いているかを確認する

### モバイル検証項目

- 最低でも 390px 前後の幅で確認する
- 右端の欠け、横スクロール、要素の切れ込みがないかを見る
- ヘッダーの右アクション群とロゴが押し合っていないか確認する
- タブとボタンのラベルが潰れずに読めるか確認する
- フォーム、カード、CTA が左右で不自然に片寄って見えないか確認する

## コンポーネント設計ルール

### Button

- variant は意味単位で定義する
  - `primary`
  - `danger`
  - `info`
  - `secondary`
- size は役割単位で定義する
  - `default`
  - `compact`
- disabled / hover / focus は全 variant 共通ルールに寄せる

### Card

- カードは用途ごとに 3 種類以内に抑える
  - 操作用
  - 情報用
  - 警告用
- カードごとに見出し装飾を増やさない
- 情報密度の差は `compact | detailed` のような mode で表す

### Alert

- 危険度の順に色と CTA の強さを変える
- エラーは視認性を高める
- 注意喚起は背景だけでなく、ボタンや枠でも差を出す

## AI に渡す実装ルール

以下を共通ルールとして AI に含める。

### Rule Set

- 既存 token を優先し、直接値を増やさない
- 既存 primitive を優先し、新規 UI は variant 追加で吸収する
- 装飾ラベルは原則追加しない
- モバイルでファーストビューに主操作を収める
- デスクトップでは必ず最大幅を設ける
- 主操作と補助情報の優先度差を、サイズと色で明確にする
- 親レイアウトが子要素の横幅に引っ張られないように、`min-width: 0` と `overflow-x: hidden` を優先する
- モバイルで 1 行に収まらない要素は、縮めるのではなく段を分ける
- 一時的な画面都合のスタイルを feature 配下に閉じ込めず、再利用できるなら shared に戻す
- 新しい色相、影、角丸の種類をむやみに増やさない

## AI に依頼するときのテンプレート

```md
この変更では既存の design system を優先してください。

- 新しい色や余白のルールを増やさず、既存 token を使う
- shared の primitive を優先し、必要なら variant を追加する
- 装飾ラベルは追加しない
- モバイルで主操作をファーストビューに収める
- デスクトップでは最大幅を設け、広げすぎない
- 主操作 > 警告 > 補助情報 の優先度を崩さない
```

## 実装時の判断順

新しい UI を作るときは、必ず次の順で判断する。

1. 既存 component で表現できるか
2. 既存 component に variant を足せば済むか
3. component 専用 token を足せば済むか
4. それでも足りない場合だけ新しい primitive を作る

## まず整備すべきもの

優先度順:

1. Button / Card / Alert の variant 整理
2. feature ごとに散らばった見た目ロジックの shared への寄せ
3. 画面レシピの文書化
4. AI に渡す共通プロンプトの固定化
5. Figma ではなくコードベース側の design source of truth の明確化

## 完了条件

このガイドが機能している状態は次の通り。

- AI が新規画面を作っても、色・余白・角丸・情報密度が大きくぶれない
- PR レビューで「雰囲気が違う」ではなく「どのルールに反しているか」で指摘できる
- 画面固有の見た目判断が減り、variant と token の追加判断に集約される
- デザインの再現性が、人ではなくルールに依存する
