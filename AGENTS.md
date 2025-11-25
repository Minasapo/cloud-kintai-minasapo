Amplifyで動作する勤怠管理のWebアプリケーションです。

## 概要

- コードベース: React + Material UI
- バックエンド: AWS Amplify
- E2E テスト: Playwright（`playwright/`）

### Playwright MCP の利用について

- 動作確認やエラー調査を行う際には、Playwright の MCP（Managed Cross Browser Platform）を利用することがあります。MCP を使うとリモートでのブラウザ実行や詳細なログ取得が容易になり、問題の切り分けが速くなります。
- MCP 用のログイン情報はリポジトリルートの `.env` ファイルに定義されている `PLAYWRIGHT_MCP_EMAIL` と `PLAYWRIGHT_MCP_PASSWORD` を使用してください（`#file:.env` を参照）。

このファイルは、開発ルールと運用上の注意を簡潔にまとめたものです。新規参加者がまず読むべき「クイックスタート」「ページ追加手順」「PR チェックリスト」を含みます。

## 主要なディレクトリ（抜粋）

- `src/`: アプリ本体
- `src/pages/`: ページごとのコンポーネントを置く場所（新規ページはここ）
- `src/router.tsx`: ルーティングの集中管理（新しいページを追加したらここにルートを登録）
- `amplify/`: Amplify のバックエンド設定（多くは自動生成。直接編集禁止のものが多い）
- `playwright/`: E2E テスト
- `src/time_recorder/`: 勤怠管理に関する主要コンポーネント
- `src/pages/AttendanceEdit/AttendanceEdit.tsx`: スタッフ側の勤怠編集画面
  - `src/pages/AttendanceEdit/MobileEditor/MobileEditor.tsx`: モバイル用の勤怠編集コンポーネント
  - `src/pages/AttendanceEdit/DesktopEditor/DesktopEditor.tsx`: デスクトップ用の勤怠編集コンポーネント
- `src/pages/admin/AdminAttendanceEditor.tsx`: 管理者側の勤怠編集画面
- `src/components/download_form/DownloadForm.tsx`: 勤怠データのダウンロードフォーム
- `src/pages/admin/AdminConfigManagement/AdminConfigManagement.tsx`: 設定画面(管理者のみ)
- `src/components/AttendanceDailyList/AttendanceDailyList.tsx`: 当日の全スタッフの勤怠一覧コンポーネント(管理者のみ)
  - 編集ボタンを押すとスタッフの勤怠一覧へ遷移
- `src/pages/admin/AdminStaffAttendanceList/AdminStaffAttendanceList.tsx`: スタッフの勤怠一覧(管理者のみ)
- `src/components/AttendanceList/AttendanceList.tsx`: 勤怠一覧コンポーネント(スタッフ側)
  - `src/components/AttendanceList/DesktopList.tsx`: デスクトップ用の勤怠一覧コンポーネント
  - `src/components/AttendanceList/MobileList.tsx`: モバイル用の勤怠一覧コンポーネント

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
- コメント: 実装理由やトレードオフの説明は許容する。ただし、冗長なインラインコメントは避け、コメントは原則として日本語で記載してください。

  コメントは実装の意図やトレードオフ、注意点など、変数名や関数名からは読み取れない情報を記載してください。変数名や関数名から明らかに分かる内容（例: `count` に「カウント」とだけ書く等）は冗長ですので記述しないでください。

## テストと TDD（追加）

- コードを編集する際は、テストコードを追加できそうな箇所を随時作成してください。新機能の追加や既存コードの修正では、少なくとも1つのユニットテストまたは統合テストを含めることを推奨します。
- コード修正で問題が見つかった場合は、問題を再現するテストをまず追加し（失敗するテスト）、その後修正を行ってテストが通るようにしてください。テストと修正は同一のPRで提出することを推奨します。
- チームとしてはテスト駆動開発（TDD）を目指します。すぐにすべてを厳密なTDDにする必要はありませんが、まずテストを書いてから実装する習慣を徐々に広げていってください。これにより品質向上とリファクタリングの安全性が高まります。

## Amplify に関する注意

- `amplify/` 配下には自動生成ファイルが多数あります。特に `amplify/backend/*` 内の自動生成ファイルは原則編集しないでください。
- GraphQL モデルを変更する場合は、`amplify/backend/api/garakufrontend/schema.graphql` を編集してください。その後、Amplify CLI で push します。

## 操作ログ (Operation Log)

このプロジェクトでは、スタッフの操作（例: 打刻／休憩ボタンの押下）を追跡するために `OperationLog` モデルを導入しています。開発者がログを確認・拡張・運用できるよう、下記に実装場所と運用上の注意をまとめます。

- モデル位置
  - Amplify schema: `amplify/backend/api/garakufrontend/schema.graphql` に `OperationLog` を追加しています。
  - 主要フィールド: `id`, `staffId`, `action`, `resource`, `resourceId`, `timestamp`, `details`, `ipAddress`, `userAgent`, `metadata`, `severity`

- フロントエンドの参照箇所
  - 作成ラッパー: `src/hooks/useOperationLog/createOperationLogData.tsx`（GraphQL の `createOperationLog` を呼ぶ）
  - 管理画面向け取得フック: `src/hooks/useAdminOperationLogs/*`（ページネーション対応）
  - 管理 UI（一覧）: `src/pages/admin/AdminLogs/AdminLogsClean.tsx`（最新 30 件を表示、スクロールで過去ログを逐次読込）

- いつログを作るか
  - 打刻（出勤・退勤）や休憩開始／終了のボタン押下時にログを作成します（実装箇所: `src/components/time_recorder/*Callback.ts` 系）。
  - `timestamp` にはフロントエンドで取得した押下時刻（pressedAt）を入れており、クライアントでの押下時刻を正確に残します。
  - `details` にはスタッフの表示名など人が読みやすい形で情報を入れる設計です（フロントエンドで staff 名を解決して保存します）。

- 表示・取り扱いの注意
  - `userAgent` を保存しますが、個人情報保護の観点から必要最小限の保持に留め、表示は短縮して tooltip などで詳細を確認できる形にしています。
  - ログの保持期間（例: 90日）や削除ポリシーを策定しておくことを推奨します。大量のログが溜まる場合はバックエンドでの TTL やバッチ削除を検討してください。

- 開発者向け操作例（参考）
  - 最新 30 件取得: GraphQL の `listOperationLogs(limit: 30, sortDirection: DESC)` を利用
  - 作成: `createOperationLog(input: { staffId: "...", action: "punch", resource: "attendance", timestamp: "...", userAgent: "..." })`

- 実装の補足
  - 管理画面は `nextToken` を利用したページネーションで過去ログを読み込む実装です。フロントエンドのフックは既存の GraphQL クライアントジェネレータ（`src/API.ts` 等）に依存します。
  - 仕様変更時は schema の変更→Amplify push、ならびにフロントエンドの hook や管理画面の更新を忘れずに行ってください。

## スナックバーの取り扱い（新ルール）

- アプリ内でユーザー通知（成功・エラー・警告）を表示する際は、ローカル state の Snackbar を直接使うのではなく、`src/lib/reducers/snackbarReducer.ts` の Redux slice を使って表示すること。
- 既存の実装例（`DocumentPoster.tsx` や各種ページ）を参考に、以下のパターンで実装してください:

  1. `useAppDispatchV2` を `@/app/hooks` からインポートして `dispatch` を用意する。
  2. 成功時は `dispatch(setSnackbarSuccess(MESSAGE_CODE.SXXXXX))` を呼ぶ（または表示したい文字列）。
  3. エラー時は `dispatch(setSnackbarError(MESSAGE_CODE.EXXXXX))` を呼ぶ。

- 理由: 全アプリで通知表示を一元管理することで UX の一貫性を保ち、将来的にグローバルなトラッキングや自動クローズ制御を中央で行いやすくするため。

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

0. テストファーストの実践: 可能な限りテストを先に書くことを習慣化してください。コードを編集・リファクタリングする際は、該当箇所のテストを追加・更新し、テストが失敗する状態を明示してから実装で修正するワークフローを推奨します。各PRには少なくとも1つの関連テストを含めることを目標としてください。

1. 小さく始める: `src/pages/_template/` を作り、新規ページは必ずテンプレを使う
2. Lint/Prettier を厳格化（必要なら `eslint`/`prettier` 設定を追加）し、`npm run lint` を PR 条件にする
3. CI に Build / Lint / Unit tests / E2E（軽量）を追加。まずは Build と Lint を必須にする
4. 既存ページの優先順位付け（頻繁に変更される画面やバグが多い画面から）
5. 1 PR = 1 画面 or 1 関連コンポーネントの単位で移行。PR に移行チェックリストを付ける
6. 必要なら codemod（単純な API 名変更や import の一括置換）を作る
