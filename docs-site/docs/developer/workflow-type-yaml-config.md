---
sidebar_position: 8
title: ワークフロー種別 YAML 設定
description: YAML ファイルで申請フォームのフィールド・バリデーション・ペイロードマッピングを宣言的に定義し、コード変更を最小化する仕組みを解説します。
---

# ワークフロー種別 YAML 設定

このページは、`workflow-types.yaml` を使ったワークフロー種別の宣言的定義と、その周辺実装の構造を開発者向けに解説します。

## 目的

従来は申請種別を追加・変更するたびに 4 ファイルを手動で修正する必要がありました。

| 変更箇所 | 内容 |
| --- | --- |
| `WorkflowTypeFields.tsx` | JSX の `if` ブランチを追加 |
| `workflowFormModel.ts` | state 型・Zod バリデーション・ペイロード生成ロジック |
| `WorkflowFormContext.tsx` | state / setter を追加 |
| `workflowLabels.ts` | ラベルマッピング定義 |

YAML 設定により、**標準フィールドのみで構成される種別ならコードを変更せずに追加できます**。特殊な UI や外部データを要するフィールドは「スペシャライズドフィールド」として一度だけ TypeScript で実装し、以降は YAML から参照します。

## ファイル配置

```
src/features/workflow/
├── config/
│   ├── workflow-types.yaml          ← 申請種別の宣言定義
│   ├── workflowTypeConfig.ts        ← YAML の TypeScript 型定義
│   └── workflowTypeLoader.ts        ← YAML のロードと検索ユーティリティ
└── application-form/
    ├── model/
    │   ├── DynamicWorkflowFormContext.tsx   ← 動的 fields マップを持つ Context
    │   ├── useDynamicWorkflowForm.ts        ← フォーム state 管理 hook
    │   ├── dynamicWorkflowFormModel.ts      ← 動的バリデーション・ペイロードビルダー
    │   └── initDynamicFields.ts             ← 既存 Workflow からフィールド初期化
    └── ui/
        ├── DynamicWorkflowTypeFields.tsx    ← YAML を読んでフィールドを動的描画
        └── fields/
            ├── index.tsx                    ← フィールドレジストリ
            ├── DateField.tsx
            ├── DateRangeField.tsx
            ├── TimeField.tsx
            ├── TimeRangeField.tsx
            ├── TextField.tsx
            ├── TextareaField.tsx
            └── TemplateSelectField.tsx      ← スペシャライズドフィールド
```

## YAML スキーマ

```yaml
types:
  - id: WORKFLOW_CATEGORY_ENUM_KEY   # WorkflowCategory enum 値
    label: 表示ラベル
    fields:                          # フィールドのリスト（省略時は subTypes を使う）
      - key: fieldKey                # fields オブジェクトのキー
        type: date | date_range | time | time_range | text | textarea | template_select
        label: ラベル文字列
        required: true              # 省略時は false
        validation:
          startBeforeEnd: true      # date_range / time_range で start < end を強制
    payload:
      type: overTimeDetails | custom
      mapping:
        fieldName: "fields.fieldKey"      # フォーム値を参照
        fieldName: "fields.key.nested"    # ネストを . で辿る
        fieldName: "const.CONSTANT_NAME"  # 定数を参照

  - id: CLOCK_CORRECTION             # サブタイプを持つ種別
    label: 打刻修正(出勤/退勤忘れ)
    subTypes:
      - id: CLOCK_IN
        label: 打刻修正(出勤忘れ)
        fields: [...]
        payload: {...}
```

### `fields.key.nested` の記法

フォーム値がオブジェクト型（`date_range` や `time_range`）の場合、ドット区切りでネストを辿ります。

```yaml
mapping:
  date: "fields.dateRange.start"     # date_range の start
  endTime: "fields.timeRange.end"    # time_range の end（ISO 8601 → HH:mm 自動変換）
```

`time` / `time_range` の値は ISO 8601 形式で保持されていますが、ペイロード生成時に自動的に `HH:mm` へ変換されます。

### `const.*` の記法

```yaml
mapping:
  reason: "const.CLOCK_CORRECTION_CHECK_IN_LABEL"
```

`WORKFLOW_PAYLOAD_CONSTANTS`（`workflowTypeConfig.ts`）に定義されたキーを参照します。現在の定義：

| キー | 値 |
| --- | --- |
| `CLOCK_CORRECTION_CHECK_IN_LABEL` | `打刻修正(出勤忘れ)` |
| `CLOCK_CORRECTION_CHECK_OUT_LABEL` | `打刻修正(退勤忘れ)` |

## 標準フィールド一覧

| `type` 値 | 入力値の型 | 説明 |
| --- | --- | --- |
| `date` | `string` (YYYY-MM-DD) | 日付入力（1 つ） |
| `date_range` | `{ start: string; end: string }` | 開始日〜終了日の範囲 |
| `time` | `string \| null` (ISO 8601) | 時刻入力（1 つ） |
| `time_range` | `{ start: string \| null; end: string \| null }` | 開始時刻〜終了時刻の範囲 |
| `text` | `string` | 1 行テキスト入力 |
| `textarea` | `string` | 複数行テキスト入力 |
| `template_select` | `string` (テンプレート ID) | テンプレート選択 + 適用（後述） |

`time` / `time_range` フィールドは、同一フォーム内の最初の `date` フィールドの値を `baseDate` として自動的に使用します。

## スペシャライズドフィールド

`template_select` のように、外部データ取得や複数フィールドへの一括書き込みが必要なフィールドを「スペシャライズドフィールド」と呼びます。

### `TemplateSelectField`

`useGetWorkflowTemplatesQuery` を内部で直接呼び出してテンプレート一覧を取得します。テンプレートを適用すると `onSetField` を通じて `title` と `content` フィールドを上書きします。

### 新しいスペシャライズドフィールドを追加する手順

1. `src/features/workflow/application-form/ui/fields/` に `XxxField.tsx` を作成する
2. `fields/index.tsx` の `FIELD_REGISTRY` に `{ type_name: XxxField }` を追加する
3. YAML の `type:` に同じ `type_name` を記述する

```typescript
// fields/index.tsx
export const FIELD_REGISTRY: Partial<Record<WorkflowFieldType, ComponentType<FieldComponentProps>>> = {
  // 既存
  text: TextField,
  // 追加例
  my_custom_field: MyCustomField,
};
```

```typescript
// workflowTypeConfig.ts
export type WorkflowFieldType =
  | "text"
  // 追加
  | "my_custom_field";
```

## 新しい申請種別を追加する手順

### ケース A: 標準フィールドのみ

YAML にブロックを追加するだけです。コードの変更は不要です。

```yaml
  - id: COMPENSATORY_LEAVE           # 既存 enum 値 or 新規
    label: 振替休日申請
    fields:
      - key: targetDate
        type: date
        label: 振替対象日
        required: true
      - key: compensatoryDate
        type: date
        label: 振替取得日
        required: true
      - key: reason
        type: text
        label: 理由
    payload:
      type: overTimeDetails
      mapping:
        date: "fields.targetDate"
        startTime: "fields.compensatoryDate"
        endTime: "fields.compensatoryDate"
        reason: "fields.reason"
```

### ケース B: 新しい GraphQL enum 値を伴う種別

`WorkflowCategory` enum はバックエンド（Amplify AppSync）の `schema.graphql` で定義されており、`amplify codegen` で自動生成されます。真に新しいカテゴリを追加する場合は以下が必要です。

1. `amplify/backend/api/garakufrontend/schema.graphql` の `WorkflowCategory` enum に値を追加する
2. `amplify push` でバックエンドを更新し、`amplify codegen` で `src/shared/api/graphql/types.ts` を再生成する
3. `workflowLabels.ts` の `CATEGORY_LABELS` と `DEFAULT_WORKFLOW_CATEGORY_ORDER` に追加する
4. YAML に新しいブロックを追加する

詳しくは [Amplify スキーマ変更手順](/docs/developer/amplify/schema-change-procedure) を参照してください。

### ケース C: 1 つの enum 値で複数の UI バリアントが必要な種別

`CLOCK_CORRECTION` のように、1 つの enum 値が UI 上で複数の選択肢に分岐する場合は `subTypes` を使います。

```yaml
  - id: CLOCK_CORRECTION
    label: 打刻修正(出勤/退勤忘れ)
    subTypes:
      - id: CLOCK_IN
        label: 打刻修正(出勤忘れ)
        fields: [...]
        payload: {...}
      - id: CLOCK_OUT
        label: 打刻修正(退勤忘れ)
        fields: [...]
        payload: {...}
```

`subTypes` を使う場合、トップレベルの `fields` と `payload` は不要です。

## 動的フォームの内部構造

### フォーム state

従来の「フラットな named fields」から動的な `fields: Record<string, unknown>` マップへ移行しました。

```typescript
// 旧設計
type WorkflowFormState = {
  startDate: string;
  endDate: string;
  absenceDate: string;
  // 全カテゴリのフィールドが混在...
};

// 新設計
type DynamicWorkflowFormState = {
  categoryLabel: string;
  fields: Record<string, unknown>;
  // 例: { dateRange: { start: "2024-01-10", end: "2024-01-15" }, reason: "私用のため" }
};
```

### Context API

```typescript
// DynamicWorkflowFormContext
type DynamicWorkflowFormContextValue = {
  category: string;
  disabled: boolean;
  fields: Record<string, unknown>;
  setFieldValue: (key: string, value: unknown) => void;
  fieldErrors: Record<string, string>;
};
```

### バリデーション

YAML の `required` と `validation.startBeforeEnd` を読み取り、動的に検証します。

```typescript
const result = validateDynamicWorkflowForm({ categoryLabel, fields });
// result.isValid: boolean
// result.fieldErrors: { [fieldKey]: "エラーメッセージ" }
```

### ペイロードビルダー

YAML の `payload.mapping` を評価して GraphQL input を生成します。

```typescript
const input = buildDynamicCreateWorkflowInput({ staffId, draftMode, state });
const input = buildDynamicUpdateWorkflowInput({ workflowId, draftMode, state, existingComments });
```

### 編集画面の初期値

既存の Workflow レコードから `fields` を復元する処理は `initDynamicFields.ts` の `initDynamicFieldsFromWorkflow()` で行います。現在は種別ごとにハードコードされていますが、標準マッピングのみの種別については将来的に YAML から自動導出できます。

## テスト

YAML ファイルはテスト環境（Jest）では `jest.mock` で差し替えます。

```typescript
jest.mock("@features/workflow/config/workflow-types.yaml", () => ({
  types: [
    {
      id: "PAID_LEAVE",
      label: "有給休暇申請",
      fields: [
        {
          key: "dateRange",
          type: "date_range",
          label: "取得期間",
          required: true,
          validation: { startBeforeEnd: true },
        },
      ],
      payload: {
        type: "overTimeDetails",
        mapping: {
          date: "fields.dateRange.start",
          startTime: "fields.dateRange.start",
          endTime: "fields.dateRange.end",
          reason: "fields.reason",
        },
      },
    },
  ],
}));
```

Jest 設定（`jest.config.cjs`）には YAML トランスフォーマー（`__mocks__/yamlTransformer.cjs`）が設定されており、テスト内で YAML をインポートしたり、上記のようにモックを注入したりできます。

## 変更時の確認観点

| 変更内容 | 確認箇所 |
| --- | --- |
| YAML にフィールドを追加 | フォーム表示・バリデーション・ペイロード生成の動作確認 |
| 新しい種別を追加 | 新規作成・編集・詳細・一覧フィルタ・`workflowLabels.ts` |
| GraphQL enum を追加 | Amplify スキーマ変更・codegen・`workflowLabels.ts` |
| スペシャライズドフィールドを追加 | `WorkflowFieldType` 型・レジストリ・YAML 型宣言 |
| `initDynamicFields.ts` を変更 | 編集画面での既存データ復元が正しいか確認 |

## 関連ページ

- [ワークフロー機能仕様](./workflow)
- [Amplify スキーマ変更手順](/docs/developer/amplify/schema-change-procedure)
- [ディレクトリ構成](./architecture/directory-structure)
