applyTo: - "src/shared/api/graphql/**" - "src/ui-components/**"

---

# Amplify 自動生成ファイル

このディレクトリ配下の GraphQL 関連ファイル（例: `documents/mutations.ts`、`documents/queries.ts`、`documents/subscriptions.ts`、`types.ts` など）は Amplify CLI により自動生成されます。

また、`src/ui-components/**` 配下のコンポーネント群も Amplify Studio から自動生成されるため、手動編集は避けてください。

## 実装ルール

- 手動で編集しないでください。変更が必要な場合はスキーマや設定を更新し、Amplify のコード生成コマンドを実行してください。
- 生成元: `amplify/backend/api/garakufrontend/schema.graphql` などの Amplify 設定。
- 再生成例: `amplify codegen` を実行して生成物を更新し、必要に応じて `npm run lint`/`npm run test` を併せて確認してください。
- UI コンポーネントの再生成: Amplify Studio 上で編集後、`amplify pull` を実行して `src/ui-components/**` を更新してください。
