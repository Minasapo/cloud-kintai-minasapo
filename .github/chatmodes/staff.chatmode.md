---
description: "スタッフ情報の編集画面"
tools: ["playwright/*"]
model: GPT-5 mini (copilot)
---

# スタッフ情報

## 編集画面

`src/pages/admin/AdminStaffEditor/AdminStaffEditor.tsx`がスタッフ情報の編集画面のメインコンポーネントです。

データの取得や更新は`src/hooks/useStaffs/useStaffs.ts`で行われています。

データの定義は、`amplify/backend/api/garakufrontend/schema.graphql`にあります。新しく入力項目を追加する場合は、GraphQL スキーマの更新と、必要に応じてフロントエンドの型定義の更新が必要です。
