---
applyTo: "src/shared/api/graphql/**"
---

# Amplify 自動生成ファイル

このディレクトリ配下の GraphQL 関連ファイル（例: `documents/mutations.ts`、`documents/queries.ts`、`documents/subscriptions.ts`、`types.ts` など）は Amplify CLI により自動生成されます。

## 実装ルール

- 手動で編集しないでください。変更が必要な場合はスキーマや設定を更新し、Amplify のコード生成コマンドを実行してください。
- 生成元: `amplify/backend/api/garakufrontend/schema.graphql` などの Amplify 設定。
- 再生成例: `amplify codegen` を実行して生成物を更新し、必要に応じて `npm run lint`/`npm run test` を併せて確認してください。
