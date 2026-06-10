# Agents.md

## 基本ルール

- 英語で考えて、日本語で説明してください。
- コミットメッセージは英語で書く
- push 前に `npm run typecheck` が `.githooks` で自動実行される

## 最低限のエラー解消

- `npm run typecheck` でエラーが出ない状態を保つこと
  - 既存のエラーがある場合は、修正対象コードに新たなエラーを追加しないこと（例: `src/features/attendance/edit/ui/AttendanceEditPage.tsx` に既に `5` 個エラーがあるなら、修正後も `5` 個以下に抑える）
- `npm run lint -- --fix` を定期的に実行して、ESLint エラーを増やさないこと
  - 既存の ESLint エラーがある場合は、修正対象コードに新たなエラーを追加しないこと（例: `src/features/attendance/edit/ui/AttendanceEditPage.tsx` に既に `10` 個エラーがあるなら、修正後も `10` 個以下に抑える）

## タスクやファイル書き込み時の注意点

- 使用しているAIモデルのコンテキストウィンドウサイズを超える大規模な変更を行う場合は、変更内容を複数の小さなタスクに分割して実行すること
- ファイルサイズが大きい場合は、変更内容を複数の小さなタスクに分割して実行すること（例: `AttendanceEditPage.tsx` が `500` 行ある場合は、変更内容を複数の小さなタスクに分割して実行する）

## 実装時の重要制約

- `src/shared/api/graphql/documents/` 配下の生成ファイル（`mutations.ts`, `queries.ts`, `subscriptions.ts`）および `src/shared/api/graphql/types.ts` は Amplify 自動生成のため手動編集禁止
- `src/ui-components/` は Amplify 自動生成のため手動編集禁止
- キャッシュ戦略ユーティリティ（`graphqlBaseQuery.ts`、`tagBuilder.ts`、`concurrency.ts`、`paginatedQuery.ts` など）は手動管理ファイルのため編集可能
- MUI コンポーネントの新規直接 import は禁止（`src/shared/ui/` の共通 UI を使う）
- スタイリングは MUI `sx` を主軸、Tailwind は補助、新規 SCSS は作らない
- デザイントークンは `designTokenVar()` 経由で参照する
- フォームは React Hook Form + Zod を基本にする
- 拡張モジュールは `src/extensions/<name>/` 配下に `manifest.ts` を置いて宣言する。新規追加は `node scripts/create-extension.mjs <name>` で雛形生成。詳細は `docs/EXTENSION_ARCHITECTURE.md`

## アンチリグレッション・レビュー基準（肥大化防止）

- **コンポーネント分割**: 1ファイルが目安 `200` 行超、または `useEffect/useMemo/useCallback` が合計 `4` 個以上になったら分割を検討し、PR で「分割しない理由」か「分割先」を明記する
- **Hook 抽出**: UI イベント処理以外の副作用が `2` 系統以上（例: API + URL クエリ同期）ある場合は custom hook へ分離する
- **Page の責務**: `src/pages/**` はオーケストレーション中心に保ち、表示ロジックは `features/**/ui`、データ整形は `features/**/model` か `entities/**` に移す
- **MUI ラッパー移行**: 既存コードを触る際、同等ラッパーが `src/shared/ui/**` にあるなら直接 MUI import を増やさず置換する。未整備ならラッパー追加→利用側置換を同一PRで最小1箇所行う
- **SCSS → sx/token 移行**: 変更対象コンポーネントでは、触ったスタイル差分を `sx + designTokenVar()` へ寄せる。SCSS は「未移行部分のみ暫定残置」を許可し、残課題を PR に記載する

## Skill 参照

- 開発コマンドと検証手順は `.agents/skills/garaku-dev-commands/SKILL.md` を参照
- テスト設計・Jest/Playwright 規約は `.agents/skills/garaku-testing-guide/SKILL.md` を参照
- 配置ルールと依存方向は `.agents/skills/garaku-architecture-map/SKILL.md` を参照
- 機能配置と修正対象の当たりを付けるときは `.agents/skills/garaku-feature-map/SKILL.md` を参照
- 勤怠ドメイン全般は `.agents/skills/about-kintai-app/SKILL.md` を参照
- 権限・ロールは `.agents/skills/about-permissions/SKILL.md` を参照

## Skill 優先順位（競合時）

- 実装場所探索（どこを直すか）と構成判定（レイヤー違反）が同時に出た場合:
	1) `garaku-feature-map` で候補を特定し、2) `garaku-architecture-map` で正誤判定する
- 検証コマンド選定とテスト設計が同時に出た場合:
	1) `garaku-testing-guide` でテスト層を決め、2) `garaku-dev-commands` で実行順を決める
- 勤怠仕様と権限仕様が同時に出た場合:
	1) `about-permissions` を優先してアクセス可否を確定し、2) `about-kintai-app` で業務ルールを適用する
- エラー調査時の開始点:
	実装場所不明なら `garaku-feature-map`、仕様不明ならドメインSKILL（`about-kintai-app` / `about-permissions`）を先に使う

## 詳細仕様ドキュメント

機能ごとの詳細仕様は `.github/instructions/` に配置：

| ファイル                                  | 対象                                         |
| ----------------------------------------- | -------------------------------------------- |
| `attendanceEdit.instructions.md`          | 勤怠編集（定型入力・バリデーションルール等） |
| `attendanceList.instructions.md`          | 勤怠一覧・ステータス判定                     |
| `register.instructions.md`                | 打刻ページ・直行直帰                         |
| `shift.instructions.md`                   | シフト機能全般                               |
| `shiftCollaborative.instructions.md`      | シフト共同編集のガードレール                 |
| `dailyReport.instructions.md`             | 日報                                         |
| `amplifyGraphqlGenerated.instructions.md` | 自動生成ファイルの扱い                       |
| `graphqlCachingStrategy.instructions.md`  | GraphQL キャッシング戦略・RTK Query 規約     |

## 自動生成ファイル（編集禁止）

- `src/shared/api/graphql/documents/mutations.ts`, `queries.ts`, `subscriptions.ts`（`amplify codegen` で生成）
- `src/shared/api/graphql/types.ts`（`amplify codegen` で生成）
- `src/ui-components/**`
- `src/aws-exports.js`（`amplify pull` で生成）。ソースツリー（git worktree）使用時はメインリポジトリのファイルをリンクして使用する
