# Agents.md

英語で考えて、日本語で説明してください。

## ドキュメントと情報源

- **開発ドキュメントサイト**: Docusaurus ベースのサイトがあります。
  - 開発者向けガイド (`docs-site/docs/developer/`)
  - 管理者・ユーザー操作マニュアル (`docs-site/docs/admin/`, `docs-site/docs/staff/`)
  - 用語定義 (`docs-site/docs/terminology.md`)
  - 勤務ステータス・タイプ仕様 (`docs-site/docs/work-status-overview.md`, `docs-site/docs/work-type-overview.md`)

## 自動生成ファイル（編集禁止）

- 以下の領域は Amplify による自動生成コードのため、手動で編集しないこと
  - `src/ui-components/**`
  - `src/shared/api/graphql/**`
- `src/ui-components/**` を変更したい場合は Amplify Studio 側を更新し、`amplify pull` で再生成すること
- `src/shared/api/graphql/**` を変更したい場合はスキーマや設定を更新し、`amplify codegen` で再生成すること
- 詳細ルールは `.github/instructions/amplifyGraphqlGenerated.instructions.md` を参照すること

## コミットルール

- コミットメッセージは英語で書くこと
