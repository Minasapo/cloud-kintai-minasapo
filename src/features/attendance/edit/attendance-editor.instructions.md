---
applyTo: "src/features/attendance/edit/AttendanceEditor.tsx"
---

- 管理者画面の勤怠編集コンポーネント
- 新しい編集項目を追加する場合は、`amplify/backend/api/garakufrontend/schema.graphql`にフィールドを追加し、`amplify status`を実行してから`amplify push`を実行してください。
- 新しいフィールドを追加した場合、次のファイルも更新する必要があります。
  - `src/lib/api/attendanceApi.ts` のクエリ/ミューテーション定義や型を同期してください。
  - `src/lib/attendance/attendanceActions.ts` の更新処理（clockIn/out など）で新フィールドを正しく扱うよう調整してください。
