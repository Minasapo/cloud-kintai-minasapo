---
applyTo: "src/components/attendance_editor/AttendanceEditor.tsx"
---

- 管理者画面の勤怠編集コンポーネント
- 新しい編集項目を追加する場合は、`amplify/backend/api/garakufrontend/schema.graphql`にフィールドを追加し、`amplify status`を実行してから`amplify push`を実行してください。
- 新しいフィールドを追加した場合、`src/hooks/useAttendance/useAttendance.ts`の GraphQL クエリとミューテーションも更新してください。
