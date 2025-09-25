Amplifyで動作する勤怠管理のWebアプリケーションです。
Amplifyで動作する勤怠管理の Web アプリケーションです。

## 概要

- コードベース: React + Material UI
- バックエンド: AWS Amplify
- E2E テスト: Playwright（`playwright/`）

このファイルは、開発ルールと運用上の注意を簡潔にまとめたものです。新規参加者がまず読むべき「クイックスタート」「ページ追加手順」「PR チェックリスト」を含みます。

## 主要なディレクトリ（抜粋）

- `src/`: アプリ本体
- `src/pages/`: ページごとのコンポーネントを置く場所（新規ページはここ）
- `src/router.tsx`: ルーティングの集中管理（新しいページを追加したらここにルートを登録）
- `amplify/`: Amplify のバックエンド設定（多くは自動生成。直接編集禁止のものが多い）
- `playwright/`: E2E テスト

## クイックスタート（新規環境）

1. 依存関係をインストール

```bash
npm install
```

2. 開発サーバ起動（プロジェクトのスクリプトに従ってください）

```bash
npm run dev
```

※ プロジェクトで別のコマンドを使っている場合は `package.json` のスクリプトを参照してください。

## ページ追加の最低手順（テンプレ）

1. `src/pages/<NewPage>/` を作成し、ページコンポーネントを置く。
2. 必要なサブコンポーネントを `src/components/` に作成する。
3. `src/router.tsx` にルートを追加する（例）:

```tsx
// ...existing imports
import NewPage from 'src/pages/NewPage/NewPage'

// ルート配列に追加
{
  path: '/new-page',
  element: <NewPage />,
}
```

4. スタイルは Material UI をベースに作成し、再利用可能なコンポーネント化を優先する。

## 開発ルール（要点）

- UI: 必ず Material UI を使用する。
- 日付操作: 常に `dayjs` を使う（フォーマット統一、タイムゾーン対策のため）。例:

```js
import dayjs from 'dayjs'
dayjs().format('YYYY-MM-DD')
```

- コード構造: ロジックは関数化／カスタムフック化し、再利用性を高める。
- 命名: 意味のある英語（camelCase / PascalCase）を使う。
- コメント: 実装理由・トレードオフを書くのは OK。冗長なインラインコメントは避ける。

## Amplify に関する注意

- `amplify/` 配下には自動生成ファイルが多数あります。特に `amplify/backend/*` 内の自動生成ファイルは原則編集しないでください。
- GraphQL モデルを変更する場合は、`amplify/backend/api/garakufrontend/schema.graphql` を編集してください。その後、Amplify CLI で push します。

## PR チェックリスト（作業時に必須）

1. ビルドが通る（`npm run build` またはプロジェクトのビルドコマンド）
2. Lint を通す（`npm run lint` 等）
3. 単体テスト（必要な範囲で）と E2E（新しい画面は Playwright テスト追加を推奨）
4. Amplify のスキーマ/リソースを変更した場合は、手順と CLI コマンド（例: `amplify push`）を PR に記載
5. 変更の要点（影響範囲、ロールバック手順）を PR 本文にまとめる

## 追加の提案（任意）

- 新規ページの雛形を `src/pages/_template/` として追加すると、開発者がコピーして始められて便利です。
- PR テンプレート（`.github/PULL_REQUEST_TEMPLATE.md`）を用意するとレビュープロセスが安定します。

## 連絡先 / 質問

不明点はリポジトリの主要コントリビュータに問い合わせてください（チーム内 Slack / Issues）。

---

（このファイルは読みやすさと実務での運用を重視して簡潔化しています。必要ならさらにテンプレやスクリプトを追加します。）

## リファクタリング / 構成整理ガイド

プロジェクトの可読性・保守性を高めるための方針と、段階的に進めるためのテンプレ手順をここにまとめます。大きな一括変更はリスクが高いため、小さなイテレーションで進め、CI とレビューを活用してください。

### 目的（短く）
- コードの可読性と再利用性を向上させる
- テストカバレッジと CI を整備して安全に変更できる状態にする
- 新規開発者が短時間で貢献できるようにする

### 小さな契約（Inputs / Outputs / 成功基準）
- 入力: 既存の画面コンポーネント、ビルド通る状態、既存テスト
- 出力: リファクタ後の小さなコミット（例：1画面または1コンポーネント単位）とテスト、PR
- 成功基準: ビルド/テスト/lin tが通り、既存 E2E に影響を与えない

### 推奨ディレクトリ構成（例）

- `src/components/` — ビジネスロジックを含む再利用可能コンポーネント
- `src/ui-components/` — 汎用 UI コンポーネント（Button, Icon, Typography 等）。※注意: Amplify や UI コンポーネントジェネレータが自動生成する場合があり、自動生成ファイルは原則編集しないでください。独自に作成する汎用 UI は `src/ui/` や `src/ui-kit/` のような別ディレクトリを使うことを推奨します。
- `src/pages/` — ルーティング単位のページコンポーネント
- `src/hooks/` — カスタムフック（API 呼び出し、フォーム、共通ロジック）
- `src/lib/` — 低レイヤのユーティリティ（api wrappers, date utils）
- `src/context/` — React Context 定義
- `src/graphql/` — GraphQL クエリ/スキーマ/型

※ 現状の構成と掛け合わせて、まずは「テンプレ追加 → 新規ページで運用 → 既存ページを段階的に移行」を推奨します。

### リファクタリングの進め方（イテレーション）

1. 小さく始める: `src/pages/_template/` を作り、新規ページは必ずテンプレを使う
2. Lint/Prettier を厳格化（必要なら `eslint`/`prettier` 設定を追加）し、`npm run lint` を PR 条件にする
3. CI に Build / Lint / Unit tests / E2E（軽量）を追加。まずは Build と Lint を必須にする
4. 既存ページの優先順位付け（頻繁に変更される画面やバグが多い画面から）
5. 1 PR = 1 画面 or 1 関連コンポーネントの単位で移行。PR に移行チェックリストを付ける
6. 必要なら codemod（単純な API 名変更や import の一括置換）を作る

### 品質ゲートと自動化提案

- CI: `npm run build`（必須）, `npm run lint`（必須）, `npm test`（ユニット）
- PR: 変更点に応じて Playwright の E2E を追加または更新
- 自動フォーマット: pre-commit hook で `lint-staged` を使う（`eslint --fix`, `prettier --write`）

 

### 小さな注意点 / エッジケース

- 既存の Amplify schema を変更する場合はバックエンド側に影響が出るため、バックエンドと協調して作業すること
- 大きなリネームは履歴追跡を難しくするため、分割して行うこと

## 次のアクション候補（私が実行できます）

1. `src/pages/_template/` の雛形ファイルを作成する
2. `.github/PULL_REQUEST_TEMPLATE.md` を追加する
3. `package.json` に `ci-check` スクリプトを追加して CI 用チェックをまとめる

やるものを選んでください。実行します。
