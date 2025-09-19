---
applyTo: "tests/attendance-direct-flow.spec.ts"
---

# 実装

## 打刻

- `src/pages/Register.tsx`内の`src/components/time_recorder/TimeRecorder.tsx`を使用
- 要素の選択には、`data-testid`属性を使用していますが、実装側の対応が不十分な場合がある
- `data-testid`属性が定義されていない場合は、実装側に追加すること

## 勤怠一覧

- `src/components/AttendanceList/AttendanceList.tsx`を使用
  - デスクトップ向けとモバイル向けでコンポーネントが異なる
    - デスクトップ向け：`src/components/AttendanceList/DesktopList.tsx`
    - モバイル向け：(準備中のため、考慮不要)
- 30 日分の勤怠データが表示される
- EditIcon のボタンをクリックすると、編集画面に遷移する
