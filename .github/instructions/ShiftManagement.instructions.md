## applyTo: "src/features/shift/management/ui/ShiftManagementBoard.tsx"

## ShiftManagementBoard.tsx 用インストラクション

このファイルは `src/features/shift/management/ui/ShiftManagementBoard.tsx` を編集・拡張する際の開発ルールと実装ガイドです。主に新規実装者やレビュー担当者が守るべき方針を簡潔にまとめています。

目的

- 勤務シフト管理ページの UI と振る舞いを実装・保守する。

責務（短く）

- シフト一覧の取得、表示、検索・フィルタ、編集モーダルの起動、シフト保存（Amplify API / GraphQL）を担う。

簡単な契約（Inputs / Outputs / 成功基準）

- 入力: GraphQL/API から取得するシフト配列、ユーザー操作（フィルタ・編集）
- 出力: UI 描画（表／カレンダー等）、編集リクエスト、成功/エラー通知
- 成功基準: 正常に一覧が表示され、編集・保存が行える。主要なユースケースでエラーが Snackbar で通知される。

開発ルール（必須）

- UI: 常に Material UI を使用する（既存プロジェクトのデザインに合わせる）。
- 日付操作: `dayjs` を使用する（タイムゾーン・フォーマットは既存規約に合わせる）。
- ロジック: コンポーネント本体にロジックを詰め込みすぎず、API 呼び出しや変換ロジックはカスタムフック（`src/hooks/`）や `src/lib/` に切り出す。
- スナックバー: アプリ共通の Snackbar は必ず `src/lib/reducers/snackbarReducer.ts` を経由して表示する（`useAppDispatchV2` を使い `setSnackbarSuccess` / `setSnackbarError` を dispatch する）。
- 型定義: 可能な限り TypeScript の型を明示する。GraphQL 型が利用可能ならそれを優先する。
- アクセシビリティ: テーブルやモーダルはキーボード操作・スクリーンリーダーを考慮する（aria 属性、ラベル等）。

推奨構成

- `src/pages/shift/management/index.tsx` — ルーティング用の薄いページラッパ。`ShiftManagementBoard` を描画するだけに留める。
- `src/features/shift/management/ui/ShiftManagementBoard.tsx` — メインボード（本インストラクション対象）。一覧表示や操作ガード、編集ダイアログの起点を担う。
- `src/features/shift/management/lib/generateMockShifts.ts` など `lib/` 以下 — 一時的なモックやユーティリティ。将来的に API 化されたらここから差し替える。
- `src/hooks/useShiftApi.ts` など共有 hook — API 呼び出しや変換ロジックはコンポーネントから分離する。

よくあるエッジケース

- API が空配列を返す（表示: 空状態のプレースホルダー）。
- データが不整合（勤務開始 > 終了など）：バリデーションで防ぐ、ユーザへ分かりやすくエラー表示。
- 同時更新（楽観ロックや ETag があれば利用）。
- 大量データ（ページネーション／仮想化を検討）。

テスト要件

- 単体テスト: 一覧描画のハッピーパス、空データケース、編集フォームのバリデーションを少なくとも 1 つずつ。
- 統合テスト: API モックで保存フローが成功/失敗する場合の表示（Playwright E2E への追加を推奨）。

パフォーマンスと最適化

- テーブル描画が重い場合は `react-window` 等で仮想化を導入する。
- 不要な再レンダリングを避けるため、props の分割や React.memo を検討する。

ローカル開発時の確認手順（簡易）

1. 依存インストール: `npm install`（既にセットアップ済みであれば不要）。
2. 開発サーバ起動: `npm run dev`。
3. シフトページにアクセスして一覧表示・編集を確認。

注意事項（Amplify / GraphQL）

- GraphQL モデル／schema を変更する場合は `amplify/backend/api/garakufrontend/schema.graphql` を編集し、Amplify CLI で push する（自動生成ファイルは直接編集しない）。

運用上の細かい約束事

- 日付の表示形式はプロジェクト共通（`dayjs` フォーマット）に合わせること。
- 操作に対するユーザ通知は必ず Snackbar 経由で行う（`setSnackbarSuccess` / `setSnackbarError`）。
- CSS は可能な限り MUI の sx または makeStyles（プロジェクト方針に合わせる）を使用し、グローバルな CSS 汚染を避ける。

追加の参考

- 成功例・実装例は `src/pages/admin/AdminStaffAttendanceList/` や `src/components/AttendanceList/` を参考にすると実装の方向性が掴みやすい。

このインストラクションは簡潔に把握できることを優先しています。詳細な実装や設計決定が必要な場合は、PR の説明で設計ノート（意図／制約）を明記してください。
