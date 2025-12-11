---
applyTo: "src/pages/workflow/list/WorkflowListPage.tsx"
---

# ワークフロー機能（ドキュメント）

このファイルは、リポジトリ内に追加された「ワークフロー」機能の実装概要、使用方法、注意点、今後の作業候補をまとめたものです。

## 概要

- 目的: 管理者/ユーザーがワークフロー（申請フロー）を一覧・作成・表示・編集できるモック機能を追加しました。
- 実装スタック: React + TypeScript, Material UI (MUI v5), MUI X Date Pickers, react-router-dom v6
- 現状: 全てクライアントサイドのモック実装（永続化は未実装）。

## 主要な画面とルート

- `/workflow` — ワークフロー一覧（`src/pages/workflow/list/WorkflowListPage.tsx`）
- `/workflow/new` — 新規作成（`src/pages/workflow/new/NewWorkflowPage.tsx`）
- `/workflow/:id` — 詳細（`src/pages/workflow/detail/WorkflowDetailPage.tsx`）
- `/workflow/:id/edit` — 編集（`src/pages/workflow/edit/WorkflowEditPage.tsx`）

ルーティングは既存の `src/router.tsx` に追加してあります。ヘッダー（Desktop/Mobile メニュー）にも項目を追加しています。

## 主要なファイル

- `src/pages/workflow/list/WorkflowListPage.tsx`

  - ワークフロー一覧表示。ダミーデータ `INITIAL_DATA` を元にテーブルレンダリング。
  - 列: ID, 名前, 種別 (category), 申請日 (applicationDate), ステータス, 作成日
  - 列フィルタ: ID, 名前, 種別, 申請日 (from/to), ステータス, 作成日 (from/to)
  - 申請日・作成日の範囲入力は、コンパクト化のためポップオーバー内に 2 つの `DatePicker` を配置（選択は即時適用、適用ボタンはなし）。
  - グローバルな「すべてのフィルターをクリア」ボタンは、追加された申請日・作成日フィルタも含めて全てクリアし、ポップオーバーを閉じます。

- `src/pages/workflow/new/NewWorkflowPage.tsx`

  - 新規作成フォーム（モック）。
  - 仕様:
    - 種別 (`category`) を画面上部に配置（選択でタイトルを自動補完するモック挙動）。
    - 申請日 (`applicationDate`) の入力（デフォルトは当日）。
    - 下書きモードのスイッチ（ON の場合はステータスが `draft` に固定）。
    - 種別に応じたモックフィールド (有給: 開始/終了日、欠勤: 欠勤理由、その他: 備考) を表示。
    - 作成後はモックの alert を表示して一覧に戻る（永続化はしていない）。

- `src/pages/workflow/detail/WorkflowDetailPage.tsx`

  - 詳細表示のモック（`useParams` で id を取得して表示）。

- `src/pages/workflow/edit/WorkflowEditPage.tsx`

  - 編集画面のモック（保存は alert、一覧/詳細へ遷移）。

- `src/components/Page/Page.tsx`
  - ページ共通のラッパー（タイトルとコンテナ）。ワークフロー画面で利用して UI を統一。

## UI の注意点 / 設計上の決定

- 日付範囲 UI

  - 2 つの date input を横並びに置くとテーブル列幅を圧迫するため、ポップオーバー内に `DatePicker` を 2 つ置く方式にしました。MUI の `DateRangePicker`（プロ版や別パッケージ）を導入する代替案もありますが、現状は既存依存である `@mui/x-date-pickers` を使っています。
  - 日付選択時は即時適用（Apply ボタンは撤去）。クリアはポップオーバー内の「クリア」ボタンで行います。

- 新規作成フォーム

  - 種別は画面上部に移動しており、ユーザーが最初に選べるように配置。
  - 下書きモードや種別に応じた入力はモックです。バリデーション（開始日 <= 終了日など）は最小限で未実装。

- データ永続化
  - 現状は in-memory のダミーデータのみ。バックエンド（Amplify / GraphQL 等）との連携は未実装。

## 使い方（開発者向け手順）

1. 依存のインストール / 開発サーバ起動:

```bash
npm install
npm run dev
```

2. ワークフロー画面へ

   - ブラウザで `/workflow` にアクセス。右上の「新規作成」で `/workflow/new` に遷移します。

3. フィルタの操作
   - テーブル上部のフィルタ行で ID/名前/種別/ステータス を入力できます。
   - 申請日・作成日のフィルタはフィールドをクリックしてポップオーバーを開き、From/To を選択してください。選択は即時反映されます。
   - 「すべてのフィルターをクリア」を押すと、すべてのフィルタ（申請日・作成日含む）をリセットしてポップオーバーを閉じます。

## テスト / ビルド

- ビルド確認は `npm run build` で行えます。既存の Vite 警告（チャンクサイズ、Sass の legacy JS API deprecation など）は残る可能性がありますが、今回の変更自体はビルドを通過しています。

## 既知の課題 / 今後の改善案

- 永続化: 新規作成・編集の内容をバックエンドに保存する（Amplify / GraphQL への接続）。
- バリデーション: 種別ごとの詳細なバリデーション（有給の日付レンジチェック等）を強化。
- UX: DateRangePicker（公式 / プロ版）の導入による UX 改善検討。現在の実装は既存依存で代替。
- リンティング: import の並び順や未使用変数に関する repo 全体の lint 指摘が一部残っています。CI ルールに合わせて自動修正 / 修正を検討してください。
- テスト: ユニットテスト（React Testing Library）および E2E（Playwright）の追加を推奨。特に一覧フィルタと新規作成 → 一覧遷移のシナリオ。

## 変更したファイル一覧（実装時点）

- 追加/編集:
  - src/pages/workflow/list/WorkflowListPage.tsx
  - src/pages/workflow/new/NewWorkflowPage.tsx
  - src/pages/workflow/detail/WorkflowDetailPage.tsx
  - src/pages/workflow/edit/WorkflowEditPage.tsx
  - src/components/Page/Page.tsx (既存の Page を整備/利用)
  - src/router.tsx (ルート追加)
  - src/components/header/DesktopMenu.tsx (ヘッダーに項目追加)
  - src/components/header/MobileMenu.tsx (ヘッダーに項目追加)

## 参考

- MUI Date Picker: https://mui.com/x/react-date-pickers/
- dayjs: https://day.js.org/
