# AGENTS.md

このファイルは、リポジトリ内のコードを扱う際にAIエージェントに指示を与えるためのガイダンスを提供します。

## 基本ルール

- チャット上では、英語で考えて、日本語で説明します。
- ユーザーが確認する事項がない場合は、変更した内容を英語でコミットメッセージを記述し、コミットします。
- 必要に応じて`AGENTS.md`の更新を提案します。

## commit messageについて

- コミットメッセージは、変更内容の要約を英語で明確に記述してください。

## Pull Request (PR)について

- Pull Request (PR) の作成時は、PRのタイトルと説明に、変更内容の要約と目的を日本語で明確に記述してください。

## ドキュメントについて

ユーザー向けのドキュメントは、`docs-site`ディレクトリで管理されています。ドキュメントの変更や追加を行う場合は、`docs-site`ディレクトリ内の該当するファイルを編集してください。

## Amplify自動生成ファイルについて

次のディレクトリ・ファイルは、Amplify CLI によって自動生成されます。これらのファイルを手動で編集しないでください。変更が必要な場合は、Amplify の設定やスキーマを更新し、コード生成コマンドを実行してください。

- `src/graphql/**` 配下
- `src/ui-components/**` 配下
- `src/aws-exports.js`
- `src/aws-exports.ts`
- `src/aws-exports.d.ts`

### Schemaの変更方法について

スキーマを変更する場合は、`amplify/backend/api/garakufrontend/schema.graphql` を編集してください。その後、`amplify codegen` を実行して変更を反映させます。

### コード生成コマンドについて

`amplify codegen` コマンドを実行すると、スキーマの変更に基づいて自動生成ファイルが更新されます。

## フォントシステム方針

UI 全体のテキストは、Noto Sans JP のみを使用して統一します。日本語と英数字を含む画面でも、同一のフォントで一貫した見た目と可読性を保ちます。

- プライマリフォント: `Noto Sans JP`
- 読み込み方法: `src/index.css` で Google Fonts の `@import` を使用する
- 基本ウェイト: `400`、`500`、`600`
- デザインシステム変数: `--ds-typography-font-family`
- すべての UI テキストはこの変数経由で統一する
- コードブロックやログ表示などの等幅テキストは、別途 monospace フォントを使用する

### 実装ルール

- `src/shared/designSystem/tokens.ts` のフォント値は `Noto Sans JP` を基準にする
- `src/shared/designSystem/cssVariables.ts` で生成される CSS 変数を通じてフォントを適用する
- Tailwind や MUI のテーマは、ハードコードではなくトークンや CSS 変数を参照する
- フォント更新時は、関連する設定・表示確認を行い、必要に応じてドキュメントも更新する

## MUI利用方針

- MUI コンポーネントを利用する場合は、まず既存のデザインシステム（トークン・CSS 変数・テーマ）との整合性を優先する
- 色・余白・タイポグラフィは、可能な限り MUI テーマまたはデザインシステム由来の値を参照し、画面ごとのハードコードを避ける
- スタイル調整は `sx` や `styled` を用いる場合でも、共通化できるものはテーマ拡張や共通コンポーネント化を検討する
- Tailwind と MUI を併用する際は責務を分離し、同一要素に対して競合するスタイル指定を重ねない

## テスト方針

### テストピラミッドと責務

- Unit（Jest）: 純粋関数、バリデーション、lib/model、hooks のロジックを検証する
- Integration（Jest + React Testing Library）: コンポーネントの表示、ユーザー操作、コンポーネント連携を検証する
- E2E（Playwright）: ログイン後の主要業務フローをエンドツーエンドで検証する

各層で避ける対象:

- Unit で DOM や実ネットワーク通信を過剰に扱わない
- Integration で実ネットワーク通信や DB 依存を持ち込まない
- E2E で細かい分岐ロジックの網羅を狙わない（Unit/Integration で担保）

### テスト配置・命名

- Unit/Integration は原則として対象実装と同階層の `__tests__` に配置する
- shared UI の単純コンポーネントは同ディレクトリに `*.test.tsx` を並置してよい
- E2E は `playwright/tests/<機能名>/` に配置する
- `describe` は対象名、`it`/`test` は「〜の場合、〜すること」の日本語で記述する

### 共通テストユーティリティ

- `src/shared/test-utils` の `renderWithProviders` を優先利用する
- モックデータは `createMockAppConfig`、`createMockUser`、`createMockAttendance` などの factory を優先する
- 同じ Arrange が 3 回以上出たら `setupXxx` か factory に抽出する
- 入力と期待値のみが異なるケースは `test.each` を優先する

### Jest モック規約

- `jest.mock` はファイルトップで宣言し、必要なモック参照はファクトリ外で定義する
- 外部 API や副作用はモジュール全体モック、純粋関数の一部差し替えは部分モックを使い分ける
- 呼び出し監視中心のケースは `jest.spyOn` を使い、`afterEach` で `jest.restoreAllMocks()` を実行する
- 実装詳細（内部 state 名など）ではなく、ユーザー観点の振る舞いを検証する

### Hooks テスト

- `renderHook` と `act` を基本とし、非同期は `waitFor` または `findBy*` で待機する
- Context が必要な hooks はテスト内 wrapper で必要 Provider を組み立てる

### Playwright E2E 規約

- 認証状態は `playwright/.auth/` のストレージを利用する
- `chromium-staff`: `playwright/.auth/user.json`
- `chromium-admin`: `playwright/.auth/admin.json`
- 認証再生成は `npm run test:e2e:setup` を利用する
- 操作は `test.step` で意味単位に分割する
- ロケーター優先順位は `getByRole` → `getByLabel`/`getByPlaceholder` → `getByTestId` → CSS selector とする
- 重要要素には `data-testid` の付与を検討する
- 待機は要素可視（`expect(...).toBeVisible()`）優先で、必要時のみ `waitForResponse` を併用する

### カバレッジ運用

- `jest.config.cjs` の現行 global threshold:
- statements: 65%
- branches: 52%
- functions: 56%
- lines: 65%
- 新規コードは原則 Unit テストを追加する
- ビジネスロジック・バリデーションは 80% 以上を目標にする
- PR では閾値未達を許容しない

### よくあるミスの防止

- `describe.skip` / `test.skip` には理由と追跡情報（チケット等）を残す
- テスト内の `console.log` はコミット前に削除する
- `afterEach` で `jest.clearAllMocks()` / `jest.restoreAllMocks()` を実行し副作用を隔離する
- UI 操作は `fireEvent` より `userEvent` を優先する
